const amqp = require('amqplib');

let channel;

const connectToRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  return channel;
};

const getChannel = async () => {
  if (!channel) {
    channel = await connectToRabbitMQ();
  }
  return channel;
};

module.exports = {
  getChannel
};