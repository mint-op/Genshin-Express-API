const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.post('/', controller.createNewTask, controller.readTaskById);

router.get('/', controller.readAllTasks);
router.get('/:id', controller.readTaskById);

router.put('/:id', controller.updateTaskById, controller.readTaskById);

router.delete('/:id', controller.deleteTaskById);

module.exports = router;
