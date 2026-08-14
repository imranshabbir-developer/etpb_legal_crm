const { Router } = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const rolesRoutes = require("../modules/roles/roles.routes");
const usersRoutes = require("../modules/users/users.routes");
const courtsRoutes = require("../modules/courts/courts.routes");
const casesRoutes = require("../modules/cases/cases.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const remindersRoutes = require("../modules/reminders/reminders.routes");
const notificationsRoutes = require("../modules/notifications/notifications.routes");
const settingsRoutes = require("../modules/settings/settings.routes");

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "ETPB CMS API is healthy",
    data: {
      service: "etpb-cms-be",
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/roles", rolesRoutes);
router.use("/users", usersRoutes);
router.use("/courts", courtsRoutes);
router.use("/cases", casesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reminders", remindersRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/settings", settingsRoutes);

module.exports = router;
