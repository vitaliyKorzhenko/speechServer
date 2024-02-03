var express = require('express');
var router = express.Router();
const controller = require("../controllers/courseCategoryController");

/* GET users listing. */
router.post("/findByCourse", controller.findAll);
router.post("/forwardCategory", controller.forwardСategory);

// Create a new user
router.post("/", controller.create);


module.exports = router;
