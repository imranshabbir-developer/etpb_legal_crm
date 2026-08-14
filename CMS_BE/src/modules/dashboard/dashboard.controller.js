const dashboardService = require("./dashboard.service");
const { success } = require("../../utils/response");

async function getSummary(req, res, next) {
  try {
    const data = await dashboardService.getSummary();
    return success(res, data, "Dashboard summary loaded");
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary };
