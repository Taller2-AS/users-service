const { connect } = require('mongoose');
const { config } = require('dotenv');
const { Server, ServerCredentials } = require('@grpc/grpc-js');
const insertSeedUsers = require('./src/database/seeders/seed');
const UsersService = require('./src/services/userService');
const loadProto = require('./src/utils/loadProto');

config({path: '.env'});

const server = new Server();

const DB = process.env.MONGO_DATABASE.replace(
    '<PASSWORD>', 
    process.env.MONGO_PASSWORD
).replace(
    '<USER>', 
    process.env.MONGO_USER
);

connect(DB).then(async () => {
  console.log('Conexión a la base de datos exitosa');
  await insertSeedUsers();
});

const usersProto = loadProto('users');
server.addService(usersProto.Users.service, UsersService);

server.bindAsync(`${process.env.SERVER_URL}:${process.env.SERVER_PORT}`, ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error('Error al iniciar el servidor:', error);
        return;
    }
    console.log(`Servidor escuchando en ${process.env.SERVER_URL}:${process.env.SERVER_PORT}`);
});


