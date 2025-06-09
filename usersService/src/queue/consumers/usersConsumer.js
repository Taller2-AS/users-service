const { getChannel } = require('../config/connection');

const usersConsumer = async () => {
  const channel = await getChannel();

  channel.consume('user-events-queue', async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());

      console.log('📨 Evento recibido desde user-events-queue:');
      console.log(content);

      channel.ack(msg);
    } catch (error) {
      console.error('❌ Error al procesar mensaje:', error.message);
      channel.nack(msg, false, true);
    }
  });

  console.log('👂 Escuchando mensajes en "user-events-queue"...');
};

module.exports = usersConsumer;