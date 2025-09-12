// src/backend/utils/logActivity.js
const { ActivityLog } = require("../models");
module.exports = async function logActivity({
  userId,
  action,
  targetType,
  targetId,
  details = "",
}) {
  try {
    await ActivityLog.create({
      userId,
      action,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
