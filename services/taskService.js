const CustomizeTask = require("../models").CustomizeTasks;
const CourseCategoriesModel = require("../models").CourseCategories;
const DaliyPackageModel = require("../models").DaliyPackages;
const DaliyTasksModel = require("../models").DaliyTasks;
const Exercises = require("../models").Exercises;
const Categories = require("../models").Categories;
const ExecutionCourseModel = require("../models").ExecutionCourses;
const Blocks = require("../models").Blocks;
const BlockTasks = require("../models").BlockTasks;
const CourseClients = require("../models").CourseClients;


const ExercisesFilesModel = require("../models").ExerciseFiles;


const { Op } = require('sequelize');

var Sequelize = require('sequelize');

function serviceError(err) {
    ////////////console.log("======== SERVICE ERROR =============" + JSON.stringify(err));
    return { error: true, errorMessage: err };
}

function serviceResult(result) {
    return { error: false, data: result };
}

// TODO SET COURSE ID
//courseID
async function getCourseCategories(courseId) {
    try {
        let result = await CourseCategoriesModel.findAll({
            where: {
                courseId: courseId
            },
            include: [
                { model: Categories, as: 'Category' }
             ]
        }).then(courseCategories => {
            const parsedRes = courseCategories.map((node) => node.get({ plain: true }));
            return serviceResult(parsedRes);
        }).catch(err => {
            return serviceError(err);
        });

        return result;
    } catch (error) {
        return serviceError(error);
    }

}

async function refreshActiveDailyPackage(courseClientId) {
    try {
        function serviceError(err) {
            ////////////console.log("======== SERVICE ERROR =============" + JSON.stringify(err));
            return { error: true, errorMessage: err };
        }

        function serviceResult(result) {
            return { error: false, data: result };
        }
        
        let result = await DaliyPackageModel.destroy({
            where: {
                courseClientId: courseClientId,
                status: 'active'
            },
            raw: true
        }).then(rowDeleted => {
            if (rowDeleted == 1) {
                return serviceResult(true);
            } else {
                return serviceResult (false);
            }
        }).catch(err => {
            return serviceError(err);
        });
        if (result.data) {
            let resFindLastOld = await findLastOldPackage(courseClientId);
            if (resFindLastOld) {
                if (resFindLastOld.data) {
                    if (resFindLastOld.data.max) {
                        let updateLastOldPackage = await updateLastOld(courseClientId, resFindLastOld.data.max);

                    }
                } 
            }
            return result;
        } else {
            return result;
        }
    } catch (err) {
        return serviceError(err);
    }
}

async function updateLastOld(courseClientId, createdAt) {
    try {
        let result = DaliyPackageModel.update({status: 'finished'}, {
            where: { 
                courseClientId: courseClientId,
                createdAt: createdAt
            }
        })
            .then(num => {
                return serviceResult(true);
            })
            .catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}


async function findLastOldPackage (courseClientId) {
  
    try {
        ////console.log('---GO FIND LAST DATA---');
       const result = await  DaliyPackageModel.findOne({
            where: {
                courseClientId: courseClientId,
                status: 'old'
            },
            attributes: ['courseClientId',[Sequelize.fn('max', Sequelize.col('createdAt')), 'max']],
            group: ['courseClientId'],
            raw: true,
          }).then(res => {
            ////console.log('------RESULT FIND WITH MAX CREATE ----');
            ////console.log(res);
            return serviceResult (res);
          }).catch(err => {
              ////console.log('---ERROR');
              ////console.log(err);
            return serviceError(err);
            });
        return result;
    } catch (err) {
        ////console.log('---GLOBAL ERROR ----');
        ////console.log(err);
        return serviceError(err);
    }
}



//find Daily Package For Client!
//findActiveDailyPackage (status: active)
async function findActiveDailyPackage(courseClientId) {
    try {
        let result = DaliyPackageModel.findOne({
            where: {
                courseClientId: courseClientId,
                status: 'active'
            },
            raw: true
        }).then(package => {
            return serviceResult(package);
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (err) {
        return serviceError(err);
    }
}


async function countDailyPackage(courseClientId) {
    try {
        let result = DaliyPackageModel.findAll({
            where: {
                courseClientId: courseClientId,
            },
            raw: true
        }).then(packages => {
            if (packages && packages.length > 0) {
                return serviceResult(packages.length);
            } else {
                return serviceResult(0);
            }
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (err) {
        return serviceError(err);
    }
}


async function findFullDailyTasks (packageId) {
    if (!packageId || packageId == 0 || packageId == "") {
        return serviceResult([]);
    } 
    try {
        let result = DaliyTasksModel.findAll({
            where: {
                dailyPackageId: packageId
            },
            include: [
                {
                    model: CustomizeTask,
                    include: [
                        { 
                            model: Exercises, as: 'Exercise'
                    
                        },
                        

                    ]
                },
            ]
        }).then(tasks => {
            const parsedDailyTasks = tasks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedDailyTasks);
        }).catch(error => {
            return serviceError(error);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function countErrorForTask (taskId) {
    try {
        let result = DaliyTasksModel.findAll({
            where: {
                taskId: taskId
            },
            
        }).then(tasks => {
            const parsedDailyTasks = tasks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedDailyTasks.length);
        }).catch(error => {
            return serviceError(error);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function findDailyTasks(packageId) {
    ////////////console.log("====================findDailyTasks===========");
    ////////////console.log(packageId);
    try {
        let result = DaliyTasksModel.findAll({
            where: {
                dailyPackageId: packageId
            },
            include: [
                {
                    model: CustomizeTask,
                    include: [
                        { 
                            model: Exercises, as: 'Exercise',
                            include: [
                                { model: ExercisesFilesModel, as: "ExerciseFiles" }
                            ]

                    },
                        

                    ]
                },
            ]
        }).then(tasks => {
            const parsedDailyTasks = tasks.map((node) => node.get({ plain: true }));
            let dailyTasks = [];
            parsedDailyTasks.forEach(element => {
                dailyTasks.push({
                    name: element.name,
                    videoAnswer: element.videoAnswer ? element.videoAnswer: null,
                    videoLink: element.CustomizeTask.Exercise.videoLink,
                    textValue: element.CustomizeTask.Exercise.textValue,
                    linksText: element.CustomizeTask.Exercise.linksText &&  element.CustomizeTask.Exercise.linksText.length > 0 ? element.CustomizeTask.Exercise.linksText : null,
                    coachInfo:  element.CustomizeTask && element.CustomizeTask.Exercise && element.CustomizeTask.Exercise.coachInfo ? element.CustomizeTask.Exercise.coachInfo : '',
                    taskId: element.taskId,
                    dailyTaskId: element.id,
                    packageId: element.dailyPackageId,
                    status: element.status,
                    duration: element.CustomizeTask.Exercise.duration,
                    number: element.number,
                    files:  element.CustomizeTask.Exercise.ExerciseFiles ?  element.CustomizeTask.Exercise.ExerciseFiles : []
                });
            });

            ////////////console.log(dailyTasks);
            return serviceResult(dailyTasks);
        }).catch(err => {
            return serviceError(err);
        });
        //return Promise
        return result;
    } catch (error) {
        return serviceError(err);
    }
}

async function findAllPrimaryCustomizeTasks(courseId) {
    try {
        let result = CustomizeTask.findAll({
            where: {
                type: 'primary',
                courseId: courseId
            },
            include: [
                { model: Exercises, as: 'Exercise' }
            ]
        }).then(tasks => {
            const parsedTasks = tasks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedTasks);

        }).catch(err => {
            return serviceError(err);

        });
        return result;
    } catch (error) {
        return serviceError(err);
    }
}


async function findAllFullUseIdsCustomizeTasks(ids, courseId) {
    try {
        let result = CustomizeTask.findAll({
            where: {
                id: {
                    [Op.in]: ids
                },
                courseId: courseId
            },
            include: [
                { model: Exercises, as: 'Exercise' }
            ]
        }).then(tasks => {
            const parsedTasks = tasks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedTasks);

        }).catch(err => {
            return serviceError(err);

        });
        return result;
    } catch (error) {
        return serviceError(err);
    }
}


async function findAllCustomizeTasksForCourse(courseId) {
    try {
        let result = CustomizeTask.findAll({
            where: {
                courseId: courseId
            },
            include: [
                { model: Exercises, as: 'Exercise' },
                { model: Categories, as: 'Category' },

            ]
        }).then(tasks => {
            const parsedTasks = tasks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedTasks);

        }).catch(err => {
            return serviceError(err);

        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}


//NEW CODE 

async function findFullCustomizeTaskForId(taskId) {
    
    try {
        let result = CustomizeTask.findOne({
            where: {
                id: taskId
            },
            include: [
                { model: Exercises, as: 'Exercise' },
                { model: Categories, as: 'Category' },

            ],
            raw: true
        }).then(task => {
            return task;
        }).catch(err => {
            return null;
        });
        return result;
    } catch (error) {
        return null;
    }
}
//-----------------------------------

async function findAllBlocks () {
    try {
        let result =  Blocks.findAll({
            include: [
                { model: BlockTasks, as: 'BlockTasks' },
            ]
        })
          .then(data => {
            const blocks = data.map((node) => node.get({ plain: true }));
            return serviceResult(blocks);
          })
          .catch(err => {
            return serviceError(err);
          });
          return result;
    } catch (err) {
        return serviceError(err);
   }
}
  

async function findExecutionTaskForCourse(courseClientId) {
    try {
        let result = ExecutionCourseModel.findAll({
            where: {
                courseClientId: courseClientId
            }
        })
          .then(data => {
            const tasks = data.map((node) => node.get({ plain: true }));
            return serviceResult(tasks);
          })
          .catch(err => {
            return serviceError(err);
          });
          return result;
    } catch (err) {
        return serviceError(err);
   }
}
   


async function findExecutionCourseForClient(courseClientId) {
    try {
        let result = ExecutionCourseModel.findAll({
            where: {
                courseClientId: courseClientId
            }
        }).then(executionCourse => {
            const parsedExecutionCourse = executionCourse.map((node) => node.get({ plain: true }));
            return serviceResult(parsedExecutionCourse);
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (error) {
        return serviceError(err);
    }
}


async function clearExecutionForBlock(courseClientId, taskIds) {
    try {
        let emptyStats = {
            success: 0,
            error: 0,
            attempts: 0,
            errorInOrder: 0
        }
        let result = ExecutionCourseModel.update(emptyStats,{
            where: {
                courseClientId: courseClientId,
                taskId: {
                    [Op.in]: taskIds
                },
            },
           
        }).then(res => {
            return true;
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (error) {
        return serviceError(err);
    }
}

async function frozenClient(courseClientId) { 
    CourseClients.update({userIsfrozen: true}, {
        where: {
            id: courseClientId,
         }
      })
        .then(num => {
          if (num == 1) {
            return true;

          } else {
            return serviceError(`Cannot update CourseClientst`);
          }
        })
        .catch(err => {
            return serviceError(err);
        })
}



async function findExecutionForDailyTask (courseClientId, taskId) {
    try {
        let result = ExecutionCourseModel.findOne({
            where: {
                courseClientId: courseClientId,
                taskId: taskId
            },
            raw: true
        }).then(executionCourse => {
            return serviceResult(executionCourse);
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (error) {
        return serviceError(err);
    }
}

async function createDailyPackage(courseClientId) {
    try {
        await updateDailyPackageStatus(courseClientId);
        let result = DaliyPackageModel.create({
            status: 'active',
            name: 'package-> ' + new Date().toISOString(),
            courseClientId: courseClientId
        }, { raw: true }).then(

            dailyPackage => {
              
                return serviceResult(dailyPackage);
            }).catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}


async function updateDailyPackageStatus(courseClientId) {
    try {
        let result = DaliyPackageModel.update({status: 'old'}, {
            where: { 
                courseClientId: courseClientId }
        })
            .then(num => {
                return serviceResult(true);
            })
            .catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function createDailyTasks(taskList) {
    ////////////console.log('TASK LIST---');
    ////////////console.log(taskList);
    try {
        let result = DaliyTasksModel.bulkCreate(taskList, { returning: true, raw: true })
            .then(values => {
                const parsedDailyTasks = values.map((node) => node.get({ plain: true }));
                return serviceResult(parsedDailyTasks);
            }
            ).catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function findBlocksForTasks(tasksIds) {
    try {
        let result = Blocks.findAll({
            where: {
                taskId: tasksIds
            }
        }).then(blocks => {
            const parsedBlocks = blocks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedBlocks);

        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (error) {
        return serviceError(err);
    }
}


async function updateDaliyTaskStatus(dailyTask) {

    try {
        let result = DaliyTasksModel.update(dailyTask, {
            where: { id: dailyTask.id }
        })
            .then(num => {
                ////////////console.log('---update status ---');
                ////////////console.log(num);
                if (num == 1) {
                    return serviceResult(true);
                } else {
                    return serviceError(`Cannot update `);
                }
            })
            .catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function updateExecutionCourse(executionCourse) {
    console.debug("updateExecutionCourse");
    console.log(executionCourse);
    try {
        let result = ExecutionCourseModel.update(executionCourse, {
            where: { id: executionCourse.id }
        })
            .then(num => {
                if (num == 1) {
                    return serviceResult(true);
                } else {
                    return serviceError(`Cannot update `);
                }
            })
            .catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}


async function findExecutionCourseForTask(courseClientId, taskId) {
    try {
        let result = ExecutionCourseModel.findOne({
            where: {
                courseClientId: courseClientId,
                taskId: taskId
            },
            raw: true
        }).then(executionCourse => {
            return serviceResult(executionCourse);
        }).catch(error => {
            return serviceError(error);

        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}


async function createExecutionCourse(executionCourse) {
    ////////////console.log('execution course --');
    ////////////console.log(executionCourse);
    try {
        let result = ExecutionCourseModel.create(executionCourse, { raw: true }).then(
            createdExCourse => {
                return serviceResult(createdExCourse);
            }).catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function findCustomizeTaskForId(taskId) {
    try {
        let result = CustomizeTask.findOne({
            where: {
                id: taskId
            },
            raw: true
        }).then(task => {
            return serviceResult(task);
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}





async function checkDailyPackageFinished(
    packageId
) {
    try {
        let result = DaliyTasksModel.findAll({
            where: {
                dailyPackageId: packageId,
                status: 'active'
            },
            raw: true
        }).then(tasks => {
            if (tasks && tasks.length > 0) {
                return serviceResult(false);
            } else {
                //if Empty Array, all task success or error!!! finishe package need
                return serviceResult(true);
            }
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function finishedDailyPackage(packageId) {
    try {
        let result = DaliyPackageModel.update({ id: packageId, status: 'finished' }, {
            where: { id: packageId }
        })
            .then(num => {
                if (num == 1) {
                    return serviceResult(true);
                } else {
                    return serviceError(`Cannot update `);
                }
            })
            .catch(err => {
                return serviceError(err);
            });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function findLastPackage(courseClientId) {
    try {
        let result  = DaliyPackageModel.findOne({
            where: {
                courseClientId: courseClientId,
                status: 'finished',
            },
            raw: true
        }).then(package => {
            return serviceResult(package);
        }).catch(err => {
            return serviceError(err);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}



//SUCCESS TEST 
async function checkSuccessTask (courseClientId, dailyTask) {
    ////////////console.log('----Daily Task ----');
   

    try {
        return dailyTask;
        // let resultExecutionCourseResult = await findExecutionCourseForTask (courseClientId, dailyTask.taskId);
        // if (resultExecutionCourseResult.error) {
        //     return serviceError(resultExecutionCourseResult.errorMessage);
        // }
        // let currentExecutionCourse = resultExecutionCourseResult.data;
        // ////////////console.log(currentExecutionCourse);
        // if (currentExecutionCourse.statusCode !== 1) {
        //     return dailyTask;
        // } else {
        //     let sortedPrimaryCutomizeTaskResult = await getSortedPrimaryCutomizeTask(4);
        //     ////////////console.log(sortedPrimaryCutomizeTaskResult);
        //     return dailyTask;
        // }        
    } catch (error) {
        return serviceError(error);
    }
}

//EROR TEST NEW
async function checkErrorTask (courseClientId, dailyTask) {
    try {
        return dailyTask;
    } catch (error) {
        return serviceError(error);
    }
}

async function getSortedPrimaryCutomizeTask (courseId) {
            ////////////console.log('---GO GO CREATE NEW DAILY PACKAGE ----');
            let courseCategoriesResult = await getCourseCategories();
            if (courseCategoriesResult.error) {
                return serviceResult(courseCategoriesResult.errorMessage);
            }
            courseCategoriesResult.data.sort((a, b) => a.number - b.number);
            let currentCourseCategories = courseCategoriesResult.data;
            let customizeTasksResult = await findAllPrimaryCustomizeTasks(courseId);
            if (customizeTasksResult.error) {
                return serviceResult(customizeTasksResult.errorMessage);
            }
            let currentCustomizeTasks = customizeTasksResult.data;
            let sortedCustomizeTasks = [];
            currentCourseCategories && currentCourseCategories.forEach(element => {
                let tasksInCategories = currentCustomizeTasks.filter(x => x.categoryId == element.categoryId);
                //sorted!
                tasksInCategories.sort((a, b) => a.number - b.number);
                sortedCustomizeTasks = sortedCustomizeTasks.concat(tasksInCategories);
            });
            ////////////console.log('-------sorted customize tasks---------');
            ////////////console.log(sortedCustomizeTasks);
            return sortedCustomizeTasks;
}

async function historyClientPackage (courseClientId) {
    ////////////console.log('-history client--');
    ////////////console.log(courseClientId);
   
    try {
        let result = DaliyPackageModel.findAll({
            where: {
                courseClientId: courseClientId
            },
            include: [
                { model: DaliyTasksModel, as: 'DailyTasks' }
            ]
        }).then(tasks => {
            const parsedTasks = tasks.map((node) => node.get({ plain: true }));
            return serviceResult(parsedTasks);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function clearClientCourse (courseClientId) {
    try {
        let clearExecution = await clearExecutionCourse(courseClientId);

        let result = DaliyPackageModel.destroy({
            where: {
                courseClientId: courseClientId
            }
        }).then(rowDeleted => {
            if (rowDeleted == 1) {
                return serviceResult (true);
            } else {
                return serviceError('error clear course');
            }
        }).catch(error => {
            return serviceError(error);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}



async function clearExecutionCourse (courseClientId) {
    try {
        let result = ExecutionCourseModel.destroy({
            where: {
                courseClientId: courseClientId
            }
        }).then(rowDeleted => {
            if (rowDeleted == 1) {
                return serviceResult (true);
            } else {
                return serviceError('error clear course');
            }
        }).catch(error => {
            return serviceError(error);
        });
        return result;
    } catch (error) {
        return serviceError(error);
    }
}

async function findNewPackageTasks (courseId, courseClientId, lastDailyTasks) {
    //console.log('-----last daily tasks ------');
    //console.log(lastDailyTasks);
    
    function checkDuration(currentDuration, task) {
        if (task.duration + currentDuration <= 10) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkCopy (currentTasks, newTask) {
        let check = currentTasks.find(x=> x.name == newTask.name);
        if (check) {
            return false;
        } else {
            return true;
        }
    }
   


    function createStopParentTaskID (lastDailyTasks, courseMap) {
        let result = [];
        lastDailyTasks.forEach(element => {
            let dailyTask = courseMap.find(x => x.taskId == element.taskId && x.type == 'blockTask');
            if (dailyTask) {
                let currentBlock = courseMap.find(x=> x.blockId == dailyTask.blockId);
                if (currentBlock) {
                    result.push({
                        taskId: currentBlock.taskId
                    });
                }
            }
        });
        return result;
    }

    function createBlockDailyTasks (lastDailyTasks, courseMap) {
        let result = [];
        lastDailyTasks.forEach(element => {
            let dailyTask = courseMap.find(x => x.taskId == element.taskId && x.type == 'blockTask');
            if (dailyTask) {
                let currentBlock = courseMap.find(x=> x.blockId == dailyTask.blockId);
                if (currentBlock) {
                    result.push({
                        taskId: currentBlock.taskId,
                        dailyTask: element
                    });
                }
            }
        });
        return result;
    }

    


    let courseMap = await getMapCourse(courseId);
    ////////////console.log('-------result -------');
    let executionCourseResult = await findExecutionCourseForClient(courseClientId);
    ////////////console.log('---execution course for client ');
    ////////////console.log(executionCourseResult);
    //get DATA
    let executionTasks = executionCourseResult.data;

    ////////////console.log('-----LAST DAILY TASKS --------');
    ////////////console.log(lastDailyTasks);

    //currentNumber!!
    let currentNumber = 1;
    //current Duration!
    let currentDuration = 0;

    let resultTaskList = [];

    let stopParentTasks = createStopParentTaskID(lastDailyTasks, courseMap);
    

//---------------HELPERS FUNCTIONS ----------------------------------------
      //FOR TYPE TASK
    function taskOverflowedDuration(currentDuration, currentTask) {
        if (currentTask.duration + currentDuration > 10) {
            return true;
        }
        return false;
    }

    function taskInStopArray (currentTask, stopArray) {
        let res = stopArray.find(x => x.taskId == currentTask.taskId);
        return res ? true : false;
    }

    function isTaskFinished (executionTask, currentTask) {
        if (executionTask && executionTask.success >= currentTask.countForSuccess) { 
            return true;
        } else {
            return false;
        }
    }

    function addNewTaskToResult (currentTask) {
        resultTaskList.push({
            name: currentTask.name,
            status: 'active',
            taskId: currentTask.taskId,
            number: currentNumber,
            videoLink: currentTask.videoLink,
            duration: currentTask.duration
        });
        currentDuration = currentDuration + currentTask.duration;
        currentNumber = currentNumber + 1;
    }

    function addNewBlockTaskToResult (currentBlockTask) {
        var duration = currentBlockTask.duration ? currentBlockTask.duration : currentBlockTask.dailyTask.CustomizeTask.Exercise.duration;

        resultTaskList.push({
            name:  currentBlockTask.name ? currentBlockTask.name : currentBlockTask.dailyTask.name,
            status: 'active',
            taskId: currentBlockTask.taskId ?  currentBlockTask.taskId: currentBlockTask.dailyTask.taskId,
            number: currentNumber,
            videoLink: currentBlockTask.videoLink ? currentBlockTask.videoLink : currentBlockTask.dailyTask.CustomizeTask.Exercise.videoLink,
            duration: duration
        });
        currentDuration = currentDuration + 1;
        currentNumber = currentNumber + 1;
    }

    function isCopyInResultTasks (currentTask) {
        //////console.log("======check copy ========");
        //////console.log(currentTask);
        let check = resultTaskList.find(x=> x.name == currentTask.name);
        if (check) {
            return true;
        } else {
            return false;
        }
    }
    try {

        let stopIfBlocking = false;
        //console.log('---course map----');
        //console.log(courseMap);

        for (let indexCourse = 0; indexCourse < courseMap.length; indexCourse ++) {
            if (stopIfBlocking || currentDuration >= 10) {
                break;
            }
            if (courseMap[indexCourse].type == 'task') {
                //IF IN STOP LIST
                // if (taskInStopArray(element[indexCourse], stopParentTasks)) {
                //     continue;
                // }
                // IF DURATION IS BIG
                if(!taskInStopArray(courseMap[indexCourse], stopParentTasks)) {
                    if (taskOverflowedDuration(courseMap[indexCourse], currentDuration)) {
                        continue;
                    }
    
                    // ЕСЛИ КОПИЯ ТО ИДЕМ ДАЛЬШЕ НИЧЕГО НЕ ДЕЛАЕМ!!!
                    if(isCopyInResultTasks(courseMap[indexCourse])) {
                        continue;
                    }
                    //МЫ ПОЛУЧАЕМ СЛЕПОК НА КАРТЕ (текущее выполнение!);
                    let executionTask = executionTasks.find(x => x.taskId == courseMap[indexCourse].id);
                    //IF FINISHED
                    if (isTaskFinished(executionTask, courseMap[indexCourse])) {
                        continue;
                    }
                    // CURRENT DAILY TASK------------------------------------------
                    let dailyTask = lastDailyTasks.find(x => x.taskId == courseMap[indexCourse].id);
                    
                   
                    
                    if (dailyTask) {
                        if (dailyTask.status == "success") {
                            addNewTaskToResult(courseMap[indexCourse]);
                        } else {
                            //ЗНАЧИТ СТАТУС ERROR И НУЖНО ДОБАВИТЬ ВЕСЬ БЛОК
                            //////console.log('----ADD ALL BLOCK-------');
                            if (dailyTask.blockId && dailyTask.blockId !== 0 ) {
                                // ЗДЕСЬ У НАС ЕСТЬ УПРАЖНЕНИЯ В БЛОКЕ
                                let blockTasks = courseMap.filter(x=> x.type == 'blockTask' && x.blockId == dailyTask.blockId);
                                //ВСЕ ЗАДАЧИ В БЛОКЕ!
                                ////console.log('--BLOCK TASKS ------');
                                ////console.log(blockTasks);
                                ////console.log(currentDuration);
                                //находим упражнение с выходом
                                blockTasks.forEach(blockTask => {
                                    //////console.log('-----block task ---');
                                    //////console.log(blockTask);
                                    if (blockTask.countForSuccess == 1) {
                                        //УПРАЖНЕНИЕ ДЛЯ ВЫХОДА ЕГО ДОБАВИМ ОБЯЗАТЕЛЬНО!
                                        addNewTaskToResult(blockTask);
                                    } else {
                                        if (!isCopyInResultTasks(blockTask) && currentDuration < 10) {
                                            addNewTaskToResult(blockTask);
                                        }
                                    }
                                });
                                ////console.log('ПОСЛЕ ДОБАВЛЕНИЯ БЛОКА!!!');
                                ////console.log(currentDuration);
    
                            } else {
                                // ЗДЕСЬ У НАС НЕТ УПРАЖНЕНИЙ В БЛОКЕ
                                // СТРАБОТАЛО ОБЫЧНОЕ НЕТ!
                                addNewTaskToResult(courseMap[indexCourse]);
                            }
                        }
    
                    } else {
                        addNewTaskToResult(courseMap[indexCourse]);
                    }
                    
                } else {
                   
                let allBlockDailyTasks = createBlockDailyTasks(lastDailyTasks, courseMap);
                let currentBlockTask = allBlockDailyTasks.filter(x=> x.taskId == courseMap[indexCourse].id);
                let exitBlockTask = currentBlockTask.find(x =>  x.dailyTask.CustomizeTask.countForSuccess == 1);
                
                 if (exitBlockTask) {
                     
                   

                     let fullExitBlock = courseMap.find(x => x.type == 'blockTask' && x.name == exitBlockTask.dailyTask.name);
                     let blockTasks = courseMap.filter(x=> x.type == 'blockTask' && x.blockId == fullExitBlock.blockId);

                     ////console.log("----BLOCK TASKS---");
                     //console.log(blockTasks);
                    if (exitBlockTask && exitBlockTask.dailyTask.status == 'error') {
                       
                        blockTasks.forEach(element => {
                          
                            //////console.log("----------ADD BLOCKS=====");
                            if (element.taskId == exitBlockTask.dailyTask.taskId)  {
                                //////console.log('-----not check copy block');
                                addNewBlockTaskToResult(element);
                            } else {
                                if(!isCopyInResultTasks(element) && currentDuration <=10) {
                                    let executionBlocktask = executionTasks.find(x => x.taskId == element.taskId);
                                   
                                    if  ((element.countForCancel !== 0) && (executionBlocktask && executionBlocktask.success && executionBlocktask.success >= element.countForCancel)) {
                                        //нам не нужно это упражнение из блока пототому что слишком много раз сделали
                                        
                                    } else {
                                        addNewBlockTaskToResult(element);
                                    }
                                   
                                 }
                            }
                        });
                       
                    }
                    else {
                        //ДОБАВЛЯЕМ ТОЛЬКО РОДИТЕЛЯ
                        
                        // // var blockTaskIds =                 let currentBlockTask = allBlockDailyTasks.filter(x=> x.taskId == courseMap[indexCourse].id);
                        // currentBlockTask.forEach(element => {
                        //     blockTaskIds
                        // });
                        let allBlockDailyTasks = createBlockDailyTasks(lastDailyTasks, courseMap);
                       
                        let blockTaskIds = [];
                        allBlockDailyTasks.forEach(element => {
                            if (element && element.dailyTask &&  element.dailyTask.taskId) {
                                blockTaskIds.push(element.dailyTask.taskId);
                            }
                        });
                      
                        var resUpdateBlockExecution = await clearExecutionForBlock(courseClientId,blockTaskIds);
                        addNewTaskToResult(courseMap[indexCourse]);
                    }
                 } else {
                     //////console.log('not correct block!!!');
                 }
                }
              

                if (courseMap[indexCourse].isBlocking) {
                    //если мы тут то упражнение точно не закончилось если успех или ошибка но тогда мы его берем точно
                    stopIfBlocking = true;
                }
               
            } 
        }
        return resultTaskList;
    }
    catch (err) {
     
        return [];
    }
}


async function findNewPackageTasksUseDuration (courseId, duration, courseClientId, lastDailyTasks) {
   
    
    function checkDuration(currentDuration, task) {
        if (task.duration + currentDuration <= duration) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkCopy (currentTasks, newTask) {
        let check = currentTasks.find(x=> x.name == newTask.name);
        if (check) {
            return false;
        } else {
            return true;
        }
    }
   


    function createStopParentTaskID (lastDailyTasks, courseMap) {
        let result = [];
        lastDailyTasks.forEach(element => {
            let dailyTask = courseMap.find(x => x.taskId == element.taskId && x.type == 'blockTask');
            if (dailyTask) {
                let currentBlock = courseMap.find(x=> x.blockId == dailyTask.blockId);
                if (currentBlock) {
                    result.push({
                        taskId: currentBlock.taskId
                    });
                }
            }
        });
        return result;
    }

    function createBlockDailyTasks (lastDailyTasks, courseMap) {
        let result = [];
        lastDailyTasks.forEach(element => {
            let dailyTask = courseMap.find(x => x.taskId == element.taskId && x.type == 'blockTask');
            if (dailyTask) {
                let currentBlock = courseMap.find(x=> x.blockId == dailyTask.blockId);
                if (currentBlock) {
                    result.push({
                        taskId: currentBlock.taskId,
                        dailyTask: element
                    });
                }
            }
        });
        return result;
    }

    


    let courseMap = await getMapCourse(courseId);
    ////////////console.log('-------result -------');
    let executionCourseResult = await findExecutionCourseForClient(courseClientId);
    ////////////console.log('---execution course for client ');
    ////////////console.log(executionCourseResult);
    //get DATA
    let executionTasks = executionCourseResult.data;

    ////////////console.log('-----LAST DAILY TASKS --------');
    ////////////console.log(lastDailyTasks);

    //currentNumber!!
    let currentNumber = 1;
    //current Duration!
    let currentDuration = 0;

    let resultTaskList = [];

    let stopParentTasks = createStopParentTaskID(lastDailyTasks, courseMap);
    

//---------------HELPERS FUNCTIONS ----------------------------------------
      //FOR TYPE TASK
    function taskOverflowedDuration(currentDuration, currentTask) {
        // console.log("TASK OVER FLOWED DURATION!", currentTask.duration);
        // console.log("FULL DURATION", duration);
        // console.log("CURRENT currentDuration", duration);
        
        if (currentTask.duration + currentDuration > duration) {
            return true;
        }
        return false;
    }

    function taskInStopArray (currentTask, stopArray) {
        let res = stopArray.find(x => x.taskId == currentTask.taskId);
        return res ? true : false;
    }

    function isTaskFinished (executionTask, currentTask) {
        if (executionTask && executionTask.success >= currentTask.countForSuccess) { 
            return true;
        } else {
            return false;
        }
    }

    function addNewTaskToResult (currentTask) {
        resultTaskList.push({
            name: currentTask.name,
            status: 'active',
            taskId: currentTask.taskId,
            number: currentNumber,
            videoLink: currentTask.videoLink,
            duration: currentTask.duration
        });
        currentDuration = currentDuration + currentTask.duration;
        currentNumber = currentNumber + 1;
    }

    function addNewBlockTaskToResult (currentBlockTask) {
        var duration = currentBlockTask.duration ? currentBlockTask.duration : currentBlockTask.dailyTask.CustomizeTask.Exercise.duration;

        resultTaskList.push({
            name:  currentBlockTask.name ? currentBlockTask.name : currentBlockTask.dailyTask.name,
            status: 'active',
            taskId: currentBlockTask.taskId ?  currentBlockTask.taskId: currentBlockTask.dailyTask.taskId,
            number: currentNumber,
            videoLink: currentBlockTask.videoLink ? currentBlockTask.videoLink : currentBlockTask.dailyTask.CustomizeTask.Exercise.videoLink,
            duration: duration
        });
        currentDuration = currentDuration + 1;
        currentNumber = currentNumber + 1;
    }

    function isCopyInResultTasks (currentTask) {
        //////console.log("======check copy ========");
        //////console.log(currentTask);
        let check = resultTaskList.find(x=> x.name == currentTask.name);
        if (check) {
            return true;
        } else {
            return false;
        }
    }
    try {

        let stopIfBlocking = false;
        // console.log('---course map----');
        // console.log(courseMap);

        for (let indexCourse = 0; indexCourse < courseMap.length; indexCourse ++) {
            if (stopIfBlocking || currentDuration >= duration) {
               
                break;
            }
            if (courseMap[indexCourse].type == 'task') {
                console.info("ХОДИМ ПО ЦИЛКУ", currentDuration);
                // console.log
                //IF IN STOP LIST
                // if (taskInStopArray(element[indexCourse], stopParentTasks)) {
                //     continue;
                // }
                // IF DURATION IS BIG
                if(!taskInStopArray(courseMap[indexCourse], stopParentTasks)) {
                   
                    if (taskOverflowedDuration(currentDuration,  courseMap[indexCourse])) {
                        continue;
                    }
                    
                    // ЕСЛИ КОПИЯ ТО ИДЕМ ДАЛЬШЕ НИЧЕГО НЕ ДЕЛАЕМ!!!
                    if(isCopyInResultTasks(courseMap[indexCourse])) {
                        continue;
                    }
                   
                    //МЫ ПОЛУЧАЕМ СЛЕПОК НА КАРТЕ (текущее выполнение!);
                    let executionTask = executionTasks.find(x => x.taskId == courseMap[indexCourse].id);
                    //IF FINISHED
                    if (isTaskFinished(executionTask, courseMap[indexCourse])) {
                        continue;
                    }
                   
                    // CURRENT DAILY TASK------------------------------------------
                    let dailyTask = lastDailyTasks.find(x => x.taskId == courseMap[indexCourse].id);
                    
                   
                    if (dailyTask) {
                        if (dailyTask.status == "success") {
                            addNewTaskToResult(courseMap[indexCourse]);
                        } else {
                            //ЗНАЧИТ СТАТУС ERROR И НУЖНО ДОБАВИТЬ ВЕСЬ БЛОК
                            //////console.log('----ADD ALL BLOCK-------');
                            if (dailyTask.blockId && dailyTask.blockId !== 0 ) {
                                // ЗДЕСЬ У НАС ЕСТЬ УПРАЖНЕНИЯ В БЛОКЕ
                                let blockTasks = courseMap.filter(x=> x.type == 'blockTask' && x.blockId == dailyTask.blockId);
                                //ВСЕ ЗАДАЧИ В БЛОКЕ!
                                ////console.log('--BLOCK TASKS ------');
                                ////console.log(blockTasks);
                                ////console.log(currentDuration);
                                //находим упражнение с выходом
                                blockTasks.forEach(blockTask => {
                                    //////console.log('-----block task ---');
                                    //////console.log(blockTask);
                                    if (blockTask.countForSuccess == 1) {
                                        //УПРАЖНЕНИЕ ДЛЯ ВЫХОДА ЕГО ДОБАВИМ ОБЯЗАТЕЛЬНО!
                                        addNewTaskToResult(blockTask);
                                    } else {
                                        if (!isCopyInResultTasks(blockTask) && currentDuration < 10) {
                                            addNewTaskToResult(blockTask);
                                        }
                                    }
                                });
                                ////console.log('ПОСЛЕ ДОБАВЛЕНИЯ БЛОКА!!!');
                                ////console.log(currentDuration);
    
                            } else {
                                // ЗДЕСЬ У НАС НЕТ УПРАЖНЕНИЙ В БЛОКЕ
                                // СТРАБОТАЛО ОБЫЧНОЕ НЕТ!
                                addNewTaskToResult(courseMap[indexCourse]);
                            }
                        }
    
                    } else {
                        addNewTaskToResult(courseMap[indexCourse]);
                    }
                    
                } else {
                   
                let allBlockDailyTasks = createBlockDailyTasks(lastDailyTasks, courseMap);
                let currentBlockTask = allBlockDailyTasks.filter(x=> x.taskId == courseMap[indexCourse].id);
                let exitBlockTask = currentBlockTask.find(x =>  x.dailyTask.CustomizeTask.countForSuccess == 1);
                
                 if (exitBlockTask) {
                     
                   

                     let fullExitBlock = courseMap.find(x => x.type == 'blockTask' && x.name == exitBlockTask.dailyTask.name);
                     let blockTasks = courseMap.filter(x=> x.type == 'blockTask' && x.blockId == fullExitBlock.blockId);

                     ////console.log("----BLOCK TASKS---");
                     //console.log(blockTasks);
                    if (exitBlockTask && exitBlockTask.dailyTask.status == 'error') {
                       
                        blockTasks.forEach(element => {
                          
                            //////console.log("----------ADD BLOCKS=====");
                            if (element.taskId == exitBlockTask.dailyTask.taskId)  {
                                //////console.log('-----not check copy block');
                                addNewBlockTaskToResult(element);
                            } else {
                                if(!isCopyInResultTasks(element) && currentDuration <=10) {
                                    let executionBlocktask = executionTasks.find(x => x.taskId == element.taskId);
                                   
                                    if  ((element.countForCancel !== 0) && (executionBlocktask && executionBlocktask.success && executionBlocktask.success >= element.countForCancel)) {
                                        //нам не нужно это упражнение из блока пототому что слишком много раз сделали
                                        
                                    } else {
                                        addNewBlockTaskToResult(element);
                                    }
                                   
                                 }
                            }
                        });
                       
                    }
                    else {
                        //ДОБАВЛЯЕМ ТОЛЬКО РОДИТЕЛЯ
                        
                        // // var blockTaskIds =                 let currentBlockTask = allBlockDailyTasks.filter(x=> x.taskId == courseMap[indexCourse].id);
                        // currentBlockTask.forEach(element => {
                        //     blockTaskIds
                        // });
                        let allBlockDailyTasks = createBlockDailyTasks(lastDailyTasks, courseMap);
                       
                        let blockTaskIds = [];
                        allBlockDailyTasks.forEach(element => {
                            if (element && element.dailyTask &&  element.dailyTask.taskId) {
                                blockTaskIds.push(element.dailyTask.taskId);
                            }
                        });
                      
                        var resUpdateBlockExecution = await clearExecutionForBlock(courseClientId,blockTaskIds);
                        addNewTaskToResult(courseMap[indexCourse]);
                    }
                 } else {
                     //////console.log('not correct block!!!');
                 }
                }
              

                if (courseMap[indexCourse].isBlocking) {
                    //если мы тут то упражнение точно не закончилось если успех или ошибка но тогда мы его берем точно
                    stopIfBlocking = true;
                }
               
            } 
        }
        return resultTaskList;
    }
    catch (err) {
        // console.log("findNewPackageTasksUseDuration", err);
        return [];
    }
}







async function getMapCourse(courseId) {
    function checkServiceError (res) {
        ////////////console.log('----CHECK SERVICE RES ERROR');
        ////////////console.log(res);
        if (res.error) {
            return {error: true, errorMessage: res.errorMessage};
        }
    }
    // first get 
    var currentCategories = await getCourseCategories(courseId);
    //sort use number
    ////////////console.log('----current categories -------');
    checkServiceError(currentCategories);
    currentCategories.data.sort((a, b) => a.number - b.number);
    //get customize task

    // we get all tasks for course
    var resultCustomizeTask = await findAllCustomizeTasksForCourse(courseId);
    ////////////console.log('-----------result customize task-------');
    ////////////console.log(resultCustomizeTask);
    var resultBlock = await findAllBlocks();
    checkServiceError(resultBlock);
    ////////////console.log('-----result block --------');
    ////////////console.log(resultBlock);
    let allBlock = resultBlock.data;
    let categoryData = currentCategories.data;
    var resData = [];
    categoryData.forEach(element => {
        let tasks = resultCustomizeTask.data.filter(x => x.type == "primary" && x.categoryId == element.categoryId);
        tasks.sort((a, b) => a.number - b.number);
        let categoryIsDeleted = true;
        if (tasks && tasks.length > 0) {
            categoryIsDeleted = false;
        }
        try {
            tasks.forEach(taskElement => {
                resData.push({
                    headerLabel: 'Упражнение->',
                    type: 'task',
                    taskId: taskElement.id,
                    categoryId: taskElement.Category.id,
                    name: taskElement.Exercise.name,
                    exerciseId: taskElement.Exercise.id,
                    countForBlock: taskElement.countForBlock,
                    countForSuccess: taskElement.countForSuccess,
                    courseId: taskElement.courseId,
                    categoryName: taskElement.Category.name,
                    number: taskElement.number,
                    id: taskElement.id,
                    videoLink: taskElement.Exercise.videoLink,
                    duration: taskElement.Exercise.duration,
                    isBlocking: taskElement.isBlocking
                  
                });
                let blocks = allBlock.filter(x => x.taskId == taskElement.id);
                blocks.sort((a, b) => a.number - b.number);
                blocks.forEach(blockElement => {
                    resData.push({
                        type: 'block',
                        blockId: blockElement.id,
                        number: blockElement.number,
                        categoryId: taskElement.Category.id,
                        name: blockElement.name,
                        taskId: taskElement.id,
                        // id:  blockElement.id,
                    });
                    let blockTasks = blockElement.BlockTasks && blockElement.BlockTasks ? blockElement.BlockTasks : [];
                    blockTasks.sort((a, b) => a.number - b.number);
                    blockTasks.forEach(blockTaksElement => {
                        let blockTask = resultCustomizeTask.data.find(x => x.id == blockTaksElement.taskId && x.type == "block");
                        resData.push({
                            headerLabel: 'Упражнение->',
                            type: 'blockTask',
                            categoryId: blockTask.categoryId,
                            name: blockTask.name,
                            blockId: blockElement.id,
                            number: blockTaksElement.number,
                            categoryId: blockTask.Category.id,
                            formula: blockTask.countForSuccess ? 'выход' : 'не выход',
                            taskId: blockTaksElement.taskId,
                            blockTaskId: blockTaksElement.taskId,
                            id: blockTaksElement.id,
                            videoLink: blockTask.Exercise ? blockTask.Exercise.videoLink : ' ',
                            exerciseId: blockTask.Exercise ? blockTask.Exercise.id : 0,
                            countForCancel: blockTask.countForCancel ? blockTask.countForCancel : 0,
                            countForBlock: blockTask.countForBlock ? blockTask.countForBlock : 0,
                            countForSuccess: blockTask.countForSuccess ? blockTask.countForSuccess : 0,
                            duration: blockTask.Exercise.duration

                        });
                        let blocks1 = allBlock.filter(x => x.taskId == blockTaksElement.taskId);
                        blocks1.forEach(blockElement1 => {
                            resData.push({
                                headerLabel: 'Блок->',
                                type: 'block1',
                                blockId: blockElement1.id,
                                number: blockElement1.number,
                                categoryId: taskElement.Category.id,
                                name: blockElement1.name,
                            });
                            blockElement1.BlockTasks && blockElement1.BlockTasks.forEach(blockTaksElement1 => {
                                let blockTask1 = resultCustomizeTask.data.find(x => x.id == blockTaksElement1.taskId && x.type == "block");
                                resData.push({
                                    headerLabel: 'xпражнение->',
                                    type: 'blockTask1',
                                    categoryId: blockTask1.categoryId,
                                    name: blockTask1.name,
                                    blockId: blockTaksElement1.id,
                                    number: blockTaksElement1.number,
                                    categoryId: taskElement.Category.id,
                                    formula: blockTask1.countForSuccess ? 'выход' : 'не выход',
                                    blockTaskId: blockTaksElement1.taskId,
                                    id: blockTaksElement1.id
                                });
                            });

                        });

                    });

                });
            });
        } catch (e) {
            ////////////console.log(JSON.stringify(e));
        }
    });
    ////////////console.log('--------RES DATA -------');
    ////////////console.log(resData);
    return resData;
}



//ПОЛУЧИТЬ КАК-ТО СРАЗУ ВЕСЬ КУРС!!!!

async function findAllCourseTasks (courseId) {
    let courseMap = await getMapCourse(courseId);
    let resultTaskList = [];
    let currentNumber = 1;

    

//---------------HELPERS FUNCTIONS ----------------------------------------
      //FOR TYPE TASK


    function addNewTaskToResult (currentTask) {
        resultTaskList.push({
            name: currentTask.name,
            status: 'active',
            taskId: currentTask.taskId,
            number: currentNumber,
            videoLink: currentTask.videoLink,
            duration: currentTask.duration
        });
    }


    try {
        // console.log('---course map----');
        // console.log(courseMap);
        for (let indexCourse = 0; indexCourse < courseMap.length; indexCourse ++) {
            if (courseMap[indexCourse].type == 'task') {
                addNewTaskToResult(courseMap[indexCourse]);
            }
        }
        return resultTaskList;
    }
    catch (err) {
        console.log("ALL COURSE", err);
        return [];
    }
}






async function prepareNewPackage (courseId, courseClientId, duration, numberForRepeat) {
    console.debug("PREPARE NEW PACKAGE", numberForRepeat);
    console.debug("PREPARE NEW PACKAGE", duration);

    try {
           //проверяет закончен ли task!
    function isTaskFinished (executionTask, currentTask) {
        if (executionTask && executionTask.success >= currentTask.countForSuccess) { 
            return true;
        } else {
            return false;
        }
    }

    function isTaskHaveError (executionTask) {
        console.log("isTaskHaveError", executionTask);
        if (executionTask && executionTask.error >= 1) { 
            return true;
        } else {
            return false;
        }
    }


    function checkHistory (history, executionTask, numberForRepeat) {
        console.log("---check history--", history[0].DailyTasks);
        let currentPackageWithTask;
        let historyIndex = -1000;
        history.sort((a,b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
        console.log("===SORTED HISTROY", history);

        for (let index = history.length-1 ; index >=0; index--) {
            if ( history[index] && history[index].DailyTasks) {
                console.log("START FIND", history[index].DailyTasks);
                let findTask = history[index].DailyTasks.find(x => x.taskId == executionTask.taskId && x.status == 'error');
                console.log("resultFind", findTask);
                if (findTask) {
                    currentPackageWithTask = history[index];
                    historyIndex = index;
                    break;
                }
            }
        }
        console.log("historyIndex",historyIndex, history.length );
        console.log("NUMBER FOR REPEAT", numberForRepeat);
        if (historyIndex > 0  && (history.length - historyIndex) >= numberForRepeat) {
            return true;
        } else {
            false;
        }
    }

    function addNewTaskToResult (currentTask) {
        resultTaskList.push({
            name: currentTask.name,
            status: 'active',
            taskId: currentTask.taskId,
            number: currentNumber,
            videoLink: currentTask.videoLink,
            duration: currentTask.duration
        });
        currentDuration = currentDuration + currentTask.duration;
        currentNumber = currentNumber + 1;
    }
        //получаем весь слепок курса
        let courseMap = await getMapCourse(courseId);

        //получаем слепок курса для конкретного клиента!
        let executionCourseResult = await findExecutionCourseForClient(courseClientId);

         //данные для клиента изьяли
        let executionTasks = executionCourseResult.data;


        //блокирующие упражнения есть ли они у нас?
        let stopIfBlocking = false;

        //обьем блока изначально 0 
        let currentDuration = 0;


          //currentNumber!!
          let currentNumber = 1;


        //для конечный tasks
        let resultTaskList = [];


        let historyResult = await historyClientPackage(courseClientId);

        let history = historyResult.data;

        console.log("===history", history[0].DailyTasks);

        console.log("===execution task", executionTasks[0]);
        //начинаем идти по циклу!!! всех упражнений в курсе!
        for (let indexCourse = 0; indexCourse < courseMap.length; indexCourse ++) {

            // условия остановки цикла или блокирующее упражнение - или блок переполнился
            if (stopIfBlocking || currentDuration >= duration) {
               
                break;
            }

            if (courseMap[indexCourse].type == 'task') {
                let executionTask = executionTasks.find(x => x.taskId == courseMap[indexCourse].id);

                if (!isTaskFinished(executionTask, courseMap[indexCourse])) {
                    if(!isTaskHaveError(executionTask)) {
                        addNewTaskToResult(courseMap[indexCourse]);

                    } else {
                        if (checkHistory(history,executionTask, numberForRepeat)) {
                            addNewTaskToResult(courseMap[indexCourse]);

                        }
                    }
                }
            }

        }

        if (resultTaskList && resultTaskList.length == 0) {
            console.log("ЕСЛИ СПИСОК ЗАДАЧ ПОСЛЕ ОСНОВНОГО ПРОХОДА ПУСТОЙ!");
            for (let indexCourse = 0; indexCourse < courseMap.length; indexCourse ++) {

                // условия остановки цикла или блокирующее упражнение - или блок переполнился
                if (stopIfBlocking || currentDuration >= duration) {
                   
                    break;
                }
    
                if (courseMap[indexCourse].type == 'task') {
                    let executionTask = executionTasks.find(x => x.taskId == courseMap[indexCourse].id);
    
                    if (!isTaskFinished(executionTask, courseMap[indexCourse])) {
                        addNewTaskToResult(courseMap[indexCourse]);
                    }
                }
    
            }
        }
        return resultTaskList;

    } catch (error) {
        console.log("PREPARE NEW PACKAGE ERROR", error);
        //TODO: logger пишет про проблему!
        return [];
    }
}

module.exports = {
    getCourseCategories: getCourseCategories,
    findActiveDailyPackage: findActiveDailyPackage,
    findDailyTasks: findDailyTasks,
    findAllPrimaryCustomizeTasks: findAllPrimaryCustomizeTasks,
    findExecutionCourseForClient: findExecutionCourseForClient,
    createDailyPackage: createDailyPackage,
    createDailyTasks: createDailyTasks,
    findBlocksForTasks: findBlocksForTasks,
    createExecutionCourse: createExecutionCourse,
    findExecutionCourseForTask: findExecutionCourseForTask,
    updateExecutionCourse: updateExecutionCourse,
    updateDaliyTaskStatus: updateDaliyTaskStatus,
    findCustomizeTaskForId: findCustomizeTaskForId,
    checkDailyPackageFinished: checkDailyPackageFinished,
    finishedDailyPackage: finishedDailyPackage,
    findLastPackage: findLastPackage,
    findFullDailyTasks: findFullDailyTasks,
    findExecutionForDailyTask: findExecutionForDailyTask,
    checkSuccessTask: checkSuccessTask,
    checkErrorTask: checkErrorTask,
    historyClientPackage: historyClientPackage,
    clearClientCourse: clearClientCourse,
    findNewPackageTasks: findNewPackageTasks,
    countDailyPackage: countDailyPackage,
    refreshActiveDailyPackage: refreshActiveDailyPackage,
    findAllFullUseIdsCustomizeTasks: findAllFullUseIdsCustomizeTasks,
    frozenClient: frozenClient,
    findNewPackageTasksUseDuration: findNewPackageTasksUseDuration,
    findAllCourseTasks: findAllCourseTasks,
    findFullCustomizeTaskForId: findFullCustomizeTaskForId,
    //NEW FUNCTION for repeat
    prepareNewPackage: prepareNewPackage

};

// module.exports.getCourseCategories = getCourseCategories;
