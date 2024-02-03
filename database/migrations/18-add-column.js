
  'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Exercises', 'duration', {
        type: Sequelize.INTEGER,
        defaultValue: 1
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('Exercises', 'duration', {
      
      });
  }
}; 