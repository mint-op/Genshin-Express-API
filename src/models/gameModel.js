const pool = require('../services/db');

module.exports.selectUserById = (id, callback) => {
  const sqlstatement = `
    SELECT * FROM userData WHERE user_id = ?;
    `;
  pool.query(sqlstatement, id, callback);
};

module.exports.insertNewUser = (name, callback) => {
  const sqlstatement = `
    INSERT INTO userData (name) VALUES (?);
    `;
  pool.query(sqlstatement, name, callback);
};
