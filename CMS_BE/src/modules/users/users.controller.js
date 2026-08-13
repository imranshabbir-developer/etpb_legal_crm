const usersService = require("./users.service");
const { success } = require("../../utils/response");

async function listUsers(req, res, next) {
  try {
    const users = await usersService.listUsers();
    return success(res, users, "Users loaded");
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await usersService.createUser(req.user, req.body);
    return success(res, user, "User created", 201);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await usersService.updateUser(req.user, req.params.id, req.body);
    return success(res, user, "User updated");
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const user = await usersService.updateUserStatus(req.user, req.params.id, req.body.status);
    return success(res, user, "User status updated");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  updateStatus,
};
