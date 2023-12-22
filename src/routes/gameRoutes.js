const express = require('express');
const router = express.Router();

const controller = require('../controllers/gameController');
const login = require('../controllers/loginController');

router.post('/login', login.userLogin);

// * Gacha Route
router.get('/gacha', controller.gachaSingle, controller.insertGachaResult, controller.ShowGachaResult);
router.get('/gacha_multi', controller.gachaMulti, controller.insertGachaResult, controller.ShowGachaResult);

// * Inventory Route
router.get('/inventory', controller.inventoryAll);
router.get('/inventory/characters', controller.inventoryChars);
router.get('/inventory/characters/:uchar_id', controller.inventoryChar);
router.get('/inventory/weapons', controller.inventoryWeaps);
router.get('/inventory/weapons/:uweap_id', controller.inventoryWeap);

// Quest Route
router.get('/quests', controller.showAllQuests);
router.get('/quests/status', controller.showAllQuestStatus);
router.get('/quests/accept/:quest_id', controller.selectQuestById);

// Preparation (Party Creation)
router.get('/party', controller.showPartyMembers);
router.get('/party/add/:uchar_id', controller.addCharacterToParty);
router.get('/party/remove/:uchar_id', controller.removeCharacterFromParty);
router.get('/party/replace/:uchar_id/:uweap_id', controller.updateWeaponForParty);

module.exports = router;
