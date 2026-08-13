const { Router } = require("express");
const usersController = require("./users.controller");
const { validate } = require("../../middleware/validate");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");
const {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
} = require("./users.validation");

const router = Router();

router.use(authenticate, loadCurrentUser);

router.get("/", authorize("users:view"), usersController.listUsers);
router.post(
  "/",
  authorize("users:manage-staff", "users:manage-admin"),
  validate(createUserSchema),
  usersController.createUser,
);
router.patch(
  "/:id",
  authorize("users:manage-staff", "users:manage-admin"),
  validate(updateUserSchema),
  usersController.updateUser,
);
router.patch(
  "/:id/status",
  authorize("users:manage-staff", "users:manage-admin"),
  validate(updateStatusSchema),
  usersController.updateStatus,
);

module.exports = router;
