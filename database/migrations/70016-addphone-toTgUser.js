
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TGUsers', 'phone', {
        type: Sequelize.STRING(100),
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('TGUsers', 'phone', {
        
     });
  }
};