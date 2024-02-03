const urlHelper = require("./urlHelper");
const axios = require('axios');


/* 
test task message method
*/

async function testTaskMessage (task) {
    const infoUrl = urlHelper.getInfoUrl();

    try {
        axios.post(infoUrl + '/taskInfoMessage', {
            task: task,
         })
            .then(res => {
                console.log("Сохранили Лог!");
            })
            .catch(error => {
                console.log("Потеряли Лог!");
        });
    } catch (error) {
        console.log("Потеряли Лог Глобально!" + error);
    }

}


/* 
 finish test task message method
*/

async function sendFeedbackMessage (clientInfo, feedbackText) {
    const infoUrl = urlHelper.getInfoUrl();

    try {
        axios.post(infoUrl + '/addFeddback', {
            feedbackText: feedbackText,
            clientInfo: clientInfo
         })
            .then(res => {
                console.log("Сохранили Лог!");
            })
            .catch(error => {
                console.log("Потеряли Лог!");
        });
    } catch (error) {
        console.log("Потеряли Лог Глобально!" + error);
    }

}

/* 
feedback message to info bot
*/





async function addMessageStatusToLoggerBot (clientName, taskName, status) {
    
    const infoUrl = urlHelper.getInfoUrl();
    try {
        axios.post(infoUrl + '/addNewMessage', {
            clientName: clientName,
            taskName: taskName,
            status: status,
            type: 'MessageForStatus'
         })
            .then(res => {
                // res.send("Скоро прийдут задачи");
                console.log("Сохранили Лог!");
    
            })
            .catch(error => {
                console.log("Потеряли Лог!");
                // res.send("FAILED + " + JSON.stringify(error));
        });
    } catch (error) {
        console.log("Потеряли Лог Глобально!" + error);
    }

}


async function addMessageTaskToLoggerBot (clientName, taskName) {
    
    const infoUrl = urlHelper.getInfoUrl();
    try {
        axios.post(infoUrl + '/addNewMessage', {
            clientName: clientName,
            taskName: taskName,
            type: 'TaskInfo'
         })
            .then(res => {
                // res.send("Скоро прийдут задачи");
                console.log("Сохранили Лог Про Отправку!!");
    
            })
            .catch(error => {
                console.log("Потеряли Лог! Про Отправку");
                // res.send("FAILED + " + JSON.stringify(error));
        });
    } catch (error) {
        console.log("Потеряли Лог Глобально!" + error);
    }

}

async function addMessagServerToLoggerBot (msg) {
    
    const infoUrl = urlHelper.getInfoUrl();


    try {
        axios.post(infoUrl + '/addNewMessage', {
            message: msg,
            type: 'ServerMesssage'
         })
            .then(res => {
                // res.send("Скоро прийдут задачи");
                console.log("Сохранили Лог Про Отправку!!");
    
            })
            .catch(error => {
                console.log("Потеряли Лог! Про Отправку");
                // res.send("FAILED + " + JSON.stringify(error));
        });
    } catch (error) {
        console.log("Потеряли Лог Глобально!" + error);
    }

}

module.exports = {
    addMessageStatusToLoggerBot: addMessageStatusToLoggerBot,
    addMessageTaskToLoggerBot: addMessageTaskToLoggerBot,
    addMessagServerToLoggerBot: addMessagServerToLoggerBot,
    testTaskMessage: testTaskMessage,
    sendFeedbackMessage: sendFeedbackMessage
};