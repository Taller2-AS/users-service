const { connect } = require('mongoose');
const { config } = require('dotenv');
const { Server, ServerCredentials } = require('@grpc/grpc-js');
const UsersService = require('./src/services/userService');
const loadProto = require('./src/utils/loadProto');
const initializeQueueConsumers = require('./src/queue');

config({path: '.env'});

const server = new Server();

if (!process.env.MONGO_DATABASE || !process.env.MONGO_USER || !process.env.MONGO_PASSWORD) {
  console.error('❌ Variables de entorno de Mongo no definidas correctamente');
  process.exit(1);
}

const DB = process.env.MONGO_DATABASE
  .replace('<PASSWORD>', process.env.MONGO_PASSWORD)
  .replace('<USER>', process.env.MONGO_USER);

connect(DB).then(async () => {

  await initializeQueueConsumers();
  console.log('✅ RabbitMQ Consumers inicializados');
  
  console.log('Conexión a la base de datos exitosa');
});

const usersProto = loadProto('users');
server.addService(usersProto.Users.service, UsersService);

const SERVER_URL = process.env.SERVER_URL || '0.0.0.0';
const SERVER_PORT = process.env.SERVER_PORT || '50057';

server.bindAsync(`${SERVER_URL}:${SERVER_PORT}`, ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Error al iniciar el servidor:', error);
    return;
  }
  console.log(`🚀 Servidor gRPC escuchando en ${SERVER_URL}:${SERVER_PORT}`);
});


