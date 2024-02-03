var express = require('express');
var router = express.Router();
const coachController = require("../controllers/coachController");

/* GET users listing. */
router.get("/", coachController.findAll);


// Create a new user
router.post("/", coachController.create);


router.post("/edit", coachController.update);


router.post("/delete", coachController.delete);

router.post("/findCoache", coachController.findCoache);

router.post("/findCoacheById", coachController.findCoacheById);



router.post("/findCoachCourses", coachController.findCoachCourses);



router.post("/findCourseCoaches", coachController.findCourseCoaches);

router.post("/startCourseForCoach", coachController.startCourseForCoach);

router.post("/stopCourseForCoaches", coachController.stopCourseForCoaches);



router.post("/findCoachesForCourse", coachController.findCoachesForCourse);

router.post("/addNewPassword", coachController.addNewPassword);

router.post("/checkPassword", coachController.checkPassword);


// findCoachesForAdminUI
router.post("/findCoachesForAdminUI", coachController.findCoachesForAdminUI);

// generateCodeForCourse
router.post("/generateCodeForCourse", coachController.generateCodeForCourse);

//getAllCodesForCoach
router.post("/getAllCodesForCoach", coachController.getAllCodesForCoach);

//updateAlphaCode
router.post("/updateAlphaCode", coachController.updateAlphaCode);

//findActiveCoachesCourses
router.post("/findActiveCoachesCourses", coachController.findActiveCoachesCourses);

module.exports = router;
