const router = require("express").Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "InfinityBudget API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/expenses", require("./expenses.routes"));
router.use("/budgets", require("./budgets.routes"));
router.use("/goals", require("./goals.routes"));
router.use("/analytics", require("./analytics.routes"));
router.use("/achievements", require("./achievements.routes"));

module.exports = router;
