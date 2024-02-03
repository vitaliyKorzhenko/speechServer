'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Exercises', 'courseId', {
        type: Sequelize.INTEGER,
        references: {
            model: 'Courses',
            key: 'id',
          },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('Exercises', 'courseId', {
        
    });
  }
};