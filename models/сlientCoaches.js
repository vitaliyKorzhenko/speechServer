'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientCoaches extends Model {
    static associate(models) {
      // define association here
    }
  };
  ClientCoaches.associate = function(models) {
    ClientCoaches.belongsTo(models.CourseClients, {
      foreignKey: 'courseClientId',
    });
    ClientCoaches.belongsTo(models.Coaches, {
      foreignKey: 'coachId',
    });
  }
  ClientCoaches.init({
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ClientCoaches',
  });
  return ClientCoaches;
};