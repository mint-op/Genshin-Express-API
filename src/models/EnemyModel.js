const pool = require('../services/db');

module.exports.selectAllEnemies = (callback) => {
  const sqlstatement = `
    SELECT * FROM entities;
    `;
  pool.query(sqlstatement, callback);
};

module.exports.selectCombatLogByStatus = (data, callback) => {
  const sqlstatement = `
    SELECT * FROM combatlog WHERE combat_id = ? AND combat_status = ?;
  `;
  const VALUES = [data.combat_id, data.combat_status];
  pool.query(sqlstatement, VALUES, callback);
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

module.exports.InsertCombatLog = (data, callback) => {
  const sqlstatement = `
    INSERT INTO combatlog (combat_id, user_character_id, user_character_health, entity_health, elemental_interaction, combat_status) VALUES (?, ?, ?, ?, ?, ?);
    `;
  const VALUES = [data.combat_id, data.user_character_id, data.user_character_health, data.entity_health, data.elemental_interaction, data.combat_status];
  pool.query(sqlstatement, VALUES, callback);
};
