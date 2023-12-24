const p_model = require('../models/PlayerModel');
const e_model = require('../models/EnemyModel');

module.exports.combat = async (userId) => {
  const enemies = await getAllEntities();
  const combat = await getCombatById(userId);
  const combatLog_active = await getCombatLog({ combat_id: combat[0].combat_id, combat_status: 'active' });

  const showAllEntities = () => {
    return enemies.map((m, idx) => `${idx + 1}. ${m.name}`);
  };

  const selectEntity = (id) => {
    const entity = enemies[id - 1];
    const checkid = combat.find((f) => f.entity_id == entity.entity_id).outcome;

    if (!checkid) {
    }

    console.log(entity);
    console.log(elements);
  };

  return {
    showAllEntities,
    selectEntity,
  };
};

function getCombatLog(data) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) console.error(errors);
      else resolve(results);
    };

    e_model.selectCombatLogByStatus(data, callback);
  });
}

function getCombatById(userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) console.error(errors);
      else resolve(results);
    };

    e_model.selectCombatById(userId, callback);
  });
}

function getAllEntities() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) console.error(errors);
      else resolve(results);
    };

    e_model.selectAllEnemies(callback);
  });
}
