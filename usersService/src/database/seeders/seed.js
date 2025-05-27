const fs = require('fs');
const path = require('path');
const Users = require('../usersModel');

const insertSeedUsers = async () => {
  const seedPath = path.join(__dirname, '..', '..', 'usersSeed.json');
  const usersData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  await Users.deleteMany();
  await Users.insertMany(usersData);
  console.log('Usuarios semilla insertados correctamente');
};

module.exports = insertSeedUsers;
