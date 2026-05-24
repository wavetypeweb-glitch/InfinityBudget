const Expense = require("../models/Expense");
const ApiError = require("../utils/ApiError");
const { getPagination, paginatedResponse } = require("../utils/pagination");
const { getMonthYear } = require("../utils/date");
const budgetService = require("./budget.service");
const achievementService = require("./achievement.service");

function getExpenseMonthYear(expenseDate) {
  return getMonthYear(new Date(expenseDate));
}

function buildExpenseFilter(userId, query = {}) {
  const filter = { userId };

  if (query.category) filter.category = query.category;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.tags) filter.tags = { $in: query.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };

  if (query.startDate || query.endDate) {
    filter.expenseDate = {};
    if (query.startDate) filter.expenseDate.$gte = query.startDate;
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.expenseDate.$lte = end;
    }
  }

  if (query.search) {
    filter.$or = [
      { note: { $regex: query.search, $options: "i" } },
      { subcategory: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } }
    ];
  }

  return filter;
}

function sortFromQuery(sort = "newest") {
  const sorts = {
    newest: { expenseDate: -1, createdAt: -1 },
    oldest: { expenseDate: 1, createdAt: 1 },
    amount_desc: { amount: -1 },
    amount_asc: { amount: 1 }
  };

  return sorts[sort] || sorts.newest;
}

async function listExpenses(userId, query) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildExpenseFilter(userId, query);
  const sort = sortFromQuery(query.sort);

  const [data, total] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(limit),
    Expense.countDocuments(filter)
  ]);

  return paginatedResponse({ data, page, limit, total });
}

async function getExpense(userId, expenseId) {
  const expense = await Expense.findOne({ _id: expenseId, userId });
  if (!expense) throw new ApiError(404, "Expense not found");
  return expense;
}

async function createExpense(userId, payload) {
  const expense = await Expense.create({ ...payload, userId });
  const { month, year } = getExpenseMonthYear(expense.expenseDate);

  await budgetService.recalculateBudget(userId, month, year);
  await achievementService.evaluateUserAchievements(userId);

  return expense;
}

async function updateExpense(userId, expenseId, payload) {
  const before = await getExpense(userId, expenseId);
  const beforeMonthYear = getExpenseMonthYear(before.expenseDate);

  Object.assign(before, payload);
  await before.save();

  const afterMonthYear = getExpenseMonthYear(before.expenseDate);

  await budgetService.recalculateBudget(userId, beforeMonthYear.month, beforeMonthYear.year);
  if (beforeMonthYear.month !== afterMonthYear.month || beforeMonthYear.year !== afterMonthYear.year) {
    await budgetService.recalculateBudget(userId, afterMonthYear.month, afterMonthYear.year);
  }
  await achievementService.evaluateUserAchievements(userId);

  return before;
}

async function deleteExpense(userId, expenseId) {
  const expense = await getExpense(userId, expenseId);
  const { month, year } = getExpenseMonthYear(expense.expenseDate);
  await expense.deleteOne();
  await budgetService.recalculateBudget(userId, month, year);
}

module.exports = {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense
};
