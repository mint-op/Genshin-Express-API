const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

const pool = mysql.createPool({
  connectionLimit: 10, // Set limit to 10 connections
  host: process.env.DB_HOST, // Get host from environment variable
  user: process.env.DB_USER, // Get user from environment variable
  password: process.env.DB_PASSWORD, // Get password from environment variable
  database: process.env.DB_DATABASE, // Get database from environment variable
  multipleStatements: true, // Allow multiple SQL statements
  dateStrings: true, // Return date as string instead of Date object
});

module.exports.insertSingleCharacter = (data, callback) => {
  const sqlstatement = `INSERT INTO characters (name, title, vision_key, weapon_type, gender, nation, affiliation, rarity, release_date, constellation, birthday, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  const VALUES = [
    data.name,
    data.title,
    data.vision_key,
    data.weapon_type,
    data.gender,
    data.nation,
    data.affiliation,
    data.rarity,
    data.release_date,
    data.constellation,
    data.birthday,
    data.description,
  ];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.insertSingleWeapon = (data, callback) => {
  const sqlstatement = `INSERT INTO weapons (name, type, rarity, baseAttack, subStat) VALUES (?, ?, ?, ?, ?);`;
  const VALUES = [data.name, data.type, data.rarity, data.baseAttack, data.subStat];
  pool.query(sqlstatement, VALUES, callback);
};
