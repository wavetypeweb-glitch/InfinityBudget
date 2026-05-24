const asyncHandler = require("../utils/asyncHandler");
const analyticsService = require("../services/analytics.service");

const summary = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.fullSummary(req.user._id, req.query);
  res.json({ success: true, analytics });
});

const monthlySummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.monthlySummary(req.user._id, req.query);
  res.json({ success: true, data });
});

const categoryBreakdown = asyncHandler(async (req, res) => {
  const data = await analyticsService.categoryBreakdown(req.user._id, req.query);
  res.json({ success: true, data });
});

const weeklyComparison = asyncHandler(async (req, res) => {
  const data = await analyticsService.weeklyComparison(req.user._id);
  res.json({ success: true, data });
});

const averageDailyExpenses = asyncHandler(async (req, res) => {
  const data = await analyticsService.averageDailyExpenses(req.user._id, req.query);
  res.json({ success: true, data });
});

const savingsTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.savingsTrend(req.user._id);
  res.json({ success: true, data });
});

const topCategory = asyncHandler(async (req, res) => {
  const data = await analyticsService.topCategory(req.user._id, req.query);
  res.json({ success: true, data });
});

const heatmap = asyncHandler(async (req, res) => {
  const data = await analyticsService.heatmap(req.user._id, req.query);
  res.json({ success: true, data });
});

const createSnapshot = asyncHandler(async (req, res) => {
  const result = await analyticsService.createSnapshot(req.user._id, req.query);
  res.status(201).json({ success: true, ...result });
});

const latestSnapshot = asyncHandler(async (req, res) => {
  const snapshot = await analyticsService.latestSnapshot(req.user._id, req.query);
  res.json({ success: true, snapshot });
});

module.exports = {
  averageDailyExpenses,
  categoryBreakdown,
  createSnapshot,
  heatmap,
  latestSnapshot,
  monthlySummary,
  savingsTrend,
  summary,
  topCategory,
  weeklyComparison
};
