const fs = require('fs');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10, // Set limit to 10 connections
  host: process.env.DB_HOST, // Get host from environment variable
  user: process.env.DB_USER, // Get user from environment variable
  password: process.env.DB_PASSWORD, // Get password from environment variable
  database: process.env.DB_DATABASE, // Get database from environment variable
  multipleStatements: true, // Allow multiple SQL statements
  dateStrings: true, // Return date as string instead of Date object
});

const insertSingleCharacter = (data, callback) => {
  const sqlstatement = `INSERT INTO characters (name, title, vision_key, weapon_type, gender, nation, affiliation, rarity, release_date, constellation, birthday, description, NORMAL_ATTACK, ELEMENTAL_SKILL, ELEMENTAL_BURST) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  const VALUES = [
    data.name,
    data.title,
    data.vision_key,
    data.weapon_type,
    data.gender,
    data.nation,
    data.affiliation,
    data.rarity,
    data.release_date,
    data.constellation,
    data.birthday,
    data.description,
    data.NORMAL_ATTACK,
    data.ELEMENTAL_SKILL,
    data.ELEMENTAL_BURST,
  ];
  pool.query(sqlstatement, VALUES, callback);
};

const insertSingleWeapon = (data, callback) => {
  const sqlstatement = `INSERT INTO weapons (name, type, rarity, baseAttack, subStat) VALUES (?, ?, ?, ?, ?);`;
  const VALUES = [data.name, data.type, data.rarity, data.baseAttack, data.subStat];
  pool.query(sqlstatement, VALUES, callback);
};

const insertSingleEntity = (data, callback) => {
  const sqlstatement = `
  INSERT INTO entities (creature_id, name, description, region, type, family, faction, elements, descriptions, elemental_descriptions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const VALUES = [data.creature_id, data.name, data.description, data.region, data.type, data.family, data.faction, data.elements, data.descriptions, data.elemental_descriptions];
  pool.query(sqlstatement, VALUES, callback);
};

const insertSingleQuest = (data, callback) => {
  const sqlstatement = `
    INSERT INTO quests (title, description, objective, experience_reward, weapon_reward_rarity, required_level) VALUES (?, ?, ?, ?, ?, ?);
  `;
  const VALUES = [data.title, data.description, data.objective, data.experience_reward, data.weapon_reward_rarity, data.required_level];
  pool.query(sqlstatement, VALUES, callback);
};

const readDirectoryRecursiveWithFilter = async (baseDir, prefix) => {
  try {
    const parsedDataArray = []; // Array to store parsed data

    const traverse = (folder) => {
      const items = fs.readdirSync(`${prefix}/${folder}`);
      for (const file of items) {
        const path = `${folder}/${file}`;
        const stats = fs.lstatSync(`${prefix}/${path}`);
        if (stats.isDirectory()) {
          traverse(path);
        } else {
          const content = fs.readFileSync(`${prefix}/${path}`, 'utf-8');
          const parsed = JSON.parse(content);
          parsedDataArray.push(parsed);
        }
      }
    };

    traverse(baseDir);

    const insertData = async (temp, insertFunction) => {
      return new Promise((resolve, reject) => {
        insertFunction(temp, (errors, results, fields) => {
          if (errors) {
            console.error(`Error inserting data for file`, errors);
            reject(errors);
          } else {
            // console.log(results); // * For debuging
            resolve();
          }
        });
      });
    };

    const insertCharacter = async (data) => {
      const temp = {
        name: data.name,
        title: data.title,
        vision_key: data.vision_key,
        weapon_type: data.weapon_type,
        gender: data.gender,
        nation: data.nation,
        affiliation: data.affiliation,
        rarity: data.rarity,
        release_date: data.release,
        constellation: data.constellation,
        birthday: data.birthday,
        description: data.description,
        NORMAL_ATTACK: JSON.stringify(data.skillTalents[0]),
        ELEMENTAL_SKILL: JSON.stringify(data.skillTalents[1]),
        ELEMENTAL_BURST: JSON.stringify(data.skillTalents[2]),
      };

      await insertData(temp, insertSingleCharacter);
    };

    const insertWeapon = async (data) => {
      const temp = {
        name: data.name,
        type: data.type,
        rarity: data.rarity,
        baseAttack: data.baseAttack,
        subStat: data.subStat,
      };

      await insertData(temp, insertSingleWeapon);
    };

    const insertEntity = async (data) => {
      const temp = {
        creature_id: data.id,
        name: data.name,
        description: data.description,
        region: data.region,
        type: data.type,
        family: data.family,
        faction: data.faction,
        elements: JSON.stringify(data.elements),
        descriptions: JSON.stringify(data.descriptions),
        elemental_descriptions: JSON.stringify(data['elemental-descriptions']),
      };

      await insertData(temp, insertSingleEntity);
    };

    if (prefix === path.join(__dirname, 'data/characters')) {
      /**
       * * uses Promise.all and map to asynchronously insert each item in the parsedDataArray
       * * using the insertCharacter function
       */
      await Promise.all(parsedDataArray.map(insertCharacter));
    } else if (prefix === path.join(__dirname, 'data/weapons')) {
      await Promise.all(parsedDataArray.map(insertWeapon));
    } else if (prefix === path.join(__dirname, 'data/enemies')) {
      await Promise.all(parsedDataArray.map(insertEntity));
    }
  } catch (error) {
    console.error(error);
  }
};

const readFile = async (prefix) => {
  const questData = await require('./queryDist').readJSON(prefix);

  const insertData = (temp, insertFunction) => {
    return new Promise((resolve, reject) => {
      insertFunction(temp, (errors, results, fields) => {
        if (errors) {
          console.error(`Error inserting data for file`, errors);
          reject(errors);
        } else {
          // console.log(results);   // * For debuging
          resolve(results);
        }
      });
    });
  };

  const insertQuest = async (data) => {
    const temp = {
      title: data.title,
      description: data.description,
      experience_reward: data.experience_reward,
      objective: JSON.stringify(data.objective),
      weapon_reward_rarity: data.weapon_reward_rarity,
      primogems_reward: data.primogems_reward,
      required_level: data.required_level,
    };

    await insertData(temp, insertSingleQuest);
  };

  if (prefix === 'quests.json') {
    await Promise.all(questData.map(insertQuest));
  }
};

// ... existing code ...

// * The __dirname variable provides the directory name of the current module (i.e., the directory of the script)
Promise.all([
  readDirectoryRecursiveWithFilter('', path.join(__dirname, 'data/characters')),
  readDirectoryRecursiveWithFilter('', path.join(__dirname, 'data/weapons')),
  readDirectoryRecursiveWithFilter('', path.join(__dirname, 'data/enemies')),
  readFile('quests.json'),
])
  .then(() => {
    startCountdown(5);
  })
  .catch((error) => {
    console.error('An error occurred during data insertion:', error);
    process.exit(1); // Exit with a "failure" code
  });

function startCountdown(seconds) {
  let counter = seconds;

  const interval = setInterval(() => {
    process.stdout.write(`Waiting for ${counter} more seconds...\r`);
    counter--;

    if (counter < 1) {
      clearInterval(interval);
      console.log('Finished inserting all data. Exiting now...');
      process.exit(0); // Exit with a "success" code
    }
  }, 1000);
}
