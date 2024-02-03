'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseCoaches extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CourseCoaches.associate = function(models) {
    CourseCoaches.belongsTo(models.Courses, {
      foreignKey: 'courseId',
    });
    CourseCoaches.belongsTo(models.Coaches, {
      foreignKey: 'coachId',
    });
  }
  CourseCoaches.init({
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CourseCoaches',
  });
  return CourseCoaches;
};