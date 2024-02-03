
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExecutionCourses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ExecutionCourses.associate = function(models) {
    // associations can be defined here
  
    ExecutionCourses.belongsTo(models.CourseClients, {
      foreignKey: 'courseClientId',
    });
    ExecutionCourses.belongsTo(models.CustomizeTasks, {
      foreignKey: 'taskId',
    });
  };
  ExecutionCourses.init({
    number: DataTypes.INTEGER,
    status: DataTypes.STRING,
    statusCode: DataTypes.INTEGER,
    attempts: DataTypes.INTEGER,
    success: DataTypes.INTEGER,
    error: DataTypes.INTEGER,
    errorInOrder: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ExecutionCourses',
  });
  return ExecutionCourses;
};