const mongoose = require("mongoose");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { daysBetween, endOfMonth, parseMonthYear, startOfMonth, subtractDays } = require("../utils/date");

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id.toString());
}

function getRangeFromQuery(query = {}) {
  const fallback = parseMonthYear(query);

  if (query.startDate || query.endDate) {
    const startDate = query.startDate || startOfMonth(fallback.month, fallback.year);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);

    return { startDate, endDate };
  }

  const { month, year } = fallback;
  return {
    month,
    year,
    startDate: startOfMonth(month, year),
    endDate: endOfMonth(month, year)
  };
}

async function monthlySummary(userId, query = {}) {
  const { month, year, startDate, endDate } = getRangeFromQuery(query);
  const [summary] = await Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSpend: { $sum: "$amount" },
        expenseCount: { $sum: 1 },
        averageExpense: { $avg: "$amount" },
        largestExpense: { $max: "$amount" }
      }
    }
  ]);

  const budget = month && year ? await Budget.findOne({ userId, month, year }) : null;
  const totalSpend = summary?.totalSpend || 0;
  const monthlyLimit = budget?.monthlyLimit || 0;
  const remainingAmount = monthlyLimit - totalSpend;
  const savingRate = monthlyLimit > 0 ? Math.max(0, (remainingAmount / monthlyLimit) * 100) : 0;

  return {
    month,
    year,
    totalSpend,
    expenseCount: summary?.expenseCount || 0,
    averageExpense: summary?.averageExpense || 0,
    largestExpense: summary?.largestExpense || 0,
    monthlyLimit,
    remainingAmount,
    savingRate
  };
}

async function categoryBreakdown(userId, query = {}) {
  const { startDate, endDate } = getRangeFromQuery(query);

  return Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        average: { $avg: "$amount" }
      }
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        total: 1,
        count: 1,
        average: 1
      }
    }
  ]);
}

async function weeklyComparison(userId) {
  const now = new Date();
  const currentStart = subtractDays(now, 6);
  currentStart.setUTCHours(0, 0, 0, 0);
  const previousStart = subtractDays(currentStart, 7);
  const previousEnd = new Date(currentStart);

  const rows = await Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: previousStart, $lte: now }
      }
    },
    {
      $facet: {
        currentWeek: [
          { $match: { expenseDate: { $gte: currentStart, $lte: now } } },
          {
            $group: {
              _id: { $dateToString: { date: "$expenseDate", format: "%Y-%m-%d" } },
              total: { $sum: "$amount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        previousWeek: [
          { $match: { expenseDate: { $gte: previousStart, $lt: previousEnd } } },
          {
            $group: {
              _id: { $dateToString: { date: "$expenseDate", format: "%Y-%m-%d" } },
              total: { $sum: "$amount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  const currentWeek = rows[0]?.currentWeek || [];
  const previousWeek = rows[0]?.previousWeek || [];
  const currentTotal = currentWeek.reduce((total, day) => total + day.total, 0);
  const previousTotal = previousWeek.reduce((total, day) => total + day.total, 0);
  const changePercent = previousTotal > 0
    ? ((currentTotal - previousTotal) / previousTotal) * 100
    : currentTotal > 0 ? 100 : 0;

  return {
    currentWeek,
    previousWeek,
    currentTotal,
    previousTotal,
    changePercent
  };
}

async function averageDailyExpenses(userId, query = {}) {
  const { startDate, endDate } = getRangeFromQuery(query);

  const rows = await Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { date: "$expenseDate", format: "%Y-%m-%d" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const total = rows.reduce((sum, item) => sum + item.total, 0);
  const days = daysBetween(startDate, endDate);

  return {
    days,
    dailyAverage: total / days,
    total,
    series: rows.map((row) => ({
      date: row._id,
      total: row.total,
      count: row.count
    }))
  };
}

async function savingsTrend(userId) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const expenses = await Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: start, $lte: now }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$expenseDate" },
          year: { $year: "$expenseDate" }
        },
        spent: { $sum: "$amount" }
      }
    }
  ]);

  const budgets = await Budget.find({
    userId,
    $or: Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1));
      return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
    })
  });

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1));
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    const spendRow = expenses.find((row) => row._id.month === month && row._id.year === year);
    const budget = budgets.find((row) => row.month === month && row.year === year);
    const spent = spendRow?.spent || 0;
    const monthlyLimit = budget?.monthlyLimit || 0;

    return {
      month,
      year,
      spent,
      monthlyLimit,
      saved: Math.max(0, monthlyLimit - spent),
      savingRate: monthlyLimit > 0 ? Math.max(0, ((monthlyLimit - spent) / monthlyLimit) * 100) : 0
    };
  });
}

async function topCategory(userId, query = {}) {
  const breakdown = await categoryBreakdown(userId, query);
  return breakdown[0] || null;
}

async function heatmap(userId, query = {}) {
  const { startDate, endDate } = getRangeFromQuery(query);

  return Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: {
          day: { $dateToString: { date: "$expenseDate", format: "%Y-%m-%d" } },
          dayOfWeek: { $dayOfWeek: "$expenseDate" }
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.day": 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id.day",
        dayOfWeek: "$_id.dayOfWeek",
        total: 1,
        count: 1
      }
    }
  ]);
}

function generateInsights({ summary, breakdown, weekly }) {
  const insights = [];
  const top = breakdown[0];

  if (top) {
    insights.push({
      type: "info",
      title: `${top.category} is your top category`,
      message: `${top.category} accounts for the highest spend this period.`,
      metadata: top
    });
  }

  if (weekly.changePercent > 25) {
    insights.push({
      type: "warning",
      title: "Weekly spending jumped",
      message: `You spent ${Math.round(weekly.changePercent)}% more than last week.`,
      metadata: { changePercent: weekly.changePercent }
    });
  } else if (weekly.changePercent < -10) {
    insights.push({
      type: "success",
      title: "Weekly spending improved",
      message: `You spent ${Math.abs(Math.round(weekly.changePercent))}% less than last week.`,
      metadata: { changePercent: weekly.changePercent }
    });
  }

  if (summary.remainingAmount >= 0 && summary.monthlyLimit > 0) {
    insights.push({
      type: "success",
      title: "Budget is still alive",
      message: `You have ${Math.round(summary.remainingAmount)} left this month.`,
      metadata: { remainingAmount: summary.remainingAmount }
    });
  }

  if (summary.remainingAmount < 0) {
    insights.push({
      type: "danger",
      title: "Overspending detected",
      message: `You are over budget by ${Math.abs(Math.round(summary.remainingAmount))}.`,
      metadata: { remainingAmount: summary.remainingAmount }
    });
  }

  return insights;
}

async function fullSummary(userId, query = {}) {
  const [summary, breakdown, weekly, dailyAverage, trend, heatmapData] = await Promise.all([
    monthlySummary(userId, query),
    categoryBreakdown(userId, query),
    weeklyComparison(userId),
    averageDailyExpenses(userId, query),
    savingsTrend(userId),
    heatmap(userId, query)
  ]);

  return {
    summary,
    categoryBreakdown: breakdown,
    weeklyComparison: weekly,
    dailyAverage,
    savingsTrend: trend,
    topCategory: breakdown[0] || null,
    heatmap: heatmapData,
    generatedInsights: generateInsights({ summary, breakdown, weekly })
  };
}

async function createSnapshot(userId, query = {}) {
  const { month, year } = parseMonthYear(query);
  const summary = await fullSummary(userId, { month, year });

  const snapshot = await AnalyticsSnapshot.create({
    userId,
    month,
    year,
    totalMonthlySpend: summary.summary.totalSpend,
    topCategory: summary.topCategory?.category || "",
    weeklyAverage: summary.weeklyComparison.currentTotal / 7,
    savingRate: summary.summary.savingRate,
    generatedInsights: summary.generatedInsights,
    generatedAt: new Date()
  });

  return {
    snapshot,
    analytics: summary
  };
}

async function latestSnapshot(userId, query = {}) {
  const { month, year } = parseMonthYear(query);
  return AnalyticsSnapshot.findOne({ userId, month, year }).sort({ generatedAt: -1 });
}

module.exports = {
  averageDailyExpenses,
  categoryBreakdown,
  createSnapshot,
  fullSummary,
  heatmap,
  latestSnapshot,
  monthlySummary,
  savingsTrend,
  topCategory,
  weeklyComparison
};
