const { selectAll } = require('../models/userModel');
const { selectUserById, insertNewUser } = require('../models/PlayerModel');
const { selectAllCharacters, selectAllWeapons } = require('../models/PlayerModel');
const { readJSON } = require('../assets/readJSON');
const pool = require('../services/db');

// Create a new player with the given ID.
const newPlayer = async (id) => {
  // Fetch weapons and characters
  const weapons = await getWeapons();
  const characters = await getCharacters();

  // Map the character details
  const charMap = {
    name: 'Traveler',
    vision: 'ANEMO',
    weapon: 'Dull Blade',
  };

  // SQL statements for inserting character and weapon data
  const sqlstatements = {
    insertChar: `INSERT INTO user_character (user_id, character_id, user_weapon_id, health, atk, def) VALUES (?, ?, ?, ?, ?, ?);`,
    insertWeap: `INSERT INTO user_weapon (weapon_id, user_id, totalAttack) VALUES (?, ?, ?);`,
  };

  // Callback function to handle errors.
  const callback = (errors, results, fields) => {
    if (errors) console.error(errors);
  };

  // Insert the weapon data
  const insertWeapon = new Promise((resolve, reject) => {
    const weapon = weapons.filter((f) => f.name == charMap.weapon);
    if (weapon.length == 0) console.log('Weapon not found');
    else {
      pool.query(sqlstatements.insertWeap, [weapon[0].weapon_id, id, weapon[0].baseAttack], (errors, results, fields) => {
        if (errors) reject(errors);
        else {
          resolve(results);
          console.log('UserWeapon added');
        }
      });
    }
  });

  // Insert the character data
  insertWeapon
    .then((result) => {
      const character = characters.filter((f) => f.name == charMap.name && f.vision_key == charMap.vision);
      if (character.length == 0) console.log('Character not found');
      else {
        const charData = readJSON('character-values.json').find((f) => f.Character == charMap.name);
        pool.query(
          sqlstatements.insertChar,
          [id, character[0].character_id, result.insertId, parseFloat(charData.HP), parseFloat(charData.ATK), parseFloat(charData.DEF)],
          callback
        );
        console.log('UserCharacter added');
      }
    })
    .catch((error) => console.error(error));
};

// Handle user login
module.exports.userLogin = async (req, res, next) => {
  // Get all users
  const users = await selectAllUser();

  // Extract name, username, and email from the request body
  const { name, username, email } = req.body;

  // Find the user with matching username and email
  const user = users.filter((f) => (f.username = username && f.email == email));

  // If no matching user found, return an error response
  if (user.length == 0) {
    res.status(404).json({ message: 'Username or Email not matched' });
  } else {
    // Check if the user exists in the database
    selectUserById(user[0].user_id, (errors, results, fields) => {
      if (errors) {
        console.error('Error selectUserById ', errors);
      } else {
        if (results.length == 0) {
          // Insert new user
          const data = {
            user_id: user[0].user_id,
            name: name,
            primogems: 320,
          };
          insertNewUser(data, (error, results, fields) => {
            if (error) {
              console.error('Error insertNewUser', error);
            } else {
              // Export the user ID and perform new player setup
              module.exports = { userId: user[0].user_id };
              newPlayer(data.user_id);
              res.status(200).json({ message: `Welcome ${data.name}`, primogems: `💎${data.primogems}` });
            }
          });
        } else {
          // User exists, return a success response
          res.status(200).json({ message: `Welcome ${results[0].name}`, primogems: `💎${results[0].primogems}` });
          module.exports = { userId: user[0].user_id };
        }
      }
    });
  }
};

function getWeapons() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject('Error getWeapons ', errors);
      else resolve(results);
    };

    selectAllWeapons(callback);
  });
}

function getCharacters() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject('Error getCharacters ', errors);
      else resolve(results);
    };

    selectAllCharacters(callback);
  });
}

function selectAllUser() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject('Error selectAllUser ', errors);
      else resolve(results);
    };

    selectAll(callback);
  });
}
