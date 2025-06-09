const { getChannel } = require('../config/connection');

const publishLog = async (type, payload) => {
  const channel = await getChannel();
  const queue = type === 'error' ? 'logs.error' : 'logs.action';
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
};

module.exports = publishLog;