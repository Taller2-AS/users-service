const { randomUUID } = require('crypto');
const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  _id: {
    type: String,
    default: () => randomUUID(),
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Administrador', 'Cliente'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Users = model('Users', UserSchema);

module.exports = Users;

