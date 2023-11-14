const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const taskPRoutes = require('./taskPRoutes');

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/task_progress', taskPRoutes);

module.exports = router;
