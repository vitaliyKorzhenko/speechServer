'use strict'
//create model for OkkCourses
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class OkkCourses extends Model {
        static associate(models) {
            // define association here
        }
    }
    OkkCourses.init({
        okkId: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        serverId : {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'OkkCourses'
    })
    return OkkCourses
}