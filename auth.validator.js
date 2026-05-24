const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    collegeName: z.string().trim().max(120).optional(),
    monthlyIncome: z.coerce.number().min(0).optional(),
    currency: z.string().trim().length(3).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1).max(128)
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20)
  })
});

const logoutSchema = refreshSchema;

const googleSchema = z.object({
  body: z.object({
    idToken: z.string().min(20),
    collegeName: z.string().trim().max(120).optional(),
    currency: z.string().trim().length(3).optional()
  })
});

module.exports = {
  googleSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema
};
