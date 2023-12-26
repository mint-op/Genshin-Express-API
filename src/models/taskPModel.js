const pool = require('../services/db');

module.exports.insertSingle = (data, callback) => {
  const sqlstatement = `
    INSERT INTO taskprogress (user_id, task_id, completion_date, notes)
    VALUES (?, ?, ?, ?);
    `;
  const values = [data.user_id, data.task_id, data.completion_date, data.notes];
  pool.query(sqlstatement, values, callback);
};

module.exports.checkIds = (callback) => {
  const sqlstatement = `
    SELECT * FROM user INNER JOIN task;
    `;
  pool.query(sqlstatement, callback);
};

module.exports.selectAll = (callback) => {
  const sqlstatement = `
    SELECT * FROM taskprogress;
    `;
  pool.query(sqlstatement, callback);
};

module.exports.selectById = (id, callback) => {
  const sqlstatement = `
    SELECT * FROM taskprogress WHERE progress_id = ?;
    `;
  pool.query(sqlstatement, id, callback);
};

module.exports.updateById_notes = (data, callback) => {
  const sqlstatement = `
    UPDATE taskprogress SET notes = ? WHERE progress_id = ?;
    `;
  const VALUES = [data.notes, data.progress_id];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.deleteProgress = (id, callback) => {
  const sqlstatement = `
    DELETE FROM taskprogress WHERE progress_id = ?;
    ALTER TABLE taskprogress AUTO_INCREMENT = 1;
    `;
  pool.query(sqlstatement, id, callback);
};
