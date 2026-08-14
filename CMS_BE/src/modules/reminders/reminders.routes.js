const { Router } = require("express");
const remindersController = require("./reminders.controller");
const { validate } = require("../../middleware/validate");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");
const { listRemindersQuerySchema } = require("./reminders.validation");

const router = Router();

router.use(authenticate, loadCurrentUser);
router.get(
  "/",
  authorize("cases:view"),
  validate(listRemindersQuerySchema, "query"),
  remindersController.listReminders,
);

module.exports = router;
