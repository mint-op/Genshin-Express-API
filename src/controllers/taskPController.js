const model = require('../models/taskPModel');

module.exports.createNewProgress = (req, res, next) => {
  const { user_id, task_id, completion_date } = req.body;
  if (!completion_date) {
    res.status(400).json({ message: 'completion_date is missing' });
    return;
  }
  model.checkIds((error, results, fields) => {
    if (error) console.error('Error checkIds', error);
    const uid = results.find((f) => f.user_id == user_id);
    const tid = results.find((f) => f.task_id == task_id);
    if (!uid || !tid) {
      res.status(404).json({ message: 'userId or taskId not found' });
      return;
    } else {
      model.insertSingle(req.body, (error, results, fields) => {
        if (error) console.error('Error createProgress', error);
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

module.exports.readProgressById = (req, res) => {
  const { id } = req.params;
  model.selectById(id, (error, results, fields) => {
    if (error) console.error('Error readProgressById', error);
    if (results.length == 0) {
      res.status(404).json({ message: 'Progress not found' });
      return;
    } else {
      if (req.params.status != undefined) res.status(req.params.status).json(results[0]);
      else res.status(200).json(results[0]);
    }
  });
};

module.exports.updateProgressNotes = (req, res, next) => {
  const { id } = req.params;
  const { notes } = req.body;
  if (!notes) {
    res.status(400).json({ message: 'notes is missing' });
    return;
  } else {
    model.selectAll((error, results, fields) => {
      if (error) console.error('Error readAllProgress', error);
      const progress = results.find((f) => f.progress_id == id);
      if (!progress) {
        res.status(404).json({ message: 'ProgressId not found' });
        return;
      } else {
        model.updateById_notes(notes, (error, results, fields) => {
          if (error) console.error('Error updateProgressNotes', error);
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
  }
};

module.exports.deleteProgress = (req, res, next) => {
  const { id } = req.params;

  model.deleteProgress(id, (error, results, fields) => {
    if (error) console.error('Error deleteProgress', error);
    else {
      if (results.affectedRows == 0) res.status(404).json({ message: 'ProgressId not found' });
      else res.status(204).send();
    }
  });
};
