const model = require('../models/gameModel');

const getCharacters = () => {
  return new Promise((resolve, reject) => {
    model.selectAllCharacters((errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    });
  });
};

const getWeapons = () => {
  return new Promise((resolve, reject) => {
    model.selectAllWeapons((errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    });
  });
};

const insertCharUser = (data) => {
  return new Promise((resolve, reject) => {
    model.insertNewUserCharacter(data, (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    });
  });
};

const insertWeapUser = (data) => {
  return new Promise((resolve, reject) => {
    model.insertNewUserWeapon(data, (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    });
  });
};

const getUserData = (userId) => {
  return new Promise((resolve, reject) => {
    model.selectUserById(userId, (errors, results, fields) => {
      if (errors) reject(errors);
      else {
        if (results.length == 0) reject('UserId not found');
        else resolve(results[0]);
      }
    });
  });
};

module.exports.gacha = async (req, res, next) => {
  const { userId } = require('./loginController');

  if (!userId) {
    res.status(404).json({ message: 'Login Required!' });
    return;
  }

  // * Get Required Data
  const characters = await getCharacters().finally(() => console.log('getCharacters✅'));
  const weapons = await getWeapons().finally(() => console.log('getWeapons✅'));
  const userData = await getUserData(userId).finally(() => console.log('getUserData✅'));

  // * In case character drop then the character is given default weapon
  const default_weap = new Map([
    ['SWORD', 'Dull Blade'],
    ['BOW', "Hunter's Bow"],
    ['CATALYST', "Apprentice's Notes"],
    ['POLEARM', "Beginner's Protector"],
    ['CLAYMORE', 'Waster Greatsword'],
  ]);

  // * Update primogems upon making wish
  const updatePrimogems = (data) => {
    return new Promise((resolve, reject) => {
      model.updatePrimogem(data, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });
  };

  // * Update pity counter upon making wish
  const updatePityCounter = (data) => {
    return new Promise((resolve, reject) => {
      model.updatePityCounter(data, (errors, results, fields) => {
        if (errors) reject(errors);
        else resolve(results);
      });
    });
  };

  /**
   * * Get weapon stats (use .)
   * * Refers to default_weap function
   */
  const getWeapStats = (weap_name) => {
    return new Promise((resolve, reject) => {
      const result = weapons.find((f) => f.name == weap_name);
      if (result.length == 0) reject('Weapon not found');
      else resolve(result);
    });
  };

  let counter5 = userData.counter5;
  let counter4 = userData.counter4;
  let primogems = userData.primogems;

  const dropRates = {
    _rate5: 0.006,
    _rate4: 0.051,
    _pity5: 73,
    _pity4: 8,
  };

  const x = Math.random();
  let prob5 = dropRates._rate5 + Math.max(0, (counter5 - dropRates._pity5) * 10 * dropRates._rate5);
  let prob4 = dropRates._rate4 + Math.max(0, (counter4 - dropRates._pity4) * 10 * dropRates._rate5);

  if (primogems >= 160) {
    if (x < prob5) {
      drop('5star');
      counter5 = 1;
      counter4 += 1;
    } else if (x < prob4 + prob5) {
      drop('4star');
      counter5 += 1;
      counter4 = 1;
    } else {
      drop('3star');
      counter5 += 1;
      counter4 += 1;
    }
    await updatePrimogems({ primogems: primogems - 160, user_id: userId });
    await updatePityCounter({ counter5: counter5, counter4: counter4, user_id: userId });
  } else {
    res.status(406).json({ primogems: `💎${primogems}`, message: 'You have insufficient Primogems' });
  }

  async function drop(rarity) {
    // * use [0]
    const rarity5 = characters.filter((f) => f.rarity == 5 && f.name != 'Traveler');
    const rarity4 = characters.filter((f) => f.rarity == 4);
    const rarity3 = weapons.filter(
      (f) =>
        f.rarity == 3 &&
        f.name != default_weap.get('SWORD') &&
        f.name != default_weap.get('BOW') &&
        f.name != default_weap.get('CATALYST') &&
        f.name != default_weap.get('POLEARM') &&
        f.name != default_weap.get('CLAYMORE')
    );

    const data1 = {
      user_id: userId,
      health: 1000,
      energy: 300,
      def: 58,
    };

    if (rarity === '5star') {
      // * Get 5 star character
      const character = rarity5[Math.floor(Math.random() * rarity5.length)];
      const check_weapType = character.weapon_type;
      const weap_stat = await getWeapStats(default_weap.get(check_weapType)).finally(() => console.log('getWeapStats✅'));

      const data2 = {
        atk: 18 + weap_stat.baseAttack,
        character_id: character.character_id,
        weapon_id: weap_stat.weapon_id,
      };

      let data = { ...data1, ...data2 };
      await insertCharUser(data).finally(() => console.log('insertCharUser✅'));
      res.status(201).json({ name: character.name, vision: character.vision_key, rarity: '⭐⭐⭐⭐⭐', remaining_primogems: `💎${primogems - 160}` });
    } else if (rarity === '4star') {
      // * Get 4 star character

      const character = rarity4[Math.floor(Math.random() * rarity4.length)];
      const check_weapType = character.weapon_type;
      const weap_stat = await getWeapStats(default_weap.get(check_weapType)).finally(() => console.log('getWeapStats✅'));

      const data2 = {
        atk: 18 + weap_stat.baseAttack,
        character_id: character.character_id,
        weapon_id: weap_stat.weapon_id,
      };

      let data = { ...data1, ...data2 };
      await insertCharUser(data).finally(() => console.log('insertCharUser✅'));
      res.status(201).json({ name: character.name, vision: character.vision_key, rarity: '⭐⭐⭐⭐', remaining_primogems: `💎${primogems - 160}` });
    } else if (rarity === '3star') {
      // * Get 3 star Weapon

      const weapon = rarity3[Math.floor(Math.random() * rarity3.length)];

      const data2 = {
        totalAttack: weapon.baseAttack,
        weapon_id: weapon.weapon_id,
      };

      let data = { user_id: data1.user_id, ...data2 };
      await insertWeapUser(data).finally(() => console.log('insertWeapUser✅'));
      res.status(201).json({ name: weapon.name, type: weapon.type, rarity: '⭐⭐⭐', remaining_primogems: `💎${primogems - 160}` });
    }
  }
};
