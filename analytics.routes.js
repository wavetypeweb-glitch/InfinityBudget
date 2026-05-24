const router = require("express").Router();
const analyticsController = require("../controllers/analytics.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { analyticsMonthQuerySchema, dateRangeQuerySchema } = require("../validators/analytics.validator");

router.use(requireAuth);

router.get("/summary", validate(analyticsMonthQuerySchema), analyticsController.summary);
router.get("/monthly-summary", validate(analyticsMonthQuerySchema), analyticsController.monthlySummary);
router.get("/category-breakdown", validate(dateRangeQuerySchema), analyticsController.categoryBreakdown);
router.get("/weekly-comparison", analyticsController.weeklyComparison);
router.get("/daily-average", validate(dateRangeQuerySchema), analyticsController.averageDailyExpenses);
router.get("/savings-trend", analyticsController.savingsTrend);
router.get("/top-category", validate(dateRangeQuerySchema), analyticsController.topCategory);
router.get("/heatmap", validate(dateRangeQuerySchema), analyticsController.heatmap);
router.get("/snapshots/latest", validate(analyticsMonthQuerySchema), analyticsController.latestSnapshot);
router.post("/snapshots", validate(analyticsMonthQuerySchema), analyticsController.createSnapshot);

module.exports = router;
