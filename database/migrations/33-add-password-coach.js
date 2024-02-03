
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Coaches', 'password', {
      type: Sequelize.STRING(100),
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('Coaches', 'password', {
        
    });
  }
}; 