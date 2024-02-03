const { formatDate } = require("./dateHelper");
const urlHelper = require("./urlHelper");

const Clients = require("../models").Clients;
const CourseClients = require("../models").CourseClients;
const ClientCoaches = require("../models").ClientCoaches;
const Courses = require("../models").Courses;
const Blocks = require("../models").Blocks;
const axios = require('axios');

//find client for course

async function findClientForCourse(clientId, courseId) {
    if (!courseId) {
        return null;
    }
    let result = await CourseClients.findOne({
        where: {
            clientId: clientId,
            courseId: courseId,
        },
        raw: true
    }).then(courseClient => {
        return courseClient;
    }).catch(err => {
        return null;
    });

    return result;
}

//find client by chatId

async function findClientByChatId(chatId) {
    let client = await Clients.findOne({
        where: {
            chatId: chatId
        },
        raw: true
    }).then(clientData => {
        return clientData;
    }).catch(err => {
        return null;
    });

    return client;
}

async function activeCourseForClient(clientId, courseId, schedule) {
    //check params
    if (!courseId || !clientId) {
        return null;
    }
    var newDate = formatDate(new Date());
    
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
            return dataCourseClients;
        })
        .catch(err => {
            return null;
        });
    return result;
}


async function activeCourseForClientUseNewBot(clientId, courseId, schedule) {
    //check params
    if (!courseId || !clientId) {
        return null;
    }
    var newDate = formatDate(new Date());
    
    const courseClientData = {
        courseId: courseId,
        clientId: clientId,
        status: 'active',
        isActive: true,
        paymentDate: newDate,
        schedule: schedule ?? null,
        useNewBot: true
    };

    let result = await CourseClients.create(courseClientData)
        .then(async (dataCourseClients) => {
            return dataCourseClients;
        })
        .catch(err => {
            return null;
        });
    return result;
}

async function findCourseClientNewBot(clientId, courseId) {
    if (!courseId) {
        return null;
    }
    let result = await CourseClients.findOne({
        where: {
            clientId: clientId,
            courseId: courseId,
            useNewBot: true,
            isActive: true
        },
        raw: true
    }).then(courseClient => {
        return courseClient;
    }).catch(err => {
        return null;
    });

    return result;
}


async function createClient (govorikaUser) {
    // name: DataTypes.STRING,
    // username: DataTypes.STRING,
    // chatId: DataTypes.STRING,
    // language: DataTypes.STRING,
    // phone: DataTypes.STRING,
    // schedule: DataTypes.TEXT
    
    const user = {
      firstName: govorikaUser.name,
      lastName: '',
      email: '',
      role: '',
      status: 'active',
      phone: govorikaUser.phone ? govorikaUser.phone : '',
      textback_url:  '',
      chatId: govorikaUser.chatId
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


//active coach for client course
async function activeCoachForClientCourse(courseClientId, coachId) {
    console.log('ACTIVE COACH FOR CLIENT', courseClientId, coachId);
    if(!coachId) {
        return null;
    }
    let newClientCoach = {
      coachId: coachId,
      courseClientId: courseClientId,
      status: 'Active'
    };
    await ClientCoaches.create(newClientCoach).then(newItem => {
        return newItem;
    }).catch(err => {
       return err;
    });
  }



  async function startPackageForClient (newTask, chatId, language) {
    if (!newTask) {
        return false;
    }

    console.log('newTask', newTask);
    let taskIds = [newTask.taskId];
    let parsedBlocksRes = await Blocks.findAll({
        where: {
            taskId: taskIds
        }
    }).then(blocks => {
        const parsedBlocks = blocks.map((node) => node.get({ plain: true }));
        return parsedBlocks;
    }).catch(err => {
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
      language: language ?? 'ru'
  }
  
  const baseUrl = urlHelper.getUrlGovorikaBot();
  
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
   
  }


  //find course language by id
  async function findCourseLanguageById(courseId) {
    if (!courseId) {
        return null;
    }
    let result = await Courses.findOne({
        where: {
            id: courseId
        },
        raw: true
    }).then(course => {
        return  course && course.language ? course.language : 'ru'; 
    }).catch(err => {
        return null;
    });

    return result;
}
//exports
module.exports = {
    findClientByChatId: findClientByChatId,
    findClientForCourse: findClientForCourse,
    activeCourseForClient: activeCourseForClient,
    activeCoachForClientCourse: activeCoachForClientCourse,
    createClient: createClient,
    startPackageForClient: startPackageForClient,
    //new bot methods
    activeCourseForClientUseNewBot: activeCourseForClientUseNewBot,
    findCourseClientNewBot: findCourseClientNewBot,
    findCourseLanguageById: findCourseLanguageById

};
