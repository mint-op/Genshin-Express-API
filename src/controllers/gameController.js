const model = require('../models/PlayerModel');

module.exports.gachaSingle = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      const callback = (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      };
      model.selectUserById(userId, callback);
    });

    const userData = await getUserData;

    var data = {
      user_id: userId,
      counter4: userData[0].counter4,
      counter5: userData[0].counter5,
    };

    if (userData[0].primogems < 160) {
      res.status(404).json({ message: 'Not enough primogems!' });
    } else {
      data = { ...data, primogems: userData[0].primogems - 160 };

      let drop = (await require('../utils/gacha').gacha(data)).single();

      const counter = drop.splice(drop.length - 1, 1)[0];
      // * Update Counter Values to data object
      data['counter5'] = counter[0];
      data['counter4'] = counter[1];

      const callback = (errors, results, fields) => {
        if (errors) console.error(errors);
      };

      model.updatePrimogems(data, callback);
      model.updatePityCounter(data, callback);

      res.locals.result = { userData: userData[0], results: drop, primogems: data.primogems, refunds: 0 };
      next();
    }
  }
};

module.exports.gachaMulti = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    var data = {
      user_id: userId,
      counter4: userData[0].counter4,
      counter5: userData[0].counter5,
    };

    if (userData[0].primogems < 1600) {
      res.status(404).json({ message: 'Not enough primogems!' });
    } else {
      data = { ...data, primogems: userData[0].primogems - 1600 };

      let drop = (await require('../utils/gacha').gacha(data)).multi();

      const counter = drop.splice(drop.length - 1, 1)[0];
      // * Update counter values to data object
      data['counter5'] = counter[0];
      data['counter4'] = counter[1];

      const callback = (errors, results, fields) => {
        if (errors) console.error(errors);
      };

      model.updatePrimogems(data, callback);
      model.updatePityCounter(data, callback);

      res.locals.result = { userData: userData[0], results: drop, primogems: data.primogems, refunds: 0 };
      next();
    }
  }
};

module.exports.insertGachaResult = (req, res, next) => {
  const { userData, results } = res.locals.result;
  const { readJSON } = require('../assets/queryDist');

  var charObj = {
    user_id: userData.user_id,
  };

  results.forEach((item) => {
    var weapObj = {
      weapon_id: item.weapon_id,
      totalAttack: item.baseAttack,
    };

    const isChar = item.character_id != undefined;
    if (isChar) {
      // Check if character already exists
      const char = new Promise((resolve, reject) => {
        const callback = (errors, results, fields) => {
          if (errors) reject(errors);
          else resolve(results);
        };

        model.selectUserCharacterById(userData.user_id, callback);
      });

      char.then((results) => {
        const uchar = results.find((f) => f.character_id == item.character_id);
        if (uchar) {
          const multiplier = readJSON('character-level-multiplier.json');
          const rarity = { 5: '5-Star', 4: '4-Star' };

          if (uchar.level != 90) {
            const temp = {
              level: uchar.level + 1,
              health: uchar.health * multiplier[uchar.level][rarity[item.rarity]],
              atk: uchar.atk * multiplier[uchar.level][rarity[item.rarity]],
              def: uchar.def * multiplier[uchar.level][rarity[item.rarity]],
              character_id: item.character_id,
            };

            // console.log(temp); // For Debuging
            // console.log(multiplier[uchar.level]); // For Debuging

            const callback = (errors, results, fields) => {
              if (errors) console.error(errors);
            };

            model.updateUserCharacterById(temp, callback);
          } else {
            res.locals.result['refunds'] += 160;
          }
        } else {
          const charData = readJSON('character-values.json').find((f) => f.Character == item.name);

          charObj = {
            ...charObj,
            health: parseFloat(charData.HP),
            atk: parseFloat(charData.ATK),
            def: parseFloat(charData.DEF),
          };
          weapObj = { character_id: item.character_id, ...weapObj };

          const callback_weap = (errors, results, fields) => {
            if (errors) console.error(errors);
            else {
              const callback_char = (errors, results, fields) => {
                if (errors) console.error(errors);
              };

              model.insertNewUserCharacter({ ...charObj, ...weapObj, user_weapon_id: results.insertId }, callback_char);
            }
          };

          model.insertNewUserWeapon({ ...charObj, ...weapObj }, callback_weap);
        }
      });
    } else {
      // Check if weapon already exists
      const weap = new Promise((resolve, reject) => {
        const callback = (errors, results, fields) => {
          if (errors) reject(errors);
          else resolve(results);
        };

        model.selectUserWeaponById(userData.user_id, callback);
      });

      weap.then((results) => {
        const uweap = results.find((f) => f.weapon_id == item.weapon_id);
        if (uweap) {
          const type = readJSON('weapon-values.json').filter((f) => f.Rarity[0] == item.rarity);
          const multiplier = readJSON('weapon-1-3-multiplier.json');
          const value = type.find((f) => parseFloat(f.Value) == item.baseAttack);

          if (uweap.level != 90) {
            const temp = {
              level: uweap.level + 1,
              totalAttack: item.baseAttack * parseFloat(multiplier[uweap.level][value.Multiplier]),
              weapon_id: item.weapon_id,
            };

            // console.log(temp); // For Debuging
            // console.log(multiplier[uweap.level]); // For Debuging

            const callback = (errors, results, fields) => {
              if (errors) console.error(errors);
            };

            model.updateUserWeaponById(temp, callback);
          } else {
            res.locals.result['refunds'] += 160;
          }
        } else {
          weapObj = { character_id: item.character_id, ...weapObj };

          const callback = (errors, results, fields) => {
            if (errors) console.error(errors);
          };

          model.insertNewUserWeapon({ ...charObj, ...weapObj }, callback);
        }
        next();
      });
    }
  });
};

module.exports.ShowGachaResult = (req, res, next) => {
  const { primogems, results, refunds } = res.locals.result;

  res.status(200).json([
    ...results.reduce((acc, item) => {
      const { name, rarity } = item;
      if (item.character_id != undefined) acc.push({ name: name, vision: item.vision_key.toLowerCase(), rarity: '⭐'.repeat(rarity) });
      else acc.push({ name: name, rarity: '⭐'.repeat(rarity) });
      return acc;
    }, []),
    { remaining_primogems: primogems, refunds: refunds },
  ]);
};

module.exports.inventoryAll = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const results = await require('../utils/inventory').inventoryAll(userData[0].user_id);

    res.status(200).json(results);
  }
};

module.exports.inventoryChars = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const result = (await require('../utils/inventory').inventoryChar(userData[0].user_id)).allchar();

    res.status(200).json(result);
  }
};

module.exports.inventoryChar = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uchar_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const result = await (await require('../utils/inventory').inventoryChar(userData[0].user_id)).charById(uchar_id);

    if (result != 0) res.status(200).json(result);
    else res.status(404).json({ message: 'Character Id does not belong to this user!' });
  }
};

module.exports.inventoryWeaps = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const result = (await require('../utils/inventory').inventoryWeap(userData[0].user_id)).allweap();

    res.status(200).json(result);
  }
};

module.exports.inventoryWeap = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uweap_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const result = await (await require('../utils/inventory').inventoryWeap(userData[0].user_id)).weapById(uweap_id);

    if (result != 0) res.status(200).json(result);
    else res.status(404).json({ message: 'Weapon Id does not belong to this user!' });
  }
};

module.exports.showPartyMembers = (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const { party } = require('../utils/party');

    if (party.length == 0) res.status(404).json({ message: 'Please add a character to the party' });
    else res.status(200).json(party);
  }
};

module.exports.addCharacterToParty = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uchar_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const uchar_Arr = await (await require('../utils/party').createParty(userData[0].user_id)).addChar(uchar_id);

    res.status(200).json(uchar_Arr);
  }
};

module.exports.removeCharacterFromParty = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uchar_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const uchar_Arr = (await require('../utils/party').createParty(userData[0].user_id)).removeChar(uchar_id);

    res.status(200).json(uchar_Arr);
  }
};

module.exports.updateWeaponForParty = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uchar_id, uweap_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const uchar_Arr = await (await require('../utils/party').createParty(userData[0].user_id)).changeWeap(uchar_id, uweap_id);

    res.status(200).json(uchar_Arr);
  }
};

module.exports.showAllQuests = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      const callback = (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      };

      model.selectUserById(userId, callback);
    });

    const userData = await getUserData;

    const allQuests = (await require('../utils/quests').showAllQuests(userData[0].user_id)).allQuests();

    res.status(200).json(allQuests);
  }
};

module.exports.showAllQuestStatus = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      const callback = (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      };

      model.selectUserById(userId, callback);
    });

    const userData = await getUserData;

    const userQuests = (await require('../utils/quests').showAllQuests(userData[0].user_id)).userQuests();

    res.status(200).json(userQuests);
  }
};

module.exports.selectQuestById = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { quest_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const selected = await require('../utils/quests').selectQuest(userData[0].user_id, quest_id);

    res.status(200).json(selected);
  }
};

module.exports.upgradeChar = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uchar_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    if (userData[0].primogems < 160) {
      res.status(404).json({ message: 'Not enough primogems!' });
    } else {
      const results = (await require('../utils/upgrade').upgradeItemById(userData[0].user_id)).ucharUpgrade(uchar_id);

      if (results !== 0) {
        const callback = (errors, results, fields) => {
          if (errors) console.error(errors);
        };

        model.updatePrimogems({ primogems: userData[0].primogems - 160, user_id: userData[0].user_id }, callback);
        res.status(200).json([results, { remaining_primogems: userData[0].primogems - 160 }]);
      } else res.status(404).json({ message: 'Character Id does not belong to this user!' });
    }
  }
};

module.exports.upgradeWeap = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { uweap_id } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    if (userData[0].primogems < 160) {
      res.status(404).json({ message: 'Not enough primogems!' });
    } else {
      const results = (await require('../utils/upgrade').upgradeItemById(userData[0].user_id)).uweapUpgrade(uweap_id);

      if (results !== 0) {
        const callback = (errors, results, fields) => {
          if (errors) console.error(errors);
        };

        model.updatePrimogems({ primogems: userData[0].primogems - 160, user_id: userData[0].user_id }, callback);
        res.status(200).json([results, { remaining_primogems: userData[0].primogems - 160 }]);
      } else res.status(404).json({ message: 'Weapon Id does not belong to this user!' });
    }
  }
};

module.exports.showAllEntities = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const results = (await require('../utils/combat').combat(userData[0].user_id)).showAllEntities();

    res.status(200).json(results);
  }
};

module.exports.selectEntityByIndex = async (req, res, next) => {
  const { userId } = require('./loginController');
  const { idx } = req.params;

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
  } else {
    const getUserData = new Promise((resolve, reject) => {
      model.selectUserById(userId, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });

    const userData = await getUserData;

    const results = (await require('../utils/combat').combat(userData[0].user_id)).selectEntity(idx);

    res.status(200).json(results);
  }
};
