const pool = require('../services/db');

const sqlstatement = `

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS taskprogress;

CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username TEXT,
    email TEXT
);

CREATE TABLE task (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT,
    description TEXT,
    points INT
);

CREATE TABLE taskprogress (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    completion_date TIMESTAMP,
    notes TEXT
);
INSERT INTO task (title, description, points) VALUES
("Plant a Tree", "Plant a tree in your neighbourhood or a designated green area.", 50),
("Use Public Transportation", "Use public transportation or carpool instead of driving alone.", 30),
("Reduce Plastic Usage", "Commit to using reusable bags and containers.", 40),
("Energy Conservation", "Turn off lights and appliances when not in use.", 25),
("Composting", "Start composting kitchen scraps to create natural fertilizer.", 35);

DROP TABLE IF EXISTS userData;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS user_character;
DROP TABLE IF EXISTS weapons;
DROP TABLE IF EXISTS user_weapon;
DROP TABLE IF EXISTS entities;
DROP TABLE IF EXISTS quests;
DROP TABLE IF EXISTS user_quest;

CREATE TABLE userData (
    user_id INT PRIMARY KEY,
    name TEXT NOT NULL,
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
    description TEXT,
    NORMAL_ATTACK JSON NOT NULL,
    ELEMENTAL_SKILL JSON NOT NULL,
    ELEMENTAL_BURST JSON NOT NULL
);

CREATE TABLE user_character (
    user_character_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    character_id INT NOT NULL,
    user_weapon_id INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    health FLOAT NOT NULL,
    atk FLOAT NOT NULL,
    def FLOAT NOT NULL,
    experience INT NOT NULL DEFAULT 0
);

CREATE TABLE weapons (
    weapon_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    type ENUM ('SWORD', 'BOW', 'POLEARM', 'CATALYST', 'CLAYMORE') NOT NULL,
    rarity INT NOT NULL,
    baseAttack FLOAT NOT NULL,
    subStat VARCHAR(50) NOT NULL
);

CREATE TABLE user_weapon (
    user_weapon_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    weapon_id INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    totalAttack FLOAT NOT NULL
);

CREATE TABLE entities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creature_id VARCHAR(50),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    region VARCHAR(50),
    type VARCHAR(50),
    family VARCHAR(50),
    faction VARCHAR(50),
    elements JSON NOT NULL,
    descriptions JSON,
    elemental_descriptions JSON
);

CREATE TABLE quests (
    quest_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    description TEXT NOT NULL,
    objective JSON NOT NULL,
    experience_reward INT NULL,
    weapon_reward_rarity INT,
    required_level INT NOT NULL
);

CREATE TABLE user_quest (
    user_quest_id INT PRIMARY KEY AUTO_INCREMENT,
    quest_id INT NOT NULL,
    user_id INT NOT NULL,
    count INT NOT NULL DEFAULT 0,
    progress ENUM ('completed', 'inprogress', 'failed') NOT NULL
);

`;
pool.query(sqlstatement, (error, results, fields) => {
  if (error) console.error('Error creating tables: ', error);
  else console.log('Table successfully created!');
  process.exit();
});
