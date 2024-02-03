'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exercises extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Exercises.belongsTo(models.Courses, {
        foreignKey: 'courseId',
      });
      Exercises.hasMany(models.CustomizeTasks,{as: 'CustomizeTasks', foreignKey: 'exerciseId'});
      Exercises.hasMany(models.ExerciseFiles, {as: 'ExerciseFiles', foreignKey: 'exerciseId'});

      
    }
  };
  
  Exercises.init({
    name: DataTypes.STRING,
    videoLink: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    textValue: DataTypes.TEXT,
    coachInfo: DataTypes.TEXT,
    linksText: DataTypes.TEXT,
    isMotivatate: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Exercises',
  });
  return Exercises;
};