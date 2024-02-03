var express = require('express');
var router = express.Router();
const courseController = require("../controllers/courseController");

/* GET users listing. */
router.get("/", courseController.findAll);


// Create a new user
router.post("/", courseController.create);



router.post("/disableCourse", courseController.disableCourse);

router.post("/findCourseInfo", courseController.findCourseInfo);

router.post("/edit", courseController.edit);

router.post("/startExecutionCourses", courseController.startExecutionCourses);

module.exports = router;
