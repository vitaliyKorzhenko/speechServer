
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Courses', 'messagingMode', {
      type: Sequelize.TEXT,
      defaultValue: "standart"
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('Courses', 'messagingMode', {
        
    });
  }
}; 