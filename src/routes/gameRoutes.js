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
// (Character Upgrade)
router.get('/inventory/characters/upgrade/:uchar_id', controller.upgradeChar);

router.get('/inventory/weapons', controller.inventoryWeaps);
router.get('/inventory/weapons/:uweap_id', controller.inventoryWeap);
// (Weapon Upgrade)
router.get('/inventory/weapons/upgrade/:uweap_id', controller.upgradeWeap);

// Quest Route
router.get('/quests', controller.showAllQuests);
router.get('/quests/status', controller.showAllQuestStatus);
router.get('/quests/accept/:quest_id', controller.selectQuestById);

// Preparation
// (Party Creation)
router.get('/party', controller.showPartyMembers);
router.get('/party/add/:uchar_id', controller.addCharacterToParty);
router.get('/party/remove/:uchar_id', controller.removeCharacterFromParty);
router.get('/party/replace/:uchar_id/:uweap_id', controller.updateWeaponForParty);

// Combat Route
router.get('/combat/list', controller.showAllEntities);
router.get('/combat/select/:idx', controller.selectEntityByIndex);
router.get('/combat/attack/:partyIdx', controller.attackEntity);

module.exports = router;
