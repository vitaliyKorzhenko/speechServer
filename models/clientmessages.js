'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientMessages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ClientMessages.associate = function(models) {
    ClientMessages.belongsTo(models.DaliyPackages, {
        foreignKey: 'dailyPackageId',
      });
    ClientMessages.belongsTo(models.Clients, {
      foreignKey: 'clientId',
    });
  }
  ClientMessages.init({
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ClientMessages',
  });
  return ClientMessages;
};