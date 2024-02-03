var express = require('express');
var router = express.Router();
const exerciseController = require("../controllers/exerciseController");

/* GET users listing. */
router.get("/", exerciseController.findAll);

router.post("/findAllMotivatate", exerciseController.findAllMotivatate);

router.post("/addMotivateToLessonCourse", exerciseController.addMotivateToLessonCourse);

router.post("/addFile", exerciseController.addFile);


router.post("/findAllExersicesForCourse", exerciseController.findAllExersicesForCourse);


router.post("/findMotivateForCourse", exerciseController.findMotivateForCourse);


router.post("/deleteMotivateExercise", exerciseController.deleteMotivateExercise);



// Create a new user
router.post("/", exerciseController.create);

router.post("/findSingleExersice", exerciseController.findSingleExersice);


router.post("/edit", exerciseController.update);


router.post("/updateLinks", exerciseController.updateLinks);



router.post("/delete", exerciseController.delete);

router.post("/deleteExerciseFiles", exerciseController.deleteExerciseFiles);




module.exports = router;
