const { Router } = require("express");
const notificationsController = require("./notifications.controller");
const { validate } = require("../../middleware/validate");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");
const { notificationIdSchema } = require("./notifications.validation");

const router = Router();

router.use(authenticate, loadCurrentUser, authorize("cases:view"));
router.get("/", notificationsController.listNotifications);
router.patch(
  "/:id/read",
  validate(notificationIdSchema, "params"),
  notificationsController.markRead,
);
router.post("/read-all", notificationsController.markAllRead);

module.exports = router;
