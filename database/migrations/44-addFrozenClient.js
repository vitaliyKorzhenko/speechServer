
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CourseClients', 'userIsfrozen', {
      type: Sequelize.BOOLEAN,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('CourseClients', 'userIsfrozen', {

      });
  }
}; 