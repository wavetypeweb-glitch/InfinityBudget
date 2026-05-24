const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");
const {
  googleSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema
} = require("../validators/auth.validator");

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/google", authLimiter, validate(googleSchema), authController.googleLogin);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(logoutSchema), authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
