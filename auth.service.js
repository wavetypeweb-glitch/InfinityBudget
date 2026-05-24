const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { issueAuthTokens, revokeRefreshToken, rotateRefreshToken } = require("./token.service");
const { verifyGoogleIdToken } = require("./google.service");

function getRequestContext(req) {
  return {
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip
  };
}

async function register(payload, req) {
  const existing = await User.findOne({ email: payload.email });

  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash,
    collegeName: payload.collegeName || "",
    monthlyIncome: payload.monthlyIncome || 0,
    currency: payload.currency || "INR",
    authProvider: "local"
  });

  const tokens = await issueAuthTokens(user, getRequestContext(req));

  return {
    user: user.toSafeObject(),
    tokens
  };
}

async function login(payload, req) {
  const user = await User.findOne({ email: payload.email }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, getRequestContext(req));

  return {
    user: user.toSafeObject(),
    tokens
  };
}

async function googleLogin(payload, req) {
  const googleProfile = await verifyGoogleIdToken(payload.idToken);
  let user = await User.findOne({ email: googleProfile.email });

  if (!user) {
    user = await User.create({
      fullName: googleProfile.fullName,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      avatarUrl: googleProfile.avatarUrl,
      collegeName: payload.collegeName || "",
      currency: payload.currency || "INR",
      authProvider: "google",
      onboardingCompleted: false,
      lastLoginAt: new Date()
    });
  } else {
    user.googleId = user.googleId || googleProfile.googleId;
    user.avatarUrl = user.avatarUrl || googleProfile.avatarUrl;
    user.authProvider = user.authProvider === "local" ? "both" : user.authProvider;
    user.lastLoginAt = new Date();
    await user.save();
  }

  const tokens = await issueAuthTokens(user, getRequestContext(req));

  return {
    user: user.toSafeObject(),
    tokens
  };
}

async function refresh(refreshToken, req) {
  const tokens = await rotateRefreshToken(refreshToken, getRequestContext(req));
  return { tokens };
}

async function logout(refreshToken) {
  await revokeRefreshToken(refreshToken);
}

module.exports = {
  googleLogin,
  login,
  logout,
  refresh,
  register
};
