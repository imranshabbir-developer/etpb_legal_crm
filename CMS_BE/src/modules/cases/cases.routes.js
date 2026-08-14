const { Router } = require("express");
const casesController = require("./cases.controller");
const { validate } = require("../../middleware/validate");
const { authenticate, loadCurrentUser, authorize } = require("../../middleware/auth");
const {
  createCaseSchema,
  updateCaseSchema,
  listCasesQuerySchema,
} = require("./cases.validation");

const router = Router();

router.use(authenticate, loadCurrentUser);

router.get(
  "/",
  authorize("cases:view"),
  validate(listCasesQuerySchema, "query"),
  casesController.listCases,
);
router.get("/:id", authorize("cases:view"), casesController.getCase);
router.post("/", authorize("cases:create"), validate(createCaseSchema), casesController.createCase);
router.patch(
  "/:id",
  authorize("cases:edit"),
  validate(updateCaseSchema),
  casesController.updateCase,
);
router.delete("/:id", authorize("cases:delete"), casesController.deleteCase);
router.delete("/", authorize("cases:delete"), casesController.bulkDelete);

module.exports = router;
