'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
     /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Courses.associate = function(models) {
    Courses.hasMany(models.CustomizeTasks,{as: 'CustomizeTasks', foreignKey: 'courseId'});
    Courses.hasMany(models.CourseCoaches,{as: 'CourseCoaches', foreignKey: 'courseId'});
    Courses.hasMany(models.CourseMotivateExercises,{as: 'CourseMotivateExercises', foreignKey: 'courseId'});

    

  }
  Courses.init({
    name: DataTypes.STRING,
    status:DataTypes.STRING,
    messagingMode: DataTypes.TEXT,
    duration: DataTypes.INTEGER,
    numberForRepeat: DataTypes.INTEGER,
    language: DataTypes.TEXT,

  }, {
    sequelize,
    modelName: 'Courses',
  });
  return Courses;
};