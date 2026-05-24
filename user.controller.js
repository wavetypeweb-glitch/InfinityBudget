const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.service");

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user, req.body);
  res.json({ success: true, user });
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const user = await userService.completeOnboarding(req.user, req.body);
  res.json({ success: true, user });
});

module.exports = {
  completeOnboarding,
  getMe,
  updateMe
};
