const model = require('../models/PlayerModel');

module.exports.upgradeItemById = async (userId) => {
  const [characters, ucharacters, weapons, uweapons] = await Promise.all([
    getAllCharacters(),
    getUserCharacter(userId),
    getAllWeapons(),
    getuserWeapons(userId),
  ]);

  const ucharUpgrade = (uchar_id) => {
    const uchar = ucharacters.find((f) => f.user_character_id == uchar_id);

    if (!uchar) return 0;

    const character = characters.find((f) => f.character_id == uchar.character_id);
    const multiplier = require('../assets/queryDist').readJSON('character-level-multiplier.json');

    const temp = {
      level: uchar.level + 1,
      health: uchar.health * multiplier[uchar.level][`${character.rarity}-Star`],
      atk: uchar.atk * multiplier[uchar.level][`${character.rarity}-Star`],
      def: uchar.def * multiplier[uchar.level][`${character.rarity}-Star`],
      character_id: uchar.character_id,
    };

    model.updateUserCharacterById(temp, (errors, results, fields) => {
      if (errors) console.error(errors);
    });

    return {
      user_character_id: uchar.user_character_id,
      character_id: uchar.character_id,
      name: character.name,
      level: `${uchar.level} -> ${temp.level}`,
      health: `${uchar.health} -> ${temp.health}`,
      atk: `${uchar.atk} -> ${temp.atk}`,
      def: `${uchar.def} -> ${temp.def}`,
    };
  };

  const uweapUpgrade = (uweap_id) => {
    const uweap = uweapons.find((f) => f.user_weapon_id == uweap_id);

    if (!uweap) return 0;

    const weapon = weapons.find((f) => f.weapon_id == uweap.weapon_id);
    const type = require('../assets/queryDist')
      .readJSON('weapon-values.json')
      .filter((f) => f.Rarity[0] == weapon.rarity)
      .find((f) => parseFloat(f.Value) == weapon.baseAttack);
    var multiplier;

    switch (weapon.rarity) {
      case 5:
        multiplier = require('../assets/queryDist').readJSON('weapon-5-multiplier.json');
        break;
      case 4:
        multiplier = require('../assets/queryDist').readJSON('weapon-4-multiplier.json');
        break;
      case 3:
      case 2:
      case 1:
        multiplier = require('../assets/queryDist').readJSON('weapon-1-3-multiplier.json');
        break;
      default:
        break;
    }

    const temp = {
      level: uweap.level + 1,
      totalAttack: uweap.totalAttack * multiplier[uweap.level][type.Multiplier],
      weapon_id: uweap.weapon_id,
    };

    model.updateUserWeaponById(temp, (errors, results, fields) => {
      if (errors) console.error(errors);
    });

    return {
      user_weapon_id: uweap.user_weapon_id,
      weapon_id: uweap.weapon_id,
      name: weapon.name,
      level: `${uweap.level} -> ${temp.level}`,
      totalAttack: `${uweap.totalAttack} -> ${temp.totalAttack}`,
    };
  };

  return {
    ucharUpgrade,
    uweapUpgrade,
  };
};

function getAllCharacters() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectAllCharacters(callback);
  });
}
function getAllWeapons() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectAllWeapons(callback);
  });
}

function getUserCharacter(userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserCharacterById(userId, callback);
  });
}

function getuserWeapons(userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserWeaponById(userId, callback);
  });
}
