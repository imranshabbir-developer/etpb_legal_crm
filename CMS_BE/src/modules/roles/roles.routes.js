const { Router } = require("express");
const rolesController = require("./roles.controller");

const router = Router();

router.get("/", rolesController.listRoles);

module.exports = router;
