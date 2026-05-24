const asyncHandler = require("../utils/asyncHandler");
const achievementService = require("../services/achievement.service");

const listAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementService.listAchievements(req.user._id);
  res.json({ success: true, achievements });
});

const recalculate = asyncHandler(async (req, res) => {
  const unlocked = await achievementService.evaluateUserAchievements(req.user._id);
  res.json({ success: true, unlocked });
});

module.exports = {
  listAchievements,
  recalculate
};
