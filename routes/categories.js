var express = require('express');
var router = express.Router();
const categoryController = require("../controllers/categoryController");

/* GET users listing. */
router.get("/", categoryController.findAll);


// Create a new category
router.post("/", categoryController.create);

// Create a new category
router.post("/createForCourse", categoryController.createForCourse);



router.post("/edit", categoryController.update);


router.post("/delete", categoryController.delete);

module.exports = router;
