'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExerciseFiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ExerciseFiles.associate = function(models) {
   
    ExerciseFiles.belongsTo(models.Exercises, {
        foreignKey: 'exerciseId',
      });
   
  }
  ExerciseFiles.init({
    name: DataTypes.STRING,
    bucketLink: DataTypes.STRING,
    comment: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'ExerciseFiles',
  });
  return ExerciseFiles;
};