const Goal = require("../models/Goal");
const ApiError = require("../utils/ApiError");
const { getPagination, paginatedResponse } = require("../utils/pagination");
const achievementService = require("./achievement.service");

function applyGoalCompletion(goal) {
  if (goal.savedAmount >= goal.targetAmount) {
    goal.savedAmount = goal.targetAmount;
    goal.status = "completed";
  }
}

async function listGoals(userId, query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = { userId };
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    Goal.find(filter).sort({ status: 1, targetDate: 1, createdAt: -1 }).skip(skip).limit(limit),
    Goal.countDocuments(filter)
  ]);

  return paginatedResponse({ data, page, limit, total });
}

async function getGoal(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, "Goal not found");
  return goal;
}

async function createGoal(userId, payload) {
  const goal = new Goal({ ...payload, userId });
  applyGoalCompletion(goal);
  await goal.save();
  await achievementService.evaluateUserAchievements(userId);
  return goal;
}

async function updateGoal(userId, goalId, payload) {
  const goal = await getGoal(userId, goalId);
  Object.assign(goal, payload);
  applyGoalCompletion(goal);
  await goal.save();
  await achievementService.evaluateUserAchievements(userId);
  return goal;
}

async function contribute(userId, goalId, amount) {
  const goal = await getGoal(userId, goalId);
  goal.savedAmount += amount;
  applyGoalCompletion(goal);
  await goal.save();
  await achievementService.evaluateUserAchievements(userId);
  return goal;
}

async function deleteGoal(userId, goalId) {
  const goal = await getGoal(userId, goalId);
  await goal.deleteOne();
}

module.exports = {
  contribute,
  createGoal,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal
};
