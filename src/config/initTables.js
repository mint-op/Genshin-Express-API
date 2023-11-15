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

CREATE TABLE userData (
    user_id INT PRIMARY KEY,
    name TEXT NOT NULL,
    gamelvl INT NOT NULL DEAFULT 1,
    primogems INT NOT NULL DEAFULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT FALSE
)

`;
pool.query(sqlstatement, (error, results, fields) => {
  if (error) console.error('Error creating tables: ', error);
  else console.log('Table successfully created: ', results);
  process.exit();
});
