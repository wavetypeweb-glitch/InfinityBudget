const mongoose = require("mongoose");
const Achievement = require("../models/Achievement");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const Goal = require("../models/Goal");
const { endOfMonth, getMonthYear, startOfMonth, subtractDays } = require("../utils/date");

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id.toString());
}

const BADGES = {
  first_expense: {
    title: "First Spend Logged",
    description: "You tracked your first expense."
  },
  three_day_streak: {
    title: "3 Day Saver",
    description: "You stayed under daily pace for 3 days."
  },
  seven_day_streak: {
    title: "7 Day Saver",
    description: "You stayed under daily pace for 7 days."
  },
  no_spend_day: {
    title: "No-Spend Day",
    description: "You completed a day without spending."
  },
  under_budget_month: {
    title: "Budget Boss",
    description: "You are staying under this month's budget."
  },
  goal_completed: {
    title: "Goal Completed",
    description: "You completed a savings goal."
  },
  savings_milestone: {
    title: "Savings Milestone",
    description: "You crossed a meaningful savings milestone."
  }
};

async function unlock(userId, badgeType) {
  const badge = BADGES[badgeType];
  if (!badge) return null;

  return Achievement.findOneAndUpdate(
    { userId, badgeType },
    {
      $setOnInsert: {
        userId,
        badgeType,
        title: badge.title,
        description: badge.description,
        unlockedAt: new Date()
      }
    },
    { new: true, upsert: true }
  );
}

async function getDailySpendMap(userId, days) {
  const end = new Date();
  const start = subtractDays(end, days - 1);
  start.setUTCHours(0, 0, 0, 0);

  const rows = await Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $dateToString: { date: "$expenseDate", format: "%Y-%m-%d" } },
        total: { $sum: "$amount" }
      }
    }
  ]);

  return new Map(rows.map((row) => [row._id, row.total]));
}

async function evaluateUserAchievements(userId) {
  const unlocked = [];
  const totalExpenses = await Expense.countDocuments({ userId });

  if (totalExpenses > 0) {
    unlocked.push(await unlock(userId, "first_expense"));
  }

  const { month, year } = getMonthYear();
  const budget = await Budget.findOne({ userId, month, year });
  const currentGoals = await Goal.find({ userId });

  if (currentGoals.some((goal) => goal.status === "completed" || goal.savedAmount >= goal.targetAmount)) {
    unlocked.push(await unlock(userId, "goal_completed"));
  }

  if (currentGoals.some((goal) => goal.savedAmount >= 5000)) {
    unlocked.push(await unlock(userId, "savings_milestone"));
  }

  if (budget) {
    const start = startOfMonth(month, year);
    const end = endOfMonth(month, year);
    const monthly = await Expense.aggregate([
      {
        $match: {
          userId: toObjectId(userId),
          expenseDate: { $gte: start, $lt: end }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const spent = monthly[0]?.total || 0;
    if (spent <= budget.monthlyLimit) {
      unlocked.push(await unlock(userId, "under_budget_month"));
    }

    const dailyLimit = budget.monthlyLimit / 30;
    const spendMap = await getDailySpendMap(userId, 7);
    let streak = 0;

    for (let offset = 0; offset < 7; offset += 1) {
      const date = subtractDays(new Date(), offset);
      const key = date.toISOString().slice(0, 10);
      const daySpend = spendMap.get(key) || 0;
      if (daySpend <= dailyLimit) streak += 1;
      else break;
    }

    if (streak >= 3) unlocked.push(await unlock(userId, "three_day_streak"));
    if (streak >= 7) unlocked.push(await unlock(userId, "seven_day_streak"));
    if ([...spendMap.values()].some((amount) => amount === 0) || spendMap.size < 7) {
      unlocked.push(await unlock(userId, "no_spend_day"));
    }
  }

  return unlocked.filter(Boolean);
}

async function listAchievements(userId) {
  return Achievement.find({ userId }).sort({ unlockedAt: -1 });
}

module.exports = {
  evaluateUserAchievements,
  listAchievements
};
