const { Router } = require("express");
const courtsController = require("./courts.controller");
const { validate } = require("../../middleware/validate");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");
const { createCourtSchema, updateCourtSchema, listCourtsQuerySchema } = require("./courts.validation");

const router = Router();

router.get("/", validate(listCourtsQuerySchema, "query"), courtsController.listCourts);
router.get("/:id", courtsController.getCourt);

router.post(
  "/",
  authenticate,
  loadCurrentUser,
  authorize("courts:manage"),
  validate(createCourtSchema),
  courtsController.createCourt,
);

router.patch(
  "/:id",
  authenticate,
  loadCurrentUser,
  authorize("courts:manage"),
  validate(updateCourtSchema),
  courtsController.updateCourt,
);

module.exports = router;
