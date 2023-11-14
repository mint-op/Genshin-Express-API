const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskPController');

router.post('/', controller.createNewProgress, controller.readProgressById);

router.get('/:id', controller.readProgressById);

router.put('/:id', controller.updateProgressNotes, controller.readProgressById);

router.delete('/:id', controller.deleteProgress);

module.exports = router;
