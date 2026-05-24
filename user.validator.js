const { z } = require("zod");

const updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(80).optional(),
    avatarUrl: z.string().url().or(z.literal("")).optional(),
    collegeName: z.string().trim().max(120).optional(),
    monthlyIncome: z.coerce.number().min(0).optional(),
    currency: z.string().trim().length(3).optional()
  }).refine((body) => Object.keys(body).length > 0, "No update fields provided")
});

const onboardingSchema = z.object({
  body: z.object({
    onboardingCompleted: z.boolean().default(true),
    monthlyIncome: z.coerce.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    collegeName: z.string().trim().max(120).optional()
  })
});

module.exports = {
  onboardingSchema,
  updateMeSchema
};
