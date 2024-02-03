'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DaliyPackages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };

  DaliyPackages.associate = function(models) {
    // associations can be defined here

    DaliyPackages.hasMany(models.DaliyTasks,{as: 'DailyTasks', foreignKey: 'dailyPackageId'});

  
    DaliyPackages.belongsTo(models.CourseClients, {
      foreignKey: 'courseClientId',
    });
  };
  DaliyPackages.init({
    status: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DaliyPackages',
  });
  return DaliyPackages;
};