const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10, // Set limit to 10 connections
  host: process.env.DB_HOST, // Get host from environment variable
  user: process.env.DB_USER, // Get user from environment variable
  password: process.env.DB_PASSWORD, // Get password from environment variable
  database: process.env.DB_DATABASE, // Get database from environment variable
  multipleStatements: true, // Allow multiple SQL statements
  dateStrings: true, // Return date as string instead of Date object
});

module.exports = pool;
