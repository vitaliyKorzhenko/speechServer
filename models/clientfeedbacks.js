'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientFeedbacks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ClientFeedbacks.associate = function(models) {
   
    ClientFeedbacks.belongsTo(models.Clients, {
      foreignKey: 'clientId',
    });
  }
  ClientFeedbacks.init({
    feedbackText: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'ClientFeedbacks',
  });
  return ClientFeedbacks;
};