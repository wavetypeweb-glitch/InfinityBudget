const mongoose = require("mongoose");
const { EXPENSE_CATEGORIES } = require("../utils/constants");

const CategoryLimitSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: true
    },
    limit: {
      type: Number,
      min: 0,
      required: true
    },
    spentAmount: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { _id: false }
);

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0
    },
    categoryLimits: {
      type: [CategoryLimitSchema],
      default: []
    },
    spentAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: 0
    },
    warningThreshold: {
      type: Number,
      min: 1,
      max: 100,
      default: 80
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2000
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

BudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
BudgetSchema.index({ userId: 1, year: -1, month: -1 });

module.exports = mongoose.model("Budget", BudgetSchema);
