const { getChannel } = require('../config/connection');

const usersConsumer = async () => {
  const channel = await getChannel();

  // 👇 Asegurarse que la cola existe antes de consumir
  await channel.assertQueue('user-events-queue', { durable: true });

  channel.consume('user-events-queue', async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());

      switch (content.event) {
        case 'USER_CREATED':
          console.log('👤 Usuario creado:', content);
          break;
        case 'USER_UPDATED':
          console.log('🔄 Usuario actualizado:', content);
          break;
        case 'USER_DELETED':
          console.log('❌ Usuario eliminado:', content);
          break;
        default:
          console.log('📦 Evento no reconocido:', content.event);
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
