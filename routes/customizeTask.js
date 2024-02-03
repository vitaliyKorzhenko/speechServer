var express = require('express');
var router = express.Router();
const customizeTaskController = require("../controllers/customizeTaskController");

router.get("/", customizeTaskController.findAll);


// Create a new user
router.post("/", customizeTaskController.create);


router.post("/createBlockTask", customizeTaskController.createBlockTask);


router.post("/findForCategory", customizeTaskController.findTaskForCategory);

router.post("/findClientPackages", customizeTaskController.findClientPackages);


router.post("/findTaskForCourse", customizeTaskController.findTaskForCourse);


router.post("/forwardTask", customizeTaskController.forwardTask);

router.post("/forwardBlockTask", customizeTaskController.forwardBlockTask);


router.post("/edit", customizeTaskController.update);

router.post("/delete", customizeTaskController.delete);

router.post("/findDailyTasks", customizeTaskController.findDailyTask);

router.post("/updateDaliyTaskStatus", customizeTaskController.updateDaliyTaskStatus);

router.post("/createExecutionCourse", customizeTaskController.createExecutionCourse);

router.post("/findExecutionCourseForClient", customizeTaskController.findExecutionCourseForClient);


router.post("/updateExecutionCourse", customizeTaskController.updateExecutionCourse);

router.post("/findDailyPackage", customizeTaskController.findDailyPackage);

router.post("/findDailyPackageWithDuration", customizeTaskController.findDailyPackageWithDuration);

router.post("/findUserPackage", customizeTaskController.findUserPackage);

router.post("/findUserStart", customizeTaskController.findUserStart);

router.post("/historyClient", customizeTaskController.historyClient);

router.post("/clearClientCourse", customizeTaskController.clearClientCourse);

router.post("/refreshDailyPackage", customizeTaskController.refreshDailyPackage);


router.post("/getCurrentClientTask", customizeTaskController.getCurrentClientTask);

router.post("/addVideoUrlToTask", customizeTaskController.addVideoUrlToTask);

router.post("/addStatusToTask", customizeTaskController.addStatusToTask);

router.post("/addStatusToUATask", customizeTaskController.addStatusToUATask);

router.post("/addStatusToGovorikaTask", customizeTaskController.addStatusToGovorikaTask);

router.post("/findAllWithCourses", customizeTaskController.findAllWithCourses);

router.post("/sendFullCourse", customizeTaskController.sendFullCourse);

router.post("/getCourseTasks", customizeTaskController.getCourseTasks);

router.post("/sendPartOfCourse", customizeTaskController.sendPartOfCourse);

router.post("/sendTaskInfoToBot", customizeTaskController.sendTaskInfoToBot);

router.post("/moveTask", customizeTaskController.moveTask);






module.exports = router;
