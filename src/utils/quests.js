const model = require('../models/PlayerModel');

var killCount = 0;

module.exports = { count: killCount };

module.exports.ShowAllQuests = async (userId) => {
  const [quests, completed, inprogress, failed] = await Promise.all([
    displayAllQuests(),
    displayUserQuests(userId, 'completed'),
    displayUserQuests(userId, 'inprogress'),
    displayUserQuests(userId, 'failed'),
  ]);

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

module.exports.SelectQuest = async (userId, questId) => {
  const quests = await displayAllQuests();
  const selected = quests.find((q) => q.quest_id == questId);

  if (!selected) return { error: 'Quest not found' };
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
