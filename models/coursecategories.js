'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CourseCategories.associate = function(models) {
    CourseCategories.belongsTo(models.Categories, {
      foreignKey: 'categoryId',
    });
    CourseCategories.belongsTo(models.Courses, {
      foreignKey: 'courseId',
    });
  }
  CourseCategories.init({
    number: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CourseCategories',
  });
  return CourseCategories;
};