const model = require('../models/PlayerModel');

// Upgrade the user's character by increasing its level and attributes.
module.exports.upgradeItemById = async (userId) => {
  // Retrieve all characters, user characters, weapons, and user weapons
  const [characters, ucharacters, weapons, uweapons] = await Promise.all([
    getAllCharacters(),
    getUserCharacter(userId),
    getAllWeapons(),
    getuserWeapons(userId),
  ]);

  // Upgrade the user character by increasing its level and attributes.
  const ucharUpgrade = (uchar_id) => {
    // Find the user character with the given ID
    const uchar = ucharacters.find((f) => f.user_character_id == uchar_id);

    // If the user character is not found, return 0
    if (!uchar) return 0;

    // Find the character with the same ID as the user character
    const character = characters.find((f) => f.character_id == uchar.character_id);

    // Load the character level multiplier data
    const multiplier = require('../assets/queryDist').readJSON('character-level-multiplier.json');

    // Calculate the new attributes for the upgraded character
    const temp = {
      level: uchar.level + 1,
      health: uchar.health * multiplier[uchar.level][`${character.rarity}-Star`],
      atk: uchar.atk * multiplier[uchar.level][`${character.rarity}-Star`],
      def: uchar.def * multiplier[uchar.level][`${character.rarity}-Star`],
      character_id: uchar.character_id,
    };

    // Update the user character in the database
    model.updateUserCharacterById(temp, (errors, results, fields) => {
      if (errors) console.error(errors);
    });

    // Return the upgraded user character information
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

  // Upgrade the user weapon by increasing its level and total attack.
  const uweapUpgrade = (uweap_id) => {
    // Find the user weapon with the given ID
    const uweap = uweapons.find((f) => f.user_weapon_id == uweap_id);

    // If no user weapon is found, return 0
    if (!uweap) return 0;

    // Find the weapon associated with the user weapon
    const weapon = weapons.find((f) => f.weapon_id == uweap.weapon_id);

    // Read the weapon values from the JSON file based on the weapon rarity and base attack
    const type = require('../assets/queryDist')
      .readJSON('weapon-values.json')
      .filter((f) => f.Rarity[0] == weapon.rarity)
      .find((f) => parseFloat(f.Value) == weapon.baseAttack);

    var multiplier;

    // Determine the multiplier based on the weapon rarity
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

    // Calculate the updated level and total attack of the user weapon
    const temp = {
      level: uweap.level + 1,
      totalAttack: uweap.totalAttack * multiplier[uweap.level][type.Multiplier],
      weapon_id: uweap.weapon_id,
    };

    // Update the user weapon in the database
    model.updateUserWeaponById(temp, (errors, results, fields) => {
      if (errors) console.error(errors);
    });

    // Return the updated user weapon object
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
