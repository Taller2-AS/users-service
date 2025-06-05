const { connect } = require('amqplib');

let channel;

const QUEUES = ["user-create-queue1", "user-create-queue2"];
const EXCHANGE_NAME = ["user-created-exchange"];

async function connectToRabbitMQ() {
    try {
        const connection = await connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
        await Promise.all(
            QUEUES.map(async (queue) => {
                await channel.assertQueue("user-create-queue1", { durable: true });
                await channel.bindQueue("user-create-queue1", EXCHANGE_NAME, '');
            }
        ));
    } catch (error) {
        console.error('Error al conectar a RabbitMQ:', error);
        throw error;
    }
}

async function getChannel() {
    if (!channel) {
        await connectToRabbitMQ();
    }
    return channel;
}

module.exports = getChannel;