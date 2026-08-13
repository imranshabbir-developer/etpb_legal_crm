const { Router } = require("express");
const authController = require("./auth.controller");
const { validate } = require("../../middleware/validate");
const { loginSchema, changePasswordSchema } = require("./auth.validation");
const { authenticate } = require("../../middleware/auth");

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
