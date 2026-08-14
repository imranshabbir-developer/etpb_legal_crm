const { Router } = require("express");
const dashboardController = require("./dashboard.controller");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");

const router = Router();

router.use(authenticate, loadCurrentUser);
router.get("/summary", authorize("cases:view"), dashboardController.getSummary);

module.exports = router;
