'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseClients extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CourseClients.associate = function(models) {
    CourseClients.belongsTo(models.Courses, {
      foreignKey: 'courseId',
    });
    CourseClients.belongsTo(models.Clients, {
      foreignKey: 'clientId',
    });
  }
  CourseClients.init({
    status: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    userIsfrozen: DataTypes.BOOLEAN,
    paymentDate: DataTypes.STRING,
    schedule: DataTypes.TEXT,
    useNewBot: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CourseClients',
  });
  return CourseClients;
};