const usersConsumer = require('./consumers/usersConsumer');

const initializeQueueConsumers = async () => {
  await usersConsumer();
};

module.exports = initializeQueueConsumers;