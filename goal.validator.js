const { z } = require("zod");
const { GOAL_STATUSES } = require("../utils/constants");
const { idParams } = require("./common.validator");

const createGoalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(100),
    targetAmount: z.coerce.number().positive(),
    savedAmount: z.coerce.number().min(0).optional(),
    targetDate: z.coerce.date().optional(),
    status: z.enum(GOAL_STATUSES).optional()
  })
});

const updateGoalSchema = z.object({
  params: idParams,
  body: z.object({
    title: z.string().trim().min(2).max(100).optional(),
    targetAmount: z.coerce.number().positive().optional(),
    savedAmount: z.coerce.number().min(0).optional(),
    targetDate: z.coerce.date().optional(),
    status: z.enum(GOAL_STATUSES).optional()
  }).refine((body) => Object.keys(body).length > 0, "No update fields provided")
});

const listGoalsSchema = z.object({
  query: z.object({
    status: z.enum(GOAL_STATUSES).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

const goalIdSchema = z.object({
  params: idParams
});

const contributeGoalSchema = z.object({
  params: idParams,
  body: z.object({
    amount: z.coerce.number().positive()
  })
});

module.exports = {
  contributeGoalSchema,
  createGoalSchema,
  goalIdSchema,
  listGoalsSchema,
  updateGoalSchema
};
