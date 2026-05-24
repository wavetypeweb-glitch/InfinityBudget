const { z } = require("zod");
const { monthYearQuery } = require("./common.validator");

const analyticsMonthQuerySchema = z.object({
  query: monthYearQuery
});

const dateRangeQuerySchema = z.object({
  query: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(3000).optional()
  })
});

module.exports = {
  analyticsMonthQuerySchema,
  dateRangeQuerySchema
};
