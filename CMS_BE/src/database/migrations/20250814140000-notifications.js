/**
 * Persistent, per-user notification inbox generated from live case reminders.
 */
module.exports = {
  async up(sequelize) {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id UUID NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        case_id UUID NULL REFERENCES cases(id) ON UPDATE CASCADE ON DELETE CASCADE,
        type VARCHAR(40) NOT NULL,
        title VARCHAR(240) NOT NULL,
        body TEXT NOT NULL,
        read_at TIMESTAMPTZ NULL,
        meta JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS notifications_user_read_idx
      ON notifications (user_id, read_at);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS notifications_case_idx
      ON notifications (case_id);
    `);
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS notifications_user_case_type_uq
      ON notifications (user_id, case_id, type);
    `);
  },

  async down(sequelize) {
    await sequelize.query("DROP TABLE IF EXISTS notifications CASCADE;");
  },
};
