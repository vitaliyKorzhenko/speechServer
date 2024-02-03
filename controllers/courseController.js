const db = require("../models");
const Courses = require("../models").Courses;
const ExecutionCoursesModel = require("../models").ExecutionCourses;
const CourseCoaches =  require("../models").CourseCoaches;
const CourseMotivateExercises =  require("../models").CourseMotivateExercises;
const Coaches =  require("../models").Coaches;

const Op = db.Sequelize.Op;

// Create and Save a new Course
exports.create = (req, res) => {
  if (!req.body.name) {
    res.status(400).send({
      message: "Name can not be empty!"
    });
    return;
  }
console.log("======BODYBODY===");
  console.log(req.body);

  const course = {
    name: req.body.name ? req.body.name : '',
    status: req.body.status ? req.body.status : 'active',
    duration: req.body.duration ? req.body.duration : '10',
    messagingMode:  req.body.messageMode ?  req.body.messageMode : 'single'
  };

  // Save Courses in the database
  const name = req.body.name;
  try {
    Courses.findOne({ where: { name: name } }).then(data => {
      if (data) {
        res.status(500).send({
          message:
            "Name is unique, course with another name"
        });
      } else {
        Courses.create(course)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err && err.message || "Some error occurred while creating the Courses."
            });
          });
      }
  
    }).catch(err => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
  } catch (error) {
    console.log(error);
  }
  


};




exports.edit = (req, res) => {
  

  console.log('---EDIT COURSE' , req.body);
  const id = req.body.id;

  if (!req.body.name ) {
    res.status(400).send({
      message: "Name can not be empty!"
    });
    return;
  }
  if (!req.body.id ) {
    res.status(400).send({
      message: "Id can not be empty!"
    });
    return;
  }
  Courses.update(req.body, {
  where: { id: id }
})
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Course was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Course with id=${id}. Maybe Exercise was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Course with id=" + id
    });
  });

};


exports.findCourseInfo = (req, res) => {
  if (!req.body.id) {
    res.status(400).send({
      message: "id can not be empty!"
    });
    return;
  }

  const courseId = req.body.id;

  Courses.findOne(
    { 
      where: {id: courseId},
      include: [
        { 
          model: CourseCoaches, 
          as: "CourseCoaches",
          include: [
            {
              model: Coaches, 
              as: "Coach",
            }
          ]
       },
        { model: CourseMotivateExercises, as: "CourseMotivateExercises" },
        
        // { model: Blocks, as: 'Blocks' },
      ],
      // raw: true
   }).then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
}

// Retrieve all Category from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { [Op.like]: `%${name}%` }, status: 'active' } : {status: 'active'};

  Courses.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};


exports.startExecutionCourses = (req, res) => {
  ////console.log('---- req body 5454 ------');
  ////console.log(req.body.taskList);
  if (!req.body.taskList) {
    res.status(400).send({
      message: "taskList can not be empty!"
    });
  }
    let taskList = req.body.taskList;
    ////console.log('-------task list now -----------');
    ////console.log(taskList);
    try {
      ExecutionCoursesModel.bulkCreate(taskList)
      .then(function () {
        res.sеnd(true);
      }).catch(function (error) {
        res.status(500).send({
          message:
            error.message || "Some error occurred while retrieving bulkCreate."
        });
      });
    } catch (e) {
      ////console.log('----global error ------');
      ////console.log(e);
    }
    
}



exports.disableCourse = (req, res) => {
  

  const id = req.body.id;

  if (!req.body.id ) {
    res.status(400).send({
      message: "Id can not be empty!"
    });
    return;
  }
  Courses.update({status: 'notActive'}, {
  where: { id: id }
})
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Course was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Course with id=${id}. Maybe Exercise was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Course with id=" + id
    });
  });

};