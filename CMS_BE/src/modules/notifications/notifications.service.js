const { Op } = require("sequelize");
const { Notification } = require("../../models");
const { ApiError } = require("../../utils/ApiError");
const remindersService = require("../reminders/reminders.service");

function notificationMeta(item) {
  return {
    source: "case-reminder",
    caseNo: item.caseNo,
    courtId: item.courtId,
    layer: item.layer,
    caseCategory: item.caseCategory,
    nextDateOfHearing: item.nextDateOfHearing,
    dueInDays: item.dueInDays,
    timing: item.timing,
    dueLabel: item.dueLabel,
  };
}

async function syncNotificationsForUser(userId) {
  const reminders = await remindersService.listReminders({ daysAhead: 30, limit: 200 });
  const activeKeys = new Set();
  const existing = await Notification.findAll({ where: { userId } });
  const existingByKey = new Map(existing.map((row) => [`${row.caseId}:${row.type}`, row]));
  const inserts = [];
  const updates = [];

  for (const item of reminders.items) {
    const key = `${item.caseId}:${item.type}`;
    activeKeys.add(key);
    const meta = notificationMeta(item);
    const row = existingByKey.get(key);

    if (!row) {
      inserts.push({
        userId,
        caseId: item.caseId,
        type: item.type,
        title: item.title,
        body: item.body,
        meta,
      });
    } else {
      const dateChanged =
        String(row.meta?.nextDateOfHearing || "") !== String(meta.nextDateOfHearing || "");
      const contentChanged =
        row.title !== item.title ||
        row.body !== item.body ||
        JSON.stringify(row.meta || {}) !== JSON.stringify(meta);
      if (contentChanged || dateChanged) {
        updates.push(
          row.update({
            title: item.title,
            body: item.body,
            meta,
            ...(dateChanged ? { readAt: null } : {}),
          }),
        );
      }
    }
  }

  if (inserts.length) await Notification.bulkCreate(inserts);
  if (updates.length) await Promise.all(updates);

  const staleIds = existing
    .filter((row) => row.caseId && !activeKeys.has(`${row.caseId}:${row.type}`))
    .map((row) => row.id);
  if (staleIds.length) {
    await Notification.destroy({ where: { id: { [Op.in]: staleIds } } });
  }

  return reminders;
}

async function listNotifications(userId) {
  await syncNotificationsForUser(userId);
  const rows = await Notification.findAll({
    where: { userId },
    order: [["updatedAt", "DESC"]],
  });
  rows.sort((a, b) => Number(Boolean(a.readAt)) - Number(Boolean(b.readAt)));
  return {
    unreadCount: rows.filter((row) => !row.readAt).length,
    items: rows.map((row) => row.toApiJSON()),
  };
}

async function markRead(userId, id) {
  const row = await Notification.findOne({ where: { id, userId } });
  if (!row) throw new ApiError(404, "Notification not found");
  if (!row.readAt) await row.update({ readAt: new Date() });
  return row.toApiJSON();
}

async function markAllRead(userId) {
  const [updated] = await Notification.update(
    { readAt: new Date() },
    { where: { userId, readAt: null } },
  );
  return { updated };
}

module.exports = {
  syncNotificationsForUser,
  listNotifications,
  markRead,
  markAllRead,
};
