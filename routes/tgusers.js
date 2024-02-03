var express = require('express');
var router = express.Router();
const userController = require("../controllers/tguserController");

/* GET users listing. */
router.get("/", userController.findAll);

router.post("/allVideos", userController.findAllVideos);

router.post("/videos", userController.findVideos);

router.post("/findVideosForClientPackage", userController.findVideosForClientPackage);


// Create a new user
router.post("/", userController.create);

router.post("/editTgUser", userController.editTgUser);

router.post("/deleteVideo", userController.deleteVideo);

router.post("/video", userController.createVideo);

router.post("/message", userController.createMessage);

// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


module.exports = router;
