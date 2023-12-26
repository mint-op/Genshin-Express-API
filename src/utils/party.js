const model = require('../models/PlayerModel');

var party = [];

module.exports = { party: party };

/** For Debugging
module.exports = {
  party: ...
};
*/

// Creates a party for a user
module.exports.createParty = async (userId) => {
  // Fetch necessary data from DB
  const [characters, weapons, userChars, userWeaps] = await Promise.all([getAllCharacters(), getAllWeapons(), getUserCharacter(userId), getUserWeapon(userId)]);

  // Adds a character to the party.
  const addChar = async (uchar_id) => {
    const charId = userChars.find((f) => f.user_character_id == uchar_id);
    const sameId = party.find((f) => f.user_character_id == uchar_id);

    if (!charId) return { message: 'Invalid Character Id!' };
    else if (party.length == 4) return { message: 'Party is full!' };
    else if (sameId) return { message: 'Character already in party!' };

    const character = characters.find((f) => f.character_id == charId.character_id);
    const userData = await getUserData(uchar_id, userId);
    const weapon = weapons.find((f) => f.weapon_id === userData[0].weapon_id);

    const temp = {
      user_character_id: charId.user_character_id,
      name: character.name,
      level: charId.level,
      weapon_name: weapon.name,
      type: character.weapon_type[0] + character.weapon_type.slice(1).toLowerCase(),
      vision: character.vision_key,
    };
    party.push(temp);
    return party;
  };

  // Removes a character from the party.
  const removeChar = (uchar_id) => {
    const index = party.findIndex((f) => f.user_character_id == uchar_id);
    const removed = party[index];
    if (index > -1) party.splice(index, 1);
    else return { message: 'Invalid Character Id!' };

    return { removed: removed, party: party };
  };

  // Changes the weapon for a character in the party.
  const changeWeap = async (uchar_id, uweap_id) => {
    const charId = userChars.find((f) => f.user_character_id == uchar_id);
    const weapId = userWeaps.find((f) => f.user_weapon_id == uweap_id);

    if (!charId || !weapId) return { message: 'Invalid Ids!' };

    const weapon = weapons.find((f) => f.weapon_id == weapId.weapon_id);
    const character = characters.find((f) => f.character_id == charId.character_id);

    if (weapon.type != character.weapon_type) return { message: 'Invalid Weapon Type!' };
    else await updateUserCharWeap(uchar_id, uweap_id);

    const temp = party.find((f) => f.user_character_id == uchar_id);
    const prevWeap = temp.weapon_name;

    temp.weapon_name = weapons.find((f) => f.weapon_id == weapId.weapon_id).name;

    return { previous_weapon: prevWeap, new: party };
  };

  // Return an object with the party manipulation functions
  return {
    addChar,
    removeChar,
    changeWeap,
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

function getUserWeapon(userId) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserWeaponById(userId, callback);
  });
}

function updateUserCharWeap(uchar_id, uweap_id) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.updateUserCharWeap({ user_character_id: uchar_id, user_weapon_id: uweap_id }, callback);
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
