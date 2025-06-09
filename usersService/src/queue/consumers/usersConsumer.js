const { getChannel } = require('../config/connection');

const usersConsumer = async () => {
  const channel = await getChannel();

  channel.consume('user-events-queue', async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());

      if (content.event !== 'USER_CREATED') {
        console.log('Usuario creado:', content.videoId);
      }

      if (content.event !== 'USER_UPDATED') {
        console.log('Usuario actualizado:', content.videoId);
      }

      if (content.event !== 'USER_DELETED') {
        console.log('Usuario eliminado:', content.videoId);
      }

      channel.ack(msg);
    } catch (error) {
      console.error('❌ Error al procesar mensaje:', error.message);
      channel.nack(msg, false, true);
    }
  });

  console.log('👂 Escuchando mensajes en "user-events-queue"...');
};

module.exports = usersConsumer;