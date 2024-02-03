const { sendSingleTaskWithVariantsForStartUABot, sendSingleTaskWithVariantsForStart } = require('../helpers/sendTaskHelper');
const { FindDailyPackageWithDuration, FindDailyPackageWithDurationAndRepeat } = require('../helpers/taskHelper');
const userHelper = require('../helpers/userHelper');
const { updatePackageStatusToOld } = require('./packageService');

const taskService = require('./taskService');

const CourseCodesModel = require('../models').CourseStartCodes;
const CourseClients = require("../models").CourseClients;
const Clients = require("../models").Clients;
const Courses = require("../models").Courses;

//create function for find active code by code value 
const findActiveCode = async (code) => {
    return await CourseCodesModel.findOne({
        where: {
            code: code,
            isActive: true
        },
        raw: true

    });
}

// disable code by code value and set description use current date and chat id client
const disableCode = async (code, chatId, phone) => {
    const clientInfo = `Телефон: ${phone}, chatId: ${chatId}`;
    return await CourseCodesModel.update({
        isActive: false,
        description: `Код использован ${new Date().toLocaleString()} пользователем ${clientInfo}`
    }, {
        where: {
            code: code
        }
    });
}


//start new package for course
const startNewPackage = async (courseClientId) => {
    //find for course id in future
    const duration = 10;
    //step 1 find course id 
    const courseId = await findCourseIdUseCourseClientId(courseClientId);
    if (!courseId) {
        return;
    }
    console.log('courseId', courseId);
    //step 2 find client info use courseClientId
    const activeClient = await findClientInfoUseCourseClientId(courseClientId);
    if (!activeClient) {
        return;
    }
    const tgUser = await userHelper.findTgUser(activeClient['Client.chatId']);
    if (!tgUser) {
        return;
    }

    console.log('activeClient', activeClient);
    //step 3 find full course info
    const currentCourse = await findCurrentCourse(courseId);
    console.log('currentCourse', currentCourse);
    //step 4 update old package status
    await updatePackageStatusToOld(activeClient.id);
    //step 5 find new package
    let newPackage = await FindDailyPackageWithDurationAndRepeat({
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
        sendSingleTaskWithVariantsForStartUABot(tgUser, newTask);
    } else {
        console.debug("FINISH COOURSe");
        // обсудить что делать если нет заданий
        // sendTaskHelper.setFinishedCourse(activeClient);
    }
}


//new package RU bot version
const startNewPackageForRUCourse = async (courseClientId) => {
    //find for course id in future
    const duration = 10;
    //step 1 find course id 
    const courseId = await findCourseIdUseCourseClientId(courseClientId);
    if (!courseId) {
        return;
    }
    console.log('courseId', courseId);
    //step 2 find client info use courseClientId
    const activeClient = await findClientInfoUseCourseClientId(courseClientId);
    if (!activeClient) {
        return;
    }
    const tgUser = await userHelper.findTgUser(activeClient['Client.chatId']);
    if (!tgUser) {
        return;
    }

    console.log('activeClient', activeClient);
    //step 3 find full course info
    const currentCourse = await findCurrentCourse(courseId);
    console.log('currentCourse', currentCourse);
    //step 4 update old package status
    await updatePackageStatusToOld(activeClient.id);
    //step 5 find new package
    let newPackage = await FindDailyPackageWithDurationAndRepeat({
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
        sendSingleTaskWithVariantsForStart(tgUser, newTask);
        // sendSingleTaskWithVariantsForStartUABot(tgUser, newTask);
    } else {
        console.debug("FINISH COOURSe");
        // обсудить что делать если нет заданий
        // sendTaskHelper.setFinishedCourse(activeClient);
    }
}
//get client info use courseClientId
const findClientInfoUseCourseClientId = async (courseClientId) => {
    let result = await CourseClients.findOne({
        where: {
            id: courseClientId
        },
        include: [
            { model: Clients, as: 'Client' },

        ],
        raw: true
    }).then(clientData => {
        return clientData;
    }).catch(err => {
        return null;
    });
    return result;
}

const findCourseIdUseCourseClientId = async (courseClientId) => {
    let result = await CourseClients.findOne({
        where: {
            id: courseClientId
        },
        raw: true
    }).then(clientData => {
        if (clientData && clientData.courseId) {
            return clientData.courseId;
        } else {
            return null;
        }
    }).catch(err => {
        return null;
    });
    return result;
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


  //find client schedule use courseClientId
const findClientScheduleUseCourseClientId = async (courseClientId) => {
    let result = await CourseClients.findOne({
        where: {
            id: courseClientId
        },
    }).then(clientData => {
        if (clientData && clientData.schedule) {
            return clientData.schedule;
        } else {
            return null;
        }
    }).catch(err => {
        return null;
    });
    return result;
}



//expor findActiveCode function
module.exports = {
    findActiveCode,
    disableCode,
    startNewPackage,
    startNewPackageForRUCourse,
    findClientScheduleUseCourseClientId
}

