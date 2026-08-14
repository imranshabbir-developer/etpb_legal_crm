const notificationsService = require("./notifications.service");
const { success } = require("../../utils/response");

async function listNotifications(req, res, next) {
  try {
    const data = await notificationsService.listNotifications(req.user.id);
    return success(res, data, "Notifications loaded");
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const data = await notificationsService.markRead(req.user.id, req.params.id);
    return success(res, data, "Notification marked as read");
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const data = await notificationsService.markAllRead(req.user.id);
    return success(res, data, "Notifications marked as read");
  } catch (error) {
    next(error);
  }
}

module.exports = { listNotifications, markRead, markAllRead };
