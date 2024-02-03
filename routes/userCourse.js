var express = require('express');
var router = express.Router();

const userCourseController = require("../controllers/userCourseController");

/* GET users listing. */
//startProductForUser post
router.post("/startProductForUser", userCourseController.startProductForUser);

module.exports = router;
