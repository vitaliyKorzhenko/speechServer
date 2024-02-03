
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ExecutionCourses', 'errorInOrder', {
        type: Sequelize.INTEGER,
        defaultValue: 0
     });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('ExecutionCourses', 'errorInOrder', {

      });
  }
};