const asyncHandler = require("../utils/asyncHandler");
const budgetService = require("../services/budget.service");

const getCurrentBudget = asyncHandler(async (req, res) => {
  const result = await budgetService.getBudget(req.user._id, req.query);
  res.json({ success: true, ...result });
});

const upsertBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.upsertBudget(req.user._id, req.body);
  res.status(201).json({
    success: true,
    budget,
    alerts: budgetService.getBudgetAlerts(budget)
  });
});

const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.user._id, req.params.id, req.body);

  if (!budget) {
    return res.status(404).json({ success: false, message: "Budget not found" });
  }

  return res.json({
    success: true,
    budget,
    alerts: budgetService.getBudgetAlerts(budget)
  });
});

const budgetHistory = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgetHistory(req.user._id, req.query);
  res.json({ success: true, budgets });
});

module.exports = {
  budgetHistory,
  getCurrentBudget,
  updateBudget,
  upsertBudget
};
