const model = require('../models/taskModel');

module.exports.createNewTask = (req, res, next) => {
  const { title, description, points } = req.body;
  if (!title || !description || !points) {
    res.status(400).json({ message: 'Title or Description or Points are required' });
    return;
  }
  const callback = (error, results, fields) => {
    if (error) console.error('Error createTask', error);
    else {
      req.params = {
        id: results.insertId,
        status: 201,
      };
      next();
    }
  };

  model.insertSingle(req.body, callback);
};

module.exports.readAllTasks = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) console.error('Error readAllTasks: ', error);
    else {
      res.status(200).json(results);
    }
  };

  model.selectAll(callback);
};

module.exports.readTaskById = (req, res) => {
  const { id } = req.params;

  const callback = (error, results, fields) => {
    if (error) console.error('Error readTaskById', error);
    else {
      if (results.length == 0) {
        res.status(404).json({ message: 'Task not found' });
        return;
      } else {
        if (req.params.status != undefined) res.status(req.params.status).json(results[0]);
        else res.status(200).json(results[0]);
      }
    }
  };

  model.selectById(id, callback);
};

module.exports.updateTaskById = (req, res, next) => {
  const { title, description, points } = req.body;
  const { id } = req.params;

  if (!title || !description || !points) {
    res.status(400).json({ message: 'Title or Description or Points are required' });
    return;
  }

  const callback = (error, results, fields) => {
    if (error) console.error('Error readAllTask', error);
    const findTask = results.find((f) => f.task_id == id);

    if (!findTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    } else {
      const data = {
        ...req.body,
        id: id,
      };

      const callback_update = (error, results, fields) => {
        if (error) console.error('Error updateTaskById', error);
        else {
          req.params = {
            id: id,
            status: 200,
          };
          next();
        }
      };

      model.updateById(data, callback_update);
    }
  };

  model.selectAll(callback);
};

module.exports.deleteTaskById = (req, res, next) => {
  const { id } = req.params;

  const callback = (error, results, fields) => {
    if (error) console.error('Error deleteTaskById', error);
    else {
      if (results[0].affectedRows == 0) res.status(404).json({ message: 'Task not found' });
      else res.status(204).send();
    }
  };

  model.deleteById(id, callback);
};
