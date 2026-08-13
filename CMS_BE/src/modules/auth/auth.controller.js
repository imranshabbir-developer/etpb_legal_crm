const authService = require("./auth.service");
const { success } = require("../../utils/response");

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return success(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const profile = await authService.getProfile(req.auth.sub);
    return success(res, profile, "Profile loaded");
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword(req.auth.sub, req.body);
    return success(res, result, "Password changed successfully");
  } catch (error) {
    next(error);
  }
}

async function logout(_req, res) {
  // JWT is stateless; client must discard the token.
  return success(res, { loggedOut: true }, "Logged out");
}

module.exports = { login, me, changePassword, logout };
