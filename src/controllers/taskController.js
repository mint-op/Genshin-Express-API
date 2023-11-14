const model = require('../models/taskModel');

module.exports.createNewTask = (req, res, next) => {
  const { title, description, points } = req.body;
  if (!title || !description || !points) {
    res.status(400).json({ message: 'Title or Description or Points are required' });
    return;
  }
  model.insertSingle(req.body, (error, results, fields) => {
    if (error) console.error('Error createTask', error);
    else {
      req.params = {
        id: results.insertId,
        status: 201,
      };
      next();
    }
  });
};

module.exports.readAllTasks = (req, res, next) => {
  model.selectAll((error, results, fields) => {
    if (error) console.error('Error readAllTasks: ', error);
    else {
      res.status(200).json(results);
    }
  });
};

module.exports.readTaskById = (req, res) => {
  const { id } = req.params;
  model.selectById(id, (error, results, fields) => {
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
  });
};

module.exports.updateTaskById = (req, res, next) => {
  const { title, description, points } = req.body;
  const { id } = req.params;
  if (!title || !description || !points) {
    res.status(400).json({ message: 'Title or Description or Points are required' });
    return;
  }
  model.selectAll((error, results, fields) => {
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
      model.updateById(data, (error, results, fields) => {
        if (error) console.error('Error updateTaskById', error);
        else {
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

module.exports.deleteTaskById = (req, res, next) => {
  const { id } = req.params;

  model.deleteById(id, (error, results, fields) => {
    if (error) console.error('Error deleteTaskById', error);
    else {
      if (results.affectedRows == 0) res.status(404).json({ message: 'Task not found' });
      else res.status(204).send();
    }
  });
};
