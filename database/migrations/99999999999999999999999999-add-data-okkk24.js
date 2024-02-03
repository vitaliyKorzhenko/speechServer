'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Вставляем данные в таблицу 'OkkCourses'
    await queryInterface.bulkInsert('OkkCourses', [
      { okkId: 83, description: 'Видео курс "Запуск речи" без логопеда', serverId: 15, createdAt: now, updatedAt: now },
      { okkId: 87, description: 'Відео курс "Запуск мови" без логопеда (99,00 за месяц)', serverId: 16, createdAt: now, updatedAt: now },
      { okkId: 85, description: 'Видео курс "Запуск фразовой речи" без логопеда', serverId: 17, createdAt: now, updatedAt: now },
      { okkId: 86, description: 'Відео курс "Запуск фразового мовлення" без логопеда', serverId: 18, createdAt: now, updatedAt: now},
      // Добавьте остальные записи здесь
        { okkId: 63, description: 'Курс "Запуск речи" + 24 сессии с логопедом куратором', serverId: 8, createdAt: now, updatedAt: now },
        { okkId: 88, description: 'Курс "Запуск мови" + 24 сесії з логопедом куратором', serverId: 13, createdAt: now, updatedAt: now },
        { okkId: 62, description: 'Курс "Запуск речи " + 12 сессий с логопедом куратором', serverId: 8, createdAt: now, updatedAt: now },
        { okkId: 89, description: 'Курс "Запуск мови" + 12 сесій з логопедом куратором', serverId: 13, createdAt: now, updatedAt: now },
        { okkId: 72, description: 'Курс "Запуск речи" + 12 сессий с логопедом куратором (оплата частями)', serverId: 8, createdAt: now, updatedAt: now },
        { okkId: 90, description: 'Курс "Запуск мови" + 12 сесій з логопедом куратором (оплата частинами)', serverId: 13, createdAt: now, updatedAt: now },
        { okkId: 71, description: 'Курс "Запуск речи" + 6 сессий с логопедом куратором (оплата частями)', serverId: 8, createdAt: now, updatedAt: now },
        { okkId: 91, description: 'Курс "Запуск мови" + 6 сесій з логопедом куратором (оплата частинами)', serverId: 13, createdAt: now, updatedAt: now },
        { okkId: 92, description: 'Курс "Запуск фразовой речи" + 24 сессии с логопедом куратором', serverId: 10, createdAt: now, updatedAt: now },
        { okkId: 93, description: 'Курс "Запуск фразового мовлення" + 24 сесії з логопедом куратором', serverId: 14, createdAt: now, updatedAt: now },

        { okkId: 95, description: 'Курс "Запуск фразовой речи " + 12 сессий с логопедом куратором', serverId: 10, createdAt: now, updatedAt: now },
        { okkId: 94, description: 'Курс "Запуск фразового мовлення" + 12 сесій з логопедом куратором', serverId: 14, createdAt: now, updatedAt: now },
        { okkId: 96, description: 'Курс "Запуск фразовой речи" + 12 сессий с логопедом куратором (оплата частями)', serverId: 10, createdAt: now, updatedAt: now },
        { okkId: 97, description: 'Курс "Запуск фразового мовлення" + 12 сесій з логопедом куратором (оплата частинами)', serverId: 14, createdAt: now, updatedAt: now },
        { okkId: 98, description: 'Курс "Запуск фразовой речи" + 6 сессий с логопедом куратором (оплата частями)', serverId: 10, createdAt: now, updatedAt: now },
        { okkId: 99, description: 'Курс "Запуск фразового мовлення" + 6 сесій з логопедом куратором (оплата частинами)', serverId: 14, createdAt: now, updatedAt: now },
    ], {});

    // // Обновляем значения id на okkId
    // await queryInterface.sequelize.query(`
    //   UPDATE "OkkCourses" 
    //   SET id = okkId;
    // `);

    // Устанавливаем значение auto-increment правильно
    await queryInterface.sequelize.query(`
      SELECT setval('"OkkCourses_id_seq"', (SELECT MAX(id) FROM "OkkCourses"));
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем вставленные данные
    await queryInterface.bulkDelete('OkkCourses', null, {});
  }
};
