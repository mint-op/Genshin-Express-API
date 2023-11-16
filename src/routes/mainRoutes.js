const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const taskPRoutes = require('./taskPRoutes');

const gameRoutes = require('./gameRoutes');

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/task_progress', taskPRoutes);

router.use('/game', gameRoutes);

module.exports = router;
