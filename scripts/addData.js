const fs = require('fs');
const model = require('./models');

const readDirectoryRecursiveWithFilter = async (baseDir, prefix, predicate) => {
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

    if (prefix === '../assets/data/characters') {
      await Promise.all(
        parsedDataArray.map((data) => {
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
          };
          return new Promise((resolve, reject) => {
            model.insertSingleCharacter(temp, (errors, results, fields) => {
              if (errors) {
                console.error(`Error inserting data for file`, errors);
                reject(errors);
              } else {
                console.log(results);
                resolve();
              }
            });
          });
        })
      );
    } else if (prefix === '../assets/data/weapons') {
      await Promise.all(
        parsedDataArray.map((data) => {
          const temp = {
            name: data.name,
            type: data.type,
            rarity: data.rarity,
            baseAttack: data.baseAttack,
            subStat: data.subStat,
          };
          return new Promise((resolve, reject) => {
            model.insertSingleWeapon(temp, (errors, results, fields) => {
              if (errors) {
                console.error(`Error inserting data for file`, errors);
                reject(errors);
              } else {
                console.log(results);
                resolve();
              }
            });
          });
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
};
// ... existing code ...

readDirectoryRecursiveWithFilter('', '../assets/data/characters', () => {});
readDirectoryRecursiveWithFilter('', '../assets/data/weapons', () => {})
  .then(() => {
    console.log('Finished inserting all data. Exiting now...');
    process.exit();
  })
  .catch((error) => {
    console.error('An error occurred during data insertion:', error);
    process.exit(1); // Exit with a "failure" code
  });
