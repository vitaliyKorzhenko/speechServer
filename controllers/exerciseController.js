const db = require("../models");
const Exercise = require("../models").Exercises;
const ExerciseFiles = require("../models").ExerciseFiles;

const Op = db.Sequelize.Op;

const CourseModel = require("../models").Courses;
const ExercisesModel = require("../models").Exercises;
const ExercisesFilesModel = require("../models").ExerciseFiles;

const CourseMotivateExercises = require("../models").CourseMotivateExercises;

const CustomizeTask = require("../models").CustomizeTasks;




exports.addFile = (req, res) => {
  console.log("SAVE FILE START", req.body);

  if (!req.body.name) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }

  if (!req.body.exerciseId) {
    res.status(400).send({
      exerciseId: "exerciseId can not be empty!",
    });
    return;
  }
  
  if (!req.body.bucketLink) {
    res.status(400).send({
      message: "bucketLink can not be empty!",
    });
    return;
  }

  const fileInfo = {
    name: req.body.name ? req.body.name : "",
    bucketLink: req.body.bucketLink ? req.body.bucketLink : "",
    comment: req.body.comment ? req.body.comment : "",
    exerciseId: req.body.exerciseId
  };

  ExercisesFilesModel.create(fileInfo)
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    res.status(500).send({
      message:
        err.message ||
        "Some error occurred while creating the category.",
    });
  });
};


exports.deleteExerciseFiles = (req, res) => {
  const name = req.body.name;

  if (!req.body.name) {
    res.status(400).send({
      message: "name can not be empty!",
    });
    return;
  }

  if (!req.body.exerciseId) {
    res.status(400).send({
      message: "exerciseId can not be empty!",
    });
    return;
  }
  const exerciseId =  req.body.exerciseId;
  ExercisesFilesModel.destroy({
    where: { name: name, exerciseId:exerciseId },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Exercise File was destroy successfully.",
        });
      } else {
        res.send({
          message: `Cannot update destroy with id=${name}. Maybe Exercise was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error destroy with name=" + name,
      });
    });
};

exports.create = (req, res) => {
 
  if (!req.body.name) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }
  if (!req.body.videoLink) {
    res.status(400).send({
      message: "VideoLink can not be empty!",
    });
    return;
  }

  const exercise = {
    name: req.body.name ? req.body.name : "",
    videoLink: req.body.videoLink ? req.body.videoLink : "",
    textValue: req.body.textValue ? req.body.textValue : "",
    duration: req.body.duration ? req.body.duration : 1,
    coachInfo: req.body.coachInfo ? req.body.coachInfo : "",
    isMotivatate: req.body.isMotivatate ? req.body.isMotivatate : false,
    courseId: req.body.courseId ?  req.body.courseId : null,
    linksText: req.body.linksText ? req.body.linksText : null,

  };

  const files = req.body.files ? req.body.files : [];
  console.log("FILES", files);
  // Save User in the database
  const exName = req.body.name;
  Exercise.findOne({ where: { name: exName } })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        Exercise.create(exercise)
          .then((data) => {
            const dataObj = data.get({plain:true});
            console.log("dataObj", dataObj);
            if (files && files.length > 0) {
              const fileModels = [];
              files.forEach(element => {
                fileModels.push({
                  name:element.name ? element.name : "",
                  bucketLink: element.bucketLink ? element.bucketLink : "",
                  comment: element.comment ? element.comment : "",
                  exerciseId: dataObj.id
                });
                
              });
            console.log("FILE MODELS", fileModels);
              ExercisesFilesModel.bulkCreate(fileModels, { returning: true, raw: true })
              .then(function (values) {
                res.send(data);
              }).catch(function (e) {
                res.send(data);
              });
            } else {
              res.send(data);
            }
            
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({
              message:
                err.message ||
                "Some error occurred while creating the category.",
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

exports.addMotivateToLessonCourse = (req, res) => {
  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!",
    });
    return;
  }

  if (!req.body.exerciseId) {
    res.status(400).send({
      message: "exerciseId can not be empty!",
    });
    return;
  }

  if (!req.body.lessonNumber) {
    res.status(400).send({
      message: "lessonNumber can not be empty!",
    });
    return;
  }

  const item = {
    courseId: req.body.courseId,
    exerciseId: req.body.exerciseId,
    lessonNumber: req.body.lessonNumber,
  };

  CourseMotivateExercises.create(item)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the category.",
      });
    });
};

exports.findMotivateForCourse = (req, res) => {
  console.log("findMotivateForCourse", req.body);
  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!",
    });
    return;
  }

  try {
    CourseMotivateExercises.findAll({
      where: {
        courseId: req.body.courseId,
      },
      include: [
        { model: ExercisesModel, as: "Exercise" },
        { model: CourseModel, as: "Course" },
      ],
      raw: true,
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log("=====CAAATCh-====", err);
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials.",
        });
      });
  } catch (error) {
    console.log("=====CAAATCh-====");
    console.log(error);
  }
};

exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Exercise.findAll({
    where: condition,
    include: [
      { model: ExerciseFiles, as: "ExerciseFiles" },
      // { model: Blocks, as: 'Blocks' },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};



//refactor

async function findExercisesUseCourseID(courseId, ids) {

  let exercies = await Exercise.findAll({
    where: {
      [Op.or]:
        [
          { courseId: courseId },
          {
            id: {
              [Op.in]: ids
            }
          }
        ]
    },
    include: [
      { model: ExerciseFiles, as: "ExerciseFiles" },
      // { model: Blocks, as: 'Blocks' },
    ],
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return null;
  });

  return exercies;
}

async function findExersicesIdsUseInCourse (courseId) {
  let exerciesIds = await CustomizeTask.findAll({
    attributes: ['exerciseId'],
    where: {
      courseId: courseId
    },
    raw: true
    
  }).then(ids => {
    return ids;
  }).catch(err=> {
    return [];
  });

  return exerciesIds;
}


exports.findAllExersicesForCourse = async (req, res) => {

  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!",
    });
    return;
  }
 
  try {
    //find all exercises ids
    let ids = await findExersicesIdsUseInCourse(req.body.courseId);

    //parse ids to array
   let exercisesIds = ids.map(item => item.exerciseId);
    //find all exercises
    let exercises = await findExercisesUseCourseID(req.body.courseId, exercisesIds);

    //return exercises
    res.send(exercises);
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials.",
    });
  }
};


exports.findSingleExersice = (req, res) => {

  if (!req.body.id) {
    res.status(400).send({
      message: "id can not be empty!",
    });
    return;
  }
  const id = req.body.id;
  console.log("=====id", id);
  Exercise.findOne({
    where: {id: id},
    include: [
      { model: ExerciseFiles, as: "ExerciseFiles" },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
}






exports.findAllMotivatate = (req, res) => {
  Exercise.findAll({
    where: {
      isMotivatate: true,
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

exports.update = (req, res) => {
  const id = req.body.id;

  if (!req.body.name) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }
  if (!req.body.id) {
    res.status(400).send({
      message: "Id can not be empty!",
    });
    return;
  }
  Exercise.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Exercise was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe Exercise was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Exercise with id=" + id,
      });
    });
};

exports.updateLinks = (req, res) => {
  const id = req.body.id;

  if (!req.body.id) {
    res.status(400).send({
      message: "Id can not be empty!",
    });
    return;
  }

  Exercise.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Exercise was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe Exercise was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Exercise with id=" + id,
      });
    });
};

// Update a User by the id in the request
exports.delete = (req, res) => {
  const id = req.body.id;

  if (!req.body.id) {
    res.status(400).send({
      message: "Id can not be empty!",
    });
    return;
  }
  Exercise.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Exercise was destroy successfully.",
        });
      } else {
        res.send({
          message: `Cannot update destroy with id=${id}. Maybe Exercise was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error destroy with id=" + id,
      });
    });
};

//deleteMotivateExercise
exports.deleteMotivateExercise = (req, res) => {
  const id = req.body.id;

  if (!req.body.id) {
    res.status(400).send({
      message: "Id can not be empty!",
    });
    return;
  }
  CourseMotivateExercises.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Exercise was destroy successfully.",
        });
      } else {
        res.send({
          message: `Cannot update destroy with id=${id}. Maybe Exercise was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error destroy with id=" + id,
      });
    });
};

//
