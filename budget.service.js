const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { endOfMonth, getMonthYear, parseMonthYear, startOfMonth } = require("../utils/date");

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id.toString());
}

function normalizeCategoryLimits(categoryLimits = []) {
  const byCategory = new Map();

  for (const item of categoryLimits) {
    byCategory.set(item.category, {
      category: item.category,
      limit: Number(item.limit) || 0,
      spentAmount: Number(item.spentAmount) || 0
    });
  }

  return Array.from(byCategory.values());
}

async function getCategorySpend(userId, month, year) {
  const start = startOfMonth(month, year);
  const end = endOfMonth(month, year);

  return Expense.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        expenseDate: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: "$category",
        spentAmount: { $sum: "$amount" }
      }
    }
  ]);
}

async function recalculateBudget(userId, month, year) {
  const budget = await Budget.findOne({ userId, month, year });

  if (!budget) {
    return null;
  }

  const categorySpend = await getCategorySpend(userId, month, year);
  const spendMap = new Map(categorySpend.map((item) => [item._id, item.spentAmount]));
  const spentAmount = categorySpend.reduce((total, item) => total + item.spentAmount, 0);

  budget.spentAmount = spentAmount;
  budget.remainingAmount = budget.monthlyLimit - spentAmount;
  budget.categoryLimits = budget.categoryLimits.map((limit) => ({
    category: limit.category,
    limit: limit.limit,
    spentAmount: spendMap.get(limit.category) || 0
  }));

  await budget.save();
  return budget;
}

function getBudgetAlerts(budget) {
  if (!budget) return [];

  const alerts = [];
  const usage = budget.monthlyLimit > 0 ? (budget.spentAmount / budget.monthlyLimit) * 100 : 0;

  if (usage >= 100) {
    alerts.push({
      type: "overspent",
      severity: "danger",
      message: "Monthly budget crossed",
      usage
    });
  } else if (usage >= budget.warningThreshold) {
    alerts.push({
      type: "budget_warning",
      severity: "warning",
      message: "Monthly budget warning threshold reached",
      usage
    });
  }

  for (const limit of budget.categoryLimits) {
    const categoryUsage = limit.limit > 0 ? (limit.spentAmount / limit.limit) * 100 : 0;
    if (categoryUsage >= 100) {
      alerts.push({
        type: "category_overspent",
        severity: "danger",
        category: limit.category,
        message: `${limit.category} category limit crossed`,
        usage: categoryUsage
      });
    } else if (categoryUsage >= budget.warningThreshold) {
      alerts.push({
        type: "category_warning",
        severity: "warning",
        category: limit.category,
        message: `${limit.category} category is close to its limit`,
        usage: categoryUsage
      });
    }
  }

  return alerts;
}

async function upsertBudget(userId, payload) {
  const fallback = getMonthYear();
  const month = payload.month || fallback.month;
  const year = payload.year || fallback.year;

  const budget = await Budget.findOneAndUpdate(
    { userId, month, year },
    {
      $set: {
        monthlyLimit: payload.monthlyLimit,
        categoryLimits: normalizeCategoryLimits(payload.categoryLimits || []),
        warningThreshold: payload.warningThreshold || 80,
        month,
        year
      },
      $setOnInsert: {
        spentAmount: 0,
        remainingAmount: payload.monthlyLimit
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  return recalculateBudget(userId, budget.month, budget.year);
}

async function updateBudget(userId, budgetId, payload) {
  const update = { ...payload };

  if (payload.categoryLimits) {
    update.categoryLimits = normalizeCategoryLimits(payload.categoryLimits);
  }

  const budget = await Budget.findOneAndUpdate(
    { _id: budgetId, userId },
    update,
    { new: true, runValidators: true }
  );

  if (!budget) return null;
  return recalculateBudget(userId, budget.month, budget.year);
}

async function getBudget(userId, query) {
  const { month, year } = parseMonthYear(query);
  const budget = await recalculateBudget(userId, month, year);

  return {
    budget,
    alerts: getBudgetAlerts(budget)
  };
}

async function getBudgetHistory(userId, query = {}) {
  const limit = Math.min(24, Number(query.limit) || 12);
  const budgets = await Budget.find({ userId })
    .sort({ year: -1, month: -1 })
    .limit(limit);

  return budgets;
}

module.exports = {
  getBudget,
  getBudgetAlerts,
  getBudgetHistory,
  recalculateBudget,
  upsertBudget,
  updateBudget
};
