'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Administrators extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Administrators.init({
    password: DataTypes.STRING(100),
    login: DataTypes.STRING(100),
    type: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'Administrators',
  });
  return Administrators;
};