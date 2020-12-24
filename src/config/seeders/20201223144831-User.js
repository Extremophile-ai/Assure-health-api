import bcrypt from 'bcrypt';

const password = 'SomeWeirdAndRandom2020Password';
const hash = bcrypt.hashSync(password, 12);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      id: 'c7d5fb3e-60cd-4159-b3ab-369d16a12bfc',
      email: 'alonso@gmail.com',
      firstName: 'alonso',
      lastName: 'mazi',
      password: hash,
      role: 'Admin',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '323f878c-21f5-4f82-bde5-0b35ea80e1d3',
      email: 'jerryg@hotmail.com',
      firstName: 'garry',
      lastName: 'jerry',
      password: hash,
      role: 'User',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'e66094a2-f35b-401e-9798-54f337e3af84',
      email: 'godspowercuche@gmail.com',
      firstName: 'godspower',
      lastName: 'uche',
      password: hash,
      role: 'Super Admin',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },
  down: async (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
