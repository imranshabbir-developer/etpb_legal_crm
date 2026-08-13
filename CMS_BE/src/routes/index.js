const { Router } = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const rolesRoutes = require("../modules/roles/roles.routes");
const usersRoutes = require("../modules/users/users.routes");

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

module.exports = router;
