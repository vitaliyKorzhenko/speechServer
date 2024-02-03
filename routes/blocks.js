var express = require('express');
var router = express.Router();
const blockController = require("../controllers/blockController");

/* GET users listing. */
router.get("/", blockController.findAll);


// Create a new Block
router.post("/", blockController.create);

router.post("/findAll", blockController.findAll);
router.post("/forwardBlock", blockController.forwardBlock);

router.post("/edit", blockController.update);

router.post("/delete", blockController.delete);

module.exports = router;
