const mongoose = require("mongoose");
const { ACHIEVEMENT_TYPES } = require("../utils/constants");

const AchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    badgeType: {
      type: String,
      enum: ACHIEVEMENT_TYPES,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

AchievementSchema.index({ userId: 1, badgeType: 1 }, { unique: true });
AchievementSchema.index({ userId: 1, unlockedAt: -1 });

module.exports = mongoose.model("Achievement", AchievementSchema);
