'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientsSchedules extends Model {
    static associate(models) {
      // define association here
    }
  };
  ClientsSchedules.associate = function(models) {
    ClientsSchedules.belongsTo(models.CourseClients, {
      foreignKey: 'courseClientId',
    });
    ClientsSchedules.belongsTo(models.Coaches, {
      foreignKey: 'coachId',
    });
  }
  ClientsSchedules.init({
    status: DataTypes.STRING,
    lessonTime: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ClientsSchedules',
  });
  return ClientsSchedules;
};