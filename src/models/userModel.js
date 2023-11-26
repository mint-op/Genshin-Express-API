const pool = require('../services/db');

module.exports.insertSingle = (data, callback) => {
  const sqlstatement = `
    INSERT INTO user (username, email) VALUES (?, ?);
    `;
  const values = [data.username, data.email];
  pool.query(sqlstatement, values, callback);
};

module.exports.selectAll = (callback) => {
  const sqlstatement = `
    SELECT * FROM user;
    `;
  pool.query(sqlstatement, callback);
};

module.exports.selectById = (id, callback) => {
  const sqlstatement = `
    SELECT user.user_id, user.username, user.email, task.points FROM
    taskprogress
    INNER JOIN user ON taskprogress.user_id = user.user_id
    INNER JOIN task ON taskprogress.task_id = task.task_id WHERE user.user_id = ?;
    `;
  pool.query(sqlstatement, id, callback);
};

module.exports.updateById = (data, callback) => {
  const sqlstatement = `
    UPDATE user SET username = ?, email = ? WHERE user_id = ?;
  `;
  const values = [data.username, data.email, data.id];
  pool.query(sqlstatement, values, callback);
};

module.exports.deleteById = (id, callback) => {
  const sqlstatement = `
    DELETE FROM user WHERE user_id = ?;
    ALTER TABLE user AUTO_INCREMENT = 1;
  `;
  pool.query(sqlstatement, id, callback);
};
