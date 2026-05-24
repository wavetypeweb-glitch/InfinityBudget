const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { onboardingSchema, updateMeSchema } = require("../validators/user.validator");

router.use(requireAuth);

router.get("/me", userController.getMe);
router.patch("/me", validate(updateMeSchema), userController.updateMe);
router.patch("/onboarding", validate(onboardingSchema), userController.completeOnboarding);

module.exports = router;
