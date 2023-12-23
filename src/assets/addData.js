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
  // Define the SQL statement with placeholders for insertion
  const sqlstatement = `INSERT INTO characters (name, title, vision_key, weapon_type, gender, nation, affiliation, rarity, release_date, constellation, birthday, description, NORMAL_ATTACK, ELEMENTAL_SKILL, ELEMENTAL_BURST) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  // Map data fields to the VALUES array
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

  // Execute the SQL query with the values array
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

/**
 * Asynchronously reads a directory and its subdirectories, and applies filters based on file content
 * to perform insert operations into a database. This is a high-level function that branches into
 * different insert operations depending on the type of data (characters, weapons, or enemies).
 */
const readDirectoryRecursiveWithFilter = async (baseDir, prefix) => {
  try {
    const parsedDataArray = []; // Array to store parsed JSON data from files.

    /**
     * Synchronously traverses a given directory, reading the files and directories within.
     * If a directory is found, it recursively traverses it. If a file is found, it is read
     * and its content is parsed as JSON and stored in parsedDataArray.
     */
    const traverse = (folder) => {
      // Read the contents of the folder.
      const items = fs.readdirSync(`${prefix}/${folder}`);
      for (const file of items) {
        const path = `${folder}/${file}`;
        const stats = fs.lstatSync(`${prefix}/${path}`);
        // If the path is a directory, recurse into it.
        if (stats.isDirectory()) {
          traverse(path);
        } else {
          // Read and parse file content, then store it in the array.
          const content = fs.readFileSync(`${prefix}/${path}`, 'utf-8');
          const parsed = JSON.parse(content);
          parsedDataArray.push(parsed);
        }
      }
    };

    // Start the directory traversal from baseDir.
    traverse(baseDir);

    /**
     * Wraps an insert operation in a Promise to handle asynchronous execution.
     */
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

    // Define insert functions for characters, weapons, and entities.
    // Each function formats the data and calls insertData with the appropriate insert function.
    /**
     * Inserts character data into the database.
     */
    const insertCharacter = async (data) => {
      // Format character data and call insertData.
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

    /**
     * Inserts weapon data into the database.
     */
    const insertWeapon = async (data) => {
      // Format weapon data and call insertData.
      const atk = await require('./queryDist')
        .readJSON('weapon-values.json')
        .filter((f) => f.Rarity[0] == data.rarity)
        .find((f) => Math.round(f.Value) == data.baseAttack); // * filter by rarity

      // console.log(atk, data.name, data.rarity, data.baseAttack); // For Debugging

      const temp = {
        name: data.name,
        type: data.type,
        rarity: data.rarity,
        baseAttack: parseFloat(atk.Value),
        subStat: data.subStat,
      };

      await insertData(temp, insertSingleWeapon);
    };

    /**
     * Inserts entity data into the database.
     */
    const insertEntity = async (data) => {
      // Format entity data and call insertData.
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

    // Depending on the prefix, use the appropriate insert function for the parsed data.
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

/**
 * Reads the quest data from a file and inserts it into the database.
 */
const readFile = async (prefix) => {
  // Read the JSON data from the file with the given prefix.
  const questData = await require('./queryDist').readJSON(prefix);

  /**
   * Inserts data into the database using a provided insert function.
   */
  const insertData = (temp, insertFunction) => {
    return new Promise((resolve, reject) => {
      insertFunction(temp, (errors, results, fields) => {
        if (errors) {
          console.error(`Error inserting data for file`, errors);
          reject(errors);
        } else {
          resolve(results);
        }
      });
    });
  };

  /**
   * Prepares and inserts quest data into the database.
   */
  const insertQuest = async (data) => {
    // Prepare the data for insertion.
    const temp = {
      title: data.title,
      description: data.description,
      experience_reward: data.experience_reward,
      objective: JSON.stringify(data.objective),
      weapon_reward_rarity: data.weapon_reward_rarity,
      primogems_reward: data.primogems_reward,
      required_level: data.required_level,
    };

    // Wait for the data to be inserted.
    await insertData(temp, insertSingleQuest);
  };

  // If the prefix matches 'quests.json', insert all quest data into the database.
  if (prefix === 'quests.json') {
    await Promise.all(questData.map(insertQuest));
  }
};

// ... existing code ...

// The following Promise.all will attempt to read and insert data from multiple directories, and then insert quest data.
Promise.all([
  readDirectoryRecursiveWithFilter('', path.join(__dirname, 'data/characters')),
  readDirectoryRecursiveWithFilter('', path.join(__dirname, 'data/weapons')),
  readDirectoryRecursiveWithFilter('', path.join(__dirname, 'data/enemies')),
  readFile('quests.json'), // Call readFile specifically for 'quests.json'
])
  .then(() => {
    // If all data is read and inserted without error, start a countdown.
    startCountdown(5);
  })
  .catch((error) => {
    // If there is an error, log it and exit with a failure code.
    console.error('An error occurred during data insertion:', error);
    process.exit(1);
  });

/**
 * Starts a countdown and logs the remaining time every second.
 */
function startCountdown(seconds) {
  let counter = seconds;

  // Set up an interval to count down every second.
  const interval = setInterval(() => {
    process.stdout.write(`Waiting for ${counter} more seconds...\r`);
    counter--;

    // If the countdown reaches 0, clear the interval, log the message, and exit with a success code.
    if (counter < 1) {
      clearInterval(interval);
      console.log('Finished inserting all data. Exiting now...');
      process.exit(0);
    }
  }, 1000);
}
