const db = require("../models");
const CustomizeTask = require("../models").CustomizeTasks;
const Op = db.Sequelize.Op;
const sequelize = require('sequelize');
const { raw } = require("express");
const Categories = require("../models").Categories;
const CoursesModel = require('../models').Courses;
const Exercises = require("../models").Exercises;
const Blocks = require("../models").Blocks;
const BlockTasks = require("../models").BlockTasks;
const DaliyPackageModel = require("../models").DaliyPackages;
const ExecutionCourseModel = require("../models").ExecutionCourses;
const DaliyPackagesModel = require("../models").DaliyPackages;
const DaliyTasksModel = require("../models").DaliyTasks;
const ExerciseFiles = require("../models").ExerciseFiles;


const TGUsers = require("../models").TGUsers;

const CourseCategoriesModel = require("../models").CourseCategories;
const taskService = require("../services/taskService");

const urlHelper = require("../helpers/urlHelper");
const botLogger = require('../helpers/infoLogger');



const axios = require('axios');
const loggerBot = require("../helpers/infoLogger");


const sendTaskHelper = require('../helpers/sendTaskHelper');
const infoLogger = require("../helpers/infoLogger");
const { startNewPackage, findClientScheduleUseCourseClientId, startNewPackageForRUCourse } = require("../services/courseService");
const { getNextClassSchedule } = require("../services/scheduleService");
const { findGovorikaTgUser } = require("../helpers/govorikaUserHelper");

exports.findClientPackages = (req, res) => {
    if (!req.body.courseClientsIds) {
        res.status(400).send({
            message: "courseClientsIds can not be empty!"
        });
        return;
    }
    const ids = req.body.courseClientsIds;
    DaliyPackageModel.findAll({
        where: {
            courseClientId: {[Op.in]:ids},
            status: 'active'
        },
        raw:true

    }).then(data => {
        res.send(data);
        return;

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving tutorials."
        });
        return;
    });
}


 exports.create = (req, res) => {
    if (!req.body.name) {
        res.status(400).send({
            message: "name can not be empty!"
        });
        return;
    }
    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }
    if (!req.body.categoryId) {
        res.status(400).send({
            message: "categoryId can not be empty!"
        });
        return;
    }
    if (!req.body.exerciseId) {
        res.status(400).send({
            message: "taskId can not be empty!"
        });
        return;
    }


    // countForSuccess: DataTypes.INTEGER,
    // countForBlock: DataTypes.INTEGER,
    const customizeTask = {
        name: req.body.name,
        categoryId: req.body.categoryId,
        courseId: req.body.courseId,
        exerciseId: req.body.exerciseId,
        type: "primary",
        countForSuccess: req.body.countForSuccess ? req.body.countForSuccess : '60',
        countForBlock: req.body.countForBlock ? req.body.countForBlock : '1',
        number: 1,
        isBlocking: req.body.isBlocking 
    };

    CustomizeTask.findAll({
        where: { categoryId: req.body.categoryId, courseId: req.body.courseId },
        raw: true
    })
        .then(data => {
            if (typeof data !== 'undefined' && data.length > 0) {
                // the array is defined and has at least one element
                var maxNumber = Math.max.apply(Math, data.map(function (o) { return o.number; }));
                customizeTask.number = maxNumber + 1;
                CustomizeTask.create(customizeTask)
                    .then(data => {

                        res.send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while creating the User."
                        });
                    });
            } else {
                CustomizeTask.create(customizeTask)
                    .then(data => {

                        res.send(data);
                    })
                    .catch(err => {

                        res.status(500).send({
                            message: err.message || "Some error occurred while creating the User."
                        });
                    });
            }

        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};


exports.createBlockTask = (req, res) => {
    ////console.log('=====BLOCK TASK======');
    ////console.log(req.body);
    if (!req.body.name) {
        res.status(400).send({
            message: "name can not be empty!"
        });
        return;
    }
    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }
    if (!req.body.categoryId) {
        res.status(400).send({
            message: "categoryId can not be empty!"
        });
        return;
    }
    if (!req.body.exerciseId) {
        res.status(400).send({
            message: "taskId can not be empty!"
        });
        return;
    }

    if (!req.body.blockId) {
        res.status(400).send({
            message: "blockId can not be empty!"
        });
        return;
    }



    const customizeTask = {
        name: req.body.name,
        categoryId: req.body.categoryId,
        courseId: req.body.courseId,
        exerciseId: req.body.exerciseId,
        type: "block",
        countForCancel: req.body.countForCancel ? req.body.countForCancel : 0,
        countForSuccess: req.body.countForSuccess ? req.body.countForSuccess : null,
        number: 0
    };

    let blockTasks = {
        blockId: req.body.blockId,
        taskId: 0,
        number: 1
    }

    CustomizeTask.create(customizeTask, { raw: true })
        .then(data => {


            blockTasks.taskId = data.id;
            BlockTasks.findOne({ where: { blockId: req.body.blockId, taskId: data.id } }).then(data => {
                if (data) {
                    res.status(400).send({
                        message:
                            "blockId + taskId, is unique"
                    });
                } else {

                    BlockTasks.findAll({
                        where: { blockId: req.body.blockId },
                        raw: true
                    })
                        .then(data => {
                            if (typeof data !== 'undefined' && data.length > 0) {
                                // the array is defined and has at least one element
                                var maxNumber = Math.max.apply(Math, data.map(function (o) { return o.number; }));
                                blockTasks.number = maxNumber + 1;
                                BlockTasks.create(blockTasks)
                                    .then(data => {
                                        res.send(data);
                                    })
                                    .catch(err => {
                                        res.status(500).send({
                                            message: err.message || "Some error occurred while creating the User."
                                        });
                                    });
                            } else {
                                BlockTasks.create(blockTasks)
                                    .then(data => {
                                        res.send(data);
                                    })
                                    .catch(err => {
                                        res.status(500).send({
                                            message: err.message || "Some error occurred while creating the User."
                                        });
                                    });
                            }

                        })
                        .catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while retrieving tutorials."
                            });
                        });

                }

            }).catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving tutorials."
                });
            });





        })
        .catch(err => {
            ////////console.log("Catch create ");
            ////////console.log(err);
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        });
};




exports.findTaskForCategory = (req, res) => {
    if (!req.body.category) {
        res.status(400).send({
            message: "category can not be empty!"
        });
        return;
    }

    const category = req.body.category;

    CustomizeTask.findAll({
        where: {
            categoryId: category
        },
        include: [
            { model: Categories, as: 'Category' },
            { model: Exercises, as: 'Exercise' },
            { model: Blocks, as: 'Blocks' },
        ]
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};


exports.findTaskForCourse = (req, res) => {
    if (!req.body.courseId) {
        res.status(400).send({
            message: "category can not be empty!"
        });
        return;
    }

    const courseId = req.body.courseId;

    CustomizeTask.findAll({
        where: {
            courseId: courseId,
            // type: "primary"
        },
        include: [
            { model: Categories, as: 'Category' },
            { model: Exercises, as: 'Exercise' },
        ]
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};






exports.delete = (req, res) => {
    if (!req.body.id) {
        res.status(400).send({
            message: "Id can not be empty!"
        });
        return;
    }
    try {
        CustomizeTask.destroy({
            where: { id: req.body.id }
        })
            .then(num => {

                if (num == 1) {
                    res.send({
                        message: "CustomizeTask was destroy successfully."
                    });
                } else {
                    res.send({
                        message: `Cannot  destroy with id=${id}. Maybe CustomizeTask was not found or req.body is empty!`
                    });
                }
            })
            .catch(err => {
                ////////console.log('----DESTROY CATCH-------');
                res.status(500).send({
                    message: "Error destroy with id=" + req.body.id
                });
            });
    }
    catch (e) {
        ////////console.log('----GLOBAL CATCH-------');
        ////////console.log(JSON.stringify(e));
    }


};



exports.forwardTask = (req, res) => {
    if (!req.body.firstId) {
        res.status(400).send({
            message: "firstId can not be empty!"
        });
        return;
    }
    if (!req.body.secondId) {
        res.status(400).send({
            message: "secondId can not be empty!"
        });
        return;
    }
    if (!req.body.firstNumber) {
        res.status(400).send({
            message: "firstNumber can not be empty!"
        });
        return;
    }
    if (!req.body.secondNumber) {
        res.status(400).send({
            message: "firstNumber can not be empty!"
        });
        return;
    }
    // res.send('dsfsdf');

    CustomizeTask.update(
        { number: req.body.firstNumber },
        { where: { id: req.body.firstId } }
    )
        .then(result => {
            CustomizeTask.update(
                { number: req.body.secondNumber },
                { where: { id: req.body.secondId } }
            )
                .then(result => {
                    res.send('updated success');

                }
                )
                .catch(err => {

                }
                );
        }
        )
        .catch(err => {

        }
        );
};



exports.forwardBlockTask = (req, res) => {

    if (!req.body.firstId) {
        res.status(400).send({
            message: "firstId can not be empty!"
        });
        return;
    }
    if (!req.body.secondId) {
        res.status(400).send({
            message: "secondId can not be empty!"
        });
        return;
    }
    if (!req.body.firstNumber) {
        res.status(400).send({
            message: "firstNumber can not be empty!"
        });
        return;
    }
    if (!req.body.secondNumber) {
        res.status(400).send({
            message: "firstNumber can not be empty!"
        });
        return;
    }
    // res.send('dsfsdf');

    BlockTasks.update(
        { number: req.body.firstNumber },
        { where: { id: req.body.firstId } }
    )
        .then(result => {
            BlockTasks.update(
                { number: req.body.secondNumber },
                { where: { id: req.body.secondId } }
            )
                .then(result => {
                    res.send('updated success');

                }
                )
                .catch(err => {

                }
                );
        }
        )
        .catch(err => {

        }
        );
};


exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    CustomizeTask.findAll({
        where: condition,
        include: [
            { model: Categories, as: 'Category' },
            { model: Exercises, as: 'Exercise' },
            // { model: Blocks, as: 'Blocks' },
        ]
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};



//find all 

exports.findAllWithCourses = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    CustomizeTask.findAll({
        where: condition,
        include: [
            { model: CoursesModel, as: 'Course' },
            { model: Exercises, as: 'Exercise' },
            // { model: Blocks, as: 'Blocks' },
        ]
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};



exports.update = (req, res) => {
    const id = req.body.id;

    if (!req.body.name) {
        res.status(400).send({
            message: "name can not be empty!"
        });
        return;
    }
    if (!req.body.courseId) {
        res.status(400).send({
            message: "courseId can not be empty!"
        });
        return;
    }
    if (!req.body.categoryId) {
        res.status(400).send({
            message: "categoryId can not be empty!"
        });
        return;
    }
    if (!req.body.exerciseId) {
        res.status(400).send({
            message: "taskId can not be empty!"
        });
        return;
    }


    CustomizeTask.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "CustomizeTask was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${id}. Maybe CustomizeTask was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating CustomizeTask with id=" + id
            });
        });

};

exports.findUserStart = async (req, res) => {

    const courseClientId = req.body.courseClientId;
    DaliyPackagesModel.findAll(
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

          res.send({
            dateStart: minElement ? minElement.createdAt : "", 
            dateEnd: maxElement ? maxElement.createdAt : "", 
            lessonNumber: packages && packages.length > 0 ? packages.length : 0 });
        }).catch(err => {
            console.error(err);
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving findUserStart."
          });
        });
   
}


exports.findUserPackage = async (req, res) => {
    function checkServiceError(result) {
        if (result.error) {
            res.send([]);
            return;
        }
    }
    

    let findDailyTasksResult = await taskService.findFullDailyTasks(req.body.packageId);
    checkServiceError(findDailyTasksResult);
    try {
        let dailyTasks = [];
        findDailyTasksResult.data.forEach(element => {
          
            // //console.log(element);
            let fullTask = element.CustomizeTask;
            let taskElemet = fullTask.Exercise;

            dailyTasks.push({
                name: element.name,
                videoLink: taskElemet.videoLink,
                // taskId: taskElemet.taskId,
                dailyTaskId: element.id,
                packageId: element.dailyPackageId,
                status: element.status,
                duration: taskElemet.duration,
                number: element.number,
                textValue: taskElemet.textValue ? taskElemet.textValue : "",
                coachInfo: taskElemet.coachInfo ? taskElemet.coachInfo : "",
                linksText: taskElemet.linksText ? taskElemet.linksText : "",

            });
        });
      
        dailyTasks.sort((a, b) => a.number - b.number);
        //console.log(dailyTasks);
        res.send({dailyTasks: dailyTasks ? dailyTasks: [] , number: 1});

        // res.send(dailyTasks);
    } catch (e) {
        //console.log('---CATCH FIND DAILY TASKS ---');
        //console.log(e);
        res.send({dailyTasks:  [] , number: 1});

    }
}

exports.findDailyPackage = async (req, res) => {

    console.debug("===FIND DAILY PACKAGE ======");
  

    let dailyPackageDuration = 10;
    
    function checkServiceError(result) {
        if (result.error) {
            res.send([]);
            return;
        }
    }


    async function createDailyPackageWithTasks (body, currentDailyTasks) {

        let findNewPackageTasksRest = await taskService.findNewPackageTasks(req.body.courseId, req.body.courseClientId, currentDailyTasks);

      

        let createDailyPackageResult = await taskService.createDailyPackage(body.courseClientId);
        checkServiceError(createDailyPackageResult);
        ////////console.log(createDailyPackageResult);
        let taskList = [];
        var taskIds = [];
        findNewPackageTasksRest.forEach(element => {
            taskList.push({
                name: element.name,
                status: 'active',
                taskId: element.taskId,
                dailyPackageId: createDailyPackageResult.data.id,
                number: element.number
            });
            taskIds.push(element.taskId);
        });
        
        //
       
        let fullTasksResult =  await taskService.findAllFullUseIdsCustomizeTasks(taskIds, req.body.courseId);
        let fullTasks = fullTasksResult && fullTasksResult.data ?  fullTasksResult.data  : [];



        let createDailyTaskListResult = await taskService.createDailyTasks(taskList);
        checkServiceError(createDailyTaskListResult);
        let dailyTasks = [];
        const parsedDailyTasks = createDailyTaskListResult.data;
       
        try {
            parsedDailyTasks.forEach(element => {
                let taskElemet = findNewPackageTasksRest.find((x) => x.taskId == element.taskId);
                let fullTask = fullTasks.find((x) => x.id == element.taskId);
               
                dailyTasks.push({
                    name: taskElemet.name,
                    videoLink: taskElemet.videoLink,
                    taskId: taskElemet.taskId,
                    dailyTaskId: element.id,
                    packageId: element.dailyPackageId,
                    status: element.status,
                    duration: taskElemet.duration,
                    number: taskElemet.number,
                    textValue: fullTask && fullTask.Exercise ? fullTask.Exercise.textValue : '',
                    coachInfo: fullTask  && fullTask.Exercise ? fullTask.Exercise.coachInfo : ''
    
                });
            });
          
            dailyTasks.sort((a, b) => a.number - b.number);
    
            // res.send(dailyTasks);
    
            if (req.body.useBlocks) {
                let taskIds = dailyTasks.map(x => x.taskId);
                let blocksResult = await taskService.findBlocksForTasks(taskIds);
                checkServiceError(blocksResult);
                ////////console.log(blocksResult);
                let resDailyTasks = [];
                dailyTasks.forEach(element => {
                    let blocks = blocksResult.data.filter(x => x.taskId == element.taskId);
                    element.blocks = blocks;
                    resDailyTasks.push(element);
                });
    
                resDailyTasks.sort((a, b) => a.number - b.number);
               
                return resDailyTasks
            } else {
                dailyTasks.sort((a, b) => a.number - b.number);
                return dailyTasks;
            }
        } catch (e) {
            //console.log('---CATCH FIND DAILY TASKS ---');
            //console.log(e);
            return [];
        }
  
    }


 let dailyPackageResult = await taskService.findActiveDailyPackage(req.body.courseClientId);
    ////console.log('------daily Package Result---------');
    ////console.log(dailyPackageResult);
    //Check Error
    checkServiceError(dailyPackageResult);
    
  let countPackages = await taskService.countDailyPackage(req.body.courseClientId);
    checkServiceError(countPackages);
   

    let currentDailyPackage = dailyPackageResult.data;
    if (currentDailyPackage) {
        // console.log('----У НАС ЕСТЬ ДНЕВНОЙ БЛОК И МЫ ПРОСТО ЕГО ПОКАЗЫВАЕМ!');
        let findDailyTasksResult = await taskService.findDailyTasks(currentDailyPackage.id);
       
        checkServiceError(findDailyTasksResult);
        if (req.body.useBlocks) {
            let taskIds = findDailyTasksResult.data.map(x => x.taskId);
            let blocksResult = await taskService.findBlocksForTasks(taskIds);
            checkServiceError(blocksResult);
            ////////console.log(blocksResult);
            let resDailyTasks = [];
            findDailyTasksResult.data.forEach(element => {
                let blocks = blocksResult.data.filter(x => x.taskId == element.taskId);
                element.blocks = blocks;
                resDailyTasks.push(element);
            });
            
            resDailyTasks.sort((a, b) => a.number - b.number);
            res.send({dailyTasks: resDailyTasks, number: countPackages.data});
        } else {
            res.send({dailyTasks: findDailyTasksResult.data, number: countPackages.data});
        }
    } else {
        let findLastPackageResult = await taskService.findLastPackage(req.body.courseClientId);
        checkServiceError(findLastPackageResult);
        if (findLastPackageResult.data) {
            let findDailyTasksResult = await taskService.findFullDailyTasks(findLastPackageResult.data.id);
            checkServiceError(findDailyTasksResult);
            let resultDailyTasks = await createDailyPackageWithTasks(req.body, findDailyTasksResult.data);
            resultDailyTasks.sort((a, b) => a.number - b.number);

            // let clientIsForzen;

            // let executionCourseResult = await taskService.findExecutionCourseForTask(
            //     req.body.courseClientId,
            //     req.body.taskId);
            // checkServiceError(executionCourseResult);


            res.send({dailyTasks: resultDailyTasks, number: countPackages.data + 1});

      
        } else {
            let resultDailyTasks = await createDailyPackageWithTasks(req.body, []);
            res.send({dailyTasks: resultDailyTasks, number: countPackages.data + 1});
        }

    }
}







//============= NEW FIND DALY PACKAGE

exports.findDailyPackageWithDuration = async (req, res) => {

    console.debug("===FIND DAILY PACKAGE ======");
    console.debug(req.body);

    let dailyPackageDuration = 10;
    
    function checkServiceError(result) {
        if (result.error) {
            res.send([]);
            return;
        }
    }


    //=========== create DAILY PACKAGE WITH TASKS
    async function createDailyPackageWithTasks (body, currentDailyTasks) {


        // console.log('--------body-----', body);

        let findNewPackageTasksRest = await taskService.findNewPackageTasksUseDuration(req.body.courseId,req.body.duration, req.body.courseClientId, currentDailyTasks);

      

        let createDailyPackageResult = await taskService.createDailyPackage(body.courseClientId);
        checkServiceError(createDailyPackageResult);
        ////////console.log(createDailyPackageResult);
        let taskList = [];
        var taskIds = [];
        findNewPackageTasksRest.forEach(element => {
            taskList.push({
                name: element.name,
                status: 'active',
                taskId: element.taskId,
                dailyPackageId: createDailyPackageResult.data.id,
                number: element.number
            });
            taskIds.push(element.taskId);
        });
        
        //
       
        let fullTasksResult =  await taskService.findAllFullUseIdsCustomizeTasks(taskIds, req.body.courseId);
        let fullTasks = fullTasksResult && fullTasksResult.data ?  fullTasksResult.data  : [];



        let createDailyTaskListResult = await taskService.createDailyTasks(taskList);
        checkServiceError(createDailyTaskListResult);
        let dailyTasks = [];
        const parsedDailyTasks = createDailyTaskListResult.data;
       
        try {
            parsedDailyTasks.forEach(element => {
                let taskElemet = findNewPackageTasksRest.find((x) => x.taskId == element.taskId);
                // console.log('------task Element', taskElemet);
                let fullTask = fullTasks.find((x) => x.id == element.taskId);
               
                dailyTasks.push({
                    name: taskElemet.name,
                    videoLink: taskElemet.videoLink,
                    taskId: taskElemet.taskId,
                    dailyTaskId: element.id,
                    packageId: element.dailyPackageId,
                    status: element.status,
                    duration: taskElemet.duration,
                    number: taskElemet.number,
                    textValue: fullTask && fullTask.Exercise ? fullTask.Exercise.textValue : '',
                    coachInfo: fullTask  && fullTask.Exercise ? fullTask.Exercise.coachInfo : '',
                    linksText: taskElemet.linksText &&  taskElemet.linksText.length > 0 ? taskElemet.linksText : null
                });
            });
          
            dailyTasks.sort((a, b) => a.number - b.number);
    
            // res.send(dailyTasks);
    
            if (req.body.useBlocks) {
                let taskIds = dailyTasks.map(x => x.taskId);
                let blocksResult = await taskService.findBlocksForTasks(taskIds);
                checkServiceError(blocksResult);
                ////////console.log(blocksResult);
                let resDailyTasks = [];
                dailyTasks.forEach(element => {
                    let blocks = blocksResult.data.filter(x => x.taskId == element.taskId);
                    element.blocks = blocks;
                    resDailyTasks.push(element);
                });
    
                resDailyTasks.sort((a, b) => a.number - b.number);
               
                return resDailyTasks
            } else {
                dailyTasks.sort((a, b) => a.number - b.number);
                return dailyTasks;
            }
        } catch (e) {
            //console.log('---CATCH FIND DAILY TASKS ---');
            //console.log(e);
            return [];
        }
  
    }




    //=========== create DAILY PACKAGE WITH TASKS



 let dailyPackageResult = await taskService.findActiveDailyPackage(req.body.courseClientId);
    ////console.log('------daily Package Result---------');
    ////console.log(dailyPackageResult);
    //Check Error
    checkServiceError(dailyPackageResult);
    
  let countPackages = await taskService.countDailyPackage(req.body.courseClientId);
    checkServiceError(countPackages);
   

    let currentDailyPackage = dailyPackageResult.data;
    if (currentDailyPackage) {
        console.log('----У НАС ЕСТЬ ДНЕВНОЙ БЛОК И МЫ ПРОСТО ЕГО ПОКАЗЫВАЕМ!');
        let findDailyTasksResult = await taskService.findDailyTasks(currentDailyPackage.id);
       
        checkServiceError(findDailyTasksResult);
        if (req.body.useBlocks) {
            let taskIds = findDailyTasksResult.data.map(x => x.taskId);
            let blocksResult = await taskService.findBlocksForTasks(taskIds);
            checkServiceError(blocksResult);
            ////////console.log(blocksResult);
            let resDailyTasks = [];
            findDailyTasksResult.data.forEach(element => {
                let blocks = blocksResult.data.filter(x => x.taskId == element.taskId);
                element.blocks = blocks;
                resDailyTasks.push(element);
            });
            
            resDailyTasks.sort((a, b) => a.number - b.number);
            res.send({dailyTasks: resDailyTasks, number: countPackages.data});
        } else {
            res.send({dailyTasks: findDailyTasksResult.data, number: countPackages.data});
        }
    } else {
        let findLastPackageResult = await taskService.findLastPackage(req.body.courseClientId);
        checkServiceError(findLastPackageResult);
        if (findLastPackageResult.data) {
            let findDailyTasksResult = await taskService.findFullDailyTasks(findLastPackageResult.data.id);
            checkServiceError(findDailyTasksResult);
            let resultDailyTasks = await createDailyPackageWithTasks(req.body, findDailyTasksResult.data);
            resultDailyTasks.sort((a, b) => a.number - b.number);
            res.send({dailyTasks: resultDailyTasks, number: countPackages.data + 1});

      
        } else {
            let resultDailyTasks = await createDailyPackageWithTasks(req.body, []);
            res.send({dailyTasks: resultDailyTasks, number: countPackages.data + 1});
        }

    }
}


// Find all published Tutorials
exports.findDailyTask = (req, res) => {

    console.debug('====FIND DAILY TASK=======');
    ////////console.log('---DAILY TASK-----');
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    let startPosition = 1;
    let dailyPackageDuration = 10;

    DaliyPackageModel.findOne({
        where: {
            courseClientId: req.body.courseClientId,
            status: 'active'
        },
        raw: true
    }).then(package => {
        //WE HAVE PACKGE -> GO FIND PACKAGE DATA!!!
        if (package) {
            ////////console.log('---hmm return package data------');
            ////////console.log(package);


            DaliyTasksModel.findAll({
                where: {
                    dailyPackageId: package.id
                },
                include: [
                    {
                        model: CustomizeTask,
                        where: {
                            type: 'primary'
                        },
                        include: [
                            { model: Exercises, as: 'Exercise' },
                            // { model: Blocks, as: 'Blocks' },
                        ]
                    },
                ],
            }).then(tasks => {
                ////////console.log('-------taksks----');
                const parsedTasks = tasks.map((node) => node.get({ plain: true }));
                ////////console.log(parsedTasks);
                dailyTasks = [];
                console.log('----parsed tasks----');
                console.log(parsedTasks);
                parsedTasks.forEach(element => {
                    dailyTasks.push({
                        name: element.name,
                        videoLink: element.CustomizeTask.Exercise.videoLink,
                        textValue: element.CustomizeTask.Exercise.textValue,
                        taskId: element.CustomizeTask.id,
                        executionCourseId: '0', //??? it's problem we don't have this id?????
                        dailyTaskId: element.id,
                        packageId: element.dailyPackageId,
                        status: element.status
                    });
                });
                res.send(dailyTasks);

            }).catch(err => {
                ////////console.log(err);
            });
        } else {
            let findLastPackageResult = taskService.findLastPackage(req.body.courseClientId);
            checkServiceError(findLastPackageResult);
            ////////console.log('FIND LAT PACKAGE RESULT -----');
            ////////console.log(findLastPackageResult);
            if (findLastPackageResult) {
                ////////console.log('-----FIND NEW DATA TASK! PACKAGE FINISHED --------');
                res.send([{ name: 'NEW NEW NEW ', status: 'active' }]);
            } else {
                ExecutionCourseModel.findAll({
                    limit: 10,
                    where: {
                        number: {
                            [Op.gt]: startPosition
                        },
                        courseClientId: req.body.courseClientId
                    },
                    include: [
                        {
                            model: CustomizeTask,
                            where: {
                                type: 'primary'
                            },
                            include: [
                                { model: Exercises, as: 'Exercise' },
                                // { model: Blocks, as: 'Blocks' },
                            ]
                        },
                    ],
                    // raw: true
                }).then(tasks => {
                    const parsedTasks = tasks.map((node) => node.get({ plain: true }));
                    //   ////////console.log(parsedTasks);
                    if (parsedTasks && parsedTasks.length > 0) {
                        let fullDuration = 0;
                        let result = [];
                        for (let element of parsedTasks) {
                            if (element.CustomizeTask.Exercise.duration + fullDuration > dailyPackageDuration) {
                                break;
                            } else {
                                result.push({
                                    name: element.CustomizeTask.name,
                                    videoLink: element.CustomizeTask.Exercise.videoLink,
                                    taskId: element.CustomizeTask.id,
                                    executionCourseId: element.id
                                });
                            }
                        }
                        ////////console.log('----start create -------');
                        try {
                            DaliyPackagesModel.create({
                                status: 'active',
                                name: 'package-> ' + new Date().toLocaleDateString(),
                                courseClientId: req.body.courseClientId
                            }, { raw: true }).then(dailyPackage => {
                                ////////console.log('-----daily package---');
                                //   ////////console.log(dailyPackage);
                                let packageId = dailyPackage ? dailyPackage.dataValues.id : 0;
                                ////////console.log(packageId);
                                let taskList = [];
                                result.forEach(element => {
                                    taskList.push({
                                        name: element.name,
                                        status: 'active',
                                        taskId: element.taskId,
                                        dailyPackageId: packageId
                                    });
                                });
                                ////////console.log('---taks list--');
                                ////////console.log(taskList);
                                DaliyTasksModel.bulkCreate(taskList, { returning: true, raw: true })
                                    .then(function (values) {
                                        ////////console.log('----values ---');
                                        // ////////console.log(values);
                                        //FINISHED PARSED TASK WITH FORMAT
                                        let dailyTasks = [];
                                        const parsedDailyTasks = values.map((node) => node.get({ plain: true }));
                                        ////////console.log('---parsed daliy tasks-----');
                                        ////////console.log(parsedDailyTasks);
                                        parsedDailyTasks.forEach(element => {
                                            let taskElemet = result.find((x) => x.taskId == element.taskId);
                                            console.log("---TASK element", taskElemet);
                                            dailyTasks.push({
                                                name: taskElemet.name,
                                                videoLink: taskElemet.CustomizeTask.Exercise.videoLink,
                                                textValue: taskElemet.CustomizeTask.Exercise.textValue,
                                                taskId: taskElemet.taskId,
                                                executionCourseId: taskElemet.executionCourseId,
                                                dailyTaskId: element.id,
                                                packageId: element.dailyPackageId,
                                                status: element.status
                                            });
                                        });
                                        ////////console.log('------daliy Tasks -------');
                                        ////////console.log(dailyTasks);

                                        res.send(dailyTasks);
                                    }).catch(function (error) {
                                        ////////console.log('-----error---');
                                        ////////console.log(error);
                                        res.status(500).send({
                                            message:
                                                error.message || "Some error occurred while retrieving bulkCreate."
                                        });
                                    });

                            }).catch(err => {
                                ////////console.log('hmmm catch----');
                                ////////console.log(err);
                                res.send([]);
                            });
                        } catch (e) {
                            ////////console.log(e);
                            ////////console.log('GLOBSAL ERROR:' + JSON.stringify(e));
                        }


                    } else {
                        res.status(200).send([]);
                    }
                }).catch(err => {

                });

            }
            //WE FIST POSITION 



        }
    }).catch(err => {
        ////////console.log('----ERROR-----');
        ////////console.log(err);
    });

};



exports.moveTask = async (req, res) => {
    // console.log("======= MOVE TASK ============", req.body);
    if (!req.body.categoryId) {
        res.status(400).send({
            message: "categoryId can not be empty!"
        });
        return;
    }
    if (!req.body.number) {
        res.status(400).send({
            message: "number can not be empty!"
        });
        return;
    }

    if (!req.body.id) {
        res.status(400).send({
            message: "id can not be empty!"
        });
        return;
    }
    console.log("start update");
    try {
        var values = {number: req.body.number + 1};
var condition = { where :{id: req.body.id} }; 

            CustomizeTask.update({
                number: db.Sequelize.literal('number + 1')
            }, {
                where: {
                    number: {
                        [Op.gt]: req.body.number
                    },
                    categoryId: req.body.categoryId
                }
            }).then(result => {
                CustomizeTask.update(values, condition).then(result => {
                    console.log('update first', result);
                    //bulk update all CustomizeTasks where number >= req.body.number
                res.send(true);
            }
            ).catch(err => {
                console.log(err);
                res.send(false);
            });
        }).catch(err => {
            console.log(err);
            res.send(false);
        }); 
    }
    catch (e) {
        console.log(e);
        res.send(false);
    }


 }






exports.updateDaliyTaskStatus = async (req, res) => {
    //console.log("======= UPDATE DAILY TASK STATUS ============");
    //console.log(req.body);

    function checkServiceError(result) {
        if (result.error) {
            res.send([]);
            return;
        }
    }
    //TODO-> to service
    async function checkFinish() {
        let checkFinishedResult = await taskService.checkDailyPackageFinished(req.body.packageId);
        if (checkFinishedResult.error) {
            return checkFinishedResult;
        }
        ////////console.log('----check finishe ----');
        ////////console.log(checkFinishedResult);
        //need finished
        if (checkFinishedResult.data) {
            let finishedPackageResult = await taskService.finishedDailyPackage(req.body.packageId);
            ////////console.log(finishedPackageResult);
            return finishedPackageResult;
        }
        return true;
    }

    ////////console.log('---update aily tasks----');
    ////////console.log(req.body);
    const id = req.body.id;
    if (!req.body.id) {
        res.status(400).send({
            message: "Id can not be empty!"
        });
        return;
    }
    if (!req.body.status) {
        res.status(400).send({
            message: "Status can not be empty!"
        });
        return;
    }
    let status = req.body.status;
    let customizeTaskResult = await taskService.findCustomizeTaskForId(req.body.taskId);
    checkServiceError(customizeTaskResult);
    let currentCustomizeTask = customizeTaskResult.data;
    // если задание выполнено! УСПЕШНО!
    if (status == 'success') {
        ////////console.log('----update dauily Task');

        let updateDialyTaskResult = await taskService.updateDaliyTaskStatus({ id: id, status: 'success', blockId: 0 });
        ////////console.log(updateDialyTaskResult);
        checkServiceError(updateDialyTaskResult);
        let executionCourseResult = await taskService.findExecutionCourseForTask(
            req.body.courseClientId,
            req.body.taskId);
        checkServiceError(executionCourseResult);
        ////////console.log(executionCourseResult);
        let currentExecutionCourse = executionCourseResult.data;
        if (currentExecutionCourse) {
            //GO update
            ////////console.log('------ GO UPDATE ---------');
            let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                id: currentExecutionCourse.id,
                taskId: req.body.taskId,
                courseClientId: req.body.courseClientId,
                success: currentExecutionCourse.success + 1,
                attempts: currentExecutionCourse.attempts + 1,
                statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                errorInOrder: 0
            });
            checkServiceError(updateExecutionCourseResult);
        } else {
            //GO Create
            let createExecutionCourseResult = await taskService.createExecutionCourse({
                taskId: req.body.taskId,
                courseClientId: req.body.courseClientId,
                error: 0,
                success: 1,
                attempts: 1,
                statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                errorInOrder: 0

            });
            checkServiceError(createExecutionCourseResult);
        }
        let checkFinishRes = await checkFinish();
        checkServiceError(checkFinishRes);
        res.send(true);
    } else {
        if (status == 'error') {
            ////////console.log('--------ERROR HMMM UPDATE--------');
            let updateDialyTaskResult = await taskService.updateDaliyTaskStatus({ id: id, status: 'error', blockId: req.body.blockId });
            ////////console.log(updateDialyTaskResult);
            checkServiceError(updateDialyTaskResult);
            let executionCourseResult = await taskService.findExecutionCourseForTask(
                req.body.courseClientId,
                req.body.taskId);
            checkServiceError(executionCourseResult);
            ////////console.log(executionCourseResult);
            let currentExecutionCourse = executionCourseResult.data;
            //console.log('--EXECUTION CORUS-----', currentExecutionCourse);
            if (currentExecutionCourse) {
                //GO update
                ////////console.log('------    GO UPDATE ---------');
                let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                    id: currentExecutionCourse.id,
                    taskId: req.body.taskId,
                    courseClientId: req.body.courseClientId,
                    error: currentExecutionCourse.error + 1,
                    attempts: currentExecutionCourse.attempts + 1,
                    statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                    errorInOrder: currentExecutionCourse.errorInOrder + 1
                });
                checkServiceError(updateExecutionCourseResult);

                if (currentExecutionCourse.errorInOrder + 1 > 4) {
                    //тогда наш клиент завис!
                    let frozenClientResult = await taskService.frozenClient(
                        {
                            courseClientId: req.body.courseClientId
                        }
                    )
                }

            } else {
                //GO Create
                let createExecutionCourseResult = await taskService.createExecutionCourse({
                    taskId: req.body.taskId,
                    courseClientId: req.body.courseClientId,
                    error: 1,
                    success: 0,
                    attempts: 1,
                    number: currentCustomizeTask.number,
                    statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                    errorInOrder: 1

                });
                checkServiceError(createExecutionCourseResult);
            }
            let checkFinishRes = await checkFinish();
            checkServiceError(checkFinishRes);
            res.send(true);
        }
        else {
            res.status(401).send({
                message: "Status not correct!"
            });
        }
    }


};


exports.createExecutionCourse = (req, res) => {
    ////////console.log('------create execution course -----');
    ////////console.log(req.body);
    //if count success not empty!
    if (!typeof req.body.success) {
        res.status(400).send({
            message: "success can not be empty!"
        });
        return;
    }
    if (!typeof req.body.error) {
        ////////console.log('--hmm empty error');
        res.status(400).send({
            message: "error can not be empty!"
        });
        return;
    }
    if (!req.body.taskId) {
        res.status(400).send({
            message: "taskId can not be empty!"
        });
        return;
    }
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }

    let executionCourse = {
        success: req.body.success,
        error: req.body.error,
        attempts: req.body.success + req.body.error,
        taskId: req.body.taskId,
        courseClientId: req.body.courseClientId,
        number: req.body.number ? req.body.number : 1,
        status: req.body.status ? req.body.status : 'Active',
        statusCode: req.body.statusCode ? req.body.statusCode : 0

    }
    ExecutionCourseModel.create(executionCourse)
        .then(data => {

            res.send(data);
        })
        .catch(err => {
            ////////console.log("Catch create ");
            ////////console.log(err);
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        });
}


exports.updateExecutionCourse = (req, res) => {
    ////////console.log('----update execution course ------');
    ////////console.log(req.body);
    if (!req.body.id) {
        res.status(400).send({
            message: "id can not be empty!"
        });
        return;
    }
    ExecutionCourseModel.update(req.body, {
        where: { id: req.body.id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "ExecutionCourseModel was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${id}. Maybe ExecutionCourseModel was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating ExecutionCourseModel with id=" + id
            });
        });
}
exports.findExecutionCourseForClient = (req, res) => {
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    ExecutionCourseModel.findAll({
        where: { courseClientId: req.body.courseClientId },

    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
}

exports.historyClient = async (req, res) => {
  
    ////////console.log('-----history client -------');
    ////////console.log(req.body);
    function checkServiceError(result) {
        ////////console.log('====RESULT ======');
        ////////console.log(result);
        if (result.error) {
            res.send([]);
            return;
        }
    }

    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    let historyResult = await taskService.historyClientPackage(req.body.courseClientId);
    ////////console.log(historyResult);
    ////////console.log(historyResult);
    checkServiceError(historyResult);
    res.send(historyResult.data);
}

exports.clearClientCourse = async (req, res) => {
    function checkServiceError(result) {
        ////////console.log('====RESULT ======');
        ////////console.log(result);
        if (result.error) {
            res.send([]);
            return;
        }
    }

    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    let result = await taskService.clearClientCourse(req.body.courseClientId);
    ////////console.log(historyResult);
    checkServiceError(result);
    res.send(result.data);
}

exports.refreshDailyPackage = async (req, res) => {
    function checkServiceError(result) {
        if (result.error) {
            res.send([]);
            return;
        }
    }
    if (!req.body.courseClientId) {
        res.status(400).send({
            message: "courseClientId can not be empty!"
        });
        return;
    }
    let result = await taskService.refreshActiveDailyPackage(req.body.courseClientId);
    checkServiceError(result);
    res.send(result.data);
}




exports.addVideoUrlToTask = async (req, res) => {

    console.log('----add video url to taks----');
    console.log(req.body);
    if (!req.body.id) {
        res.status(400).send({
            message: "id can not be empty!"
        });
        return;
    }

    const dailyTaskId =  req.body.id;
    
    const videoAnswer = req.body.videoAnswer;

    const packageId  = req.body.packageId;

    console.log('---package id', packageId);

    DaliyTasksModel.update({videoAnswer: videoAnswer}, {
        where: { id: dailyTaskId }
    })
        .then(num => {
            if (num == 1) {


                DaliyTasksModel.findAll({
                    where: {
                        dailyPackageId: packageId
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
                    ////////console.log('-------taksks----');
                    const parsedTasks = tasks.map((node) => node.get({ plain: true }));
                    ////////console.log(parsedTasks);

                    var newTask;
                    parsedTasks.forEach(element => {
                        if (!element.videoAnswer) {
                            if (!newTask) {
                                newTask = element;
                            } else {
                                if (newTask.number > element.number) {
                                    newTask = element;
                                }
                            }
                        }
                    });

                    const baseUrl = urlHelper.getBaseUrl();
                    
                    //отправляем запрос с одной задачей которую мы найдем!
            
                    res.send("дал запрос запрос на отправку сообщений");
                    if (newTask) {

                    const parsedNewTask = {
                        number: newTask.number,
                        id: newTask.id,
                        packageId: newTask.dailyPackageId,
                        status: newTask.status,
                        name: newTask.name,
                        dailyTaskId: newTask.id,
                        textValue: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.textValue : "",
                        videoLink: newTask && newTask.CustomizeTask && newTask.CustomizeTask.Exercise ? newTask.CustomizeTask.Exercise.videoLink : null,
                    }

                        axios.post(baseUrl + '/sendSingleLesson', {
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
                    }
                   
            
                }).catch(err => {
                    console.log("FAILED" + err);
                    // res.send("FAILED + " + JSON.stringify(err));
                });
                
            } else {
                res.send({
                    message: `Cannot update User with id=${id}. Maybe CustomizeTask was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating CustomizeTask with id=" + id
            });
        });

    
}



//PACKAGE!!

async function findPackage(packageId) {
    let result = await DaliyPackageModel.findOne({
        where: {
            id: packageId,
        },
        raw: true
    }).then(package => {
        return package;
    }).catch(err => {
        return null;
    });
    return result;
}


//DAILY TASk

async function findDailyTask(dailyTaskId) {
    let result = await DaliyTasksModel.findOne({
        where: {
            id: dailyTaskId,
        },
        raw: true
    }).then(task => {
        return task;
    }).catch(err => {
        return null;
    });
    return result;
}


async function getTgUser (chatId) {
    let currentChatId = String(chatId);
    let client = await TGUsers.findOne({
      where: {
        chatId: currentChatId
      },
      raw: true
    }).then(clientData => {
      return clientData;
    }).catch(err=> {
      return null;
    });
  
    return client;
  }



//   sendSingleTaskWithVariants
exports.addStatusToTask = async (req, res) => {

    if (!req.body.id) {
        res.status(400).send({
            message: "id can not be empty!"
        });
        return;
    }
    const currentChatId = req.body.chatId;

    const dailyTaskId = req.body.id;

    const status = req.body.status;

    const packageId = req.body.packageId;

    const blockId =  req.body.blockId;

    // console.log('---package id', packageId);

    let package = await findPackage(packageId);

    // console.log("package", package);

    let courseClientId = package.courseClientId;

    let dailyTask = await findDailyTask(dailyTaskId);

    let taskId = dailyTask.taskId;

    let customizeTaskResult = await taskService.findCustomizeTaskForId(taskId);
    let currentCustomizeTask = customizeTaskResult.data;
    const currentUser = await getTgUser(currentChatId);
   
    loggerBot.addMessageStatusToLoggerBot(currentUser.firstName + currentUser.lastName + currentUser.phone, dailyTask.name, status);
    // если задание выполнено! УСПЕШНО!
    if (dailyTask.status == 'success' || dailyTask.status == 'error') {
        //UPDATE==============
        DaliyTasksModel.update({ status: status, blockId: blockId }, {
            where: { id: dailyTaskId }
        })
            .then(num => {
                if (num == 1) {
    
                    res.send("дал запрос запрос на отправку сообщений");
    
                } else {
                    res.send({
                        message: `Cannot update`
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({
                    message: "Error updating CustomizeTask with id=" 
                });
            });

    } else {
        if (status == 'success') {
            let executionCourseResult = await taskService.findExecutionCourseForTask(
                courseClientId,
                taskId);
            
            
    
            let currentExecutionCourse = executionCourseResult.data;
            
            if (currentExecutionCourse) {
                //GO update
                ////////console.log('------ GO UPDATE ---------');
                let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                    id: currentExecutionCourse.id,
                    taskId: taskId,
                    courseClientId: courseClientId,
                    success: currentExecutionCourse.success + 1,
                    attempts: currentExecutionCourse.attempts + 1,
                    statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                    errorInOrder: 0
                });
            } else {
                //GO Create
                let createExecutionCourseResult = await taskService.createExecutionCourse({
                    taskId: taskId,
                    courseClientId: courseClientId,
                    error: 0,
                    success: 1,
                    attempts: 1,
                    statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                    errorInOrder: 0
    
                });
            }
           
        } else {
            if (status == 'error') {
              
                let executionCourseResult = await taskService.findExecutionCourseForTask(
                    courseClientId,
                    taskId);
                ////////console.log(executionCourseResult);
                let currentExecutionCourse = executionCourseResult.data;
                //console.log('--EXECUTION CORUS-----', currentExecutionCourse);
                if (currentExecutionCourse) {
                    //GO update
                    ////////console.log('------    GO UPDATE ---------');
                    let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                        id: currentExecutionCourse.id,
                        taskId: taskId,
                        courseClientId: courseClientId,
                        error: currentExecutionCourse.error + 1,
                        attempts: currentExecutionCourse.attempts + 1,
                        statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                        errorInOrder: currentExecutionCourse.errorInOrder + 1
                    });
    
                } else {
                    //GO Create
                    let createExecutionCourseResult = await taskService.createExecutionCourse({
                        taskId: taskId,
                        courseClientId: courseClientId,
                        error: 1,
                        success: 0,
                        attempts: 1,
                        number: currentCustomizeTask.number,
                        statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                        errorInOrder: 1
    
                    });
                }
    
            }
        }
    
    
    
        DaliyTasksModel.update({ status: status, blockId: blockId }, {
            where: { id: dailyTaskId }
        })
            .then(num => {
                if (num == 1) {
    
    
                    DaliyTasksModel.findAll({
                        where: {
                            dailyPackageId: packageId
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
                    }).then(async (tasks) => {
                        ////////console.log('-------taksks----');
                        const parsedTasks = tasks.map((node) => node.get({ plain: true }));
                        ////////console.log(parsedTasks);
    
                        var newTask;
                        parsedTasks.forEach(element => {
                            if (element.status == 'active') {
                                if (!newTask) {
                                    newTask = element;
                                } else {
                                    if (newTask.number > element.number) {
                                        newTask = element;
                                    }
                                }
                            }
                        });
    
                        const baseUrl = urlHelper.getBaseUrl();
    
                        //отправляем запрос с одной задачей которую мы найдем!
    
                        res.send("дал запрос запрос на отправку сообщений");
                        //отправили с вариантами!
    
                        //используем!!! ФУНКЦИЮ!
                        if (newTask){
                            sendTaskHelper.sendSingleTaskWithVariants(currentUser, newTask);
                        } else {
                                console.log('current package', package);
                                if (package && package.status == 'expired') {
                                    console.log('EXPIRED PACKAGE WE NEED NEW!!!');
                                    startNewPackageForRUCourse(courseClientId);
                                    // startNewPackage(courseClientId);
                                } else {
                                    const clientSchedule = await findClientScheduleUseCourseClientId(courseClientId);
                                    console.log('clientSchedule', clientSchedule);
                                    if (clientSchedule) {
                                        sendTaskHelper.sendServerMessageToRuBot(currentUser.chatId, getNextClassSchedule(clientSchedule, true));
                                    }
                                }
                        }
                    }).catch(err => {
                        console.log("FAILED" + err);
                        // res.send("FAILED + " + JSON.stringify(err));
                    });
    
                } else {
                    res.send({
                        message: `Cannot update`
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({
                    message: "Error updating CustomizeTask with id=" 
                });
            });
    }
 


}


//   sendSingleTaskWithVariants
exports.addStatusToUATask = async (req, res) => {

    if (!req.body.id) {
        res.status(400).send({
            message: "id can not be empty!"
        });
        return;
    }
    const currentChatId = req.body.chatId;

    const dailyTaskId = req.body.id;

    const status = req.body.status;

    const packageId = req.body.packageId;

    const blockId =  req.body.blockId;

    // console.log('---package id', packageId);

    let package = await findPackage(packageId);

    // console.log("package", package);

    let courseClientId = package.courseClientId;

    let dailyTask = await findDailyTask(dailyTaskId);

    let taskId = dailyTask.taskId;

    let customizeTaskResult = await taskService.findCustomizeTaskForId(taskId);
    let currentCustomizeTask = customizeTaskResult.data;
    const currentUser = await getTgUser(currentChatId);
   
    loggerBot.addMessageStatusToLoggerBot(currentUser.firstName + currentUser.lastName + currentUser.phone, dailyTask.name, status);
    // если задание выполнено! УСПЕШНО!
    if (dailyTask.status == 'success' || dailyTask.status == 'error') {
        //UPDATE==============
        DaliyTasksModel.update({ status: status, blockId: blockId }, {
            where: { id: dailyTaskId }
        })
            .then(num => {
                if (num == 1) {
    
                    res.send("дал запрос запрос на отправку сообщений");
    
                } else {
                    res.send({
                        message: `Cannot update`
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({
                    message: "Error updating CustomizeTask with id=" 
                });
            });

    } else {
        if (status == 'success') {
            let executionCourseResult = await taskService.findExecutionCourseForTask(
                courseClientId,
                taskId);
            
            
    
            let currentExecutionCourse = executionCourseResult.data;
            
            if (currentExecutionCourse) {
                //GO update
                ////////console.log('------ GO UPDATE ---------');
                let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                    id: currentExecutionCourse.id,
                    taskId: taskId,
                    courseClientId: courseClientId,
                    success: currentExecutionCourse.success + 1,
                    attempts: currentExecutionCourse.attempts + 1,
                    statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                    errorInOrder: 0
                });
            } else {
                //GO Create
                let createExecutionCourseResult = await taskService.createExecutionCourse({
                    taskId: taskId,
                    courseClientId: courseClientId,
                    error: 0,
                    success: 1,
                    attempts: 1,
                    statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                    errorInOrder: 0
    
                });
            }
           
        } else {
            if (status == 'error') {
              
                let executionCourseResult = await taskService.findExecutionCourseForTask(
                    courseClientId,
                    taskId);
                ////////console.log(executionCourseResult);
                let currentExecutionCourse = executionCourseResult.data;
                //console.log('--EXECUTION CORUS-----', currentExecutionCourse);
                if (currentExecutionCourse) {
                    //GO update
                    ////////console.log('------    GO UPDATE ---------');
                    let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                        id: currentExecutionCourse.id,
                        taskId: taskId,
                        courseClientId: courseClientId,
                        error: currentExecutionCourse.error + 1,
                        attempts: currentExecutionCourse.attempts + 1,
                        statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                        errorInOrder: currentExecutionCourse.errorInOrder + 1
                    });
    
                } else {
                    //GO Create
                    let createExecutionCourseResult = await taskService.createExecutionCourse({
                        taskId: taskId,
                        courseClientId: courseClientId,
                        error: 1,
                        success: 0,
                        attempts: 1,
                        number: currentCustomizeTask.number,
                        statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                        errorInOrder: 1
    
                    });
                }
    
            }
        }
    
    
    
        DaliyTasksModel.update({ status: status, blockId: blockId }, {
            where: { id: dailyTaskId }
        })
            .then(num => {
                if (num == 1) {
    
    
                    DaliyTasksModel.findAll({
                        where: {
                            dailyPackageId: packageId
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
                    }).then(async (tasks) => {
                        ////////console.log('-------taksks----');
                        const parsedTasks = tasks.map((node) => node.get({ plain: true }));
                        ////////console.log(parsedTasks);
    
                        var newTask;
                        parsedTasks.forEach(element => {
                            if (element.status == 'active') {
                                if (!newTask) {
                                    newTask = element;
                                } else {
                                    if (newTask.number > element.number) {
                                        newTask = element;
                                    }
                                }
                            }
                        });
    
                        const baseUrl = urlHelper.getBaseUrl();
    
                        //отправляем запрос с одной задачей которую мы найдем!
    
                        res.send("дал запрос запрос на отправку сообщений");
                        //отправили с вариантами!
    
                        //используем!!! ФУНКЦИЮ!
                        console.log('NEW TASK', newTask);
                        if (newTask){
                            //we have new task! and have active package!
                            sendTaskHelper.sendSingleTaskWithVariantsToUABot(currentUser, newTask);
                        } else {
                            console.log('current package', package);
                            if (package && package.status == 'expired') {
                                console.log('EXPIRED PACKAGE WE NEED NEW!!!');
                                startNewPackage(courseClientId);
                            } else {
                                const clientSchedule = await findClientScheduleUseCourseClientId(courseClientId);
                                console.log('clientSchedule', clientSchedule);
                                if (clientSchedule) {
                                    sendTaskHelper.sendServerMessageToUABot(currentUser.chatId, getNextClassSchedule(clientSchedule));
                                }
                                //send message for wait new task for your schedule!
                                // sendTaskHelper.sendSingleTaskWithVariantsToUABot(currentUser, newTask);
                            }
                        }
                    }).catch(err => {
                        console.log("FAILED" + err);
                        // res.send("FAILED + " + JSON.stringify(err));
                    });
    
                } else {
                    res.send({
                        message: `Cannot update`
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({
                    message: "Error updating CustomizeTask with id=" 
                });
            });
    }
}


exports.addStatusToGovorikaTask = async (req, res) => {

    if (!req.body.id) {
        res.status(400).send({
            message: "id can not be empty!"
        });
        return;
    }
    const currentChatId = req.body.chatId;

    const dailyTaskId = req.body.id;

    const status = req.body.status;

    const packageId = req.body.packageId;

    const blockId =  req.body.blockId;

    // console.log('---package id', packageId);

    let package = await findPackage(packageId);

    // console.log("package", package);

    let courseClientId = package.courseClientId;

    let dailyTask = await findDailyTask(dailyTaskId);

    let taskId = dailyTask.taskId;

    let customizeTaskResult = await taskService.findCustomizeTaskForId(taskId);
    let currentCustomizeTask = customizeTaskResult.data;
    const currentUser = await getTgUser(currentChatId);
   
    loggerBot.addMessageStatusToLoggerBot(currentUser.firstName + currentUser.lastName + currentUser.phone, dailyTask.name, status);
    // если задание выполнено! УСПЕШНО!
    if (dailyTask.status == 'success' || dailyTask.status == 'error') {
        //UPDATE==============
        DaliyTasksModel.update({ status: status, blockId: blockId }, {
            where: { id: dailyTaskId }
        })
            .then(num => {
                if (num == 1) {
    
                    res.send("дал запрос запрос на отправку сообщений");
    
                } else {
                    res.send({
                        message: `Cannot update`
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({
                    message: "Error updating CustomizeTask with id=" 
                });
            });

    } else {
        if (status == 'success') {
            let executionCourseResult = await taskService.findExecutionCourseForTask(
                courseClientId,
                taskId);
            
            
    
            let currentExecutionCourse = executionCourseResult.data;
            
            if (currentExecutionCourse) {
                //GO update
                ////////console.log('------ GO UPDATE ---------');
                let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                    id: currentExecutionCourse.id,
                    taskId: taskId,
                    courseClientId: courseClientId,
                    success: currentExecutionCourse.success + 1,
                    attempts: currentExecutionCourse.attempts + 1,
                    statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                    errorInOrder: 0
                });
            } else {
                //GO Create
                let createExecutionCourseResult = await taskService.createExecutionCourse({
                    taskId: taskId,
                    courseClientId: courseClientId,
                    error: 0,
                    success: 1,
                    attempts: 1,
                    statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                    errorInOrder: 0
    
                });
            }
           
        } else {
            if (status == 'error') {
              
                let executionCourseResult = await taskService.findExecutionCourseForTask(
                    courseClientId,
                    taskId);
                ////////console.log(executionCourseResult);
                let currentExecutionCourse = executionCourseResult.data;
                //console.log('--EXECUTION CORUS-----', currentExecutionCourse);
                if (currentExecutionCourse) {
                    //GO update
                    ////////console.log('------    GO UPDATE ---------');
                    let updateExecutionCourseResult = await taskService.updateExecutionCourse({
                        id: currentExecutionCourse.id,
                        taskId: taskId,
                        courseClientId: courseClientId,
                        error: currentExecutionCourse.error + 1,
                        attempts: currentExecutionCourse.attempts + 1,
                        statusCode: currentCustomizeTask.countForSuccess == (currentExecutionCourse.success + 1) ? 1 : 0,
                        errorInOrder: currentExecutionCourse.errorInOrder + 1
                    });
    
                } else {
                    //GO Create
                    let createExecutionCourseResult = await taskService.createExecutionCourse({
                        taskId: taskId,
                        courseClientId: courseClientId,
                        error: 1,
                        success: 0,
                        attempts: 1,
                        number: currentCustomizeTask.number,
                        statusCode: currentCustomizeTask.countForSuccess == 1 ? 1 : 0,
                        errorInOrder: 1
    
                    });
                }
    
            }
        }
    
    
    
        DaliyTasksModel.update({ status: status, blockId: blockId }, {
            where: { id: dailyTaskId }
        })
            .then(num => {
                if (num == 1) {
    
    
                    DaliyTasksModel.findAll({
                        where: {
                            dailyPackageId: packageId
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
                    }).then(async (tasks) => {
                        ////////console.log('-------taksks----');
                        const parsedTasks = tasks.map((node) => node.get({ plain: true }));
                        ////////console.log(parsedTasks);
    
                        var newTask;
                        parsedTasks.forEach(element => {
                            if (element.status == 'active') {
                                if (!newTask) {
                                    newTask = element;
                                } else {
                                    if (newTask.number > element.number) {
                                        newTask = element;
                                    }
                                }
                            }
                        });
    
    
                        //отправляем запрос с одной задачей которую мы найдем!
    
                        res.send("дал запрос запрос на отправку сообщений");
                        //отправили с вариантами!
    
                        //используем!!! ФУНКЦИЮ!
                        console.log('NEW TASK', newTask);
                        if (newTask){
                            //we have new task! and have active package!
                            sendTaskHelper.sendSingleTaskWithVariantsToGovorikaBot(currentUser, newTask);
                        } else {
                            console.log('current package', package);
                            if (package && package.status == 'expired') {
                                console.log('EXPIRED PACKAGE WE NEED NEW!!!');
                                startNewPackage(courseClientId);
                            } else {
                                const clientSchedule = await findClientScheduleUseCourseClientId(courseClientId);
                                console.log('clientSchedule', clientSchedule);
                                if (clientSchedule) {
                                    sendTaskHelper.sendServerMessageToGovorikaBot(currentUser.chatId, getNextClassSchedule(clientSchedule));
                                }
                                //send message for wait new task for your schedule!
                                // sendTaskHelper.sendSingleTaskWithVariantsToUABot(currentUser, newTask);
                            }
                        }
                    }).catch(err => {
                        console.log("FAILED" + err);
                        // res.send("FAILED + " + JSON.stringify(err));
                    });
    
                } else {
                    res.send({
                        message: `Cannot update`
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({
                    message: "Error updating CustomizeTask with id=" 
                });
            });
    }
}








exports.getCurrentClientTask = async (req, res) => {


    console.debug("====GET CURRENT CLIENT TASK====", req.body);

    if (!req.body.chatId) {
        res.status(400).send({
            message: "chatId can not be empty!"
        });
        return;
    }

    if (!req.body.dailyPackageId) {
        res.status(400).send({
            message: "dailyPackageId can not be empty!"
        });
        return;
    }

    const packageId = req.body.dailyPackageId;

    DaliyTasksModel.findAll({
        where: {
            dailyPackageId: packageId
        },
        include: [
            {
                model: CustomizeTask,
                where: {
                    type: 'primary'
                },
                include: [
                    { model: Exercises, as: 'Exercise' },
                    // { model: Blocks, as: 'Blocks' },
                ]
            },
        ],
    }).then(tasks => {
        ////////console.log('-------taksks----');
        const parsedTasks = tasks.map((node) => node.get({ plain: true }));
        ////////console.log(parsedTasks);
        const baseUrl = urlHelper.getBaseUrl();

        //отправляем запрос с одной задачей которую мы найдем!

        res.send("дал запрос запрос на отправку сообщений");
        axios.post(baseUrl + '/sendSingleLesson', {
            task: parsedTasks[0],
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
        console.log("FAILED" + err);
        // res.send("FAILED + " + JSON.stringify(err));
    });
}


exports.sendFullCourse = async ( req, res) => {
    if (!req.body.chatId) {
        res.status(400).send({
            message: "chatId can not be empty!"
        });
        return;
    }
    const tasks = await taskService.findAllCourseTasks(req.body.courseId);
    const currentChatId = req.body.chatId;
    const currentUser = await getTgUser(currentChatId);
    for (const task of tasks) {
        const result = await sendTaskHelper.sendSingleTaskOnyInfo(currentUser, task);
      }

    res.send(true);
}


exports.sendPartOfCourse = async ( req, res) => {
    if (!req.body.chatId) {
        res.status(400).send({
            message: "chatId can not be empty!"
        });
        return;
    }
    if (!req.body.startExercise) {
        res.status(400).send({
            message: "startExercise can not be empty!"
        });
        return;
    }
    if (!req.body.finishExercise) {
        res.status(400).send({
            message: "finishExercise can not be empty!"
        });
        return;
    }
    const startExercise = req.body.startExercise;
    const finishExercise = req.body.finishExercise;
    const tasks = await taskService.findAllCourseTasks(req.body.courseId);
    const start = tasks.findIndex(x => x.name == startExercise.name);
    const finish = tasks.findIndex(x => x.name == finishExercise.name);
    if (start > finish) {
        return;
    }
    console.log("======INDEXES=====", start, finish);
    const currentChatId = req.body.chatId;
    const currentUser = await getTgUser(currentChatId);
    let i = 0;
    botLogger.addMessagServerToLoggerBot("Начинаем рассылку Упражнений,Клиент: " + currentUser.firstName + ' ' + currentUser.lastName + ' ' +  currentUser.phone + " Первое Упражнение: " +  tasks[start].name)
    for (const task of tasks) {
        console.log('--index--', i);
        if (i>=start && i<=finish) {
            const result = await sendTaskHelper.sendSingleTaskOnyInfo(currentUser, task);

        }
        i++;
    }
    botLogger.addMessagServerToLoggerBot("Закочили рассылку Упражнений,Клиент: " + currentUser.firstName + ' ' + currentUser.lastName + ' ' + currentUser.phone + " Последнее Упражнение: " +  tasks[finish].name)

    res.send(true);
}



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

exports.sendTaskInfoToBot = async (req, res) => {
  
    if (!req.body.task) {
        res.status(400).send({
            message: "message can not be empty!"
        });
        return;
    }

    const task = req.body.task;

    console.log("====Task===", task);
        

            const parsedNewTask = {
                name: task.name,
                textValue: task.textValue ? task.textValue: "",
                videoLink: task.videoLink ? task.videoLink : null,
                linksText: task.linksText ? task.linksText : null,
                files: task.ExerciseFiles && task.ExerciseFiles.length > 0 ? task.ExerciseFiles : null
            }
            console.log("parsedNewTask", parsedNewTask);
            infoLogger.testTaskMessage(parsedNewTask);

        
       



    res.send(true);

}


exports.getCourseTasks = async ( req, res) => {
    const tasks = await taskService.findAllCourseTasks(req.body.courseId);
     res.send(tasks);
}
