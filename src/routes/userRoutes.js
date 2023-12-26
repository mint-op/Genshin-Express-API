const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.post('/', controller.createNewUsers);

router.get('/', controller.readAllUsers);
router.get('/:id', controller.readUserById);

router.put('/:id', controller.updateUserById);

router.delete('/:id', controller.deleteUserById);

module.exports = router;
