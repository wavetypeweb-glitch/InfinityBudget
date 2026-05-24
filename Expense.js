const mongoose = require("mongoose");
const { EXPENSE_CATEGORIES, PAYMENT_METHODS } = require("../utils/constants");

const ReceiptImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" }
  },
  { _id: false }
);

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    lat: { type: Number },
    lng: { type: Number }
  },
  { _id: false }
);

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    category: {
      type: String,
      required: true,
      enum: EXPENSE_CATEGORIES,
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ""
    },
    note: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ""
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "UPI"
    },
    expenseDate: {
      type: Date,
      required: true,
      index: true
    },
    location: {
      type: LocationSchema,
      default: () => ({})
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(tags) {
          return tags.length <= 12;
        },
        message: "A maximum of 12 tags is allowed"
      }
    },
    receiptImage: {
      type: ReceiptImageSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ExpenseSchema.index({ userId: 1, expenseDate: -1 });
ExpenseSchema.index({ userId: 1, category: 1, expenseDate: -1 });
ExpenseSchema.index({ userId: 1, paymentMethod: 1, expenseDate: -1 });
ExpenseSchema.index({ note: "text", subcategory: "text", tags: "text" });

module.exports = mongoose.model("Expense", ExpenseSchema);
