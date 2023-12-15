const { selectAll } = require('../models/userModel');
const { selectUserById, insertNewUser } = require('../models/PlayerModel');
const { selectAllCharacters, selectAllWeapons } = require('../models/PlayerModel');
const pool = require('../services/db');

const getWeapons = () => {
  return new Promise((resolve, reject) => {
    selectAllWeapons((errors, results, fields) => {
      if (errors) reject('Error selectAllWeapons ', errors);
      else resolve(results);
    });
  });
};

const getCharacters = () => {
  return new Promise((resolve, reject) => {
    selectAllCharacters((errors, results, fields) => {
      if (errors) reject('Error getCharacters ', errors);
      else resolve(results);
    });
  });
};

const newPlayer = async (id) => {
  const weapons = await getWeapons();
  const characters = await getCharacters();

  const charMap = {
    name: 'Traveler',
    vision: 'ANEMO',
    weapon: 'Dull Blade',
  };
  const sqlstatements = {
    insertChar: `INSERT INTO user_character (user_id, character_id, user_weapon_id, health, energy, atk, def) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    insertWeap: `INSERT INTO user_weapon (weapon_id, user_id, totalAttack) VALUES (?, ?, ?);`,
  };

  const callback = (errors, results, fields) => {
    if (errors) console.error(errors);
  };

  var weapon_baseATK;

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

  insertWeapon
    .then((result) => {
      const character = characters.filter((f) => f.name == charMap.name && f.vision_key == charMap.vision);
      if (character.length == 0) console.log('Character not found');
      else {
        pool.query(sqlstatements.insertChar, [id, character[0].character_id, result.insertId, 1000, 300, 18, 58], callback);
        console.log('UserCharacter added');
      }
    })
    .catch((error) => console.error(error));
};

const selectAllUser = () => {
  return new Promise((resolve, reject) => {
    selectAll((errors, results, fields) => {
      if (errors) reject('Error selectAllUser ', errors);
      else resolve(results);
    });
  });
};

module.exports.userLogin = async (req, res, next) => {
  const users = await selectAllUser();

  const { name, username, email } = req.body;

  const user = users.filter((f) => (f.username = username && f.email == email));

  if (user.length == 0) res.status(404).json({ message: 'Username or Email not matched' });
  else {
    selectUserById(user[0].user_id, (errors, results, fields) => {
      if (errors) console.error('Error selectUserById ', errors);
      else {
        if (results.length == 0) {
          // * insert new user
          const data = {
            user_id: user[0].user_id,
            name: name,
            primogems: 320,
          };
          insertNewUser(data, (error, results, fields) => {
            if (error) console.error('Error insertNewUser', error);
            else {
              module.exports = { userId: user[0].user_id };
              newPlayer(data.user_id);
              res.status(200).json({ message: `Welcome ${data.name}`, primogems: `💎${data.primogems}` });
            }
          });
        } else {
          res.status(200).json({ message: `Welcome ${results[0].name}`, gamelvl: results[0].gamelvl, primogems: `💎${results[0].primogems}` });
          module.exports = { userId: user[0].user_id };
        }
      }
    });
  }
};
