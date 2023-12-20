const model = require('../models/PlayerModel');

module.exports.inventoryAll = async (userId) => {
  // Retrieve all necessary data asynchronously
  const [characters, weapons, userChars, userWeaps] = await Promise.all([selectAllCharacters(), selectAllWeapons(), getUserCharacter(userId), getUserWeapon(userId)]);

  // Create an array of character objects
  const charArr = userChars.map((char) => {
    // Find the corresponding character object from the characters array
    const character = characters.find((f) => f.character_id == char.character_id);
    // Create a new object with selected properties from the character object
    return {
      name: character.name,
      vision: character.vision_key.toLowerCase(),
      rarity: '⭐'.repeat(character.rarity),
    };
  });

  // Create an array of weapon objects
  const weapArr = userWeaps.map((weap) => {
    // Find the corresponding weapon object from the weapons array
    const weapon = weapons.find((f) => f.weapon_id == weap.weapon_id);
    // Create a new object with selected properties from the weapon object
    return {
      name: weapon.name,
      rarity: '⭐'.repeat(weapon.rarity),
    };
  });

  // Sort character and weapon arrays based on rarity in descending order
  return {
    characters: charArr.sort((a, b) => b.rarity.localeCompare(a.rarity)),
    weapons: weapArr.sort((a, b) => b.rarity.localeCompare(a.rarity)),
  };
};

// Retrieves the inventory of characters for a given user.
module.exports.inventoryChar = async (userId) => {
  // Retrieve all characters and user characters
  const characters = await selectAllCharacters();
  const userChars = await getUserCharacter(userId);

  // Create an array of character objects with the required properties
  const charArr = userChars.map((char) => {
    const character = characters.find((f) => f.character_id === char.character_id);
    return {
      user_character_id: char.user_character_id,
      character_id: char.character_id,
      name: character.name,
      vision: character.vision_key[0] + character.vision_key.slice(1).toLowerCase(),
      level: char.level,
      rarity: '⭐'.repeat(character.rarity),
    };
  });

  // Retrieves the detailed information of a character by its user_character_id.
  const charByidx = async (uchar_id) => {
    const character = charArr.find((f) => f.user_character_id == uchar_id);
    if (!character) return 0;

    const userWeap = await getUserData(uchar_id, userId);
    const weapon = await selectAllWeapons().then((weapons) => weapons.find((f) => f.weapon_id === userWeap[0].weapon_id));

    const data = {
      user_character_id: character.user_character_id,
      character_id: character.character_id,
      name: character.name,
      vision: character.vision,
      type: weapon.type[0] + weapon.type.slice(1).toLowerCase(),
      level: character.level,
      weapon: weapon.name,
      'weapon level': userWeap[0].level,
      health: userWeap[0].health,
      energy: userWeap[0].energy,
      atk: userWeap[0].atk + userWeap[0].totalAttack,
      def: userWeap[0].def,
      experience: userWeap[0].experience,
      rarity: character.rarity,
      NORMAL_ATTACK: characters.find((f) => f.character_id === character.character_id).NORMAL_ATTACK,
      ELEMENTAL_SKILL: characters.find((f) => f.character_id === character.character_id).ELEMENTAL_SKILL,
      ELEMENTAL_BURST: characters.find((f) => f.character_id === character.character_id).ELEMENTAL_BURST,
    };

    return data;
  };

  // Return Methods
  return {
    // Retrieves all characters in the inventory, sorted by rarity.
    allchar() {
      // localeCompare is used to sort strings
      return charArr.sort((a, b) => b.rarity.localeCompare(a.rarity));
    },
    // Retrieves the detailed information of a character by its user_character_id.
    charById(uchar_id) {
      return charByidx(uchar_id);
    },
  };
};

// Retrieves the inventory of weapons for a given user.
module.exports.inventoryWeap = async (userId) => {
  // Retrieve all available weapons
  const weapons = await selectAllWeapons();

  // Retrieve the user's weapons
  const userWeaps = await getUserWeapon(userId);

  // Create an array of user weapons with additional information
  const weapArr = userWeaps.map((weap) => {
    // Find the corresponding weapon from the list of all weapons
    const weapon = weapons.find((f) => f.weapon_id == weap.weapon_id);
    return {
      user_weapon_id: weap.user_weapon_id,
      weapon_id: weapon.weapon_id,
      name: weapon.name,
      type: weapon.type,
      rarity: '⭐'.repeat(weapon.rarity),
    };
  });

  // Retrieve the weapon details by user_weapon_id
  const weapByIdx = async (uweap_id) => {
    // Find the weapon in the array of user weapons
    const weapon = weapArr.find((f) => f.user_weapon_id == uweap_id);
    if (!weapon) return 0;

    // Find the user weapon details
    const userWeap = userWeaps.find((f) => f.user_weapon_id == uweap_id);

    // Find the user character associated with the weapon
    const userChar = await getUserCharacter(userId).then((characters) => characters.find((f) => f.user_weapon_id == uweap_id));

    // Retrieve all available characters
    const characters = await selectAllCharacters();

    // Create an object with the weapon details
    var data = {
      user_weapon_id: weapon.user_weapon_id,
      weapon_id: weapon.weapon_id,
      name: weapon.name,
      type: weapon.type,
      level: userWeap.level,
      totalAttack: userWeap.totalAttack,
      rarity: weapon.rarity,
    };

    // If there is a user character associated with the weapon, add the character's name to the object
    if (userChar != undefined) {
      var char = characters.find((f) => f.character_id == userChar.character_id);
      data = { ...data, assigned: char.name };
    }

    return data;
  };

  // Return an object with functions to access the user's weapon inventory
  return {
    // Retrieve all weapons in the user's inventory, sorted by rarity.
    allweap() {
      return weapArr.sort((a, b) => b.rarity.localeCompare(a.rarity));
    },
    // Retrieve the details of a specific weapon in the user's inventory.
    weapById(uweap_id) {
      return weapByIdx(uweap_id);
    },
  };
};

function selectAllCharacters() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectAllCharacters(callback);
  });
}

function selectAllWeapons() {
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

function getUserWeapon(userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserWeaponById(userId, callback);
  });
}

function getUserData(uchar_id, userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserDataById({ user_character_id: uchar_id, user_id: userId }, callback);
  });
}
