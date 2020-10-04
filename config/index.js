require("dotenv").config();

module.exports = {
  DB: process.env.APP_DB,
  PORT: process.env.APP_PORT,
  SECRET: process.env.APP_SECRET,
  GOOGLE_CLIENT_ID: process.env.APP_GOOGLE_CLIENT_ID,
};