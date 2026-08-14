const remindersService = require("./reminders.service");
const { success } = require("../../utils/response");

async function listReminders(req, res, next) {
  try {
    const data = await remindersService.listReminders(req.query);
    return success(res, data, "Reminders loaded");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listReminders,
};
