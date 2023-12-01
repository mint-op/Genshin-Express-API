const pool = require('../services/db');

module.exports.selectAllUser = (callback) => {
  const sqlstatement = `
    SELECT * FROM userdata;
  `;
  pool.query(sqlstatement, callback);
};

module.exports.selectUserById = (id, callback) => {
  const sqlstatement = `
    SELECT * FROM userdata WHERE user_id = ?;
    `;
  pool.query(sqlstatement, id, callback);
};

module.exports.insertNewUser = (data, callback) => {
  const sqlstatement = `
    INSERT INTO userdata (user_id, name, primogems) VALUES (?, ?, ?);
    `;
  const VALUES = [data.user_id, data.name, data.primogems];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.updatePrimogem = (data, callback) => {
  const sqlstatement = `
    UPDATE userData SET primogems = ? WHERE user_id = ?;
  `;
  const VALUES = [data.primogems, data.user_id];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.updatePityCounter = (data, callback) => {
  const sqlstatement = `
    UPDATE userData SET counter5 = ?, counter4 = ? WHERE user_id = ?;
  `;
  const VALUES = [data.counter5, data.counter4, data.user_id];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.insertNewUserCharacter = (data, callback) => {
  const sqlstatement = `
    INSERT INTO user_character (user_id, character_id, weapon_id, health, energy, atk, def) VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  const VALUES = [data.user_id, data.character_id, data.weapon_id, data.health, data.energy, data.atk, data.def];
  pool.query(sqlstatement, VALUES, callback);
};

module.exports.insertNewUserWeapon = (data, callback) => {
  const sqlstatement = `
    INSERT INTO user_weapon (user_id, weapon_id, totalAttack) VALUES (?, ?, ?);
  `;
  const VALUES = [data.user_id, data.weapon_id, data.totalAttack];
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
