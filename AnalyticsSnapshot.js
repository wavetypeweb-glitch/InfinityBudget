const mongoose = require("mongoose");

const InsightSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["success", "warning", "danger", "info"],
      default: "info"
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: false }
);

const AnalyticsSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: true
    },
    year: {
      type: Number,
      min: 2000,
      required: true
    },
    totalMonthlySpend: {
      type: Number,
      default: 0
    },
    topCategory: {
      type: String,
      default: ""
    },
    weeklyAverage: {
      type: Number,
      default: 0
    },
    savingRate: {
      type: Number,
      default: 0
    },
    generatedInsights: {
      type: [InsightSchema],
      default: []
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false
  }
);

AnalyticsSnapshotSchema.index({ userId: 1, month: 1, year: 1, generatedAt: -1 });

module.exports = mongoose.model("AnalyticsSnapshot", AnalyticsSnapshotSchema);
