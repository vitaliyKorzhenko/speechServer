
  'use strict';
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Courses', 'numberForRepeat', {
          type: Sequelize.INTEGER,
          defaultValue: 1
        });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropColum('Courses', 'numberForRepeat', {
        
        });
    }
  }; 