const settingsService = require("./settings.service");
const { success } = require("../../utils/response");

async function getProfile(req, res, next) {
  try {
    const data = await settingsService.getProfile(req.user.id);
    return success(res, data, "Profile loaded");
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const data = await settingsService.updateProfile(req.user.id, req.body);
    return success(res, data, "Profile updated");
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const data = await settingsService.updatePassword(req.user.id, req.body);
    return success(res, data, "Password updated");
  } catch (error) {
    next(error);
  }
}

async function getModules(req, res, next) {
  try {
    const data = await settingsService.getModules();
    return success(res, data, "Modules loaded");
  } catch (error) {
    next(error);
  }
}

async function updateModules(req, res, next) {
  try {
    const data = await settingsService.updateModules(req.body);
    return success(res, data, "Modules updated");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getModules,
  updateModules,
};
