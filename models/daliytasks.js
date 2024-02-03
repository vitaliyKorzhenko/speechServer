'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DaliyTasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DaliyTasks.associate = function(models) {
    // associations can be defined here
  
    DaliyTasks.belongsTo(models.DaliyPackages, {
      foreignKey: 'dailyPackageId',
    });
    DaliyTasks.belongsTo(models.CustomizeTasks, {
      foreignKey: 'taskId',
    });
  };
  DaliyTasks.init({
    status: DataTypes.STRING,
    name: DataTypes.STRING,
    blockId: DataTypes.INTEGER,
    number: DataTypes.INTEGER,
    isSentToClient: DataTypes.BOOLEAN,
    videoAnswer: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DaliyTasks',
  });
  return DaliyTasks;
};