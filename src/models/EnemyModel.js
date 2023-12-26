const pool = require('../services/db');

module.exports.selectAllEnemies = (callback) => {
  const sqlstatement = `
    SELECT * FROM entities;
    `;
  pool.query(sqlstatement, callback);
};

module.exports.selectCombatById = (user_id, callback) => {
  const sqlstatement = `
    SELECT * FROM combat WHERE user_id = ?;
    `;
  pool.query(sqlstatement, user_id, callback);
};

module.exports.insertCombat = (data, callback) => {
  const sqlstatement = `
    INSERT INTO combat (user_id, entity_id) VALUES (?, ?);
    `;
  const VALUES = [data.user_id, data.entity_id];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.updateCombat = (data, callback) => {
  const sqlstatement = `
    UPDATE combat SET end_time = CURRENT_TIMESTAMP, outcome = ? WHERE combat_id = ?;
  `;
  const VALUES = [data.outcome, data.combat_id];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.selectCombatByEntityId = (data, callback) => {
  const sqlstatement = `
    SELECT * FROM combat WHERE entity_id = ? AND outcome = ? AND user_id = ?;
    `;
  const VALUES = [data.entity_id, data.outcome, data.user_id];
  pool.query(sqlstatement, VALUES, callback);
};
