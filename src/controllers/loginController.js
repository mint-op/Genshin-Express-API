const { selectAll } = require('../models/userModel');
const { selectUserById, insertNewUser } = require('../models/gameModel');
const { selectAllCharacters, selectAllWeapons } = require('../models/gameModel');
const pool = require('../services/db');

// Note: userId is in res.locals

const newPlayer = (id) => {
  const maps = {
    name: 'Traveler',
    vision: 'ANEMO',
    weapon: 'Dull Blade',
  };
  const sqlstatements = {
    insertChar: `INSERT INTO user_character (user_id, character_id, weapon_id, health, energy, atk, def) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    insertWeap: `INSERT INTO user_weapon (weapon_id, user_id, totalAttack) VALUES (?, ?, ?);`,
  };

  selectAllWeapons((err, results, fields) => {
    if (err) console.error(err);
    else {
      const weapon = results.filter((f) => f.name == maps.weapon);
      if (weapon.length == 0) console.error('Weapon not found');
      else {
        pool.query(sqlstatements.insertWeap, [weapon[0].weapon_id, id, weapon[0].baseAttack], (err, results, fields) => {
          if (err) console.error(err);
          console.log(results);
        });
        selectAllCharacters((err, results, fields) => {
          if (err) console.error(err);
          else {
            const character = results.filter((f) => f.name == maps.name && f.vision_key == maps.vision);
            if (character.length == 0) console.error('Character not found');
            else {
              pool.query(sqlstatements.insertChar, [id, character[0].character_id, weapon[0].weapon_id, 1000, 300, 18 + weapon[0].baseAttack, 58], (err, results, fields) => {
                if (err) console.error(err);
                console.log(results);
              });
            }
          }
        });
      }
    }
  });
};

module.exports.userLogin = (req, res, next) => {
  const { name, gender, username, email } = req.body;

  selectAll((errors, results, fields) => {
    if (errors) console.error('Error login', errors);
    else {
      // check username and email
      const user = results.filter((f) => f.username == username && f.email == email);
      if (user.length == 0) {
        res.status(404).json({ message: 'Username or Email not matched' });
      } else {
        selectUserById(user[0].user_id, (error, results, fields) => {
          if (error) console.error('Error selectUserById', error);
          else {
            if (results.length == 0) {
              // insert new user
              const data = {
                user_id: user[0].user_id,
                name: name,
                gender: gender,
                primogems: 160,
                active: true,
              };
              insertNewUser(data, (error, results, fields) => {
                if (error) console.error('Error insertNewUser', error);
                else {
                  res.locals = { userId: user[0].user_id };
                  newPlayer(res.locals.userId);
                  res.status(200).json({ message: `Welcome ${data.name}` });
                }
              });
            } else {
              res.status(200).json({ message: `Welcome ${results[0].name}` });
              res.locals = { userId: user[0].user_id };
            }
          }
        });
      }
    }
  });
};
