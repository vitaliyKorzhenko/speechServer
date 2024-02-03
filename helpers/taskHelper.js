

const taskService = require("../services/taskService");



// { duration: 5, courseClientId: 131, courseId: 21, useBlocks: true }

async function FindDailyPackageWithDuration(packageData) {

    function checkServiceError(result) {
        if (result.error) {
            return [];
        }
    }


    //=========== create DAILY PACKAGE WITH TASKS
    async function createDailyPackageWithTasks(body, currentDailyTasks) {


        // console.log('--------body-----', body);

        let findNewPackageTasksRest = await taskService.findNewPackageTasksUseDuration(packageData.courseId, packageData.duration, packageData.courseClientId, currentDailyTasks);

        console.log("findNewPackageTasksRest", findNewPackageTasksRest);

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

        let fullTasksResult = await taskService.findAllFullUseIdsCustomizeTasks(taskIds, packageData.courseId);
        let fullTasks = fullTasksResult && fullTasksResult.data ? fullTasksResult.data : [];



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
                    coachInfo: fullTask && fullTask.Exercise ? fullTask.Exercise.coachInfo : '',
                    linksText: taskElemet.linksText && taskElemet.linksText.length > 0 ? taskElemet.linksText : null
                });
            });

            dailyTasks.sort((a, b) => a.number - b.number);

            // res.send(dailyTasks);

            if (packageData.useBlocks) {
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
            // console.log('---CATCH FIND DAILY TASKS ---');
            // console.log(e);
            return [];
        }

    }




    //=========== create DAILY PACKAGE WITH TASKS



    let dailyPackageResult = await taskService.findActiveDailyPackage(packageData.courseClientId);
    ////console.log('------daily Package Result---------');
    ////console.log(dailyPackageResult);
    //Check Error
    checkServiceError(dailyPackageResult);

    let countPackages = await taskService.countDailyPackage(packageData.courseClientId);
    checkServiceError(countPackages);


    let currentDailyPackage = dailyPackageResult.data;
    if (currentDailyPackage) {
        console.log('----У НАС ЕСТЬ ДНЕВНОЙ БЛОК И МЫ ПРОСТО ЕГО ПОКАЗЫВАЕМ!');
        let findDailyTasksResult = await taskService.findDailyTasks(currentDailyPackage.id);

        checkServiceError(findDailyTasksResult);
        if (packageData.useBlocks) {
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
            return { dailyTasks: resDailyTasks, number: countPackages.data };
        } else {
            return { dailyTasks: findDailyTasksResult.data, number: countPackages.data };
        }
    } else {
        console.log("СТРОИМ НОВЫЙ ДНЕВНОЙ БЛОК!");
        let findLastPackageResult = await taskService.findLastPackage(packageData.courseClientId);
        checkServiceError(findLastPackageResult);
        console.log("findLastPackageResult", findLastPackageResult);
        if (findLastPackageResult.data) {
            let findDailyTasksResult = await taskService.findFullDailyTasks(findLastPackageResult.data.id);
            checkServiceError(findDailyTasksResult);
            let resultDailyTasks = await createDailyPackageWithTasks(packageData, findDailyTasksResult.data);
            resultDailyTasks.sort((a, b) => a.number - b.number);
            return { dailyTasks: resultDailyTasks, number: countPackages.data + 1 };


        } else {
            console.log("СТРОИМ ПЕРВЫЙ УРОООК!!!", packageData);
            let resultDailyTasks = await createDailyPackageWithTasks(packageData, []);
            return { dailyTasks: resultDailyTasks, number: countPackages.data + 1 };
        }

    }

}




async function FindDailyPackageWithDurationAndRepeat(packageData) {

    console.log("FindDailyPackageWithDurationAndRepeat", packageData);
    try {

        function checkServiceError(result) {
            if (result.error) {
                return [];
            }
        }
        //=========== create DAILY PACKAGE WITH TASKS
        async function createDailyPackageWithTasks(body, currentDailyTasks) {


            console.log('--------body-----', body);

            let findNewPackageTasksRest = await taskService.prepareNewPackage(packageData.courseId, packageData.courseClientId, packageData.duration, packageData.numberForRepeat);

            console.log("findNewPackageTasksRest", findNewPackageTasksRest);

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

            let fullTasksResult = await taskService.findAllFullUseIdsCustomizeTasks(taskIds, packageData.courseId);
            let fullTasks = fullTasksResult && fullTasksResult.data ? fullTasksResult.data : [];



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
                        coachInfo: fullTask && fullTask.Exercise ? fullTask.Exercise.coachInfo : '',
                        linksText: taskElemet.linksText && taskElemet.linksText.length > 0 ? taskElemet.linksText : null
                    });
                });

                dailyTasks.sort((a, b) => a.number - b.number);

                // res.send(dailyTasks);

                if (packageData.useBlocks) {
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
                // console.log('---CATCH FIND DAILY TASKS ---');
                // console.log(e);
                return [];
            }

        }




        //=========== create DAILY PACKAGE WITH TASKS



        let dailyPackageResult = await taskService.findActiveDailyPackage(packageData.courseClientId);
        ////console.log('------daily Package Result---------');
        ////console.log(dailyPackageResult);
        //Check Error
        checkServiceError(dailyPackageResult);

        let countPackages = await taskService.countDailyPackage(packageData.courseClientId);
        checkServiceError(countPackages);


        let currentDailyPackage = dailyPackageResult.data;
        if (currentDailyPackage) {
            console.log('----У НАС ЕСТЬ ДНЕВНОЙ БЛОК И МЫ ПРОСТО ЕГО ПОКАЗЫВАЕМ!');
            let findDailyTasksResult = await taskService.findDailyTasks(currentDailyPackage.id);

            checkServiceError(findDailyTasksResult);
            if (packageData.useBlocks) {
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
                return { dailyTasks: resDailyTasks, number: countPackages.data };
            } else {
                return { dailyTasks: findDailyTasksResult.data, number: countPackages.data };
            }
        } else {
            console.log("СТРОИМ НОВЫЙ ДНЕВНОЙ БЛОК!");
            let findLastPackageResult = await taskService.findLastPackage(packageData.courseClientId);
            checkServiceError(findLastPackageResult);
            console.log("findLastPackageResult", findLastPackageResult);
            if (findLastPackageResult.data) {
                let findDailyTasksResult = await taskService.findFullDailyTasks(findLastPackageResult.data.id);
                checkServiceError(findDailyTasksResult);
                let resultDailyTasks = await createDailyPackageWithTasks(packageData, findDailyTasksResult.data);
                resultDailyTasks.sort((a, b) => a.number - b.number);
                return { dailyTasks: resultDailyTasks, number: countPackages.data + 1 };


            } else {
                console.log("СТРОИМ ПЕРВЫЙ УРОООК!!!", packageData);
                let resultDailyTasks = await createDailyPackageWithTasks(packageData, []);
                return { dailyTasks: resultDailyTasks, number: countPackages.data + 1 };
            }

        }
    } catch (error) {
        console.log("error  FindDailyPackageWithDurationAndRepeat", error);
    }




}


module.exports = {
    FindDailyPackageWithDuration: FindDailyPackageWithDuration,
    FindDailyPackageWithDurationAndRepeat: FindDailyPackageWithDurationAndRepeat
}