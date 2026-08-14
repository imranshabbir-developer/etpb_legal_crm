const { Router } = require("express");
const settingsController = require("./settings.controller");
const { validate } = require("../../middleware/validate");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");
const { updateProfileSchema, updateModulesSchema } = require("./settings.validation");
const { changePasswordSchema } = require("../auth/auth.validation");

const router = Router();

router.use(authenticate, loadCurrentUser);

router.get("/profile", authorize("settings:view"), settingsController.getProfile);
router.patch(
  "/profile",
  authorize("settings:manage"),
  validate(updateProfileSchema),
  settingsController.updateProfile,
);
router.post(
  "/password",
  authorize("settings:view"),
  validate(changePasswordSchema),
  settingsController.updatePassword,
);
router.get("/modules", authorize("settings:view"), settingsController.getModules);
router.patch(
  "/modules",
  authorize("modules:configure"),
  validate(updateModulesSchema),
  settingsController.updateModules,
);

module.exports = router;
