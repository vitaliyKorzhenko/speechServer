'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomizeTasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // CustomizeTasks.hasMany(models.BlockingExercises,{as: 'BlockingExercises', foreignKey: 'taskId'})
    }
  };
  CustomizeTasks.associate = function(models) {
    // associations can be defined here
    CustomizeTasks.hasMany(models.Blocks,{as: 'Blocks', foreignKey: 'taskId'});

    CustomizeTasks.hasMany(models.ExecutionCourses,{as: 'ExecutionCourses', foreignKey: 'taskId'});

    CustomizeTasks.belongsTo(models.Categories, {
      foreignKey: 'categoryId',
    });
    CustomizeTasks.belongsTo(models.Exercises, {
      foreignKey: 'exerciseId',
    });
    CustomizeTasks.belongsTo(models.Courses, {
      foreignKey: 'courseId',
    });
  };
  CustomizeTasks.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    countForCancel: DataTypes.INTEGER,
    number: DataTypes.INTEGER,
    countForSuccess: DataTypes.INTEGER,
    countForBlock: DataTypes.INTEGER,
    isBlocking: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CustomizeTasks',
  });
  return CustomizeTasks;
};