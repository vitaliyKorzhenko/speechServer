
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CourseClients', 'paymentDate', {
        type: Sequelize.STRING(100),
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('CourseClients', 'paymentDate', {
        
    });
  }
};