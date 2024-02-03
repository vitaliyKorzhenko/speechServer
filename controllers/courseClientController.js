const CourseClients = require("../models").CourseClients;
const qs = require('qs');
const axios = require('axios');
const sendTaskHelper = require("../helpers/sendTaskHelper");
const { findClientStartAndEndDate, findActiveCoachesForCourseClient } = require("../services/coachesService");
const ClientMessages = require("../models").ClientMessages;
const ClientCoaches = require("../models").ClientCoaches;
const ClientModel = require("../models").Clients;
const CourseModel = require("../models").Courses;
const CoachModel = require("../models").Coaches;
const ClientsSchedulesModel = require("../models").ClientsSchedules;
// Create and Save a new User
exports.create = (req, res) => {
    // //console.log('------create course -------');
    // //console.log(req.body);
    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }
    if (!req.body.clientId) {
        res.status(400).send({
            message: "clientId can not be empty!"
        });
        return;
    }

    const courseClientData = {
        courseId: req.body.courseId,
        clientId: req.body.clientId,
        status: 'active',
        isActive: true
        //   id: uuid.v1()
        //   id: 1000
    };
    CourseClients.findOne({
            where: {
                courseId: req.body.courseId,
                clientId: req.body.clientId,
            },
            raw: true
        }).then(courseClient => {
           
            if (courseClient) {
                CourseClients.update({ isActive: true, status: 'active' }, {
                    where: {
                        id: courseClient.id,
                    }
                }).then(num => {
                    if (num == 1) {
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
            } else {
                CourseClients.create(courseClientData)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        //console.log('--CATCH---');
                        //console.log(err);
                        res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the courseClient."
                        });
                    });
            }

        }).catch(err => {
            
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the courseClient."
            });
        });
};

exports.addCoach = (req, res) => {
    if (!req.body.courseClientId) {
        res.status(400).send('courseClientId empty');
        return;
    }
    if (!req.body.coachId) {
        res.status(400).send('coachId empty');
        return;
    }
    ClientCoaches.findOne({
        where: {
            courseClientId: req.body.courseClientId,
            coachId: req.body.coachId
        },
        raw: true
    }).then(clientCoach => {
        if (clientCoach) {
            //console.log('------status now ---');
            //console.log(clientCoach);
            if (clientCoach.status == 'Active') {
                res.status(200).send(clientCoach);
            } else {
                //console.log('---go update status');
                ClientCoaches.update({ status: 'Active' }, {
                    where: {
                        courseClientId: req.body.courseClientId,
                        coachId: req.body.coachId
                    }
                })
                    .then(num => {
                        if (num == 1) {
                            res.send({
                                message: "Exercise was updated successfully."
                            });
                        } else {
                            res.send({
                                message: `Cannot update status Coach for client`
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: "Error updating Coach with"
                        });
                    });
            }
        } else {
            let newClientCoach = {
                coachId: req.body.coachId,
                courseClientId: req.body.courseClientId,
                status: 'Active'
            };
            ClientCoaches.create(newClientCoach).then(newItem => {
                res.status(200).send(newItem);
            }).catch(err => {
                res.status(400).send({ error: err });
                return;
            })
        }
    }).catch(err => {
        res.status(400).send({ error: err });
        return;
    });
}

exports.disableCoach = (req, res) => {
    //console.log('--disable coach---');
    //console.log(req.body);
    if (!req.body.courseClientId) {
        res.status(400).send('courseClientId empty');
        return;
    }
    if (!req.body.coachId) {
        res.status(400).send('coachId empty');
        return;
    }

    ClientCoaches.update({ status: 'NotActive' }, {
        where: {
            courseClientId: req.body.courseClientId,
            coachId: req.body.coachId
        }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Exercise was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update status Coach for client`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Coach with"
            });
        });
}


exports.findCoachesForClient = (req, res) => {
    // //console.log('---find coaches for client---');
    // //console.log(req.body);
    if (!req.body.courseClientId) {
        res.status(400).send('courseClientId empty');
        return;
    }
    ClientCoaches.findAll({
        where: {
            courseClientId: req.body.courseClientId
        },
        raw: true,
        include: [
            { model: CoachModel, as: 'Coach' }
        ],
    }).then(coaches => {
        res.status(200).send(coaches);
        return;
    }).catch(err => {
        //console.log('---errr');
        //console.log(err);
        res.status(400).send({ error: err });
    });
}

exports.findCourseClientsForCoach = (req, res) => {

    if (!req.body.coachId) {
        res.status(400).send('coachId empty');
        return;
    }
    ClientCoaches.findAll({
        where: {
            coachId: req.body.coachId,
            status: 'Active'
        },
        raw: true
    }).then(coaches => {
        res.status(200).send(coaches);
        return;
    }).catch(err => {
        res.status(400).send({ error: err });
    });
}
// Retrieve all Category from the database.
exports.findUserForCourse = (req, res) => {
    //////console.log('---FIND USERS FOR COURSE -------');
    // //////console.log(req);
    //////console.log(req.body);
    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }

    try {
        CourseClients.findAll({ where: 
            { courseId: req.body.courseId 
            },
             raw: true 
            })
            .then(data => {         //////console.log(data);
                res.send(data);
            })
            .catch(err => {
                //////console.log('RRRR FIND');
                //////console.log(err);
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }
    catch (e) {
        //////console.log('----GLOBAL ERROR -----');
        //////console.log(e);
    }
};



/*
  Find Active User in Course Govorika (another) for Coach

*/



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

 
/*For active client for coach */

exports.findActiveClientsForCoachInCourse = async (req, res) => {

    console.error("findActiveClientsForCoachInCourse", req.body);


    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }

    if (!req.body.coachId) {
        res.status(400).send({
            message: "coachId can not be empty!"
        });
        return;
    }

    const coachId = req.body.coachId;

    const courseId = req.body.courseId;

    // Find Active in Coaches Clients

    try {
        ClientCoaches.findAll({ 
            where: {
                coachId: coachId,
                status: 'Active'
            },
            include: [
                {
                    model: CourseClients,
                    where: {
                        courseId: courseId,
                        isActive: true
                    },
                    include: [
                        { 
                            model: ClientModel, as: 'Client'
                    
                        },
                        

                    ]
                },
            ],
            raw: true,
        })
            .then(async (data) => {     
                //Type of User how I need
                // activeInCourse : true chatId : "523802158" courseClientId : 234 createdAt : "2022-09-24T17:03:42.154Z" dateEnd : "27-09-2022" dateStart : "26-09-2022" email : "alex@gmail.com" firstName : "Alex" id : 141 lastName : "L" lessonNumber : 2 paymentDate : "27-10-2022" phone : "+3192312312312" role : "main" status : "active" textback_url : "" updatedAt : "2022-09-24T17:03:42.154Z" userIsfrozen : false
                let resultClients = [];
                console.log("------data----", data);
                if (data && data.length > 0) {
                    await Promise.all(data.map(async (element) => {
                        
                        let res = await findClientStartAndEndDate(element["CourseClient.id"]);

                        resultClients.push({
                            id: element["id"],
                            activeInCourse: true,
                            chatId: element["CourseClient.Client.chatId"],
                            courseClientId: element["CourseClient.id"],
                            userIsfrozen : false,
                            dateEnd :res ? formatDate(res.dateEnd) : "",
                            dateStart : res ? formatDate(res.dateStart) : "",
                            email: element["CourseClient.Client.email"],
                            firstName: element["CourseClient.Client.firstName"],
                            lastName: element["CourseClient.Client.lastName"],
                            lessonNumber: res ? res.lessonNumber : "",
                            paymentDate: element["CourseClient.paymentDate"],
                            phone: element["CourseClient.Client.phone"],
                            schedule: element && element["CourseClient.schedule"] ? JSON.parse(element["CourseClient.schedule"]) : []
                        });
                    })
                    )
                }

                  
                
                
                res.send(resultClients);
            })
            .catch(err => {
                console.log("SEQUELIZE CATCH", err);
                //////console.log('RRRR FIND');
                ////console.log(err);
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }
    catch (e) {
        console.err("findActiveClientsForCoachInCourse", + e);
    }
    
}



/*For archive client for coach */


exports.findActiveClientsForCoachArchiveInCourse = async (req, res) => {

    console.error("findActiveClientsForCoachInCourse", req.body);


    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }

    if (!req.body.coachId) {
        res.status(400).send({
            message: "coachId can not be empty!"
        });
        return;
    }

    const coachId = req.body.coachId;

    const courseId = req.body.courseId;

    // Find Active in Coaches Clients

    try {
        ClientCoaches.findAll({ 
            where: {
                coachId: coachId,
                status: 'Active'
            },
            include: [
                {
                    model: CourseClients,
                    where: {
                        courseId: courseId,
                        isActive: false
                    },
                    include: [
                        { 
                            model: ClientModel, as: 'Client'
                    
                        },
                        

                    ]
                },
            ],
            raw: true,
        })
            .then(async (data) => {     
                //Type of User how I need
                // activeInCourse : true chatId : "523802158" courseClientId : 234 createdAt : "2022-09-24T17:03:42.154Z" dateEnd : "27-09-2022" dateStart : "26-09-2022" email : "alex@gmail.com" firstName : "Alex" id : 141 lastName : "L" lessonNumber : 2 paymentDate : "27-10-2022" phone : "+3192312312312" role : "main" status : "active" textback_url : "" updatedAt : "2022-09-24T17:03:42.154Z" userIsfrozen : false
                let resultClients = [];
                console.log("------data----", data);
                if (data && data.length > 0) {
                    await Promise.all(data.map(async (element) => {
                        
                        let res = await findClientStartAndEndDate(element["CourseClient.id"]);

                        resultClients.push({
                            activeInCourse: true,
                            chatId: element["CourseClient.Client.chatId"],
                            courseClientId: element["CourseClient.id"],
                            userIsfrozen : false,
                            dateEnd :res ? formatDate(res.dateEnd) : "",
                            dateStart : res ? formatDate(res.dateStart) : "",
                            email: element["CourseClient.Client.email"],
                            firstName: element["CourseClient.Client.firstName"],
                            lastName: element["CourseClient.Client.lastName"],
                            lessonNumber: res ? res.lessonNumber : "",
                            paymentDate: element["CourseClient.paymentDate"],
                            phone: element["CourseClient.Client.phone"],
                            
                        });
                    })
                    )
                }

                  
                
                
                res.send(resultClients);
            })
            .catch(err => {
                console.log("SEQUELIZE CATCH", err);
                //////console.log('RRRR FIND');
                ////console.log(err);
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }
    catch (e) {
        console.err("findActiveClientsForCoachInCourse", + e);
    }
    
}

/* 
findActiveClientsForCourse - 
*/

exports.findActiveClientsForCourse = async (req, res) => {

    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }
    const courseId = req.body.courseId;

    try {
        CourseClients.findAll({
            where: {
                courseId: courseId,
                isActive: true
            },
            include: [
                { 
                    model: ClientModel, as: 'Client'
                    
                },
            ],
            raw: true
        }).then(async (data) => {     
            //Type of User how I need
            // activeInCourse : true chatId : "523802158" courseClientId : 234 createdAt : "2022-09-24T17:03:42.154Z" dateEnd : "27-09-2022" dateStart : "26-09-2022" email : "alex@gmail.com" firstName : "Alex" id : 141 lastName : "L" lessonNumber : 2 paymentDate : "27-10-2022" phone : "+3192312312312" role : "main" status : "active" textback_url : "" updatedAt : "2022-09-24T17:03:42.154Z" userIsfrozen : false
            let resultClients = [];
            if (data && data.length > 0) {
                await Promise.all(data.map(async (element) => {
                    
                    let res = await findClientStartAndEndDate(element.id);
                    let resCoaches = await findActiveCoachesForCourseClient(element.id);
                    resultClients.push({
                        id: element["id"],
                        activeInCourse: true,
                        chatId: element["Client.chatId"],
                        courseClientId: element["id"],
                        userIsfrozen : false,
                        dateEnd :res ? formatDate(res.dateEnd) : "",
                        dateStart : res ? formatDate(res.dateStart) : "",
                        email: element["Client.email"],
                        firstName: element["Client.firstName"],
                        lastName: element["Client.lastName"],
                        lessonNumber: res ? res.lessonNumber : "",
                        paymentDate: element["paymentDate"],
                        phone: element["Client.phone"],
                        coaches: resCoaches,
                        schedule: element && element.schedule ? JSON.parse(element.schedule) : []
                    });
                })
                )
            }

              
            console.log("resultClients", resultClients)
            
            res.send(resultClients);
        })
        .catch(err => {
            console.log("SEQUELIZE CATCH", err);
            //////console.log('RRRR FIND');
            ////console.log(err);
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
        
    } catch (error) {
        
    }
}




/* 
findArchiveClientsForCourse - 
*/

exports.findArchiveClientsForCourse = async (req, res) => {

    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }
    const courseId = req.body.courseId;

    try {
        CourseClients.findAll({
            where: {
                courseId: courseId,
                isActive: false
            },
            include: [
                { 
                    model: ClientModel, as: 'Client'
            
                },
                

            ],
            raw: true
        }).then(async (data) => {     
            //Type of User how I need
            // activeInCourse : true chatId : "523802158" courseClientId : 234 createdAt : "2022-09-24T17:03:42.154Z" dateEnd : "27-09-2022" dateStart : "26-09-2022" email : "alex@gmail.com" firstName : "Alex" id : 141 lastName : "L" lessonNumber : 2 paymentDate : "27-10-2022" phone : "+3192312312312" role : "main" status : "active" textback_url : "" updatedAt : "2022-09-24T17:03:42.154Z" userIsfrozen : false
            let resultClients = [];
            console.log("------data course client full ----", data);
            if (data && data.length > 0) {
                await Promise.all(data.map(async (element) => {
                    
                    let res = await findClientStartAndEndDate(element.id);
                    let resCoaches = await findActiveCoachesForCourseClient(element.id);

                    resultClients.push({
                        id: element["id"],
                        activeInCourse: true,
                        chatId: element["Client.chatId"],
                        courseClientId: element["id"],
                        userIsfrozen : false,
                        dateEnd :res ? formatDate(res.dateEnd) : "",
                        dateStart : res ? formatDate(res.dateStart) : "",
                        email: element["Client.email"],
                        firstName: element["Client.firstName"],
                        lastName: element["Client.lastName"],
                        lessonNumber: res ? res.lessonNumber : "",
                        paymentDate: element["paymentDate"],
                        phone: element["Client.phone"],
                        coaches: resCoaches,
                    });
                })
                )
            }

              
            
            res.send(resultClients);
        })
        .catch(err => {
            console.log("SEQUELIZE CATCH", err);
            //////console.log('RRRR FIND');
            ////console.log(err);
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
        
    } catch (error) {
        
    }
}


/*
 clearMessage

*/

exports.clearMessage = (req, res) => {
    if (!req.body.client) {
        res.status(400).send('ошибка в информации о клиенте');
        return;
    }

    try {
        ClientMessages.destroy({
            where: {
                clientId: req.body.client.id,
                dailyPackageId: req.body.dailyTasks[0].packageId,
                status: 'active'
            },
        })
            .then(num => {
                res.status(200).send(true);
            })
            .catch(err => {
                res.status(200).send(true);

            });
    }
    catch (e) {
        res.status(200).send(true);

    }
}


exports.sendTaskToTG = (req, res) => {
    const url = "https://main.okk24.com/govorikaalfa/api/textback_message";

    const messages = [];
    req.body.dailyTasks && req.body.dailyTasks.forEach(element => {
        let splitText = element.textValue && typeof element.textValue !== 'undefined' ? element.textValue + '\n' : '';
        let currentCopyText = "Упражнение: " + element.name + '\n' + splitText + element.videoLink;
        messages.push(currentCopyText);
    });
    if (!req.body.client) {
        res.status(400).send('ошибка в информации о клиенте');
        return;
    }
    if (!req.body.client.textback_url || req.body.client.textback_url == '') {
        res.status(400).send('texback_url не найдет для этого клиента');
        return;
    }
    try {
        ClientMessages.findOne({
            where: {
                clientId: req.body.client.id,
                dailyPackageId: req.body.dailyTasks[0].packageId,
                status: 'active'
            },
            raw: true
        }).then(result => {
            if (result == null) {
                axios.post(url,
                    qs.stringify({
                        textback_url: req.body.client.textback_url, //gave the values directly for testing
                        password: 'lkafdjkl34sakjg5f',
                        force: false,
                        messages: messages
                    }), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then(function (response) {
                    ClientMessages.create({
                        clientId: req.body.client.id,
                        dailyPackageId: req.body.dailyTasks[0].packageId,
                        status: 'active'
                    })
                        .then(data => {
                            // res.send(data);
                            res.status(200).send(true);

                        })
                        .catch(err => {
                            res.status(200).send(true);
                        });
                }).catch(err => {
                    res.status(400).send(err);
                });

            } else {
                res.status(200).send(false);
            }
        }).catch(err => {
            res.status(400).send(err);
        });
    } catch (err) {
        res.status(400).send(err);

    }

}



exports.findAllCourseClients = (req, res) => {
    try {
        CourseClients.findAll(
            {
                where: { isActive: true },
                include: [
                    { model: ClientModel, as: 'Client' },
                    { model: CourseModel, as: 'Course' },
                ],
                raw: true
            },

        )
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }
    catch (e) {
        res.status(500).send({
            message:
                e.message || "Some error occurred while retrieving tutorials."
        });
    }
}



exports.findActiveUserForCourse = (req, res) => {
    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }

    try {
        CourseClients.findAll({ where: { courseId: req.body.courseId, isActive: true }, raw: true })
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }
    catch (e) {
        res.status(500).send({
            message:
                e.message || "Some error occurred while retrieving tutorials."
        });
    }
};


exports.pauseCourseForClient = (req, res) => {
    const client = req.body.client;
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    CourseClients.update({ isActive: false, status: 'not active' }, {
        where: {
            id: req.body.courseClientId,
        }
    })
        .then(num => {
            if (num == 1) {
                sendTaskHelper.sendPaymentExpired(client);
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
}

// deleteClientForCourse

/*
deleteClientForCourse
deleted client for course
*/

exports.deleteClientForCourse = (req, res) => {
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    CourseClients.destroy({
        where: {
            id: req.body.courseClientId,
        }
    }).then(() => {
        res.send({
            message: "CourseClients was destroyed successfully."
        });
    }).catch(err => {
        res.send({
            message:  "Error destroyed CourseClients with"
        });
    })
}

exports.pauseCourseForClient = (req, res) => {
    const client = req.body.client;
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    CourseClients.update({ isActive: false, status: 'not active' }, {
        where: {
            id: req.body.courseClientId,
        }
    })
        .then(num => {
            if (num == 1) {
                sendTaskHelper.sendPaymentExpired(client);
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
}


async function findCourseClientValue (courseClientId) {


    //TODO: ДЛЯ ЗАПУСКА РЕЧИ (хардкодить бред но пока так)
   
   let result = await CourseClients.findOne({
      where: {
          id: courseClientId,
      },
      raw: true
  }).then(clientData => {
      return clientData;
  }).catch(err => {
     return null;
  });
  return result;
  }

exports.unPauseCourseForClient = async (req, res) => {
   
    const client = req.body.client;
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }

    let currentCourseClient =  await findCourseClientValue(req.body.courseClientId);
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
      function parsePaymentDate (dateString) {
         const [day, month, year] = dateString.split('-');
         return new Date([month, day, year].join('/'));
        }
    try {
        //было
        // const date = currentCourseClient && currentCourseClient.paymentDate ? parsePaymentDate(currentCourseClient.paymentDate) : new Date();
        const date = currentCourseClient && currentCourseClient.paymentDate ? new Date() : new Date();

        var newDate = new Date(date.setMonth(date.getMonth()+ 1));
      CourseClients.update({ isActive: true, status: 'active', paymentDate: formatDate(newDate) }, {
          where: {
              id: req.body.courseClientId,
          }
      })
          .then(num => {
              if (num == 1) {
                  sendTaskHelper.paymentMade(client);
  
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
        console.log("unPauseCourseForClient,", error);
    }

}

exports.disableFrozenForClient = (req, res) => {

    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    CourseClients.update({ userIsfrozen: false }, {
        where: {
            id: req.body.courseClientId,
        }
    })
        .then(num => {
            if (num == 1) {
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
}


exports.updatePaymentDate = (req, res) => {

    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    if (!req.body.paymentDate) {
        res.status(400).send({
            message: "paymentDate can not be empty!"
        });
        return;
    }
    const paymentDate = req.body.paymentDate;
    const courseClientId = req.body.courseClientId;
    CourseClients.update({ paymentDate: paymentDate }, {
        where: {
            id: courseClientId,
        }
    })
        .then(num => {
            if (num == 1) {
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
}


// addSchedule
exports.addSchedule = (req, res) => {
    //and special token

    if (!req.body.token || req.body.token !== "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1") {
        res.status(400).send({
            message: "Permission denied"
        });
        return;
    }



    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    if (!req.body.coachId) {
        res.status(400).send({
            message: "coachId can not be empty!"
        });
        return;
    }
 
    if(!req.body.lessonTime) {
        res.status(400).send({
            message: "lessonTime can not be empty!"
        });
        return;
    }


    const scheduleData = {
        coachId: req.body.coachId,
        courseClientId: req.body.courseClientId,
        status: 'active',
        lessonTime: req.body.lessonTime
    };


    ClientsSchedulesModel.create(scheduleData)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the courseClient."
                        });
                    });
}

exports.findAllSchedule = (req, res) => {
    const name = req.query.name;
  
    ClientsSchedulesModel.findAll({ })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Schedule."
        });
      });
  };


  exports.addNewScheduleTimeToClient = (req, res) => {
    console.log("===REQ BODY ADD NEW SCHEDULE", req.body);
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }

    if (!req.body.schedule) {
        res.status(400).send({
            message: "schedule can not be empty!"
        });
        return;
    }
    const schedule = req.body.schedule;
    console.log("====SCHEDULE ====", schedule);

    CourseClients.update({ schedule: JSON.stringify(schedule) }, {
        where: {
            id: req.body.courseClientId,
        }
    })
        .then(num => {
            if (num == 1) {
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
  }





