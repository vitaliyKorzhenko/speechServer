
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CourseStartCodes', 'coachId', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('CourseStartCodes', 'coachInfo', {
        type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('CourseStartCodes', 'alphaCode', {
        type: Sequelize.TEXT,
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('CourseStartCodes', 'coachId', {});
    await queryInterface.dropColum('CourseStartCodes', 'coachInfo', {});
    await queryInterface.dropColum('CourseStartCodes', 'alphaCode', {});
  }
}; 