const p_model = require('../models/PlayerModel');
const e_model = require('../models/EnemyModel');

// Currently Running Combat Status
var combatData = {}; // Fixed Data
var combatlog = {}; // Volatile Data

module.exports.combat = async (userId) => {
  const enemies = await getAllEntities();
  const combat = await getCombatById(userId);

  const showAllEntities = () => {
    return enemies.map((m, idx) => `${idx + 1}. ${m.name}`);
  };

  // Selects an entity based on the given index.
  const selectEntity = (idx) => {
    const selected = enemies[idx - 1];

    // Read enemy HP and ATK values from JSON files
    const HP_VALUES = require('../assets/queryDist').readJSON('enemy-hp-values.json');
    const ATK_VALUES = require('../assets/queryDist').readJSON('enemy-atk-values.json');

    // Return error message if the index is invalid
    if (!selected) return { message: 'Invalid index' };

    // Select a random element from the selected entity's elements
    const randomElement = selected.elements[selected.length != 0 || selected.length != 1 ? Math.floor(Math.random() * selected.elements.length) : 0];

    // Get selected entity's HP and ATK stats
    const selectedStats = (() => {
      const selected_HP_ATK = (values) => {
        const results = new Set();
        const tempArr = [];

        // Filter values based on selected entity's name
        const original = values.filter((f) => new RegExp(`^${selected.name}`, 'i').test(f['Enemy']));
        const original2 = values.filter((f) => new RegExp(`^${randomElement} ${selected.name}`, 'i').test(f['Enemy']));
        var original3 = [];
        if (selected.name.split(' ').length == 2) {
          const wordArr = selected.name.split(' ');
          original3 = values.filter((f) => new RegExp(`^${wordArr[0]} ${randomElement} ${wordArr[1]}`, 'i').test(f['Enemy']));
        }
        tempArr.push(...original, ...original2, ...original3);

        // If no exact match is found, filter values based on individual words in the selected entity's name
        if (original.length == 0 && original2.length == 0 && original3.length == 0) {
          const wordArr = selected.name.split(' ');
          wordArr.forEach((word) => {
            const filtered = values.filter((f) => new RegExp(`\\b${word.charAt(0).toUpperCase()}${word.slice(1)}\\b|\\b${word}\\b`, 'i').test(f['Enemy']));
            tempArr.push(...filtered);
          });
        }

        results.add(tempArr.map(JSON.stringify));

        return [...results][0].map(JSON.parse);
      };

      // Get HP stats for the selected entity.
      const selected_HP = () => {
        return selected_HP_ATK(HP_VALUES);
      };

      // Get ATK stats for the selected entity.
      const selected_ATK = () => {
        return selected_HP_ATK(ATK_VALUES);
      };

      return {
        HP: selected_HP(),
        ATK: selected_ATK(),
      };
    })();

    const randomStat_HP = selectedStats.HP[selectedStats.HP.length != 1 ? Math.floor(Math.random() * selectedStats.HP.length) : 0];
    const HP_multiplier_type = randomStat_HP['Level MultiplierType'];
    const randomStat_ATK = selectedStats.ATK[selectedStats.ATK.length != 1 ? Math.floor(Math.random() * selectedStats.ATK.length) : 0];
    const ATK_multiplier_type = randomStat_ATK['Level MultiplierType'];

    combatData['entity_id'] = selected.entity_id;
    combatData['entity_name'] = selected.name;
    combatData['entity_health'] = randomStat_HP['Base HP'];
    combatData['multiplier_type'] = { HP: HP_multiplier_type, ATK: ATK_multiplier_type, calc: false };
    combatData['entity_atk'] = randomStat_ATK['Base ATK'];
    combatData['entity_element'] = randomElement;

    return {
      message: 'Selected entity',
      data: {
        entity_id: selected.entity_id,
        entity_name: selected.name,
        entity_element: randomElement,
      },
    };

    /** For Debuging
    console.log('selected', selected);
    console.log('selectedHP', selectedStats.HP);
    console.log('selectedATK', selectedStats.ATK);
    console.log('randomStats', randomStats);
    console.log('randomElement', randomElement);
    console.log('combatData', combatData);
    */
  };

  const action = async (partyIdx) => {
    // Get all ongoing combat instances
    var pending = combat.filter((f) => f.end_time == null);

    // Retrieve party data
    const { party } = require('./party');
    const { readJSON } = require('../assets/queryDist');

    // Check if entity ID is selected and if there are characters in the party
    if (combatData.entity_id == undefined) return { message: 'Please select an entity' };
    else if (party.length == 0) return { message: 'Please add a character to the party' };

    // Calculate entity health and attack based on party level
    if (combatData.multiplier_type.calc == false) {
      const maxPartyLevel = Math.max(...party.map((m) => m.level));
      combatData['entity_health'] *= readJSON('enemy-hp-level-multiplier.json')[maxPartyLevel - 1][combatData.multiplier_type.HP];
      combatData['entity_atk'] *= readJSON('enemy-atk-level-multiplier.json')[maxPartyLevel - 1][combatData.multiplier_type.ATK];
      combatData['multiplier_type'].calc = true;
    }

    // If party data is not present, fetch it from the database
    if (combatData.party == undefined) {
      const promise = party.map((item) => getUserCharDataById(item.user_character_id, userId));
      const uchar_Arr = await Promise.all(promise);

      combatData['party'] = [];
      party.forEach((member, idx) => {
        const temp = {
          user_character_id: member.user_character_id,
          character_id: uchar_Arr[idx].character_id,
          name: member.name,
          weapon_name: member.weapon_name,
          health: uchar_Arr[idx].health,
          atk: uchar_Arr[idx].atk + uchar_Arr[idx].totalAttack,
          def: uchar_Arr[idx].def,
        };

        combatData['party'].push(temp);
      });
    }

    // Initialize combat log
    if (combatlog['char_health'] == undefined) {
      combatlog['counter'] = {
        ...combatData['party'].map((m) => 0),
      };
      combatlog['char_health'] = {
        ...combatData['party'].map((m, idx) => m.health),
      };
      combatlog['entity_health'] = combatData['entity_health'];
      combatlog['entity_atk'] = combatData['entity_atk'];
    }

    // Check if the same entity is already in the ongoing combat instances
    const isSameEntity = pending.find((f) => f.entity_id == combatData['entity_id']);
    if (!isSameEntity) {
      // If not, insert combat data and perform the attack
      pending = await insertCombatData({
        user_id: userId,
        entity_id: combatData['entity_id'],
      });
      return attack(partyIdx - 1, pending.insertId, userId);
    } else {
      // If yes, perform the attack on the existing combat instance
      return attack(partyIdx - 1, isSameEntity.combat_id, userId);
    }
  };

  return {
    showAllEntities,
    selectEntity,
    action,
  };
};

async function attack(partyIdx, combatId, userId) {
  const { party } = require('./party');

  // Check if character is already defeated
  if (combatlog['char_health'][partyIdx] <= 0) {
    return { message: 'Character is already defeated. Please select another character in the party' };
  }

  // Get character by ID
  const character = await getCharacterById(combatData['party'][partyIdx].character_id);

  // Extract values from character's NORMAL_ATTACK upgrades
  const regexPattern = /\d+-Hit DMG/;
  const values = character['NORMAL_ATTACK'].upgrades.filter((f) => regexPattern.test(f.name)).map((m) => m.value);

  // Calculate attack values
  const results = values.map((m) => {
    if (m.match(/\+|x|×/g)) {
      var calc = [];

      // Check the type of calculation needed
      if (m.includes('+')) calc = ['+', 0];
      else if (m.includes('x') || m.includes('×')) calc = ['*', 1];

      // Split the value by the operator and perform the calculation
      const arr = m.split(/\+|x|×/g).reduce((acc, c) => {
        const temp = parseFloat(c) || 0;

        // Perform addition or multiplication based on the calculation type
        if (calc[0] == '+') return acc + temp;
        else if (calc[0] == '*') return acc * temp;
      }, calc[1]);

      return arr;
    } else {
      // Return the value as a number if it doesn't require calculation
      return parseFloat(m) || 0;
    }
  });

  // Calculate attack data
  const data = results.map((m) => combatData['party'][partyIdx]['atk'] + combatData['party'][partyIdx]['atk'] * (m / 100));
  // console.log(data);

  // Get character's attack value
  var attack_Value = data[combatlog['counter'][partyIdx]];

  // /** For Debugging
  console.log(`charidx ${partyIdx} counter ${combatlog['counter'][partyIdx]} atk ${attack_Value}`);
  // */

  // Update counter
  combatlog['counter'][partyIdx] == data.length - 1 ? (combatlog['counter'][partyIdx] = 0) : combatlog['counter'][partyIdx]++;

  // Get element of the character
  const element = party[partyIdx].vision.charAt(0) + party[partyIdx].vision.slice(1).toLowerCase();

  // Get previous entity health
  const e_before = combatlog['entity_health'];

  // Calculate entity impact
  if (element != combatData['entity_element']) {
    combatlog['entity_health'] -= attack_Value;
  } else {
    attack_Value = 'None (Immune)';
  }

  // Check if entity is defeated
  if (combatlog['entity_health'] < 0) {
    await updateCombatData({
      combat_id: combatId,
      outcome: 'victory',
    });
    const msg = { message: 'victory' };

    // Check quest completion
    const completed = await checkQuestCompletion(combatData['entity_id'], userId);
    if (completed != undefined) {
      msg = { ...msg, quest: `Eliminate ${completed.objective[0]} ${completed.objective[1]}` };
    }

    // Reset combat data
    combatData = {};
    combatlog = {};

    return msg;
  }

  // Calculate character impact
  const c_before = combatlog['char_health'][partyIdx];
  combatlog['char_health'][partyIdx] -= combatlog['entity_atk'];
  const alive = Object.values(combatlog['char_health']).filter((f) => f >= 0);

  if (alive.length == 0) {
    await updateCombatData({
      combat_id: combatId,
      outcome: 'defeat',
    });

    // Reset combat data
    combatData = {};
    combatlog = {};
    return { message: 'Defeated' };
  }

  // /** For Debugging
  console.log(combatlog);
  // */

  return {
    char_name: combatData['party'][partyIdx].name,
    char_health: `${c_before} -> ${combatlog['char_health'][partyIdx]}`,
    totalchar_health: combatlog['char_health'],
    entity_name: combatData['entity_name'],
    entity_health: `${e_before} -> ${combatlog['entity_health']}`,
    damage_dealt: attack_Value,
  };
}

async function checkQuestCompletion(entity_id, userId) {
  try {
    // Import the quest data from the './quests' module.
    const { qData } = require('./quests');

    // Check the combat data for the given entity, user, and outcome.
    const pending = await checkCombatData({
      entity_id: entity_id,
      outcome: 'victory',
      user_id: userId,
    });

    // If the number of completed quests matches the objective, update the user quest and return the quest data.
    if (qData.objective[0] == pending.length) {
      await updateUserQuest({
        progress: 'complete',
        user_quest_id: qData.uquest_id,
      });
      return qData;
    }
  } catch (error) {
    console.error(error);
  }
}

function updateUserQuest(data) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    p_model.updateUserQuest(data, callback);
  });
}

function checkCombatData(data) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    e_model.selectCombatByEntityId(data, callback);
  });
}

function insertCombatData(data) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    e_model.insertCombat({ user_id: data.user_id, user_characters: data.user_characters, entity_id: data.entity_id }, callback);
  });
}

function updateCombatData(data) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    e_model.updateCombat(data, callback);
  });
}

function getCharacterById(char_id) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results[0]);
    };

    p_model.selectCharacterById(char_id, callback);
  });
}

function getUserCharDataById(uchar_id, uid) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results[0]);
    };

    p_model.selectUserDataById({ user_character_id: uchar_id, user_id: uid }, callback);
  });
}

function getCombatById(userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    e_model.selectCombatById(userId, callback);
  });
}

function getAllEntities() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    e_model.selectAllEnemies(callback);
  });
}
