
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DaliyTasks', 'videoAnswer', {
      type: Sequelize.TEXT,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('DaliyTasks', 'videoAnswer', {
        
    });
  }
}; 