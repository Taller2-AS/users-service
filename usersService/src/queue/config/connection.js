const amqp = require('amqplib');

let channel;

const connectWithRetry = async (url, retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(url);
      channel = await connection.createChannel();
      console.log('✅ Conectado a RabbitMQ');
      return channel;
    } catch (error) {
      console.warn(`⚠️ Error conectando a RabbitMQ (intento ${i + 1}/${retries}):`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

const getChannel = async () => {
  if (!channel) {
    channel = await connectWithRetry(process.env.RABBITMQ_URL);
  }
  return channel;
};

module.exports = {
  getChannel
};
