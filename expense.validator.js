const { z } = require("zod");
const { EXPENSE_CATEGORIES, PAYMENT_METHODS } = require("../utils/constants");
const { idParams } = require("./common.validator");

const locationSchema = z.object({
  name: z.string().trim().max(120).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional()
}).optional();

const receiptImageSchema = z.object({
  url: z.string().url().or(z.literal("")).optional(),
  publicId: z.string().trim().max(160).optional()
}).optional();

const createExpenseSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    category: z.enum(EXPENSE_CATEGORIES),
    subcategory: z.string().trim().max(60).optional(),
    note: z.string().trim().max(240).optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    expenseDate: z.coerce.date(),
    location: locationSchema,
    tags: z.array(z.string().trim().min(1).max(30)).max(12).optional(),
    receiptImage: receiptImageSchema
  })
});

const updateExpenseSchema = z.object({
  params: idParams,
  body: createExpenseSchema.shape.body.partial().refine(
    (body) => Object.keys(body).length > 0,
    "No update fields provided"
  )
});

const listExpensesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    category: z.enum(EXPENSE_CATEGORIES).optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    search: z.string().trim().max(80).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    tags: z.string().trim().optional(),
    sort: z.enum(["newest", "oldest", "amount_desc", "amount_asc"]).optional()
  })
});

const expenseIdSchema = z.object({
  params: idParams
});

module.exports = {
  createExpenseSchema,
  expenseIdSchema,
  listExpensesSchema,
  updateExpenseSchema
};
