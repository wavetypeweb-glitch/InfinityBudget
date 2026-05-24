const asyncHandler = require("../utils/asyncHandler");
const expenseService = require("../services/expense.service");

const listExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listExpenses(req.user._id, req.query);
  res.json({ success: true, ...result });
});

const getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpense(req.user._id, req.params.id);
  res.json({ success: true, expense });
});

const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user._id, req.body);
  res.status(201).json({ success: true, expense });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user._id, req.params.id, req.body);
  res.json({ success: true, expense });
});

const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user._id, req.params.id);
  res.json({ success: true, message: "Expense deleted" });
});

module.exports = {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense
};
