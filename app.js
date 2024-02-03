var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var taskRouter = require('./routes/tasks');
var customizeTaskRouter = require('./routes/customizeTask');
var categoryRouter = require('./routes/categories');
var exerciseRouter = require('./routes/exercises');
var coachRouter = require('./routes/coach');
var courseRouter = require('./routes/courses');
var courseCategoryRouter = require('./routes/coursecategory');
var blockRouter = require('./routes/blocks');
let clientCourseRouter = require('./routes/clientCourses');
var tgRouter = require('./routes/tgusers');
var userProductRouter = require('./routes/userProducts');
var userCourseRouter = require('./routes/userCourse');

var app = express();
const cron = require('node-cron');

//AXIOS
const axios = require('axios');
const urlHelper = require("./helpers/urlHelper");

//models

const CourseClients = require("./models").CourseClients;
const Clients = require("./models").Clients;
const Courses =require("./models").Courses;

// Daily Tables
const DaliyPackagesModel = require("./models").DaliyPackages;
const DaliyTasksModel = require("./models").DaliyTasks;
const DaliyPackageModel = require("./models").DaliyPackages;
// sendSingleTaskWithVariants
//helpers
const taskBotHelper = require('./helpers/sendTaskHelper');

const FindDailyPackageWithDuration = require('./helpers/taskHelper');


const courseData = require('./helpers/courseConstant');

const userHelper = require('./helpers/userHelper');

const loggerBot = require('./helpers/infoLogger');
const taskService = require('./services/taskService');
const sendTaskHelper = require('./helpers/sendTaskHelper');
const { Sequelize } = require('./models');

const Exercises = require("./models").Exercises;
const CustomizeTask = require("./models").CustomizeTasks;

//govorika users model

const GovorikaTGUsers = require("./models").GovorikaTGUsers;


//package service
const packageService = require('./services/packageService');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true  }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tasks', taskRouter);
app.use('/customizeTask', customizeTaskRouter);
app.use('/categories', categoryRouter);
app.use('/exercises', exerciseRouter);
app.use('/coaches', coachRouter);
app.use('/courses', courseRouter);
app.use('/courseCategory', courseCategoryRouter);
app.use('/block', blockRouter);
app.use('/clientCourse', clientCourseRouter);
app.use('/tgusers', tgRouter);
app.use('/products', userProductRouter);
app.use('/userCourse', userCourseRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Send mail every day at 01 AM.

// cron.schedule("0 0 23 * * *", checkUsers, {
//   timezone: "Europe/Kiev"
// });

// //18 pm - cмотрим у кого нет даты! отключить ЗАВТРА!
// cron.schedule("0 0 17 * * *", checkPaymentDatesForUser, {
//   timezone: "Europe/Kiev"
// });

//20-00 pm смотрим кого на паузу отправим сегодня!!
// cron.schedule("0 0 18 * * *", checkPausedUser, {
//   timezone: "Europe/Kiev"
// });


// cron.schedule("0 0 */1 * * *", checkUsersWithTime);

//!!! ONLY FOR TEST
// cron.schedule("*/1 * * * *", checkGovorikaUsersWithTime);


async function sendUserTaskUseCheckCourse(activeClient, courseId, duration) {
  let parsedClientSchedule = activeClient && activeClient.schedule ? JSON.parse(activeClient.schedule) : null;
  let is_DEFAULT_CLIENT_WITHOUT_SCHEDULE = parsedClientSchedule && parsedClientSchedule.length > 0 ? false : true;
  if (is_DEFAULT_CLIENT_WITHOUT_SCHEDULE) {
    // console.log("КЛИЕНТЫ БЕЗ РАСПИСАНИЯ" + activeClient['Client.phone']);
    const packageData = await findPackage(activeClient.id);
    const tasks = await findActivePackageTasks(packageData);
    const baseUrl = urlHelper.getBaseUrl();
    const tgUser = await userHelper.findTgUser(activeClient['Client.chatId']);
    if (tasks && tasks.length > 0) {
      // console.log("НАЧИНАЕМ ОТПРАВЛЯТЬ ЗАПРОС БОТУ!!");

      // sendSingleTaskWithVariants(currentUser, newTask);

      axios.post(baseUrl + '/sendReminder', {
        chatId: activeClient['Client.chatId']
      })
        .then(res => {
          // res.send("Скоро прийдут задачи");
          console.log("Result norm");

        })
        .catch(error => {
          console.log("Result catch");
          // res.send("FAILED + " + JSON.stringify(error));
        });
      taskBotHelper.sendSingleTaskWithVariants(tgUser, tasks[0]);

    } else {

      const currentCourse = await findCurrentCourse(courseId);
      // console.log('currentCourse', currentCourse);

      let updatePackage = await updatePackageStatusToOld(activeClient.id);
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDurationAndRepeat({
        duration: duration,
        numberForRepeat: currentCourse.numberForRepeat,
        courseClientId: activeClient.id,
        courseId: activeClient.courseId,
        useBlocks: true
      });

      let newTask;
      if (newPackage.dailyTasks && newPackage.dailyTasks.length > 0) {
        newTask = newPackage.dailyTasks[0];
      }
      if (newTask) {
        const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
        newTask.linksText = fullTask && fullTask['Exercise.linksText'] ? fullTask['Exercise.linksText'] : newTask.linksText;
        taskBotHelper.sendSingleTaskWithVariantsForStart(tgUser, newTask);
      } else {
        console.debug("FINISH COOURSe");
        // мы ставим клиента на паузу и отправляем ему сообщение
        sendTaskHelper.setFinishedCourse(activeClient);
      }
    }
  }
}

async function sendUserTaskUseCheckUACourse(activeClient, courseId, duration) {
  let parsedClientSchedule = activeClient && activeClient.schedule ? JSON.parse(activeClient.schedule) : null;
  let is_DEFAULT_CLIENT_WITHOUT_SCHEDULE = parsedClientSchedule && parsedClientSchedule.length > 0 ? false : true;
  if (is_DEFAULT_CLIENT_WITHOUT_SCHEDULE) {
    // console.log("КЛИЕНТЫ БЕЗ РАСПИСАНИЯ" + activeClient['Client.phone']);
    const packageData = await findPackage(activeClient.id);
    const tasks = await findActivePackageTasks(packageData);
    const baseUrl = urlHelper.getBaseUrlBotUA();
    const tgUser = await userHelper.findTgUser(activeClient['Client.chatId']);
    if (tasks && tasks.length > 0) {
      // console.log("НАЧИНАЕМ ОТПРАВЛЯТЬ ЗАПРОС БОТУ!!");

      // sendSingleTaskWithVariants(currentUser, newTask);

      axios.post(baseUrl + '/sendReminder', {
        chatId: activeClient['Client.chatId']
      })
        .then(res => {
          // res.send("Скоро прийдут задачи");
          console.log("Result norm");

        })
        .catch(error => {
          console.log("Result catch");
          // res.send("FAILED + " + JSON.stringify(error));
        });
      taskBotHelper.sendSingleTaskWithVariantsToUABot(tgUser, tasks[0]);

    } else {

      const currentCourse = await findCurrentCourse(courseId);
      // console.log('currentCourse', currentCourse);

      let updatePackage = await updatePackageStatusToOld(activeClient.id);
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDurationAndRepeat({
        duration: duration,
        numberForRepeat: currentCourse.numberForRepeat,
        courseClientId: activeClient.id,
        courseId: activeClient.courseId,
        useBlocks: true
      });

      let newTask;
      if (newPackage.dailyTasks && newPackage.dailyTasks.length > 0) {
        newTask = newPackage.dailyTasks[0];
      }
      if (newTask) {
        const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
        newTask.linksText = fullTask && fullTask['Exercise.linksText'] ? fullTask['Exercise.linksText'] : newTask.linksText;
        taskBotHelper.sendSingleTaskWithVariantsForStartUABot(tgUser, newTask);
      } else {
        console.debug("FINISH COOURSe");
        // мы ставим клиента на паузу и отправляем ему сообщение
        sendTaskHelper.setFinishedCourse(activeClient);
      }
    }
  }
}


async function sendUserTaskUseCheckCourseWithTime(activeClient, courseId, duration, h, currentDay) {
  let parsedClientSchedule = activeClient && activeClient.schedule ? JSON.parse(activeClient.schedule) : null;
  let isTimeClient = parsedClientSchedule ? parsedClientSchedule.find(x => x.day == currentDay.value && x.time == h) : null;

  if (isTimeClient) {
    loggerBot.addMessagServerToLoggerBot('Нашли время в расписании клиента.' + JSON.stringify(isTimeClient) + "Клиент:" + activeClient['Client.phone'] + ' ' + activeClient['Client.firstName'] + ' ' + activeClient['Client.lastName']);

    const packageData = await findActiveOrExpiredPackage(activeClient.id);
    const tasks = await findActivePackageTasks(packageData);
    const baseUrl = urlHelper.getBaseUrl();
    const tgUser = await userHelper.findTgUser(activeClient['Client.chatId']);
    if (tasks && tasks.length > 0) {
      // console.log("НАЧИНАЕМ ОТПРАВЛЯТЬ ЗАПРОС БОТУ!!");
      await packageService.updateDailyPackageStatus(packageData.id, 'expired');

      // sendSingleTaskWithVariants(currentUser, newTask);

      axios.post(baseUrl + '/sendReminder', {
        chatId: activeClient['Client.chatId']
      })
        .then(res => {
          // res.send("Скоро прийдут задачи");
          console.log("Result norm");

        })
        .catch(error => {
          console.log("Result catch");
          // res.send("FAILED + " + JSON.stringify(error));
        });
      taskBotHelper.sendSingleTaskWithVariants(tgUser, tasks[0]);

    } else {

      const currentCourse = await findCurrentCourse(courseId);
      console.log('currentCourse', currentCourse);

      let updatePackage = await updatePackageStatusToOld(activeClient.id);
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDurationAndRepeat({
        duration: duration,
        numberForRepeat: currentCourse.numberForRepeat,
        courseClientId: activeClient.id,
        courseId: activeClient.courseId,
        useBlocks: true
      });

      let newTask;
      if (newPackage.dailyTasks && newPackage.dailyTasks.length > 0) {
        newTask = newPackage.dailyTasks[0];
      }
      if (newTask) {
        const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
        newTask.linksText = fullTask && fullTask['Exercise.linksText'] ? fullTask['Exercise.linksText'] : newTask.linksText;
        taskBotHelper.sendSingleTaskWithVariantsForStart(tgUser, newTask);
      } else {
        console.debug("FINISH COOURSe");
        // мы ставим клиента на паузу и отправляем ему сообщение
        sendTaskHelper.setFinishedCourse(activeClient);

      }


    }



  }
  else {
    // console.debug("КЛИЕНТ НЕ В ЭТО  РАСПИСАНИЕ!!!" + parsedClientSchedule  + "КЛИЕНТ" + JSON.stringify(activeClient));
  }
}


async function sendUserTaskUseCheckCourseWithTimeForUkBot(activeClient, courseId, duration, h, currentDay) {
  console.log('sendUserTaskUseCheckCourseWithTimeForUkBot', h, currentDay);
  let parsedClientSchedule = activeClient && activeClient.schedule ? JSON.parse(activeClient.schedule) : null;
  let isTimeClient = parsedClientSchedule ? parsedClientSchedule.find(x => x.day == currentDay.value && x.time == h) : null;

  //for test for test || true
  if (isTimeClient) {
    loggerBot.addMessagServerToLoggerBot('Знайшли час в роскладі клиента.' + JSON.stringify(isTimeClient) + "Кліента:" + activeClient['Client.phone'] + ' ' + activeClient['Client.firstName'] + ' ' + activeClient['Client.lastName']);

    const packageData = await findActiveOrExpiredPackage(activeClient.id);
    const tasks = await findActivePackageTasks(packageData);
    const baseUrl = urlHelper.getBaseUrlBotUA();
    const tgUser = await userHelper.findTgUser(activeClient['Client.chatId']);
    if (tasks && tasks.length > 0) {
      // set expired package
      console.log("SET EXPIRED PACKAGE", packageData);
      await packageService.updateDailyPackageStatus(packageData.id, 'expired');
      axios.post(baseUrl + '/sendReminder', {
        chatId: activeClient['Client.chatId']
      })
        .then(res => {
          // res.send("Скоро прийдут задачи");
          console.log("Result norm");

        })
        .catch(error => {
          console.log("Result catch");
          // res.send("FAILED + " + JSON.stringify(error));
        });
      taskBotHelper.sendSingleTaskWithVariantsToUABot(tgUser, tasks[0]);

    } else {

      const currentCourse = await findCurrentCourse(courseId);
      console.log('currentCourse', currentCourse);

      let updatePackage = await updatePackageStatusToOld(activeClient.id);
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDurationAndRepeat({
        duration: duration,
        numberForRepeat: currentCourse.numberForRepeat,
        courseClientId: activeClient.id,
        courseId: activeClient.courseId,
        useBlocks: true
      });

      let newTask;
      if (newPackage.dailyTasks && newPackage.dailyTasks.length > 0) {
        newTask = newPackage.dailyTasks[0];
      }
      if (newTask) {
        const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
        newTask.linksText = fullTask && fullTask['Exercise.linksText'] ? fullTask['Exercise.linksText'] : newTask.linksText;
        taskBotHelper.sendSingleTaskWithVariantsForStartUABot(tgUser, newTask);
      } else {
        console.debug("FINISH COOURSe");
        // мы ставим клиента на паузу и отправляем ему сообщение
        sendTaskHelper.setFinishedCourse(activeClient);

      }
    }
  }


  else {
    // console.debug("КЛИЕНТ НЕ В ЭТО  РАСПИСАНИЕ!!!" + parsedClientSchedule  + "КЛИЕНТ" + JSON.stringify(activeClient));
  }
}





//FOR NEW GOVORIKA USER! 

async function sendGovorikaUserTaskUseCheckCourseWithTime(activeClient, courseId, duration, timezone, realTimeZone) {
  console.log("STAAAARTTT  sendGovorikaUserTaskUseCheckCourseWithTime");
const now = new Date();
const allDays =  [
  {text: 'Понедельник', value: 1},
  {text: 'Вторник', value: 2},
  {text: 'Среда', value: 3},
  {text: 'Четверг', value: 4},
  {text: 'Пятница', value: 5},
  {text: 'Суббота', value: 6},
  {text: 'Воскресенье', value: 0}
];
const utcOffset = now.getTimezoneOffset() * 60000; // Get local UTC offset in milliseconds

// Adjust the current time based on the provided timezone
const adjustedNow = new Date(now.getTime() + (parseInt(timezone) * 60 * 60 * 1000) + utcOffset);

// Adjust the current time to the real time zone
const realNow = adjustedNow.toLocaleString('en-US', { timeZone: realTimeZone });

// Get the day for the adjusted time
const currentDay = allDays.find(x => x.value === new Date(realNow).getDay());

console.log('Current Day:', currentDay.text)

  let parsedClientSchedule = activeClient && activeClient.schedule ? JSON.parse(activeClient.schedule) : null;
  let isTimeClient = parsedClientSchedule ? parsedClientSchedule.find(x => x.day == currentDay.value && x.time == h) : null;

  if (isTimeClient || true) {
    console.log("IS TIME!!! FOR GOVORIKA USER");
    loggerBot.addMessagServerToLoggerBot('ВРЕМЯ ДЛЯ ЮЗЕРА(Нов бот)' + JSON.stringify(isTimeClient) + "Клиент:" + activeClient['Client.phone'] + ' ' + activeClient['Client.firstName'] + ' ' + activeClient['Client.lastName']);

    const packageData = await findActiveOrExpiredPackage(activeClient.id);
    const tasks = await findActivePackageTasks(packageData);
    const baseUrl = urlHelper.getUrlGovorikaBot();
    const tgUser = await userHelper.findGovorikaUser(activeClient['Client.chatId']);
    if (tasks && tasks.length > 0) {
      // console.log("НАЧИНАЕМ ОТПРАВЛЯТЬ ЗАПРОС БОТУ!!");
      await packageService.updateDailyPackageStatus(packageData.id, 'expired');

      // sendSingleTaskWithVariants(currentUser, newTask);

      axios.post(baseUrl + '/sendReminder', {
        chatId: activeClient['Client.chatId']
      })
        .then(res => {
          // res.send("Скоро прийдут задачи");
          console.log("Result norm");

        })
        .catch(error => {
          console.log("Result catch");
          // res.send("FAILED + " + JSON.stringify(error));
        });
      taskBotHelper.sendSingleTaskWithVariantsToGovorikaBot(tgUser, tasks[0]);

    } else {

      const currentCourse = await findCurrentCourse(courseId);
      console.log('currentCourse', currentCourse);

      let updatePackage = await updatePackageStatusToOld(activeClient.id);
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDurationAndRepeat({
        duration: duration,
        numberForRepeat: currentCourse.numberForRepeat,
        courseClientId: activeClient.id,
        courseId: activeClient.courseId,
        useBlocks: true
      });

      let newTask;
      if (newPackage.dailyTasks && newPackage.dailyTasks.length > 0) {
        newTask = newPackage.dailyTasks[0];
      }
      if (newTask) {
        const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
        newTask.linksText = fullTask && fullTask['Exercise.linksText'] ? fullTask['Exercise.linksText'] : newTask.linksText;
        taskBotHelper.sendSingleTaskWithVariantsToGovorikaBot(tgUser, newTask);
      } else {
        console.debug("FINISH COOURSe");
        // мы ставим клиента на паузу и отправляем ему сообщение
        // sendTaskHelper.setFinishedCourse(activeClient);

      }
    }
  }
  
}





//TESTED
async function checkUsers () {
  try {
    loggerBot.addMessagServerToLoggerBot('Начинаем автоматическую рассылку упражнений ЗАПУСК РЕЧИ');
    let activeClientsSpeech =  await checkUsersForStatusCourseSpeech();
    let resSpeech = await Promise.all(activeClientsSpeech.map(async (activeClient) => {
      await sendUserTaskUseCheckCourse(activeClient, courseData.courseIdSpeech, courseData.durationSpeech);
    }));

    loggerBot.addMessagServerToLoggerBot('Завершили автоматическую рассылку упражнений ЗАПУСК РЕЧИ');

    loggerBot.addMessagServerToLoggerBot('Начинаем автоматическую рассылку упражнений. Курс по формированию фразовой речи детей билингвов');
    let activeClientsPharasalSpeech = await checkUsersForStatusCoursePhrasalSpeech();
    let resPharasalSpeech = await Promise.all(activeClientsPharasalSpeech.map(async (activeClient) => {
      await sendUserTaskUseCheckCourse(activeClient, courseData.courseIdPhrasalSpeech, courseData.durationPhrasalSpeech);
    }));

    // loggerBot.addMessagServerToLoggerBot('Починаємо автоматичне розсилання ЗАПУСК МОВИ');
    // let activeClientsUa = await checkUsersForStatusCourseSpeechUA();
    // console.log('ACTIVE CLIENTS UA', activeClientsUa);
    // let resUa = await Promise.all(activeClientsUa.map(async (activeClient) => {
    //   await sendUserTaskUseCheckUACourse(activeClient, courseData.courseIdSpeechUA, courseData.durationSpeechUA);
    // }));

    loggerBot.addMessagServerToLoggerBot('Завершили автоматическую рассылку упражнений. Курс по формированию фразовой речи детей билингвов');

  } catch (error) {
    console.log("PROMISE CATCH", error);
  }

}

//TESTED
async function checkUsersWithTime() {
  console.log("checkUsersWithTime");
  let now = new Date(Date.now() + 2 * (60 * 60 * 1000));
  var h = now.getHours();
  const allDays =  [
    {text: 'Понедельник', value: 1},
    {text: 'Вторник', value: 2},
    {text: 'Среда', value: 3},
    {text: 'Четверг', value: 4},
    {text: 'Пятница', value: 5},
    {text: 'Суббота', value: 6},
    {text: 'Воскресенье', value: 0}
  ];

  const currentDay = allDays.find(x => x.value == now.getDay());



  try {
    let activeClientsSpeech = await checkUsersForStatusCourseSpeech();

    loggerBot.addMessagServerToLoggerBot('Начинаем автоматическую рассылку упражнений c учетом времени. ЗАПУСК РЕЧИ' + ' День: ' + currentDay.text + 'Время: ' + h);
    let res = await Promise.all(activeClientsSpeech.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTime(activeClient, courseData.courseIdSpeech, courseData.durationSpeech, h, currentDay);
    }));

    loggerBot.addMessagServerToLoggerBot('Начинаем автоматическую рассылку упражнений c учетом времени. Курс по формированию фразовой речи детей билингвов' + ' День: ' + currentDay.text + 'Время: ' + h);
    let activeClientsPharasalSpeech = await checkUsersForStatusCoursePhrasalSpeech();
    let resPharasalSpeech = await Promise.all(activeClientsPharasalSpeech.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTime(activeClient, courseData.courseIdPhrasalSpeech, courseData.durationPhrasalSpeech, h, currentDay);
    }));

    loggerBot.addMessagServerToLoggerBot('Починаємо автоматичну рассілку ЗАПУСК МОВИ (укр)' + ' День: ' + currentDay.text + 'Время: ' + h);

    let activeClientsSpeechUkr = await checkUsersForStatusCourseSpeechUA();
    let resSpeechUkr = await Promise.all(activeClientsSpeechUkr.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTimeForUkBot(activeClient, courseData.courseIdSpeechUA, courseData.durationSpeechUA, h, currentDay);
    }));


    let activeClientsPharasalSpeechUkr = await checkUsersForStatusCoursePharasalUASpeech();
    let resPharasalSpeechUkr = await Promise.all(activeClientsPharasalSpeechUkr.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTimeForUkBot(activeClient, courseData.courseIdPhrasalSpeechUA, courseData.durationPhrasalSpeechUA, h, currentDay);
    }));

    //---------------- WITHOUT COACH ------------------------------

    let activeClientsSpeectRuWithoutCoach = await checkUsersForCourseSpeechWithoutCoach();
    console.log('activeClientsSpeectRuWithoutCoach', activeClientsSpeectRuWithoutCoach);
     let resSpeectRuWithoutCoach = await Promise.all(activeClientsSpeectRuWithoutCoach.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTime(activeClient, courseData.courseIdSpeechWithoutCurator, courseData.durationPhrasalSpeechWithoutCurator, h, currentDay);
    })); 


    //phrasal speech without coach
    let activeClientsPharasalSpeechRuWithoutCoach = await checkUsersForCourse(courseData.courseIdPhrasalSpeechWithoutCurator);
    let resPharasalSpeechRuWithoutCoach = await Promise.all(activeClientsPharasalSpeechRuWithoutCoach.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTime(activeClient, courseData.courseIdPhrasalSpeechWithoutCurator, courseData.durationPhrasalSpeechWithoutCurator, h, currentDay);
    }));



    let activeClientsSpeectUkrWithoutCoach = await checkUsersForCourseSpeechUAWithoutCoach();
    let resSpeectUkrWithoutCoach = await Promise.all(activeClientsSpeectUkrWithoutCoach.map(async (activeClient) => {
      await sendUserTaskUseCheckCourseWithTimeForUkBot(activeClient, courseData.courseIdSpeechUAWithoutCoach, courseData.durationSpeechUAWithoutCoach, h, currentDay);
    }));


    //pharasal speech UA without coach
    let activeClientsPharasalSpeechUkrWithoutCoach = await checkUsersForCourse(courseData.courseIdPhrasalSpeechUAWithoutCoach);
    let resPharasalSpeechUkrWithoutCoach = await Promise.all(activeClientsPharasalSpeechUkrWithoutCoach.map(async (activeClient) => {
    await sendUserTaskUseCheckCourseWithTimeForUkBot(activeClient, courseData.courseIdPhrasalSpeechUAWithoutCoach, courseData.durationPhrasalSpeechUAWithoutCoach, h, currentDay);
    }));

    loggerBot.addMessagServerToLoggerBot('Завершили автоматическую рассылку упражнений' + ' День: ' + currentDay.text + ' Часы: ' + h);
  } catch (error) {
    console.log("PROMISE CATCH", error);
  }


}


async function checkGovorikaUsersWithTime() {
  console.log("checkGovorikaUsersWithTime");

  console.log("checkUsersWithTime");
  let now = new Date(Date.now() + 2 * (60 * 60 * 1000));
  var h = now.getHours();
  const allDays =  [
    {text: 'Понедельник', value: 1},
    {text: 'Вторник', value: 2},
    {text: 'Среда', value: 3},
    {text: 'Четверг', value: 4},
    {text: 'Пятница', value: 5},
    {text: 'Суббота', value: 6},
    {text: 'Воскресенье', value: 0}
  ];

  const currentDay = allDays.find(x => x.value == now.getDay());

  try {
    let clients = await checkGovorikaUsersForStatus();

    loggerBot.addMessagServerToLoggerBot('Начинаем автоматическую рассылку Новій БОТ' + ' День: ' + currentDay.text + 'Время: ' + h);

    let res = await Promise.all(clients.map(async (activeClient) => {
      console.log('activeClient', activeClient);
      let govorikaClient = await findGovorikaUser(activeClient['Client.chatId']);
      console.log('govorika client', govorikaClient);
      if (govorikaClient) {
        await sendGovorikaUserTaskUseCheckCourseWithTime(
          activeClient, 
          courseData.courseIdSpeech, 
          courseData.durationSpeech, 
          govorikaClient.timeZone, 
          govorikaClient.realTimeZone);
      }
    }));


  } catch (error) {
    
  }


}

async function checkPausedUser() {

  //format date
  function formatDate(stringDate) {

    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }

    var date = new Date(stringDate);
    var month = pad2(date.getMonth() + 1);//months (0-11)
    var day = pad2(date.getDate());//day (1-31)
    var year = date.getFullYear();
    return day + "-" + month + "-" + year;
  }

  let activeClients = await checkUsersForStatusCourseSpeech();
  try {
    const dateNow = formatDate(new Date());

    loggerBot.addMessagServerToLoggerBot('Начинаем проверку клиентов которых нужно отправить на паузу, дата - ' + dateNow);

    let res = await Promise.all(activeClients.map(async (activeClient) => {
      if (activeClient && activeClient.paymentDate == dateNow) {
        const currentClient = {
          firstName: activeClient['Client.firstName'],
          lastName: activeClient['Client.lastName'],
          chatId: activeClient['Client.chatId'],
        }
        let resPause = await pauseCourseForClient(currentClient, activeClient.id);
      }
    }))
  } catch (error) {

  }
}


//for paused users 

async function checkPaymentDatesForUser() {

  function formatDate(stringDate) {

    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }

    var date = new Date(stringDate);
    var month = pad2(date.getMonth() + 1);//months (0-11)
    var day = pad2(date.getDate());//day (1-31)
    var year = date.getFullYear();
    return day + "-" + month + "-" + year;
  }

  let activeClients = await checkAllUsersForStatusCourse();
  try {

    loggerBot.addMessagServerToLoggerBot('Начинаем проверку и установку даты - оплаты');

    let res = await Promise.all(activeClients.map(async (activeClient) => {
      let resultFindStart = await findUserStartForCourse(activeClient.id);
      if (resultFindStart && resultFindStart.dateStart) {
        const date = resultFindStart.dateStart;
        var newDate = new Date(date.setMonth(date.getMonth() + 1));
        let resUpdate = await updatePaymentData(formatDate(newDate), activeClient.id)
      }
    }))
  } catch (error) {

  }
}


async function pauseCourseForClient(client, courseClientId) {
  try {
    const res = await CourseClients.update({ isActive: false, status: 'not active' }, {
      where: {
        id: courseClientId,
      }
    })
      .then(num => {
        if (num == 1) {
          taskBotHelper.sendPaymentExpired(client);
          res.send({
            message: "CourseClients was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update CourseClientst`
          });
        }
      })
      .catch(err => {
        console.debug("THIS ERROR", err);
        res.status(500).send({
          message: "Error updating CourseClients with"
        });
      })
  } catch (error) {

  }

}


//МЫ ХОТИМ ОБНОВИТЬ СТАТУС ПАКЕТА!
async function updatePackageStatusToOld(courseClientId) {
  try {
    let result = await DaliyPackageModel.update({ status: 'old' }, {
      where: {
        courseClientId: courseClientId
      }
    }).then(num => {
      return true;
    })
      .catch(err => {
        return true;
      });
    return result;
  } catch (error) {
    return true;
  }
}

async function checkUsersForStatusCourseSpeech() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdSpeech,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}


async function checkGovorikaUsersForStatus() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdSpeech,
      status: 'active',
      useNewBot: true
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}

async function checkUsersForStatusCourseSpeechUA() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdSpeechUA,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}

async function checkUsersForCourseSpeechUAWithoutCoach() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdSpeechUAWithoutCoach,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}

async function checkUsersForCourseSpeechWithoutCoach() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdSpeechWithoutCurator,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}

//check users for course (send course id)
async function checkUsersForCourse(courseId) {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseId,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}





async function checkUsersForStatusCoursePharasalUASpeech() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdPhrasalSpeechUA,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}


async function checkUsersForStatusCoursePhrasalSpeech() {
  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseIdPhrasalSpeech,
      status: 'active'
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}

async function checkAllUsersForStatusCourse() {


  //TODO: ДЛЯ ЗАПУСКА РЕЧИ (хардкодить бред но пока так)

  let result = await CourseClients.findAll({
    where: {
      courseId: courseData.courseId,
    },
    include: [
      { model: Clients, as: 'Client' },

    ],
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return [];
  });
  return result;
}

async function findPackage(courseClientId) {
  let packageResult = await DaliyPackagesModel.findOne({
    where: {
      courseClientId: courseClientId,
      status: 'active'
    },
    raw: true
  }).then(packageData => {
    return packageData;
  }).catch(err => {
    // console.log("ERROR DAILY TASK", err);
    return null;
  });
  return packageResult;
}

async function findActiveOrExpiredPackage(courseClientId) {
  let packageResult = await DaliyPackagesModel.findOne({
    where: {
      courseClientId: courseClientId,
      status: {
        [Sequelize.Op.or]: ['active', 'expired']
      }
    },
    raw: true
  }).then(packageData => {
    return packageData;
  }).catch(err => {
    // console.log("ERROR DAILY TASK", err);
    return null;
  });
  return packageResult;
}

async function updatePaymentData(paymentDate, currentCourseClientId) {
  console.log("updatePaymentData", paymentDate, currentCourseClientId);
  const courseClientId = currentCourseClientId;
  try {
    let result = await CourseClients.update({ paymentDate: paymentDate }, {
      where: {
        id: courseClientId
      }
    }).then(num => {
      console.log("UPDATED");
      return true;
    })
      .catch(err => {
        console.log("NOT UPDATED");
        return true;
      });
    return result;
  } catch (error) {
    return true;
  }
}


async function findUserStartForCourse(currentCourseClientId) {

  const courseClientId = currentCourseClientId;
  let result = await DaliyPackagesModel.findAll(
    {
      where: {
        courseClientId: courseClientId,
      },
      raw: true
    }).then(packages => {
      var minElement;
      var maxElement;
      if (packages && packages.length > 0) {
        minElement = packages && packages.reduce(function (a, b) { return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b; });
        maxElement = packages && packages.reduce(function (a, b) { return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? a : b; });
      }
      return ({
        dateStart: minElement ? minElement.createdAt : ""
      });
    }).catch(err => {
      console.error(err);
      return ({
        dateStart: minElement ? minElement.createdAt : ""
      });
    });
  return result;

}

async function findActivePackageTasks(packageData) {
  if (packageData) {
    let dailyTaskResult = await DaliyTasksModel.findAll({
      where: {
        dailyPackageId: packageData.id,
        status: 'active'
      },
      include: [
        {
          model: CustomizeTask,
          include: [
            { model: Exercises, as: 'Exercise' },
            // { model: Blocks, as: 'Blocks' },
          ]
        },
      ],
    }).then(tasks => {
      // console.log("===TASKS------", tasks);
      return tasks;
    }).catch(err => {
      console.log("ERROR DAILY TASK", err);
      return [];
    });
    return dailyTaskResult;
  } else {
    return [];
  }
}



async function findCurrentCourse(courseId) {
  let res = await Courses.findOne({
    where: {
      id: courseId,
    },
    raw: true
  }).then(packageData => {
    return packageData;
  }).catch(err => {
    // console.log("ERROR DAILY TASK", err);
    return null;
  });
  return res;
}

//find Govorika user use chatId

async function findGovorikaUser(chatId) {
  let res = await GovorikaTGUsers.findOne({
    where: {
      chatId: chatId,
    },
    raw: true
  }).then(packageData => {
    return packageData;
  }).catch(err => {
    // console.log("ERROR DAILY TASK", err);
    return null;
  });
  return res;
}

  

module.exports = app;
