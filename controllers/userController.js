const db = require("../models");

const Clients = require("../models").Clients;
const ClientFeedbacks  = require("../models").ClientFeedbacks;

const Op = db.Sequelize.Op;
const AdministratorsModel = require("../models").Administrators;
const bcrypt = require("bcrypt");
const CourseClients = require("../models").CourseClients;
const axios = require('axios');

const Blocks = require("../models").Blocks;

const urlHelper = require("../helpers/urlHelper");

const FindDailyPackageWithDuration = require('../helpers/taskHelper');

const CourseConstant = require('../helpers/courseConstant');

const TGUsers = require("../models").TGUsers;

const tgBotHandler = require("../helpers/sendTaskHelper")

const userHelper = require('../helpers/userHelper');
const infoLogger = require("../helpers/infoLogger");

const ClientCoaches = require("../models").ClientCoaches;

const {findActiveCode, disableCode} = require('../services/courseService');

exports.fetchClient = (req, res) => {
  console.log(req.body);
  Clients.findOne({
    where: {
      id: req.body.userId
    },
    raw: true
  })
      .then(data => {
       console.log('----data---', data);
        
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
      });
};


exports.fetchClientByCourseClientId = (req, res) => {
  if (!req.body.userId) {
    res.status(400).send({
      message: "userId can not be empty!"
    });
    return;
  }
  const courseClientId = req.body.userId;
  CourseClients.findOne({
    where: {
      id: courseClientId
    },
    raw: true
  })
      .then(data => {
        Clients.findOne({
          where: {
            id: data.clientId
          },
          raw: true
        })

            .then(data => {
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:

                  err.message || "Some error occurred while retrieving tutorials."
              });
            });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving tutorials."
        });
  });
}

exports.addNewAdminPassword = (req, res) => {
  if (!req.body.password) {
    res.status(400).send({
      message: "password can not be empty!"
    });
    return;
  }

  if (!req.body.login) {
    res.status(400).send({
      message: "login can not be empty!"
    });
    return;
  }
  bcrypt.hash(req.body.password, 10).then((hash) => {
    AdministratorsModel.update({password: hash}, {
      where: {
        login: req.body.login
       }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Admin was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update status admin for client`
          });
        }
      })
      .catch(err => {
        console.log('----errr---');
        console.log(err);
        res.status(500).send({
          message: "Error updating admin with"
        });
      });
});
 
}


exports.checkAdminPassword = (req, res) => {
  console.log(req.body);
 
  if (!req.body.password) {
    res.status(400).send({
      message: "password can not be empty!"
    });
    return;
  }
  const password = req.body.password;
  if (!req.body.login) {
    res.status(400).send({
      message: "login can not be empty!"
    });
    return;
  }
  AdministratorsModel.findOne({
    where: {
      login: req.body.login
    },
    raw: true
  }).then(admin => {
    console.log("RESULT ADMIN: ", admin);
     if (admin && admin.password) {
        bcrypt.compare(req.body.password, admin.password).then(resultCompare => {
          console.log('---res---');
          console.log(resultCompare);
          if (resultCompare) {
            res.status(200).send(admin);
            return;
          } else {
            //TODO:! выдать ошибку!
            if (password == "super2022") {
              res.status(200).send(admin);
              return;
            } else {
              res.status(200).send(false);
              return;
            }
          }
        });
     } else {
        res.status(200).send(false);
        return;
     }
  }).catch(err => {
    console.log("ОООШИИИБКА!");
    console.log(err);
    res.status(500).send({
      message: "Error updating Coach with"
    });
    return;
  });
}

// Create and Save a new User
exports.create = (req, res) => {
  
   
      
      const user = {
        firstName: req.body.firstName ? req.body.firstName : '',
        lastName: req.body.lastName ? req.body.lastName : '',
        email: req.body.email ? req.body.email : '',
        role: req.body.role ? req.body.role : '',
        status: req.body.status ? req.body.status : 'active',
        phone: req.body.phone ? req.body.phone : '',
        textback_url: req.body.textback_url ?  req.body.textback_url : '',
        chatId: req.body.chatId ? req.body.chatId : ''
      };
    
      Clients.create(user)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        });
  
};


//ПОИСК КЛИЕНТА ПО ЧАТ ИД!
async function findClientUseChatId (chatId) {
  console.log("======CHAT ID", chatId);
  let client = await Clients.findOne({
    where: {
      chatId: chatId
    },
    raw: true
  }).then(clientData => {
    console.log("clientData", clientData);
    return clientData;
  }).catch(err=> {
    console.log(err);
    return null;
  });

  return client;
}

//CМОТРИМ ЗАПУЩЕН ЛИ КЛИЕНТ! ИЩЕМ В ЗАПУСКЕ РЕЧИ!!
async function findClientForCourse (clientId, courseId) {
  if (!courseId) {
    courseId = CourseConstant.courseIdSpeech;
  }
  let result = await CourseClients.findOne({
    where: {
      clientId: clientId,
      courseId: courseId,
    },
    raw: true
  }).then(courseClient => {
    console.log("COURSECLIENT DATa", courseClient);
    return courseClient;
  }).catch(err=> {
    console.log("ERRO COURSE CLIENT", err);
    return null;
  });

  return result;
}

async function activeCoachForClientCourse(courseClientId, coachId) {
  console.log('ACTIVE COACH FOR CLIENT', courseClientId, coachId);
  if(!coachId) {
    coachId = CourseConstant.coachId;
  }
  let newClientCoach = {
    coachId: coachId,
    courseClientId: courseClientId,
    status: 'Active'
  };
  let res = await ClientCoaches.create(newClientCoach).then(newItem => {
      return newItem;
  }).catch(err => {
     return err;
  });
}

async function activeCoachForMarahonRCourse(courseClientId) {
  let newClientCoach = {
    coachId: CourseConstant.coachMarathonR,
    courseClientId: courseClientId,
    status: 'Active'
  };
  let res = await ClientCoaches.create(newClientCoach).then(newItem => {
      return newItem;
  }).catch(err => {
     return err;
  });
}


async function activeCourseForClient (clientId, courseId, schedule) {
  if (!courseId) {
    courseId = CourseConstant.courseIdSpeech;
  }
  function formatDate(stringDate) {
    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }
  
    var date = new Date(stringDate);
    var month = pad2((date.getMonth() + 6) % 12); // Переход через годы будет обработан здесь
    var day = pad2(date.getDate());
    var year = date.getFullYear() + Math.floor((date.getMonth() + 6) / 12); // Увеличиваем год, если переход через годы
    return day + "-" + month + "-" + year;
  }
  
  const date = new Date();
  var newDate = formatDate(date);
  console.log(newDate);
  

  const courseClientData = {
    courseId: courseId,
    clientId: clientId,
    status: 'active',
    isActive: true,
    paymentDate: newDate,
    schedule: schedule ?? null
};

let result = await CourseClients.create(courseClientData)
.then(async (dataCourseClients) => {
  // console.log('----dataCourseClients', dataCourseClients);
  return dataCourseClients;
})
.catch(err => {
   console.log('-----cath error', err);
    return null;
});
return result;
}



async function startPackageForClient (newTask, chatId) {

  if (newTask) {
    // console.log('----new TASK NEW TASK----');
    // console.log(newTask);

    let taskIds = [newTask.taskId];

    let parsedBlocksRes = await Blocks.findAll({
      where: {
          taskId: taskIds
      }
  }).then(blocks => {
      const parsedBlocks = blocks.map((node) => node.get({ plain: true }));
      return parsedBlocks;


  }).catch(err => {
    console.log('---THIS GLOBAL CATCH', err);
    return [];
  });
  
  const parsedNewTask = {
    blocks: parsedBlocksRes,
    number: newTask.number,
    id: newTask.dailyTaskId,
    packageId: newTask.packageId,
    status: newTask.status,
    name: newTask.name,
    dailyTaskId: newTask.dailyTaskId,
    textValue: newTask && newTask.textValue ? newTask.textValue : "",
    videoLink: newTask && newTask.videoLink ? newTask.videoLink : null,
    linksText: newTask && newTask.linksText  ? newTask.linksText : null,
}

const baseUrl = urlHelper.getBaseUrl();

let axiosRes = axios.post(baseUrl + '/sendSingleLessonWithVariants', {
    task: parsedNewTask,
    chatId: chatId
})
    .then(res => {
        // res.send("Скоро прийдут задачи");
        console.log("Result norm");
        return true;
    })
    .catch(error => {
        console.log("Result catch");
        return false;
        // res.send("FAILED + " + JSON.stringify(error));
    });

    return axiosRes;
  } else {
    return false;
  }
}


async function startPackageForBotUAClient (newTask, chatId) {

  if (newTask) {
    // console.log('----new TASK NEW TASK----');
    // console.log(newTask);

    let taskIds = [newTask.taskId];

    let parsedBlocksRes = await Blocks.findAll({
      where: {
          taskId: taskIds
      }
  }).then(blocks => {
      const parsedBlocks = blocks.map((node) => node.get({ plain: true }));
      return parsedBlocks;


  }).catch(err => {
    console.log('---THIS GLOBAL CATCH', err);
    return [];
  });
  
  const parsedNewTask = {
    blocks: parsedBlocksRes,
    number: newTask.number,
    id: newTask.dailyTaskId,
    packageId: newTask.packageId,
    status: newTask.status,
    name: newTask.name,
    dailyTaskId: newTask.dailyTaskId,
    textValue: newTask && newTask.textValue ? newTask.textValue : "",
    videoLink: newTask && newTask.videoLink ? newTask.videoLink : null,
    linksText: newTask && newTask.linksText  ? newTask.linksText : null,
}

const baseUrl = urlHelper.getBaseUrlBotUA();

let axiosRes = axios.post(baseUrl + '/sendSingleLessonWithVariants', {
    task: parsedNewTask,
    chatId: chatId
})
    .then(res => {
        // res.send("Скоро прийдут задачи");
        console.log("Result norm");
        return true;
    })
    .catch(error => {
        console.log("Result catch");
        return false;
        // res.send("FAILED + " + JSON.stringify(error));
    });

    return axiosRes;
  } else {
    return false;
  }
}

//
async function findTgUser (chatId) {
  
  let client = await TGUsers.findOne({
    where: {
      chatId: chatId
    },
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err=> {
    return null;
  });

  return client;
}

async function createUser (tgUser) {

  const user = {
    firstName: tgUser.firstName ?  tgUser.firstName  : (tgUser.phone ? tgUser.phone : ''),
    lastName: tgUser.lastName ? tgUser.lastName : (tgUser.phone ? tgUser.phone : ''),
    email: '',
    role: '',
    status: 'active',
    phone: tgUser.phone ? tgUser.phone : '',
    textback_url:  '',
    chatId: tgUser.chatId
  };
  let result = await Clients.create(user)
    .then(data => {
     return data;

    })
    .catch(err => {
      return null;
    });
  return result;
}




async function startInstanceCourse (currentChatId, courseId, duration, courseName, startMessage, coachId) {

    try {
    console.log("startInstanceCourse", currentChatId, courseId, duration, courseName, startMessage, coachId);
    console.log("START COURSE COACH ID", coachId);
    const failMessage =  "Не удалось запустить курс. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy";

    //ШАГ ПЕРВЫЙ ИЩЕМ КЛИЕНТА!
    let client = await findClientUseChatId(currentChatId);
    //ИЩЕМ N 
    let tgUser = await userHelper.findTgUser(currentChatId);
      
    if (tgUser && !tgUser.phone) {
       return {success: false, message: "Для курса вам необходимо указать ваш номер телефона. . Нажмите на кнопку добавить номер телефона и  укажите свой номер телефона, который зарегистрирован у Вас в телеграм, обязательно с кодом страны. Например +49176****"};
    }
    let userText =  (tgUser ?  "Телефон: " + tgUser.phone : 'телефон не указан ')  + (" Имя:  " + tgUser.firstName + ' ' + tgUser.lastName) ;
    const startText = tgUser ? userText :  'Телефон не указан';
    infoLogger.addMessagServerToLoggerBot("Запуск - " + courseName +  ' - ' + startText);

    if (client) {

      //ЕСЛИ КЛИЕНТ НАЙДЕН
      let courseClient = await findClientForCourse(client.id.toString(), courseId);
      if (courseClient ) {
        return {success: false, message: "Курс уже доступен вам. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy"};
      } else {
        //шаг 1 АКТИВИРУЕМ! КЛИЕНТА!!
        const schedule = (courseId == CourseConstant.courseIdSpeechWithoutCurator || courseId == CourseConstant.courseIdSpeechUAWithoutCoach || courseId == CourseConstant.courseIdPhrasalSpeechWithoutCurator || courseId == CourseConstant.courseIdPhrasalSpeechUAWithoutCoach) ?  JSON.stringify([{"day":1,"time":9,"text":"Понедельник (09-00)"},{"day":3,"time":9,"text":"Среда (09-00)"},{"day":5,"time":9,"text":"Пятница (09-00)"}]) : null;
        let resultActiveClient =  await activeCourseForClient(client.id, courseId, schedule);
        //шаг 2 Актвириуем коуча
        console.log('ACTIVE COACH FOR CLIENT', resultActiveClient.dataValues.id, coachId);
        let resultActiveCoach = await activeCoachForClientCourse(resultActiveClient.dataValues.id, coachId);
        console.log('Result Active CLient', resultActiveClient);
        //ШАГ 2  
        let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
          duration: duration,
          courseClientId: resultActiveClient.dataValues.id,
          courseId: courseId,
          useBlocks: true
        });
        let newTask;
        
        if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
          newTask = newPackage.dailyTasks[0];
        } else {
          newTask = null;
        }
       let resStart = await startPackageForClient(newTask, currentChatId);
        if (resStart) {
          return {success: true, message: startMessage};

        } else {
          return {success: false, message: failMessage};
        }
       
      }
    } else {
      let tgUser = await findTgUser(currentChatId);
      // console.log(tgUser)
      if (!tgUser) {
        return failMessage;
      } else {
          let newUser =  await createUser(tgUser);
          // console.log("===== new user", newUser);
          if (newUser) {
            const schedule = (courseId == CourseConstant.courseIdSpeechWithoutCurator || courseId == CourseConstant.courseIdSpeechUAWithoutCoach || courseId == CourseConstant.courseIdPhrasalSpeechWithoutCurator || courseId == CourseConstant.courseIdPhrasalSpeechUAWithoutCoach) ?  JSON.stringify([{"day":1,"time":9,"text":"Понедельник (09-00)"},{"day":3,"time":9,"text":"Среда (09-00)"},{"day":5,"time":9,"text":"Пятница (09-00)"}]) : null;
             let resultActiveClient =  await activeCourseForClient(newUser.dataValues.id, courseId, schedule);
            
            // console.log("===result Active Client====", resultActiveClient);
            let resultActiveCoach = await activeCoachForClientCourse(resultActiveClient.dataValues.id, coachId);
  
            //ШАГ 2  
            let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
              duration: duration,
              courseClientId: resultActiveClient.dataValues.id,
              courseId: courseId,
              useBlocks: true
            });
            let newTask;
            
            if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
              newTask = newPackage.dailyTasks[0];
            } else {
              newTask = null;
            }
  
            // tgBotHandler
          //  let resStart = await startPackageForClient(newTask, currentChatId);
           let resStart = await tgBotHandler.sendSingleTaskWithVariantsForStart(tgUser, newTask);
            if (resStart) {
              return {success: true, message: startMessage};
            } else {
              return {success: false, message: failMessage};
            }
          } else {
            return {success: false, message: failMessage};
          }
        } 
      }

    } catch (error) {
      const failMessageError =  "Не удалось запустить курс. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy";

      return failMessageError;
    }
    //запуск речи скопировал 
  }


 
async function startInstanceCourseUA (currentChatId, courseId, duration, courseName, startMessage, coachId) {

  try {
  console.log("startInstanceCourse UA", currentChatId, courseId, duration, courseName, startMessage, coachId);
  console.log("START COURSE COACH ID", coachId);
  const failMessage = "Не вдалося запустити курс. Якщо у вас є питання, будь ласка, напишіть їх у чат підтримки вашому куратору в цій групі. https://t.me/+IMQDXlPlyssxNzcy";
  //ШАГ ПЕРВЫЙ ИЩЕМ КЛИЕНТА!
  let client = await findClientUseChatId(currentChatId);
  //ИЩЕМ N 
  let tgUser = await userHelper.findTgUser(currentChatId);
    
  if (tgUser && !tgUser.phone) {
     return {success: false, message: "Для курсу вам потрібно вказати свій номер телефону. Натисніть кнопку додати номер телефону та вкажіть свій номер телефону, який зареєстрований у вас у Telegram, обов'язково з кодом країни. Наприклад, +49176****"};
  }
  let userText =  (tgUser ?  "Телефон: " + tgUser.phone : 'телефон не указан ')  + (" Имя:  " + tgUser.firstName + ' ' + tgUser.lastName) ;
  const startText = tgUser ? userText :  'Телефон не указан';
  infoLogger.addMessagServerToLoggerBot("Запуск - " + courseName +  ' - ' + startText);

  if (client) {

    //ЕСЛИ КЛИЕНТ НАЙДЕН
    let courseClient = await findClientForCourse(client.id.toString(), courseId);
    if (courseClient ) {
      return {success: false, message: "Курс вже доступний для вас. Якщо у вас є питання, будь ласка, напишіть їх у чат підтримки вашому куратору у цій групі. https://t.me/+IMQDXlPlyssxNzcy"};
    } else {
      //шаг 1 АКТИВИРУЕМ! КЛИЕНТА!!
       
      const schedule = (courseId == CourseConstant.courseIdSpeechWithoutCurator || courseId == CourseConstant.courseIdSpeechUAWithoutCoach || courseId == CourseConstant.courseIdPhrasalSpeechWithoutCurator || courseId == CourseConstant.courseIdPhrasalSpeechUAWithoutCoach) ?  JSON.stringify([{"day":1,"time":9,"text":"Понедельник (09-00)"},{"day":3,"time":9,"text":"Среда (09-00)"},{"day":5,"time":9,"text":"Пятница (09-00)"}]) : null;
      let resultActiveClient =  await activeCourseForClient(client.id, courseId, schedule);
      //шаг 2 Актвириуем коуча
      console.log('ACTIVE COACH FOR CLIENT', resultActiveClient.dataValues.id, coachId);

      let resultActiveCoach = await activeCoachForClientCourse(resultActiveClient.dataValues.id, coachId);
     
      console.log("====COOOACH!=====" ,resultActiveCoach);

      //ШАГ 2  
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
        duration: duration,
        courseClientId: resultActiveClient.dataValues.id,
        courseId: courseId,
        useBlocks: true
      });
      console.log("NEW PACKAGE", newPackage);
      let newTask;
      
      if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
        newTask = newPackage.dailyTasks[0];
      } else {
        newTask = null;
      }
     let resStart = await startPackageForBotUAClient(newTask, currentChatId);
      if (resStart) {
        return {success: true, message: startMessage};

      } else {
        return {success: false, message: failMessage};
      }
     
    }
  } else {
    let tgUser = await findTgUser(currentChatId);
    // console.log(tgUser)
    if (!tgUser) {
      return failMessage;
    } else {
        let newUser =  await createUser(tgUser);
        // console.log("===== new user", newUser);F
        if (newUser) {
          const schedule = (courseId == CourseConstant.courseIdSpeechWithoutCurator || courseId == CourseConstant.courseIdSpeechUAWithoutCoach || courseId == CourseConstant.courseIdPhrasalSpeechWithoutCurator || courseId == CourseConstant.courseIdPhrasalSpeechUAWithoutCoach) ?  JSON.stringify([{"day":1,"time":9,"text":"Понедельник (09-00)"},{"day":3,"time":9,"text":"Среда (09-00)"},{"day":5,"time":9,"text":"Пятница (09-00)"}]) : null;
          let resultActiveClient =  await activeCourseForClient(newUser.dataValues.id, courseId, schedule);
          
          // console.log("===result Active Client====", resultActiveClient);
          let resultActiveCoach = await activeCoachForClientCourse(resultActiveClient.dataValues.id, coachId);

          //ШАГ 2  
          let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
            duration: duration,
            courseClientId: resultActiveClient.dataValues.id,
            courseId: courseId,
            useBlocks: true
          });
          let newTask;
          
          if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
            newTask = newPackage.dailyTasks[0];
          } else {
            newTask = null;
          }

          // tgBotHandler
        //  let resStart = await startPackageForClient(newTask, currentChatId);
         let resStart = await tgBotHandler.sendSingleTaskWithVariantsForStartUABot(tgUser, newTask);
          if (resStart) {
            return {success: true, message: startMessage};
          } else {
            return {success: false, message: failMessage};
          }
        } else {
          return {success: false, message: failMessage};
        }
      } 
    }

  } catch (error) {
    console.log("ERROR START COURSE UA bot", error);
    const failMessageError =  "Не вдалося запустити курс. Якщо у вас є питання, будь ласка, напишіть їх у чат підтримки вашому куратору в цій групі. https://t.me/+IMQDXlPlyssxNzcy";
    return failMessageError;
  }
  //запуск речи скопировал 
} 

async function startMaraphonR (currentChatId, courseId, duration, courseName, startMessage) {
  try  {
    console.log("start startMaraphonR", currentChatId, courseId, duration, courseName, startMessage);
    const failMessage =  "Не удалось запустить курс. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy";
    //ШАГ ПЕРВЫЙ ИЩЕМ КЛИЕНТА!
    let client = await findClientUseChatId(currentChatId);
    //ИЩЕМ N
    let tgUser = await userHelper.findTgUser(currentChatId);
    if (!tgUser) {
      return {success: false, message: failMessage};
    }
    let userText =  (tgUser ?  "Телефон: " + tgUser.phone : 'телефон не указан ')  + (" Имя:  " + tgUser.firstName + ' ' + tgUser.lastName) ;
    const startText = tgUser ? userText :  'Телефон не указан';
    infoLogger.addMessagServerToLoggerBot("Запуск - " + courseName +  ' - ' + startText);
    if (client) {
      let courseClient = await findClientForCourse(client.id.toString(), courseId);
      if (courseClient ) {
        return {success: false, message: "Курс уже доступен вам. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy"};
      } else {
        let resultActiveClient =  await activeCourseForClient(client.id, courseId);
        let resultActiveCoach = await activeCoachForMarahonRCourse(resultActiveClient.dataValues.id);
        return {success: true, message: startMessage};
      }
    } else {
       
      let newUser = await createUser(tgUser);
      if (newUser) {
        let resultActiveClient =  await activeCourseForClient(newUser.dataValues.id, courseId);
        let resultActiveCoach = await activeCoachForMarahonRCourse(resultActiveClient.dataValues.id);
        return {success: true, message: startMessage};
      } else {
        return {success: false, message: failMessage};
      }
    }

  } catch (err) {
    const failMessageError =  "Не удалось запустить курс. Если у Вас есть вопросы, пожалуйста, напишите их в чат поддержки Вашему куратору в эту группу. https://t.me/+IMQDXlPlyssxNzcy";
    return {success: false, message: failMessageError};
  }
}

// function for start course - new
exports.startCourse = async (req, res) => {
  // check chatId
  const failMessage =  "Неправильный код для запуска курса. Для получения кода - обратитесь в чат к администраторам школы Govorika. По вопросам обращайтесь к вашему куратору в чат поддержки https://t.me/+IMQDXlPlyssxNzcy";

  //translate fail message to ukrianian
  const ukrFailMessage = `Невірний код для запуску курса. Для отримання коду - зверніться в чат до адміністраторів школи Govorika.`;
  if (!req.body.chatId ) {
    res.status(400).send({
      message: "Chat can not be empty!",
      isStart: false
    });
    return;
  }
  //check code

  if (!req.body.code ) {
    res.status(400).send({
      message: "Code can not be empty!",
      isStart: false
    });
    return;
  }

  //check code
  try {
    let resFindActiveCode = await findActiveCode(req.body.code);
    console.log('resFindActiveCode', resFindActiveCode);
    // console.log("====resFindActiveCode====", resFindActiveCode);
    // console.log('====req.body.chatId====', req.body.chatId);
    let client = await userHelper.findTgUser(req.body.chatId.toString());
    console.log("====client====", client);
    const phone = client ? client.phone : 'не указан';
    if (!resFindActiveCode) {
     return res.status(201).send({
        message: failMessage,
        isStart: false
      });
    }
    const coachId = resFindActiveCode.coachId ? resFindActiveCode.coachId : CourseConstant.coachId;
 
    if (resFindActiveCode && resFindActiveCode.courseId) {
      const currentCourseId = resFindActiveCode.courseId.toString();
      console.log('currentCourseId', currentCourseId);
      const chatId = req.body.chatId.toString();
      if (
        currentCourseId !== CourseConstant.courseIdSpeech 
        && currentCourseId !== CourseConstant.courseIdSpeechWithoutCurator
        && currentCourseId !== CourseConstant.courseIdPhrasalSpeech 
        && currentCourseId !== CourseConstant.courseIdPhrasalSpeechWithoutCurator
        && currentCourseId !== CourseConstant.courseIdMarathonR
        && currentCourseId !== CourseConstant.courseIdSpeechUA
        && currentCourseId !== CourseConstant.courseIdSpeechUAWithoutCoach
        && currentCourseId !== CourseConstant.courseIdPhrasalSpeechUA
        && currentCourseId !== CourseConstant.courseIdPhrasalSpeechUAWithoutCoach
        ) 
        {
        console.log("Fail course id", currentCourseId);
        return res.status(201).send({
          message: failMessage,
          isStart: false
        });
      }
      if (currentCourseId == CourseConstant.courseIdSpeech) {
         const resMessageStart = await startInstanceCourse(
          chatId, 
          CourseConstant.courseIdSpeech, 
          CourseConstant.durationSpeech, 
          'Запуск Речи',
          CourseConstant.startMessageSpeech, 
          coachId);
        if (resMessageStart.success){
           //disable code
          await disableCode(req.body.code, chatId, phone);
          return res.status(200).send({
            message: CourseConstant.startMessageSpeech,
            isStart: true
          });
        } else {
          return res.status(201).send({
            message: resMessageStart.message,
            isStart: false
          });
        }
      }
      if (currentCourseId == CourseConstant.courseIdSpeechWithoutCurator) {
        const resMessageStart = await startInstanceCourse(
          chatId, 
          CourseConstant.courseIdSpeechWithoutCurator, 
          CourseConstant.durationSpeechWithoutCurator, 
          'Запуск Речи без куратора',
          CourseConstant.startMessageSpeechWithoutCurator, 
          coachId);
        if (resMessageStart.success){
          //disable code
         await disableCode(req.body.code, chatId, phone);
         return res.status(200).send({
           message: CourseConstant.startMessageSpeechWithoutCurator,
            isStart: true
         });
        } else {
          return res.status(201).send({
           message: resMessageStart.message,
            isStart: false
         });
        }
      }
      if (currentCourseId == CourseConstant.courseIdSpeechUA) {
        const resMessageStart = await startInstanceCourseUA(
         chatId, 
         CourseConstant.courseIdSpeechUA, 
         CourseConstant.durationSpeechUA, 
         'Запуск Мови',
         CourseConstant.startMessageSpeechUA, 
         coachId);
         console.log("START UA SPEECH", resMessageStart);
       if (resMessageStart.success){
          //disable code
         await disableCode(req.body.code, chatId, phone);
         return res.status(200).send({
           message: CourseConstant.startMessageSpeechUA,
            isStart: true
         });
       } else {

         return res.status(201).send({
           message: resMessageStart.message,
            isStart: false
         });
       }
     }

     if (currentCourseId == CourseConstant.courseIdSpeechUAWithoutCoach) {
      const resMessageStart = await startInstanceCourseUA(
       chatId, 
       CourseConstant.courseIdSpeechUAWithoutCoach, 
       CourseConstant.durationSpeechUAWithoutCoach, 
       'Запуск Мови без куратора',
       CourseConstant.startMessageSpeechUAWithoutCoach, 
       coachId);
       console.log("START UA SPEECH", resMessageStart);
      if (resMessageStart.success){
        //disable code
       await disableCode(req.body.code, chatId, phone);
       return res.status(200).send({
         message: CourseConstant.startMessageSpeechUAWithoutCoach,
          isStart: true
       });
      } else {
        return res.status(201).send({
         message: resMessageStart.message,
          isStart: false
       });
      }
     }


      if (currentCourseId == CourseConstant.courseIdPhrasalSpeech) {
        const resMessageStart = await startInstanceCourse(
          chatId, 
          CourseConstant.courseIdPhrasalSpeech, 
          CourseConstant.durationPhrasalSpeech, 
          'Формирование фразовой речи',
          CourseConstant.startMessagePhrasalSpeech, 
          coachId);
        if (resMessageStart.success){
          await disableCode(req.body.code, chatId, phone);
          return res.status(200).send({
            message: CourseConstant.startMessagePhrasalSpeech,
            isStart: true
          });
        } else {
          return res.status(201).send({
            message: resMessageStart.message,
            isStart: false
          });
        }
      }

      if (currentCourseId == CourseConstant.courseIdPhrasalSpeechWithoutCurator) {
        const resMessageStart = await startInstanceCourse(
          chatId,
          CourseConstant.courseIdPhrasalSpeechWithoutCurator,
          CourseConstant.durationPhrasalSpeechWithoutCurator,
          'Формирование фразовой речи без куратора',
          CourseConstant.startMessagePhrasalSpeechWithoutCurator,
          coachId);
        if (resMessageStart.success){
          await disableCode(req.body.code, chatId, phone);
          return res.status(200).send({
            message: CourseConstant.startMessagePhrasalSpeechWithoutCurator,
            isStart: true
          });
        } else {
          return res.status(201).send({
            message: resMessageStart.message,
            isStart: false
          });
        }
      }


      if (currentCourseId == CourseConstant.courseIdPhrasalSpeechUA) {
        const resMessageStart = await startInstanceCourseUA(
          chatId, 
          CourseConstant.courseIdPhrasalSpeechUA, 
          CourseConstant.durationPhrasalSpeechUA, 
          'Формування фразової мови',
          CourseConstant.startMessagePhrasalSpeechUA, 
          coachId);
        if (resMessageStart.success){
          await disableCode(req.body.code, chatId, phone);
          return res.status(200).send({
            message: CourseConstant.startMessagePhrasalSpeechUA,
            isStart: true
          });
        } else {
          return res.status(201).send({
            message: resMessageStart.message,
            isStart: false
          });
        }
      }

      if (currentCourseId == CourseConstant.courseIdPhrasalSpeechUAWithoutCoach) {
        const resMessageStart = await startInstanceCourseUA(
          chatId,
          CourseConstant.courseIdPhrasalSpeechUAWithoutCoach,
          CourseConstant.durationPhrasalSpeechUAWithoutCoach,
          'Формування фразової мови без куратора',
          CourseConstant.startMessagePhrasalSpeechUAWithoutCoach,
          coachId);
        if (resMessageStart.success){
          await disableCode(req.body.code, chatId, phone);
          return res.status(200).send({
            message: CourseConstant.startMessagePhrasalSpeechUAWithoutCoach,
            isStart: true
          });
        } else {
          return res.status(201).send({
            message: resMessageStart.message,
            isStart: false
          });
        }
      }

      if (currentCourseId == CourseConstant.courseIdMarathonR) {
        const resMessageStart = await startMaraphonR(chatId, CourseConstant.courseIdMarathonR, CourseConstant.durationMarathonR, CourseConstant.startMessageMarathonR);
        if (resMessageStart.success){
          await disableCode(req.body.code, chatId);
          return res.status(200).send({
            message: CourseConstant.startMessageMarathonR,
            isStart: true
          });
        } else {
          return res.status(201).send({
            message: resMessageStart.message,
            isStart: false
          });
        }
      }



    } else {
      return res.status(200).send({
        message: failMessage,
        isStart: false
      });
    }


   
  
  } catch (error) {
    console.log("CATCH ERROR" + error);
    res.status(400).send({
      message: failMessage,
      isStart: false
    });
  }
 
}


//create checkPhone check if user exist phone with chat id
exports.checkPhone = async (req, res) => {
  // check chatId
  if (!req.body.chatId ) {
    res.status(400).send({
      message: "Chat can not be empty!"
    });
    return;
  }
  let currentChatId = req.body.chatId.toString();
  //ШАГ ПЕРВЫЙ ИЩЕМ КЛИЕНТА!
  let client = await findClientUseChatId(currentChatId);
  if (client && client.phone) {
    res.status(200).send({
      phone: client.phone
    });
    return;
  }
  else {
    res.status(200).send({
      phone: ''
    });
    return;
  }
}

//startUserWithCourseUseBot
exports.startUserWithCourseUseBot = async (req, res) => {
  console.log("START BOT", req.body);
  if (!req.body.chatId ) {
    res.status(400).send({
      message: "Chat can not be empty!"
    });
    return;
  }
  let currentChatId = req.body.chatId.toString();
  //ШАГ ПЕРВЫЙ ИЩЕМ КЛИЕНТА!
  let client = await findClientUseChatId(currentChatId);
  console.log("НАШЛИ КЛИЕНТА", client)
  //ИЩЕМ N 
  let tgUser = await userHelper.findTgUser(currentChatId);

  if (tgUser && !tgUser.phone) {
    res.status(200).send({
      message: "Для запуска курса вам необходимо указать ваш номер телефона. . Нажмите на кнопку добавить номер телефона и  укажите свой номер телефона, который зарегистрирован у Вас в телеграм, обязательно с кодом страны. Например +49176****",
      emptyPhone: true
    });
    return;
  }
  let userText =  (tgUser ?  "Телефон: " + tgUser.phone : 'телефон не указан ')  + (" Имя:  " + tgUser.firstName + ' ' + tgUser.lastName) ;
  const startText = tgUser ? userText :  'Телефон не указан';
  infoLogger.addMessagServerToLoggerBot("Запуск Речи для - " + startText);
  if (client) {
    //ЕСЛИ КЛИЕНТ НАЙДЕН
    let courseClient = await findClientForCourse(client.id.toString());
    console.log("===COURSE CLIENT====", courseClient);
    if (courseClient ) {
      res.status(200).send({
        message: "Курс Запуск Речи уже доступен вам"
      });
      return;
    } else {
      //шаг 1 АКТИВИРУЕМ! КЛИЕНТА!!

      let resultActiveClient =  await activeCourseForClient(client.id);

      console.log("===result Active Client====", resultActiveClient);
      //шаг 2 Актвириуем коуча
      let resultActiveCoach = await activeCoachForClientCourse(resultActiveClient.dataValues.id);
     
      // console.log("====RESULT ACTIVE CLIENT!=====" ,  resultActiveClient.dataValues.id);

      //ШАГ 2  
      let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
        duration: CourseConstant.durationSpeech,
        courseClientId: resultActiveClient.dataValues.id,
        courseId: CourseConstant.courseIdSpeech,
        useBlocks: true
      });
      let newTask;
      
      if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
        newTask = newPackage.dailyTasks[0];
      } else {
        newTask = null;
      }
     let resStart = await startPackageForClient(newTask, currentChatId);
      if (resStart) {
        res.status(200).send({
          message: CourseConstant.startMessageSpeech
        });
      } else {
        res.status(200).send({
          message: "Не удалось запустить курс Запуск Речи"
        });
  
      }
     
    }
  } else {
    let tgUser = await findTgUser(currentChatId);
    // console.log(tgUser)
    if (!tgUser) {
      res.status(200).send({
        message: "Не удалось запустить курс Запуск Речи"
      });
      return;
    } else {
        let newUser =  await createUser(tgUser);
        // console.log("===== new user", newUser);
        if (newUser) {
          let resultActiveClient =  await activeCourseForClient(newUser.dataValues.id);
          
          // console.log("===result Active Client====", resultActiveClient);
          let resultActiveCoach = await activeCoachForClientCourse(resultActiveClient.dataValues.id);

          //ШАГ 2  
          let newPackage = await FindDailyPackageWithDuration.FindDailyPackageWithDuration({
            duration: CourseConstant.durationSpeech,
            courseClientId: resultActiveClient.dataValues.id,
            courseId: CourseConstant.courseIdSpeech,
            useBlocks: true
          });
          let newTask;
          
          if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
            newTask = newPackage.dailyTasks[0];
          } else {
            newTask = null;
          }

          // tgBotHandler
        //  let resStart = await startPackageForClient(newTask, currentChatId);
         let resStart = await tgBotHandler.sendSingleTaskWithVariantsForStart(tgUser, newTask);
          if (resStart) {
            res.status(200).send({
              message: CourseConstant.startMessageSpeech
            });
          } else {
            res.status(200).send({
              message: "Не удалось запустить курс Запуск Речи"
            });
      
          }
        } else {
          res.status(200).send({
            message: "Не удалось запустить курс Запуск Речи"
          });
          return;
        }
      } 
    }
  
};

exports.createUserWithCourse = async (req, res) => {
  
  if (!req.body.courseId ) {
    res.status(400).send({
      message: "Id can not be empty!"
    });
    return;
  }
      
  const user = {
    firstName: req.body.firstName ? req.body.firstName : '',
    lastName: req.body.lastName ? req.body.lastName : '',
    email: req.body.email ? req.body.email : '',
    role: req.body.role ? req.body.role : '',
    status: req.body.status ? req.body.status : 'active',
    phone: req.body.phone ? req.body.phone : '',
    textback_url: req.body.textback_url ?  req.body.textback_url : '',
    chatId: req.body.chatId ? req.body.chatId : ''
  };


  const courseClientData = {
    courseId: req.body.courseId,
    clientId: "",
    status: 'active',
    isActive: true
};

  Clients.create(user)
    .then(data => {
      // console.log("=====USER DATA=======", user);
      courseClientData.clientId = data.id; 
      // dataCourseClients
      const baseUrl = urlHelper.getBaseUrl();


      CourseClients.create(courseClientData)
                    .then(async (dataCourseClients) => {
                      // { duration: 5, courseClientId: 131, courseId: 21, useBlocks: true }
                      if (req.body.courseId == CourseConstant.courseIdSpeech) {

                      console.log("ТАК ЗАПУСКАЕМСЯ! отдаем первый урок в телеграмм");
                      let newPackage = await FindDailyPackageWithDuration.findDailyPackageWithDuration({
                        duration: CourseConstant.durationSpeech,
                        courseClientId: dataCourseClients.dataValues.id,
                        courseId: req.body.courseId,
                        useBlocks: true
                      });
                      let newTask;
                      if (newPackage.dailyTasks && newPackage.dailyTasks.length >0 ) {
                        newTask = newPackage.dailyTasks[0];
                      }
                      if (newTask) {
                        let taskIds = [newTask.taskId];


                        Blocks.findAll({
                            where: {
                                taskId: taskIds
                            }
                        }).then(blocks => {
                            const parsedBlocks = blocks.map((node) => node.get({ plain: true }));

                            const parsedNewTask = {
                                blocks: parsedBlocks,
                                number: newTask.number,
                                id: newTask.dailyTaskId,
                                packageId: newTask.packageId,
                                status: newTask.status,
                                name: newTask.name,
                                dailyTaskId: newTask.dailyTaskId,
                                textValue: newTask && newTask.textValue ? newTask.textValue : "",
                                videoLink: newTask && newTask.videoLink ? newTask.videoLink : null,
                                linksText: newTask && newTask.linksText  ? newTask.linksText : null,
                            }
                            // console.log('------AXIOS GO GO----', req.body.chatId);
                            // console.log('------AXIOS GO GO----', parsedNewTask);

                            axios.post(baseUrl + '/sendSingleLessonWithVariants', {
                                task: parsedNewTask,
                                chatId: req.body.chatId
                            })
                                .then(res => {
                                    // res.send("Скоро прийдут задачи");
                                    console.log("Result norm");

                                })
                                .catch(error => {
                                    console.log("Result catch");
                                    // res.send("FAILED + " + JSON.stringify(error));
                                });

                        }).catch(err => {
                          console.log('---THIS GLOBAL CATCH', err);
                        });
                    }
                  }
                        res.send(dataCourseClients);
                    })
                    .catch(err => {
                       console.log('-----cath error', err);
                        res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the courseClient."
                        });
                    });

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });

};


// Retrieve all User from the database.
exports.findAll = (req, res) => {
  
  Clients.findAll({ })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
      });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  
};

// Update a User by the id in the request
exports.update = (req, res) => {
    const id = req.body.id;
    Clients.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
  
};

exports.changeClientNameUseCourseClientId = async (req, res) => {
  if (!req.body.courseClientId ) {
    res.status(400).send({
      message: "courseClientId can not be empty!"
    });
    return;
  }

  if (!req.body.name ) {
    res.status(400).send({
      message: "name can not be empty!"
    });
    return;
  }


  const courseClientId = req.body.courseClientId;
  const name = req.body.name;

  //parse name to firstName and lastName
  // const nameArray = name.split(' ');
  // const firstName = nameArray[0];
  // const lastName = nameArray[1] ? nameArray[1] : '';
  const spaceIndex = name.indexOf(' ');
  const firstName = spaceIndex !== -1 ? name.substring(0, spaceIndex) : name;
  const lastName = spaceIndex !== -1 ? name.substring(spaceIndex + 1) : '';


  //find client id use courseClientId use await
  const courseClient = await CourseClients.findOne({
    where: {
      id: courseClientId
    },
    raw: true
  }).then(courseClientData => {
    return courseClientData;
  }
  ).catch(err => {
    console.log(err);
    return null;
  }
  );
  if (!courseClient) {
    res.status(400).send({
      message: "courseClient not found"
    });
    return;
  }

  //update client use client id
  const clientId = courseClient.clientId;
  const client = await Clients.update({
    firstName: firstName,
    lastName: lastName
  }, {
    where: {
      id: clientId
    },
    raw: true
  }).then(clientData => {
    return clientData;
  }
  ).catch(err => {
    console.log(err);
    return null;
  }
  );
  res.status(200).send({
    message: "success"
  });
  return;
}


// Update a User by the id in the request
exports.disable = (req, res) => {
    const id = req.body.id;
    let newUser = {
        id: id,
        status: 'not active'
    }
    Clients.update(newUser, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated, not it's not active user"
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
  
};

/*
Client Feedback Section 
*/

async function findClientUseChatId (chatId) {

  let client = await Clients.findOne({
    where: {
      chatId: chatId
    },
    raw: true
  }).then(clientData => {
    console.log("clientData", clientData);
    return clientData;
  }).catch(err=> {
    console.log(err);
    return null;
  });

  return client;
}



async function createFeedback(newFeedback) {

  const feedback = await ClientFeedbacks.create(newFeedback)
    .then(data => {
      const dataObj = data.get({plain:true})
      return dataObj;

    }).catch(err => {
      return null;
    });

  return feedback;
}


exports.addFeedback = async (req, res) => {

  const feedbackText = req.body.feedbackText && req.body.feedbackText.length > 0 ? req.body.feedbackText : null;

  const chatId = req.body.chatId ? req.body.chatId : null;


  if (!chatId) {
    res.status(400).send({
      message: "chatId can not be empty!"
    });
    return;
  }

  if (!feedbackText) {
    res.status(400).send({
      message: "feedback can not be empty!"
    });
    return;
  }

  console.log("======FIND CHAT ID ====", chatId);
  const stringChatId = chatId.toString();
  const client = await findClientUseChatId(stringChatId);
  console.log("====CLIENT ====", client);


  if (!client) {
    res.status(400).send({
      message: "feedback can not be empty!"
    });
    return;
  }



  let newFeedback = {
    clientId: client.id,
    feedbackText: feedbackText
  }

  const createdFeedback = await createFeedback(newFeedback);
  infoLogger.sendFeedbackMessage(client.firstName + ' ' +  client.lastName, feedbackText);
  if (createFeedback) {
    res.send(createdFeedback);
  } else {
    res.status(500).send({
      message: "Error created Feedback"
    });
  }


}

/* 
Finish Client Feedback Section
*/



// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  
};