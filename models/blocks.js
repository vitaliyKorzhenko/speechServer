'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blocks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  // BlockTasks
 
  // CustomizeTasks.hasMany(models.Blocks,{as: 'Blocks', foreignKey: 'taskId'});

  Blocks.associate = function(models) {

    Blocks.hasMany(models.BlockTasks,{as: 'BlockTasks', foreignKey: 'blockId'});
    
    Blocks.belongsTo(models.CustomizeTasks, {
      foreignKey: 'taskId',
    });
  }
  Blocks.init({
    name: DataTypes.STRING,
    number: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Blocks',
  });
  return Blocks;
};