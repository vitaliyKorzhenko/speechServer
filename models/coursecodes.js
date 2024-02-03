'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseStartCodes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CourseStartCodes.associate = function(models) {
    CourseStartCodes.belongsTo(models.Courses, {
      foreignKey: 'courseId',
    });
  }
  CourseStartCodes.init({
    isActive: DataTypes.BOOLEAN,
    code: DataTypes.STRING(100),
    description: DataTypes.TEXT,
    displayName: DataTypes.STRING(100),
    coachId: DataTypes.INTEGER,
    coachInfo: DataTypes.TEXT,
    alphaCode: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'CourseStartCodes',
  });
  return CourseStartCodes;
};