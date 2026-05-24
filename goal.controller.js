const asyncHandler = require("../utils/asyncHandler");
const goalService = require("../services/goal.service");

const listGoals = asyncHandler(async (req, res) => {
  const result = await goalService.listGoals(req.user._id, req.query);
  res.json({ success: true, ...result });
});

const getGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoal(req.user._id, req.params.id);
  res.json({ success: true, goal });
});

const createGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.user._id, req.body);
  res.status(201).json({ success: true, goal });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.updateGoal(req.user._id, req.params.id, req.body);
  res.json({ success: true, goal });
});

const contribute = asyncHandler(async (req, res) => {
  const goal = await goalService.contribute(req.user._id, req.params.id, req.body.amount);
  res.json({ success: true, goal });
});

const deleteGoal = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.user._id, req.params.id);
  res.json({ success: true, message: "Goal deleted" });
});

module.exports = {
  contribute,
  createGoal,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal
};
