'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('GovorikaTGUsers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: true,
                type: Sequelize.STRING
            },
            username: {
                type: Sequelize.STRING
            },
            chatId: {
                type: Sequelize.STRING
            },
            language: {
                type: Sequelize.STRING,
                allowNull: true
            },
            timeZone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            realTimeZone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            schedule: {
                type: Sequelize.TEXT,
                get: function () {
                    return JSON.parse(this.getDataValue('schedule'));
                },
                set: function (value) {
                    this.setDataValue('value', JSON.stringify(value));
                },
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('GovorikaTGUsers');
    }
};