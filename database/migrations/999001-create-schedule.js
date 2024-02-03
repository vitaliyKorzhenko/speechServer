'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CourseClients', 'schedule', {
        type: Sequelize.TEXT,
        get: function () {
             return JSON.parse(this.getDataValue('schedule'));
         },
         set: function (value) {
             this.setDataValue('value', JSON.stringify(value));
         },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColum('CourseClients', 'schedule', {
        
     });
  }
};