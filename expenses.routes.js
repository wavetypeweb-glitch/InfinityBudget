const router = require("express").Router();
const expenseController = require("../controllers/expense.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createExpenseSchema,
  expenseIdSchema,
  listExpensesSchema,
  updateExpenseSchema
} = require("../validators/expense.validator");

router.use(requireAuth);

router
  .route("/")
  .get(validate(listExpensesSchema), expenseController.listExpenses)
  .post(validate(createExpenseSchema), expenseController.createExpense);

router
  .route("/:id")
  .get(validate(expenseIdSchema), expenseController.getExpense)
  .patch(validate(updateExpenseSchema), expenseController.updateExpense)
  .delete(validate(expenseIdSchema), expenseController.deleteExpense);

module.exports = router;
