const casesService = require("./cases.service");
const { success } = require("../../utils/response");
const { ApiError } = require("../../utils/ApiError");
const { bulkDeleteCasesSchema, clearCategoryQuerySchema } = require("./cases.validation");

async function listCases(req, res, next) {
  try {
    const data = await casesService.listCases(req.query);
    return success(res, data, "Cases loaded");
  } catch (error) {
    next(error);
  }
}

async function getCase(req, res, next) {
  try {
    const data = await casesService.getCaseById(req.params.id);
    return success(res, data, "Case loaded");
  } catch (error) {
    next(error);
  }
}

async function createCase(req, res, next) {
  try {
    const data = await casesService.createCase(req.body);
    return success(res, data, "Case created", 201);
  } catch (error) {
    next(error);
  }
}

async function updateCase(req, res, next) {
  try {
    const data = await casesService.updateCase(req.params.id, req.body);
    return success(res, data, "Case updated");
  } catch (error) {
    next(error);
  }
}

async function deleteCase(req, res, next) {
  try {
    const data = await casesService.deleteCase(req.params.id);
    return success(res, data, "Case deleted");
  } catch (error) {
    next(error);
  }
}

async function bulkDelete(req, res, next) {
  try {
    const query = clearCategoryQuerySchema.parse(req.query || {});
    if (query.courtId && query.category) {
      const data = await casesService.clearCourtCategory(query.courtId, query.category);
      return success(res, data, "Category cleared");
    }
    if (query.courtId || query.category) {
      throw new ApiError(400, "Both courtId and category are required to clear a category");
    }

    const body = bulkDeleteCasesSchema.parse(req.body || {});
    const data = await casesService.deleteCases(body.ids);
    return success(res, data, "Cases deleted");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  bulkDelete,
};
