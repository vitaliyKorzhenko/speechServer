var express = require('express');
var router = express.Router();
const controller = require("../controllers/courseClientController");

/* GET users listing. */
router.post("/findUserForCourse", controller.findUserForCourse);

router.post("/findActiveUserForCourse", controller.findActiveUserForCourse);

router.post("/disableFrozenForClient", controller.disableFrozenForClient);

router.post("/pauseCourseForClient", controller.pauseCourseForClient);

//delete clients from Course
router.post("/deleteClientForCourse", controller.deleteClientForCourse);


router.post("/unPauseCourseForClient", controller.unPauseCourseForClient);


router.post("/sendTaskToTG", controller.sendTaskToTG);


router.post("/clearMessage", controller.clearMessage);


// Create a new user
router.post("/", controller.create);

router.post("/findCoachesForClient", controller.findCoachesForClient);

router.post("/findCourseClientsForCoach", controller.findCourseClientsForCoach);


router.post("/addCoach", controller.addCoach);

router.post("/disableCoach", controller.disableCoach);

router.post("/findAllCourseClients", controller.findAllCourseClients);

router.post("/addSchedule", controller.addSchedule);

router.post("/updatePaymentDate", controller.updatePaymentDate);


router.post("/findActiveClientsForCoachInCourse", controller.findActiveClientsForCoachInCourse);

router.post("/findActiveClientsForCoachArchiveInCourse", controller.findActiveClientsForCoachArchiveInCourse);

router.post("/findActiveClientsForCourse", controller.findActiveClientsForCourse);

router.post("/findArchiveClientsForCourse", controller.findArchiveClientsForCourse);


router.post("/addNewScheduleTimeToClient", controller.addNewScheduleTimeToClient);



module.exports = router;
