async function updateMe(user, payload) {
  Object.assign(user, payload);
  await user.save();
  return user.toSafeObject();
}

async function completeOnboarding(user, payload) {
  Object.assign(user, payload, { onboardingCompleted: payload.onboardingCompleted ?? true });
  await user.save();
  return user.toSafeObject();
}

module.exports = {
  completeOnboarding,
  updateMe
};
