const model = require('../models/PlayerModel');

var data = {};

module.exports = { qData: data };

module.exports.showAllQuests = async (userId) => {
  let [quests, completed, inprogress, failed] = await Promise.all([
    displayAllQuests(),
    displayUserQuests(userId, 'completed'),
    displayUserQuests(userId, 'inprogress'),
    displayUserQuests(userId, 'failed'),
  ]);

  inprogress = inprogress.length == 0 ? 0 : inprogress;
  completed = completed.length == 0 ? 0 : completed;
  failed = failed.length == 0 ? 0 : failed;

  return {
    allQuests() {
      return quests;
    },
    userQuests() {
      return {
        inprogress,
        completed,
        failed,
      };
    },
  };
};

module.exports.selectQuest = async (userId, questId) => {
  try {
    // Check if user_quest exists with 'inprogress' status and all_quests
    const [inprogress, quests] = await Promise.all([queryUserQuest(userId, questId, 'inprogress'), displayAllQuests()]);

    data['objective'] = quests.find((q) => q.quest_id == questId).objective;

    if (inprogress.length != 0) {
      data['uquest_id'] = inprogress[0].user_quest_id;
    } else {
      const result = await createUserQuest(questId, userId, 'inprogress');
      data['uquest_id'] = result.insertId;
    }

    return quests.find((q) => q.quest_id == questId);
  } catch (error) {
    console.error(error);
  }
};

module.exports.checkQuest = async (entity) => {
  try {
    if (objective.length == 0) return;
    const checkEntity = objective[1] == entity;

    if (checkEntity) {
      data['killCount'] += 1;
      await updateUserQuest(data['uquest_id'], killCount, 'inprogress');
    }
    if (killCount == objective[0]) {
      await updateUserQuest(data['uquest_id'], killCount, 'completed');
      // Reset KillCount
      data['killCount'] = 0;
    }
  } catch (error) {
    console.error(error);
  }
};

function displayAllQuests() {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectAllQuests(callback);
  });
}

function displayUserQuests(userId, progress) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserQuest({ user_id: userId, progress: progress }, callback);
  });
}

function createUserQuest(quest_id, user_id, progress) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.insertUserQuest({ quest_id: quest_id, user_id: user_id, progress: progress }, callback);
  });
}

function queryUserQuest(user_id, quest_id, progress) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.selectUserQuestById({ user_id: user_id, quest_id: quest_id, progress: progress }, callback);
  });
}

function updateUserQuest(uquest_id, count, progress) {
  return new Promise((resolve, reject) => {
    const callback = (errors, results, fields) => {
      if (errors) reject(errors);
      else resolve(results);
    };

    model.updateUserQuest({ user_quest_id: uquest_id, count: count, progress: progress }, callback);
  });
}
