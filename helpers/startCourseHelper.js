const { Model } = require("sequelize");
const { findClientByChatId, findClientForCourse, createClient, activeCourseForClient, activeCoachForClientCourse, startPackageForClient, findCourseClientNewBot, activeCourseForClientUseNewBot, findCourseLanguageById } = require("./clientHelper");
const { findGovorikaTgUser } = require("./govorikaUserHelper");
const FindDailyPackageWithDuration = require('../helpers/taskHelper');

async function startProductForGovorikaUser(currentChatId, courseId, duration, courseName, startMessage, coachId) {

  try {
    console.log("startInstanceCourse", currentChatId, courseId, duration, courseName, startMessage, coachId);
    const failMessage = "Не удалось запустить курс. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy";

    // let userText = (tgUser ? "Телефон: " + tgUser.phone : 'телефон не указан ') + (" Имя:  " + tgUser.firstName + ' ' + tgUser.lastName);
    // const startText = tgUser ? userText : 'Телефон не указан';
    // infoLogger.addMessagServerToLoggerBot("Запуск - " + courseName + ' - ' + startText);

    //find client by chatId
    let client;
    let clientByChatId = await findClientByChatId(currentChatId);
    if (clientByChatId) {
      client = clientByChatId;
    } else {
      //check govorika user
      let govorikaUser = await findGovorikaTgUser(currentChatId);
      if (!govorikaUser) {
        return {
          success: false,
          code: 'user_not_found',
          message: "Пользователь не найден"
        }
      }

      //create client
      client = await createClient(govorikaUser);
    }
    if (!client) {
      return {
        success: false,
        code: 'user_not_found',
        message: "Пользователь не найден"
      }
    }


    //init default schedule
    const defaultSchedule = JSON.stringify([{ "day": 1, "time": 9, "text": "Понедельник (09-00)" }, { "day": 3, "time": 9, "text": "Среда (09-00)" }, { "day": 5, "time": 9, "text": "Пятница (09-00)" }]);

    let courseClient = await findCourseClientNewBot(client.id, courseId);
    if (courseClient) {
      return {
        success: false,
        code: 'course_already_started',
        message: "Курс уже запущен"
      }
    }

    //active course for client
   let resultActiveClient = await activeCourseForClientUseNewBot(client.id, courseId, defaultSchedule);

    //active coach for client course
    await activeCoachForClientCourse(client.id, coachId);


    //ШАГ 2  
    let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
      duration: duration,
      courseClientId: resultActiveClient.dataValues.id,
      courseId: courseId,
      useBlocks: true
    });


    let newTask = null;

    if (newPackage.dailyTasks && newPackage.dailyTasks.length > 0) {
      newTask = newPackage.dailyTasks[0];
    }
    let language = await findCourseLanguageById(courseId);
    let resStart = await startPackageForClient(newTask, currentChatId, language);
    if (resStart) {
      return { success: true, message: startMessage };

    } else {
      return {
        success: false,
        code: 'error_start_course',
        message: failMessage
      }
    }
  } catch (error) {
    console.log('error', error);
    return {
      success: false,
      code: 'error_start_course',
      message: 'Error start course'
    }
  }
  //запуск речи скопировал 
}

//exports
module.exports = {
  startProductForGovorikaUser: startProductForGovorikaUser
}