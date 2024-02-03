'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TGVideos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TGVideos.init({
    videoUrl: DataTypes.STRING,
    chatId:  DataTypes.STRING,
    messageText: DataTypes.TEXT
}, {
    sequelize,
    modelName: 'TGVideos',
  });
  return TGVideos;
};