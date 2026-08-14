/**
 * Unique case number per court + category.
 */
module.exports = {
  async up(sequelize) {
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS cases_court_category_caseno_uq
      ON cases (court_slug, case_category, case_no);
    `);
  },

  async down(sequelize) {
    await sequelize.query(`DROP INDEX IF EXISTS cases_court_category_caseno_uq;`);
  },
};
