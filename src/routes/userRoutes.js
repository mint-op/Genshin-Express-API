const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.post('/', controller.createNewUsers, controller.readUserById);

router.get('/', controller.readAllUsers);
router.get('/:id', controller.readUserById);

router.put('/:id', controller.updateUserById, controller.readUserById);

router.delete('/:id', controller.deleteUserById);

module.exports = router;
