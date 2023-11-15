import fs from 'fs';
import pool from '../src/services/db';

const readDirectoryRecursiveWithFilter = (baseDir, prefix, predicate) => {
  const traverse = (folder) => {
    const items = fs.readdirSync(`${prefix}/${folder}`);
    items.forEach((file) => {
      const path = `${folder}/${file}`;
      if (fs.lstatSync(`${prefix}/${path}`).isDirectory()) {
        traverse(path);
        return;
      }

      predicate(path);
    });
  };
  traverse(baseDir);
};

const sqlstatement = `INSERT INTO characters 
(name, title, vision_key, weapon_type, gender, nation, affiliation, rarity, release, constellation, birthday, description)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`;

readDirectoryRecursiveWithFilter('', '../assets/data/characters', (file) => {
  const content = fs.readFileSync('../assets/data/characters' + file, 'utf-8');
  const parsed = JSON.parse(content);
  pool.query(
    sqlstatement,
    [
      parsed.name,
      parsed.title,
      parsed.vision_key,
      parsed.weapon_type,
      parsed.gender,
      parsed.nation,
      parsed.affiliation,
      parsed.rarity,
      parsed.release,
      parsed.constellation,
      parsed.birthday,
      parsed.description,
    ],
    (err, results, fields) => {
      if (err) console.error(err);
      else console.log(results);
    }
  );
});

module.exports.newPlayer = () => {
  const maps = {
    name: '',
  };
};
