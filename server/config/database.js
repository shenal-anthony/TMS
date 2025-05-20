const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("new", "postgres", "Admin123", {
  host: "localhost",
  dialect: "postgres",  // Change to 'postgres' or 'sqlite' as needed
});

module.exports = sequelize;
