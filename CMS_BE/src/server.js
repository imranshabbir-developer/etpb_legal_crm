const { createApp } = require("./app");
const { env } = require("./config/env");
const { sequelize } = require("./config/database");
require("./models");

async function start() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connection established");

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`ETPB CMS API listening on http://127.0.0.1:${env.port}${env.apiPrefix}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
