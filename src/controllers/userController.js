const model = require('../models/userModel');

module.exports.createNewUsers = (req, res, next) => {
  const { username, email } = req.body;

  if (!username || !email) {
    res.status(400).json({ message: 'Username or Email are required' });
    return;
  }
  const callback_all = (error, results, fields) => {
    if (error) console.error('Error readAllUsers', error);
    else {
      const emails = results.find((f) => f.email == email);

      if (emails) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }

      const callback_insert = (error, results, fields) => {
        if (error) console.error('Error createUsers', error);
        else {
          res.status(201).json({ user_id: results.insertId, username: username, email: email });
        }
      };

      model.insertSingle(req.body, callback_insert);
    }
  };

  model.selectAll(callback_all);
};

module.exports.readAllUsers = (req, res, next) => {
  const callback = (error, result, fields) => {
    if (error) console.error('Error readAllUsers', error);
    else res.status(200).json(result);
  };

  model.selectAll(callback);
};

module.exports.getUserPoints = (req, res, next) => {
  const { id } = req.params;

  const callback = (errors, results, fields) => {
    if (errors) console.error('Error getUserPoints', errors);
    else {
      if (results[0].points == null) {
        res.locals.points = 0;
      } else {
        res.locals.points = parseInt(results[0].points);
      }

      next();
    }
  };

  model.getUserPoints(id, callback);
};

module.exports.readUserById = (req, res) => {
  const { id } = req.params;

  const callback = (error, results, fields) => {
    if (error) console.error('Error readUserById', error);
    else {
      if (results.length == 0) {
        // Mysql returns an empty array
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(200).json({ ...results[0], points: res.locals.points });
      }
    }
  };

  model.selectById(id, callback);
};

module.exports.updateUserById = (req, res, next) => {
  const { id } = req.params;
  const { username, email } = req.body;

  if (!username || !email) {
    res.status(400).json({ message: 'Username or Email is required' });
    return;
  }

  const callback_all = (error, results, fields) => {
    if (error) console.error('Error readAllUsers', error);
    else {
      const checkid = results.find((f) => f.user_id == id);
      if (!checkid) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
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

      const callback_update = (error, results, fields) => {
        if (error) console.error('Error updateUserById', error);
        else {
          console.log(results);
          res.status(200).json({ user_id: id, username: username, email: email });
        }
      };

      model.updateById(data, callback_update);
    }
  };

  model.selectAll(callback_all);
};

module.exports.deleteUserById = (req, res, next) => {
  const { id } = req.params;

  const callback = (error, results, fields) => {
    if (error) console.error('Error deleteUserById', error);
    else {
      if (results[0].affectedRows == 0) res.status(404).json({ message: 'User not found' });
      else res.status(204).send();
    }
  };

  model.deleteById(id, callback);
};
