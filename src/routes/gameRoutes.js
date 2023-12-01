const express = require('express');
const router = express.Router();

const controller = require('../controllers/gameController');
const login = require('../controllers/loginController');

router.post('/login', login.userLogin);
router.get('/gacha', controller.gacha);

module.exports = router;
