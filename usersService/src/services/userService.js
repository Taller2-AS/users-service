const bcrypt = require('bcrypt');
const Users = require('../database/usersModel');
const catchAsync = require('../utils/catchAsync');
const { getChannel, EXCHANGE_NAME } = require('../queue/config/connection');
const publishLog = require('../queue/publisher/logPublisher');

// ✅ CREAR
const CreateUser = catchAsync(async (call, callback) => {
  const { name, lastName, email, password, confirmationPassword, role } = call.request;

  if (!name?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim() || !confirmationPassword?.trim() || !role?.trim()) {
    return callback(new Error('Todos los campos son obligatorios'));
  }

  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return callback(new Error('El correo electrónico ya está en uso'));
  }

  if (role !== 'Administrador' && role !== 'Cliente') {
    return callback(new Error('El rol debe ser "Administrador" o "Cliente"'));
  }

  if (confirmationPassword !== password) {
    return callback(new Error('Las contraseñas no coinciden'));
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
  channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify({
    event: 'USER_CREATED',
    id: newUser.id.toString(),
    name: newUser.name,
    lastName: newUser.lastName,
    email: newUser.email,
    password: newUser.password,
    role: newUser.role,
    active: newUser.active,
    createdAt: newUser.createdAt.toISOString(),
    timestamp: new Date().toISOString()
  })));

  await publishLog('action', {
    userId: newUser.id.toString(),
    email: newUser.email,
    method: 'CreateUser',
    url: '/usuarios',
    action: 'CREAR USUARIO',
    date: new Date().toISOString()
  });

  callback(null, {
    id: newUser.id.toString(),
    name: newUser.name,
    lastName: newUser.lastName,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt.toISOString()
  });
});

// ✅ OBTENER
const GetUser = catchAsync(async (call, callback) => {
  const { id } = call.request;

  const user = await Users.findById(id);
  if (!user) {
    return callback(new Error('Usuario no encontrado'));
  }

  await publishLog('action', {
    userId: id,
    email: user.email,
    method: 'GetUser',
    url: `/usuarios/${id}`,
    action: 'OBTENER USUARIO',
    date: new Date().toISOString()
  });

  callback(null, {
    id: user.id.toString(),
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  });
});

// ✅ ACTUALIZAR
const UpdateUser = catchAsync(async (call, callback) => {
  const { id, name, lastName, email, password } = call.request;

  const user = await Users.findById(id);
  if (!user) {
    return callback(new Error('Usuario no encontrado'));
  }

  if (password) {
    return callback(new Error('No se puede modificar la contraseña aquí'));
  }

  await Users.findOneAndUpdate(
    { _id: id },
    { name, lastName, email }
  );

  const updatedUser = await Users.findById(id);

  const channel = await getChannel();
  channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify({
    event: 'USER_UPDATED',
    id: updatedUser.id.toString(),
    name: updatedUser.name,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    timestamp: new Date().toISOString()
  })));

  await publishLog('action', {
    userId: updatedUser.id.toString(),
    email: updatedUser.email,
    method: 'UpdateUser',
    url: `/usuarios/${id}`,
    action: 'ACTUALIZAR USUARIO',
    date: new Date().toISOString()
  });

  callback(null, {
    id: updatedUser.id.toString(),
    name: updatedUser.name,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    role: updatedUser.role,
    createdAt: updatedUser.createdAt.toISOString()
  });
});

// ✅ ELIMINAR (desactiva el usuario)
const DeleteUser = catchAsync(async (call, callback) => {
  const { id } = call.request;

  const user = await Users.findById(id);
  if (!user) {
    return callback(new Error('Usuario no encontrado'));
  }

  await Users.findOneAndUpdate({ _id: id }, { active: false });

  const channel = await getChannel();
  channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify({
    event: 'USER_DELETED',
    id: id,
    timestamp: new Date().toISOString()
  })));

  await publishLog('action', {
    userId: id,
    email: user.email,
    method: 'DeleteUser',
    url: `/usuarios/${id}`,
    action: 'ELIMINAR USUARIO',
    date: new Date().toISOString()
  });

  callback(null, {});
});

// ✅ LISTAR
const ListUsers = catchAsync(async (call, callback) => {
  const { email, name, lastName } = call.request;

  const query = { active: true };

  if (email?.trim()) query.email = { $regex: email, $options: 'i' };
  if (name?.trim()) query.name = { $regex: name, $options: 'i' };
  if (lastName?.trim()) query.lastName = { $regex: lastName, $options: 'i' };

  const users = await Users.find(query);

  const result = users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  }));

  await publishLog('action', {
    userId: 'sistema',
    email: '',
    method: 'GetUsers',
    url: `/usuarios`,
    action: 'OBTENER USUARIOS',
    date: new Date().toISOString()
  });

  callback(null, { users: result });
});

const UsersService = {
  CreateUser,
  GetUser,
  UpdateUser,
  DeleteUser,
  ListUsers
};

module.exports = UsersService;
