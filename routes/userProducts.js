var express = require('express');
var router = express.Router();

const userProductController = require("../controllers/userProductController");

/* GET users listing. */

router.get("/", userProductController.findAll);

router.post("/addNewProductForUser", userProductController.create);

module.exports = router;
