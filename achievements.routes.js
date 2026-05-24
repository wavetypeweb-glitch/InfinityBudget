const router = require("express").Router();
const achievementController = require("../controllers/achievement.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/", achievementController.listAchievements);
router.post("/recalculate", achievementController.recalculate);

module.exports = router;
