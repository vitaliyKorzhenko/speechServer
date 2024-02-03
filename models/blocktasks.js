'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BlockTasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  BlockTasks.associate = function(models) {
    // associations can be defined here

    BlockTasks.belongsTo(models.CustomizeTasks, {
      foreignKey: 'taskId',
    });
    BlockTasks.belongsTo(models.Blocks, {
      foreignKey: 'blockId',
    });
  };
  BlockTasks.init({
    number: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BlockTasks',
  });
  return BlockTasks;
};