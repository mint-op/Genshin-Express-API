const model = require('../models/PlayerModel');

var data = {};

module.exports = { qData: data };

module.exports.showAllQuests = async (userId) => {
  // Retrieve all quests and user-specific quest status
  let [all, completed, inProgress, failed] = await Promise.all([
    displayAllQuests(),
    displayUserQuests(userId, 'completed'),
    displayUserQuests(userId, 'inprogress'),
    displayUserQuests(userId, 'failed'),
  ]);

  // Convert empty arrays to 0 for progress tracking
  inProgress = inProgress.length === 0 ? 0 : inProgress;
  completed = completed.length === 0 ? 0 : completed;
  failed = failed.length === 0 ? 0 : failed;

  // Return functions to access quests and user-specific quest data
  return {
    // Function to get all quests
    allQuests() {
      return all;
    },
    // Function to get user's quests by status
    userQuests() {
      return { inProgress, completed, failed };
    },
  };
};

module.exports.selectQuest = async (userId, questId) => {
  // Select a specific quest for the user
  try {
    // Retrieve user's in-progress quest and all quests
    const [inprogress, quests] = await Promise.all([queryUserQuest(userId, questId, 'inprogress'), displayAllQuests()]);

    // Set quest objective from quests list
    data['objective'] = quests.find((q) => q.quest_id == questId).objective;

    // Check if quest is already in progress
    if (inprogress.length != 0) {
      data['uquest_id'] = inprogress[0].user_quest_id;
    } else {
      // Create a new in-progress quest for user
      const result = await createUserQuest(questId, userId, 'inprogress');
      data['uquest_id'] = result.insertId;
    }

    // Return the matched quest details
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
