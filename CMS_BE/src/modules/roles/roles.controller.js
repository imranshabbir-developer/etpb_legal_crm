const rolesService = require("./roles.service");
const { success } = require("../../utils/response");

async function listRoles(req, res, next) {
  try {
    const roles = await rolesService.listActiveRoles();
    return success(res, roles, "Roles loaded");
  } catch (error) {
    next(error);
  }
}

module.exports = { listRoles };
