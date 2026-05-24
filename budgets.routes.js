const router = require("express").Router();
const budgetController = require("../controllers/budget.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { budgetQuerySchema, updateBudgetSchema, upsertBudgetSchema } = require("../validators/budget.validator");

router.use(requireAuth);

router.get("/current", validate(budgetQuerySchema), budgetController.getCurrentBudget);
router.get("/history", budgetController.budgetHistory);
router.post("/", validate(upsertBudgetSchema), budgetController.upsertBudget);
router.put("/", validate(upsertBudgetSchema), budgetController.upsertBudget);
router.patch("/:id", validate(updateBudgetSchema), budgetController.updateBudget);

module.exports = router;
