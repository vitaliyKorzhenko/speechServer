const govorikaUserHelper = require("../helpers/govorikaUserHelper");
const { startProductForGovorikaUser } = require("../helpers/startCourseHelper");
const CourseConstant = require('../helpers/courseConstant');
const { findOkkCourseByOkkId, findCourseById } = require("../helpers/okk24Helper");

exports.startProductForUser = async (req, res) => {

    console.log('StartProduct for USER Req body', req.body);

    //check chat id in 
    if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
        return;
    }

    //check chat id
    if (!req.body.chatId) {
        res.status(400).send({
          message: "chatId can not be empty!"
        });
        return;
    }

    //check phone 
    let okk24User = req.body.okk24Response.user;

    let okk24Tariff = req.body.okk24Response.tariff;

    let okkk24Teachers = req.body.okk24Response.teachers;

    console.log('okk24User', okk24User);
    if (!okk24User.phone) {
        res.status(400).send({
          message: "phone can not be empty!"
        });
        return;
    }

    //find govorika user
    const currentUser = await govorikaUserHelper.findGovorikaTgUser(req.body.chatId);

    console.log('currentUser', currentUser);

    if (!currentUser) {
        res.status(400).send({
          message: "User not found!"
        });
        return;
    }

    //find okk course by okkId
    console.log('okk24 tariff', okk24Tariff);
    const okkCourse = await findOkkCourseByOkkId(okk24Tariff.id);
    console.log('okkCourse', okkCourse);
    if (!okkCourse) {
      return res.status(400).send({
        message: "Error start product!",
        success: false,
        code: 'start_product_error'
      });
    }
    //find course by id
    const currentCourse = await findCourseById(okkCourse.serverId);
    console.log('CURRENT COURSE', currentCourse);
    if (!currentCourse) {
      return res.status(400).send({
        message: "Error start product!",
        success: false,
        code: 'start_product_error'
      });
    }
   
    console.log('GO NEXT FIND PRODUCT!');
    //find user product using phone
    try {
      const testCourseId = currentCourse.id;
      const testDuration = 14;
      const testCourseName = currentCourse.name;
      const testStartMessage = currentCourse.startMessage ? currentCourse.startMessage : '';
      const testCoachId = CourseConstant.coachId;

      let resStart = await startProductForGovorikaUser(
        req.body.chatId,
        testCourseId,
        testDuration,
        testCourseName,
        testStartMessage,
        testCoachId
      );
      console.log('RES', resStart);
      if (!resStart.success) {
        //send error message
        console.log('Error start product!');
        return res.status(200).send({
          message: "Error start product!",
          success: false,
          code: resStart.code
        });
      } else {
        return res.status(200).send({
          message: "Start product!",
          success: true,
          code: 'start_product_success'
        })
      }
      
    } catch (error) {
      console.log('GLOBAL CATCH', error);
      return res.status(400).send({
        message: "Error start product!",
        success: false,
        code: 'start_product_error'
      });
      
    }
};