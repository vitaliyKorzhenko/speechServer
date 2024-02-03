var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");

/* GET users listing. */
router.get("/", userController.findAll);


router.post("/fetchClient", userController.fetchClient);

router.post("/fetchClientByCourseClientId", userController.fetchClientByCourseClientId);


router.post("/checkAdminPassword", userController.checkAdminPassword);

router.post("/addNewAdminPassword", userController.addNewAdminPassword);


// Create a new user
router.post("/", userController.create);

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post("/edit", userController.update);

router.post("/disable", userController.disable);

router.post("/createUserWithCourse", userController.createUserWithCourse);

router.post("/startUserWithCourseUseBot", userController.startUserWithCourseUseBot);

//new start course with bot
router.post("/startCourse", userController.startCourse);

//check phone
router.post("/checkPhone", userController.checkPhone);

router.post("/changeClientNameUseCourseClientId", userController.changeClientNameUseCourseClientId);

/*
Add Feedback 
*/
router.post("/addFeedback", userController.addFeedback);




module.exports = router;
