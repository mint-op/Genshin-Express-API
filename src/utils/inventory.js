const model = require('../models/PlayerModel');

module.exports.inventoryAll = async (userId) => {
  // * Get required data from mysql
  const characters = await selectAllCharacters();
  const weapons = await selectAllWeapons();
  // * Get Character and Weapons for certain user
  const userChar = await getUserCharacter(userId);
  const userWeap = await getUserWeapon(userId);

  // * Temp Array to store Characters and Weapons that belong to certain user
  const charArr = [],
    weapArr = [];

  userChar.forEach((char) => {
    const character = characters.find((f) => f.character_id == char.character_id);
    charArr.push({
      name: character.name,
      vision: character.vision_key.toLowerCase(),
      rarity: '⭐'.repeat(character.rarity),
    });
  });

  userWeap.forEach((weap) => {
    const weapon = weapons.find((f) => f.weapon_id == weap.weapon_id);
    weapArr.push({
      name: weapon.name,
      rarity: '⭐'.repeat(weapon.rarity),
    });
  });

  // * localeCompare to sort string in descending order
  return { characters: charArr.sort((a, b) => b.rarity.localeCompare(a.rarity)), weapons: weapArr.sort((a, b) => b.rarity.localeCompare(a.rarity)) };
};

module.exports.inventoryChar = async (userId) => {
  const characters = await selectAllCharacters();
  const userChar = await getUserCharacter(userId);

  const charArr = [];

  userChar.forEach((char) => {
    const character = characters.find((f) => f.character_id == char.character_id);
    charArr.push({
      character_id: char.character_id,
      name: character.name,
      vision: character.vision_key[0] + character.vision_key.slice(1).toLowerCase(),
      level: char.level,
      rarity: '⭐'.repeat(character.rarity),
    });
  });

  const charByidx = async (id) => {
    const checkId = charArr.find((f) => f.character_id == id);
    if (!checkId) return 0;

    const { character_id, name, vision, level, rarity } = charArr.find((f) => f.character_id == id);
    const { user_weapon_id, health, energy, atk, def, experience } = userChar.find((f) => f.character_id == id);

    const user_weapon = await getUserWeapon(userId);
    const { weapon_id, totalAttack, ...uweap } = user_weapon.find((f) => f.user_weapon_id == user_weapon_id);

    const weapons = await selectAllWeapons();
    const { type, ...weap } = weapons.find((f) => f.weapon_id == weapon_id);

    const data = {
      character_id: character_id,
      name: name,
      vision: vision,
      type: type[0] + type.slice(1).toLowerCase(),
      level: level,
      weapon: weap.name,
      'weapon level': uweap.level,
      health: health,
      energy: energy,
      atk: atk + totalAttack,
      def: def,
      experience: experience,
      rarity: rarity,
    };

    return data;
  };

  // * Return Methods
  return {
    allchar() {
      // * localeCompare is used to sort strings
      return charArr.sort((a, b) => b.rarity.localeCompare(a.rarity));
    },
    charById(id) {
      return charByidx(id);
    },
  };
};

module.exports.inventoryWeap = async (userId) => {
  const weapons = await selectAllWeapons();
  const userWeap = await getUserWeapon(userId);

  const weapArr = [];

  userWeap.forEach((weap) => {
    const weapon = weapons.find((f) => f.weapon_id == weap.weapon_id);
    weapArr.push({
      weapon_id: weapon.weapon_id,
      name: weapon.name,
      type: weapon.type,
      rarity: '⭐'.repeat(weapon.rarity),
    });
  });

  const weapByIdx = async (id) => {
    const checkId = weapArr.find((f) => f.weapon_id == id);
    if (!checkId) return 0;

    const { weapon_id, name, type, rarity } = weapArr.find((f) => f.weapon_id == id);
    const { user_weapon_id, level, totalAttack } = userWeap.find((f) => f.weapon_id == id);

    const user_character = await getUserCharacter(userId);
    const character = user_character.find((f) => f.user_weapon_id == user_weapon_id);

    const characters = await selectAllCharacters();

    var data = {
      weapon_id: weapon_id,
      name: name,
      type: type,
      level: level,
      totalAttack: totalAttack,
      rarity: rarity,
    };

    if (character != undefined) {
      var char = characters.find((f) => f.character_id == character.character_id);
      data = { ...data, assigned: char.name };
    }

    return data;
  };

  // * Return Methods
  return {
    allweap() {
      return weapArr.sort((a, b) => b.rarity.localeCompare(a.rarity));
    },
    weapById(id) {
      return weapByIdx(id);
    },
  };
};

function selectAllCharacters() {
  return new Promise((resolve, reject) => {
    model.selectAllCharacters((error, results, fields) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
}

function selectAllWeapons() {
  return new Promise((resolve, reject) => {
    model.selectAllWeapons((error, results, fields) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
}

function getUserCharacter(userId) {
  return new Promise((resolve, reject) => {
    model.selectUserCharacterById(userId, (error, results, fields) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
}

function getUserWeapon(userId) {
  return new Promise((resolve, reject) => {
    model.selectUserWeaponById(userId, (error, results, fields) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
}
