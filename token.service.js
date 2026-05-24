const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const config = require("../config/env");
const ApiError = require("../utils/ApiError");
const { hashToken, randomToken } = require("../utils/crypto");

function parseExpiryToDate(expiry) {
  const match = String(expiry).match(/^(\d+)([smhd])$/);
  if (!match) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multiplier = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  }[unit];

  return new Date(Date.now() + value * multiplier);
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn
    }
  );
}

async function createRefreshToken(userId, context = {}) {
  const token = randomToken();
  const tokenHash = hashToken(token);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt: parseExpiryToDate(config.jwt.refreshExpiresIn),
    userAgent: context.userAgent || "",
    ipAddress: context.ipAddress || ""
  });

  return token;
}

async function issueAuthTokens(user, context = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user._id, context);

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: config.jwt.accessExpiresIn
  };
}

async function rotateRefreshToken(refreshToken, context = {}) {
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  stored.revokedAt = new Date();
  await stored.save();

  const user = await User.findById(stored.userId);

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  return issueAuthTokens(user, context);
}

async function revokeRefreshToken(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null },
    { revokedAt: new Date() }
  );
}

module.exports = {
  issueAuthTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken
};
