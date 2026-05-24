const { OAuth2Client } = require("google-auth-library");
const config = require("../config/env");
const ApiError = require("../utils/ApiError");

const client = config.google.clientId ? new OAuth2Client(config.google.clientId) : null;

async function verifyGoogleIdToken(idToken) {
  if (!client) {
    throw new ApiError(503, "Google OAuth is not configured");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.google.clientId
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    throw new ApiError(401, "Google account email is not verified");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName: payload.name || payload.email.split("@")[0],
    avatarUrl: payload.picture || ""
  };
}

module.exports = {
  verifyGoogleIdToken
};
