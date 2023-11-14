const model = require('../models/userModel');

module.exports.createNewUsers = (req, res, next) => {
  const { username, email } = req.body;
  if (!username || !email) {
    res.status(400).json({ message: 'Username or Email are required' });
    return;
  }
  model.selectAll((error, results, fields) => {
    if (error) console.error('Error readAllUsers', error);
    else {
      const emails = results.find((f) => f.email == email);
      if (emails) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }
      model.insertSingle(req.body, (error, results, fields) => {
        if (error) console.error('Error createUsers', error);
        else {
          req.params = {
            id: results.insertId,
            status: 201,
          };
          next();
        }
      });
    }
  });
};

module.exports.readAllUsers = (req, res, next) => {
  model.selectAll((error, result, fields) => {
    if (error) console.error('Error readAllUsers', error);
    else res.status(200).json(result);
  });
};

module.exports.readUserById = (req, res) => {
  const { id } = req.params;
  model.selectById(id, (error, results, fields) => {
    if (error) console.error('Error readUserById', error);
    else {
      if (results.length == 0) {
        // Mysql returns an empty array
        res.status(404).json({ message: 'User not found' });
        return;
      } else {
        if (req.params.status != undefined)
          res.status(req.params.status).json(
            results.map((m) => {
              m.user_id, m.username, m.email;
            })
          );
        else res.status(200).json(results[0]);
      }
    }
  });
};

module.exports.updateUserById = (req, res, next) => {
  const { id } = req.params;
  const { username, email } = req.body;
  if (!username || !email) {
    res.status(400).json({ message: 'Username or Email is required' });
    return;
  }
  model.selectAll((error, results, fields) => {
    if (error) console.error('Error readAllUsers', error);
    else {
      const sameData = results.filter((r) => r.username == username || r.email == email);
      let sameId = false;
      if (sameData.length != 0)
        sameData.forEach((e) => {
          if (e.user_id != id) sameId = false;
          else sameId = true;
        });
      else sameId = true;
      if (!sameId) {
        res.status(409).json({ message: 'Email or Username already exists' });
        return;
      }
      const data = {
        ...req.body,
        id: id,
      };
      model.updateById(data, (error, results, fields) => {
        if (error) console.error('Error updateUserById', error);
        else {
          console.log(results);
          req.params = {
            id: id,
            status: 200,
          };
          next();
        }
      });
    }
  });
};

module.exports.deleteUserById = (req, res, next) => {
  const { id } = req.params;

  model.deleteById(id, (error, results, fields) => {
    if (error) console.error('Error deleteUserById', error);
    else {
      if (results.affectedRows == 0) res.status(404).json({ message: 'User not found' });
      else res.status(204).send();
    }
  });
};
