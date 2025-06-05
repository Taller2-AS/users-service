const bcrypt = require('bcrypt');
const Users = require('../database/usersModel');
const catchAsync = require('../utils/catchAsync');
const { getChannel, EXCHANGE_NAME } = require('../queue/config/connection');

const CreateUser = catchAsync(async (call, callback) => {
    const { userId, name, lastName, email, password, confirmationPassword, role } = call.request;
    if (!name?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim() || !confirmationPassword?.trim() || !role?.trim()) {
        return callback(new Error('Todos los campos son obligatorios'));
    }

    const existingUser = await Users.findOne({email});
    if (existingUser) {
        return callback(new Error('El correo electrónico ya está en uso'));
    }

    if (role !== 'Administrador' && role !== 'Cliente') {
        return callback(new Error('El rol debe ser "Administrador" o "Cliente"'));
    }

    if ( confirmationPassword !== password ) {
        return callback(new Error('Las contraseñas no coinciden'));
    }

    const user = await Users.findById(userId);
    if (role === 'Administrador') {
        if (!userId || user.role !== 'Administrador') {
            return callback(new Error('Solo un usuario autenticado con rol "Administrador" puede crear otro administrador'));
        }
    }
  
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await Users.create({
        name,
        lastName,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date(),
        active: true
    });

    const channel = await getChannel();
    channel.publish(
      EXCHANGE_NAME,
      '',
      Buffer.from(JSON.stringify({
        event: 'USER_CREATED',
        videoId: newUser.id.toString(),
        email: newUser.email,
        timestamp: new Date().toISOString()
      }))
    );
    //Revisar 
    callback(null, {
        id: newUser.id.toString(),
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt.toISOString(),
    });
});

const GetUser = catchAsync(async (call, callback) => {
    const { userId, id } = call.request;
    if (!userId) {
        return callback(new Error('Debes estar autenticado para obtener un usuario'));
    }
    const user = await Users.findById(id);
    if (!user) {
        return callback(new Error('Usuario no encontrado'));
    }
    const authenticatedUser = await Users.findById(userId);
    if (authenticatedUser.role !== 'Administrador' && authenticatedUser.id !== user.id) {
        return callback(new Error('No tienes permiso para ver este usuario'));
    }

    callback(null, {
        id: user.id.toString(),
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString()
    });
});

const UpdateUser = catchAsync(async (call, callback) => {
    const { userId, id, name, lastName, email, password} = call.request;

    if (!userId) {
        return callback(new Error('Debes estar autenticado para actualizar un usuario'));
    }

    const user = await Users.findById(id);
    if (!user) {
        return callback(new Error('Usuario no encontrado'));
    }

    if (password) {
        return callback(new Error('No se puede modificar la contraseña aquí'));
    }

    const authenticatedUser = await Users.findById(userId);
    if (authenticatedUser.role !== 'Administrador' && authenticatedUser.id !== user.id) {
        return callback(new Error('No tienes permiso para actualizar este usuario'));
    }

    await Users.findOneAndUpdate(
      { _id: id },
      { name, lastName, email }
    );

    const channel = await getChannel();
    channel.publish(
      EXCHANGE_NAME,
      '',
      Buffer.from(JSON.stringify({
        event: 'USER_UPDATED',
        userId: id,
        timestamp: new Date().toISOString()
      }))
    );

    callback(null, {
      id: user.id.toString(),
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString()
    });
});

const DeleteUser = catchAsync(async (call, callback) => {
    const { userId, id } = call.request;

    if (!userId) {
        return callback(new Error('Debes estar autenticado para eliminar un usuario'));
    }

    const user = await Users.findById(id);
    if (!user) {
        return callback(new Error('Usuario no encontrado'));
    }

    const authenticatedUser = await Users.findById(userId);
    if (authenticatedUser.role !== 'Administrador') {
        return callback(new Error('No tienes permiso para eliminar un usuario'));
    }

    await Users.findOneAndUpdate(
      { _id: id },
      { active: false }
    );

    const channel = await getChannel();
    channel.publish(
      EXCHANGE_NAME,
      '',
      Buffer.from(JSON.stringify({
        event: 'USER_DELETED',
        userId: id,
        timestamp: new Date().toISOString()
      }))
    );

    callback(null, {});
});

const ListUsers = catchAsync(async (call, callback) => {
    const { userId, email, name, lastName } = call.request;

    if (!userId) {
        return callback(new Error('Debes estar autenticado para listar usuarios'));
    }

    const authenticatedUser = await Users.findById(userId);
    if (authenticatedUser.role !== 'Administrador') {
        return callback(new Error('No tienes permiso para listar usuarios'));
    }

    const query = { active: true };

    if (email?.trim()) {
        query.email = { $regex: email, $options: 'i' }; 
    }

    if (name?.trim()) {
        query.name = { $regex: name, $options: 'i' };
    }

    if (lastName?.trim()) {
        query.lastName = { $regex: lastName, $options: 'i' };
    }

    const users = await Users.find(query);

    const result = users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
    }));

    callback(null, { users: result });
});

const UsersService = {
    ListUsers,
    GetUser,
    DeleteUser,
    UpdateUser,
    CreateUser,
};

module.exports = UsersService;