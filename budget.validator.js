const { z } = require("zod");
const { EXPENSE_CATEGORIES } = require("../utils/constants");
const { idParams, monthYearQuery } = require("./common.validator");

const categoryLimitSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  limit: z.coerce.number().min(0)
});

const upsertBudgetSchema = z.object({
  body: z.object({
    monthlyLimit: z.coerce.number().min(0),
    categoryLimits: z.array(categoryLimitSchema).max(20).optional(),
    warningThreshold: z.coerce.number().min(1).max(100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(3000).optional()
  })
});

const updateBudgetSchema = z.object({
  params: idParams,
  body: z.object({
    monthlyLimit: z.coerce.number().min(0).optional(),
    categoryLimits: z.array(categoryLimitSchema).max(20).optional(),
    warningThreshold: z.coerce.number().min(1).max(100).optional()
  }).refine((body) => Object.keys(body).length > 0, "No update fields provided")
});

const budgetQuerySchema = z.object({
  query: monthYearQuery
});

module.exports = {
  budgetQuerySchema,
  updateBudgetSchema,
  upsertBudgetSchema
};
