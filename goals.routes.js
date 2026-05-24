const router = require("express").Router();
const goalController = require("../controllers/goal.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  contributeGoalSchema,
  createGoalSchema,
  goalIdSchema,
  listGoalsSchema,
  updateGoalSchema
} = require("../validators/goal.validator");

router.use(requireAuth);

router
  .route("/")
  .get(validate(listGoalsSchema), goalController.listGoals)
  .post(validate(createGoalSchema), goalController.createGoal);

router.post("/:id/contributions", validate(contributeGoalSchema), goalController.contribute);

router
  .route("/:id")
  .get(validate(goalIdSchema), goalController.getGoal)
  .patch(validate(updateGoalSchema), goalController.updateGoal)
  .delete(validate(goalIdSchema), goalController.deleteGoal);

module.exports = router;
