const express = require('express');
const router = express.Router();

const controller = require('../controllers/gameController');
const login = require('../controllers/loginController');

router.post('/login', login.userLogin);

// * Gacha Route
router.get('/gacha', controller.gachaSingle, controller.insertGachaResult, controller.ShowGachaResult);
router.get('/gacha_multi', controller.gachaMulti, controller.insertGachaResult, controller.ShowGachaResult);

// * Output all items in inventory
router.get('/inventory', controller.inventoryAll);
// * Output all owned Characters
router.get('/inventory/characters', controller.inventoryChars);
// * Output only selected Character Details (name, stats, weapon name etc..)
router.get('/inventory/characters/:id', controller.inventoryChar);
// * Output all owned Weapons
router.get('/inventory/weapons', controller.inventoryWeaps);
// * Output only selected Weapon Details
router.get('/inventory/weapons/:id', controller.inventoryWeap);

module.exports = router;
