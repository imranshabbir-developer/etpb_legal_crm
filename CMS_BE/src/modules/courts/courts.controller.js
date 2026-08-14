const courtsService = require("./courts.service");
const { success } = require("../../utils/response");

async function listCourts(req, res, next) {
  try {
    const courts = await courtsService.listCourts({ layer: req.query.layer });
    return success(res, courts, "Courts loaded");
  } catch (error) {
    next(error);
  }
}

async function getCourt(req, res, next) {
  try {
    const court = await courtsService.getCourtBySlugOrId(req.params.id);
    return success(res, court, "Court loaded");
  } catch (error) {
    next(error);
  }
}

async function createCourt(req, res, next) {
  try {
    const court = await courtsService.createCourt(req.body);
    return success(res, court, "Court created", 201);
  } catch (error) {
    next(error);
  }
}

async function updateCourt(req, res, next) {
  try {
    const court = await courtsService.updateCourt(req.params.id, req.body);
    return success(res, court, "Court updated");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCourts,
  getCourt,
  createCourt,
  updateCourt,
};
