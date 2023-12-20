const fs = require('fs');

module.exports.readJSON = (file) => {
  const data = JSON.parse(fs.readFileSync(`./src/assets/json/${file}`, 'utf-8'));
  return data;
};
