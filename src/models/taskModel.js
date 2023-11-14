const pool = require('../services/db');

module.exports.insertSingle = (data, callback) => {
  const sqlstatement = `
    INSERT INTO task (title, description, points) VALUES (?, ?, ?);
    `;
  const values = [data.title, data.description, data.points];
  pool.query(sqlstatement, values, callback);
};

module.exports.selectAll = (callback) => {
  const sqlstatement = `
    SELECT * FROM task;
    `;
  pool.query(sqlstatement, callback);
};

module.exports.selectById = (id, callback) => {
  const sqlstatement = `
    SELECT * FROM task WHERE task_id = ?;
    `;
  pool.query(sqlstatement, id, callback);
};

module.exports.updateById = (data, callback) => {
  const sqlstatement = `
    UPDATE task SET title = ?, description = ?, points = ?
    WHERE task_id = ?;
    `;
  const values = [data.title, data.description, data.points, data.id];
  pool.query(sqlstatement, values, callback);
};

module.exports.deleteById = (id, callback) => {
  const sqlstatement = `
    DELETE FROM task WHERE task_id = ?;
    ALTER TABLE task AUTO_INCREMENT = 1;
    `;
  pool.query(sqlstatement, id, callback);
};
