const Blocks = require("../models").Blocks;

const ExerciseFiles = require("../models").ExerciseFiles;

const axios = require('axios');

const urlHelper = require("../helpers/urlHelper");

const botLogger = require('./infoLogger');

// 
const taskService = require('../services/taskService');

async function findFiles (exerciseId) {
  
    let files = await ExerciseFiles.findAll({
      where: {
        exerciseId: exerciseId
      },
      raw: true
    }).then(files => {
      return files;
    }).catch(err=> {
      return [];
    });
  
    return files;
  }


async function sendSingleTaskWithVariantsForStart(tgUser, newTask) {
    const baseUrl = urlHelper.getBaseUrl();
    const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
   

    const exerciseId = fullTask['Exercise.id'];
    const files = await findFiles(exerciseId);

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
                linksText: newTask && newTask.linksText ? newTask.linksText : null,
                files: files
            }

            axios.post(baseUrl + '/sendSingleLessonWithVariants', {
                task: parsedNewTask,
                chatId: tgUser.chatId
            })
                .then(res => {
                    // res.send("Скоро прийдут задачи");
                    console.log("Result norm");
                    botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
                    // return true;
                })
                .catch(error => {
                    console.log("Result catch", error);
                    // return false;
                    // res.send("FAILED + " + JSON.stringify(error));
                });
               
        }).catch(err => {
            console.log('--- sendSingleTaskWithVariants THIS GLOBAL CATCH', err);
            // return false;
        });
        return true;
    } else {
        return false;
    }
}


async function sendSingleTaskWithVariantsForStartUABot(tgUser, newTask) {
    const baseUrl = urlHelper.getBaseUrlBotUA();
    const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);
   

    const exerciseId = fullTask['Exercise.id'];
    const files = await findFiles(exerciseId);

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
                linksText: newTask && newTask.linksText ? newTask.linksText : null,
                files: files
            }

            axios.post(baseUrl + '/sendSingleLessonWithVariants', {
                task: parsedNewTask,
                chatId: tgUser.chatId
            })
                .then(res => {
                    // res.send("Скоро прийдут задачи");
                    console.log("Result norm");
                    botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
                    // return true;
                })
                .catch(error => {
                    console.log("Result catch", error);
                    // return false;
                    // res.send("FAILED + " + JSON.stringify(error));
                });
               
        }).catch(err => {
            console.log('--- sendSingleTaskWithVariants THIS GLOBAL CATCH', err);
            // return false;
        });
        return true;
    } else {
        return false;
    }
}




async function sendSingleTaskWithVariants(tgUser, newTask) {
  
    const baseUrl = urlHelper.getBaseUrl();

     if (newTask) {
         const exerciseId = newTask.CustomizeTask.Exercise.id;
         const files = await findFiles(exerciseId);

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
                                id: newTask.id,
                                packageId: newTask.dailyPackageId,
                                status: newTask.status,
                                name: newTask.name,
                                dailyTaskId: newTask.id,
                                textValue: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.textValue : "",
                                videoLink: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.videoLink : null,
                                linksText: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise && newTask.CustomizeTask.Exercise.linksText && newTask.CustomizeTask.Exercise.linksText.length > 0 ? newTask.CustomizeTask.Exercise.linksText : null,
                                files: files
                            }

                            axios.post(baseUrl + '/sendSingleLessonWithVariants', {
                                task: parsedNewTask,
                                chatId: tgUser.chatId
                            })
                                .then(res => {
                                    // res.send("Скоро прийдут задачи");
                                    console.log("Result norm");
                                    botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' +  tgUser.lastName, newTask.name);


                                })
                                .catch(error => {
                                    console.log("Result catch");
                                    // res.send("FAILED + " + JSON.stringify(error));
                                });

                        }).catch(err => {
                        });
                        return true;
                    } else 
                    {
                        return false;
                    }
}



async function sendSingleTaskWithVariantsToUABot(tgUser, newTask) {
  
    const baseUrl = urlHelper.getBaseUrlBotUA();

     if (newTask) {
         const exerciseId = newTask.CustomizeTask.Exercise.id;
         const files = await findFiles(exerciseId);

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
                                id: newTask.id,
                                packageId: newTask.dailyPackageId,
                                status: newTask.status,
                                name: newTask.name,
                                dailyTaskId: newTask.id,
                                textValue: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.textValue : "",
                                videoLink: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.videoLink : null,
                                linksText: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise && newTask.CustomizeTask.Exercise.linksText && newTask.CustomizeTask.Exercise.linksText.length > 0 ? newTask.CustomizeTask.Exercise.linksText : null,
                                files: files
                            }

                            axios.post(baseUrl + '/sendSingleLessonWithVariants', {
                                task: parsedNewTask,
                                chatId: tgUser.chatId
                            })
                                .then(res => {
                                    // res.send("Скоро прийдут задачи");
                                    console.log("Result norm");
                                    botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' +  tgUser.lastName, newTask.name);


                                })
                                .catch(error => {
                                    console.log("Result catch");
                                    // res.send("FAILED + " + JSON.stringify(error));
                                });

                        }).catch(err => {
                        });
                        return true;
                    } else 
                    {
                        return false;
                    }
}



async function sendSingleTaskWithVariantsToGovorikaBot(tgUser, newTask, language) {
  
    const baseUrl = urlHelper.getUrlGovorikaBot();

     if (newTask) {
        console.log('new task', newTask);
         const exerciseId = newTask.CustomizeTask.Exercise.id;
         const files = await findFiles(exerciseId);

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
                                id: newTask.id,
                                packageId: newTask.dailyPackageId,
                                status: newTask.status,
                                name: newTask.name,
                                dailyTaskId: newTask.id,
                                textValue: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.textValue : "",
                                videoLink: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.videoLink : null,
                                linksText: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise && newTask.CustomizeTask.Exercise.linksText && newTask.CustomizeTask.Exercise.linksText.length > 0 ? newTask.CustomizeTask.Exercise.linksText : null,
                                files: files,
                                language: language ? language : 'ru'
                            }

                            axios.post(baseUrl + '/sendSingleLessonWithVariants', {
                                task: parsedNewTask,
                                chatId: tgUser.chatId
                            })
                                .then(res => {
                                    // res.send("Скоро прийдут задачи");
                                    console.log("Result norm");
                                    botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' +  tgUser.lastName, newTask.name);


                                })
                                .catch(error => {
                                    console.log("Result catch");
                                    // res.send("FAILED + " + JSON.stringify(error));
                                });

                        }).catch(err => {
                        });
                        return true;
                    } else 
                    {
                        return false;
                    }
}

//create function for messageFromServer to bot
async function sendServerMessageToUABot(chatId, newMessage) {
    const baseUrl = urlHelper.getBaseUrlBotUA();

    let res = await axios.post(baseUrl + '/messageFromServer', {
        message: newMessage,
        chatId: chatId
    })
        .then(res => {
            // res.send("Скоро прийдут задачи");
            console.log("Result norm");
            // botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
            return true;

        })
        .catch(error => {
            console.log("Result catch");
            return false;
            // res.send("FAILED + " + JSON.stringify(error));
        });
        return res;
}


async function sendServerMessageToGovorikaBot(chatId, newMessage) {
    const baseUrl = urlHelper.getUrlGovorikaBot();

    let res = await axios.post(baseUrl + '/messageFromServer', {
        message: newMessage,
        chatId: chatId
    })
        .then(res => {
            // res.send("Скоро прийдут задачи");
            console.log("Result norm");
            // botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
            return true;

        })
        .catch(error => {
            console.log("Result catch");
            return false;
            // res.send("FAILED + " + JSON.stringify(error));
        });
        return res;
}

//send server message to ru bot
async function sendServerMessageToRuBot(chatId, newMessage) {
    const baseUrl = urlHelper.getBaseUrl();
    let res = await axios.post(baseUrl + '/messageFromServer', {
        message: newMessage,
        chatId: chatId
    })
        .then(res => {
            // res.send("Скоро прийдут задачи");
            console.log("Result norm");
            // botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
            return true;

        })
        .catch(error => {
            console.log("Result catch");
            return false;
            // res.send("FAILED + " + JSON.stringify(error));
        });
        return res;
}

async function sendSingleTaskOnyInfo(tgUser, newTask) {
    const baseUrl = urlHelper.getBaseUrl();

    if (newTask) {
        const fullTask = await taskService.findFullCustomizeTaskForId(newTask.taskId);

        const exerciseId = fullTask['Exercise.id'];
        const files = await findFiles(exerciseId);

        const parsedNewTask = {
            blocks: [],
            number: newTask.number,
            id: newTask.id,
            packageId: newTask.dailyPackageId,
            status: newTask.status,
            name: newTask.name,
            dailyTaskId: newTask.id,
            textValue: fullTask['Exercise.textValue'] ?  fullTask['Exercise.textValue']: '',
            videoLink: fullTask['Exercise.videoLink'] ?  fullTask['Exercise.videoLink'] : null,
            linksText: fullTask['Exercise.linksText'] ? fullTask['Exercise.linksText'] : null,
            files: files
        }

    let res = await axios.post(baseUrl + '/sendLessonOnlyInfo', {
            task: parsedNewTask,
            chatId: tgUser.chatId
        })
            .then(res => {
                // res.send("Скоро прийдут задачи");
                console.log("Result norm");
                // botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
                return true;

            })
            .catch(error => {
                console.log("Result catch");
                return false;
                // res.send("FAILED + " + JSON.stringify(error));
            });
            return res;

    } else {
        return false;
    }
}



//отправляем сообщение о том чт оплата истекла!
async function sendPaymentExpired(client) {
    const baseUrl = urlHelper.getBaseUrl();

    let res = await axios.post(baseUrl + '/sendPaymentExpired', {
        chatId: client.chatId
    })
        .then(res => {
            // res.send("Скоро прийдут задачи");
            console.log("Result norm");
            // botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
            return true;

        })
        .catch(error => {
            console.log("Result catch");
            return false;
            // res.send("FAILED + " + JSON.stringify(error));
        });
        console.log("ADDD LOG ", client);
        botLogger.addMessagServerToLoggerBot("Был отключен клиент: " + client.firstName + ' ' + client.lastName);
        return res;
}



//отправляем сообщение о завершении курса

async function setFinishedCourse(client) {
    const baseUrl = urlHelper.getBaseUrl();

    let res = await axios.post(baseUrl + '/finishCourse', {
        chatId: client['Client.chatId']
    })
        .then(res => {
            // res.send("Скоро прийдут задачи");
            console.log("Result norm");
            // botLogger.addMessageTaskToLoggerBot(tgUser.firstName + ' ' + tgUser.lastName, newTask.name);
            return true;

        })
        .catch(error => {
            console.log("Result catch");
            return false;
            // res.send("FAILED + " + JSON.stringify(error));
        });
        botLogger.addMessagServerToLoggerBot("ЗАКОНЧИЛИСЬ УПРАЖНЕНИЕ У КЛИЕНТА (ФИНИШ КУРСА): " + 'Телефон: ' + client['Client.phone'] + 'Имя: ' +  client['Client.firstName'] + ' ' + client['Client.lastName']);
        return res;
}

async function paymentMade(client) {
    const baseUrl = urlHelper.getBaseUrl();

    let res = await axios.post(baseUrl + '/paymentMade', {
        chatId: client.chatId
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
        botLogger.addMessagServerToLoggerBot("Активрован! клиент: " + client.firstName + ' ' + client.lastName);

        return res;
}


module.exports = {
    sendSingleTaskWithVariantsForStart: sendSingleTaskWithVariantsForStart,
    sendSingleTaskWithVariants: sendSingleTaskWithVariants,
    sendSingleTaskWithVariantsToUABot: sendSingleTaskWithVariantsToUABot,
    sendSingleTaskOnyInfo: sendSingleTaskOnyInfo,
    sendPaymentExpired: sendPaymentExpired,
    paymentMade: paymentMade,
    setFinishedCourse: setFinishedCourse,
    //ua bot methods
    sendSingleTaskWithVariantsForStartUABot: sendSingleTaskWithVariantsForStartUABot,
    sendServerMessageToUABot: sendServerMessageToUABot,
    sendServerMessageToRuBot: sendServerMessageToRuBot,

    //to gogovrika BOT!
    sendSingleTaskWithVariantsToGovorikaBot: sendSingleTaskWithVariantsToGovorikaBot,
    sendServerMessageToGovorikaBot: sendServerMessageToGovorikaBot
}



