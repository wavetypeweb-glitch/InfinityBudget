const mongoose = require("mongoose");
const { GOAL_STATUSES } = require("../utils/constants");

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1
    },
    savedAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: "active",
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

GoalSchema.index({ userId: 1, status: 1, targetDate: 1 });

GoalSchema.virtual("progressPercentage").get(function progressPercentage() {
  return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

GoalSchema.set("toJSON", { virtuals: true });
GoalSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Goal", GoalSchema);
