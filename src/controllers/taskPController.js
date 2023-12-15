const model = require('../models/taskPModel');

module.exports.createNewProgress = (req, res, next) => {
  const { user_id, task_id, completion_date } = req.body;

  if (!completion_date) {
    res.status(400).json({ message: 'completion_date is missing' });
    return;
  }

  const callback_checkIds = (error, results, fields) => {
    if (error) {
      console.error('Error checkIds', error);
      return;
    }
    const uid = results.find((f) => f.user_id == user_id);
    const tid = results.find((f) => f.task_id == task_id);

    if (!uid || !tid) {
      res.status(404).json({ message: 'userId or taskId not found' });
    } else {
      const callback_insert = (error, results, fields) => {
        if (error) console.error('Error createProgress', error);
        else {
          req.params = {
            id: results.insertId,
            status: 201,
          };
          next();
        }
      };

      model.insertSingle(req.body, callback_insert);
    }
  };

  model.checkIds(callback_checkIds);
};

module.exports.readProgressById = (req, res) => {
  const { id } = req.params;

  const callback = (error, results, fields) => {
    if (error) console.error('Error readProgressById', error);
    if (results.length == 0) {
      res.status(404).json({ message: 'Progress not found' });
      return;
    } else {
      if (req.params.status != undefined) res.status(req.params.status).json(results[0]);
      else res.status(200).json(results[0]);
    }
  };

  model.selectById(id, callback);
};

module.exports.updateProgressNotes = (req, res, next) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (!notes) {
    res.status(400).json({ message: 'notes is missing' });
    return;
  } else {
    const callback_all = (error, results, fields) => {
      if (error) {
        console.error('Error readAllProgress', error);
        return;
      }
      const progress = results.find((f) => f.progress_id == id);

      if (!progress) {
        res.status(404).json({ message: 'ProgressId not found' });
        return;
      } else {
        const callback_update = (error, results, fields) => {
          if (error) console.error('Error updateProgressNotes', error);
          else {
            req.params = {
              id: id,
              status: 200,
            };
            next();
          }
        };

        model.updateById_notes({ progress_id: id, notes: notes }, callback_update);
      }
    };

    model.selectAll(callback_all);
  }
};

module.exports.deleteProgress = (req, res, next) => {
  const { id } = req.params;

  const callback = (error, results, fields) => {
    if (error) console.error('Error deleteProgress', error);
    else {
      if (results[0].affectedRows == 0) res.status(404).json({ message: 'ProgressId not found' });
      else res.status(204).send();
    }
  };

  model.deleteProgress(id, callback);
};
