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

const sqlstatement = `

DROP TABLE IF EXISTS userData;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS user_character;
DROP TABLE IF EXISTS weapons;
DROP TABLE IF EXISTS user_weapon;

CREATE TABLE userData (
    user_id INT PRIMARY KEY,
    name TEXT NOT NULL,
    gamelvl INT NOT NULL DEFAULT 1,
    primogems INT NOT NULL DEFAULT 0,
    counter5 INT NOT NULL DEFAULT 1,
    counter4 INT NOT NULL DEFAULT 1,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE characters (
    character_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    title VARCHAR(50),
    vision_key ENUM ('ANEMO', 'CRYO', 'DENDRO', 'ELECTRO', 'GEO', 'HYDRO', 'PYRO') NOT NULL,
    weapon_type ENUM ('SWORD', 'BOW', 'POLEARM', 'CATALYST', 'CLAYMORE') NOT NULL,
    gender VARCHAR(10),
    nation VARCHAR(50) NOT NULL,
    affiliation VARCHAR(50),
    rarity INT NOT NULL,
    release_date DATE,
    constellation VARCHAR(50),
    birthday VARCHAR(10),
    description TEXT
);

CREATE TABLE user_character (
    user_character_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    character_id INT NOT NULL,
    weapon_id INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    health INT NOT NULL,
    energy INT NOT NULL,
    atk INT NOT NULL,
    def INT NOT NULL,
    experience INT NOT NULL DEFAULT 0
);

CREATE TABLE weapons (
    weapon_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    type ENUM ('SWORD', 'BOW', 'POLEARM', 'CATALYST', 'CLAYMORE') NOT NULL,
    rarity INT NOT NULL,
    baseAttack INT NOT NULL,
    subStat VARCHAR(50) NOT NULL
);

CREATE TABLE user_weapon (
    user_weapon_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    weapon_id INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    totalAttack INT NOT NULL
)

`;
pool.query(sqlstatement, (error, results, fields) => {
  if (error) console.error('Error creating tables: ', error);
  else console.log('Table successfully created: ', results);
  process.exit();
});
