var express = require('express');
var router = express.Router();
const taskController = require("../controllers/taskController");

/* GET users listing. */
router.get("/", taskController.findAll);


// Create a new user
router.post("/", taskController.create);

router.post("/edit", taskController.update);

router.post("/disable", taskController.disable);


module.exports = router;
