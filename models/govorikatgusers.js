'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GovorikaTGUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  GovorikaTGUsers.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    chatId: DataTypes.STRING,
    language: DataTypes.STRING,
    phone: DataTypes.STRING,
    schedule: DataTypes.TEXT,
    timeZone: DataTypes.STRING,
    realTimeZone: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'GovorikaTGUsers',
  });
  return GovorikaTGUsers;
};