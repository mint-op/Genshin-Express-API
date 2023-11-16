const pool = require('../services/db');

module.exports.selectUserById = (id, callback) => {
  const sqlstatement = `
    SELECT * FROM userData WHERE user_id = ?;
    `;
  pool.query(sqlstatement, id, callback);
};

module.exports.insertNewUser = (data, callback) => {
  const sqlstatement = `
    INSERT INTO userData (user_id, name, gender, primogems, active) VALUES (?, ?, ?, ?, ?);
    `;
  const VALUES = [data.user_id, data.name, data.gender, data.primogems, data.active];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.selectAllCharacters = (callback) => {
  const sqlstatement = `
    SELECT * FROM characters;
  `;
  pool.query(sqlstatement, callback);
};

module.exports.selectAllWeapons = (callback) => {
  const sqlstatement = `
    SELECT * FROM weapons;
  `;
  pool.query(sqlstatement, callback);
};
