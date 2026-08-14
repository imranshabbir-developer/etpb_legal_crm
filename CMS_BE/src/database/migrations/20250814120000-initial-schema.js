/**
 * Initial schema bootstrap.
 * Creates all Sequelize models (no alter). Drops retired notifications table if present.
 */
module.exports = {
  async up(sequelize) {
    await sequelize.query('DROP TABLE IF EXISTS "notifications" CASCADE;');
    // Ensure model associations are registered before sync.
    require("../../models");
    await sequelize.sync();
  },

  async down(sequelize) {
    await sequelize.drop();
  },
};
