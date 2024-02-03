'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseMotivateExercises extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CourseMotivateExercises.associate = function(models) {
    CourseMotivateExercises.belongsTo(models.Courses, {
      foreignKey: 'courseId',
    });
    CourseMotivateExercises.belongsTo(models.Exercises, {
        foreignKey: 'exerciseId',
      });
   
  }
  CourseMotivateExercises.init({
    lessonNumber: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'CourseMotivateExercises',
  });
  return CourseMotivateExercises;
};