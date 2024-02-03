
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DaliyTasks', 'isSentToClient', {
      type: Sequelize.BOOLEAN,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('DaliyTasks', 'isSentToClient', {
        
    });
  }
}; 