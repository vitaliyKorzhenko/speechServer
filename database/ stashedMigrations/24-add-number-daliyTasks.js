
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DaliyTasks', 'number', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('DaliyTasks', 'number', {

    });
  }
}; 