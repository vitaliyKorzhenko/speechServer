const db = require("../models");
const CoachModel = require("../models").Coaches;
const CourseCoachesModel = require("../models").CourseCoaches;
const CoursesModel = require("../models").Courses;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");

//coach service 
const coachService = require('../services/coachesService');
const { findCoachesForClient } = require("./courseClientController");

const CourseStartCodesModel = require("../models").CourseStartCodes;

exports.create = (req, res) => {
  if (!req.body.name) {
    res.status(400).send({
      message: "name can not be empty!"
    });
    return;
  }
  const coach = {
    name: req.body.name ? req.body.name : '',
    email: req.body.email ? req.body.email : '',
    phone: req.body.phone ? req.body.phone : '',
    status: req.body.status ? req.body.status : 'active'
  };


  // Save User in the database
  CoachModel.create(coach)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the COACH."
      });
    });

};


exports.addNewPassword = (req, res) => {
  if (!req.body.password) {
    res.status(400).send({
      message: "password can not be empty!"
    });
    return;
  }

  if (!req.body.coachId) {
    res.status(400).send({
      message: "coachId can not be empty!"
    });
    return;
  }
  bcrypt.hash(req.body.password, 10).then((hash) => {
    CoachModel.update({password: hash}, {
      where: {
        id: req.body.coachId
       }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Exercise was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update status Coach for client`
          });
        }
      })
      .catch(err => {
        console.log('----errr---');
        console.log(err);
        res.status(500).send({
          message: "Error updating Coach with"
        });
      });
});
 
}



exports.checkPassword = (req, res) => {
  console.log(req.body);
  if (!req.body.password) {
    res.status(400).send({
      message: "password can not be empty!"
    });
    return;
  }

  if (!req.body.email) {
    res.status(400).send({
      message: "email can not be empty!"
    });
    return;
  }
  CoachModel.findOne({
    where: {
      email: req.body.email
    },
    raw: true
  }).then(coach => {
     if (coach && coach.password) {
        bcrypt.compare(req.body.password, coach.password).then(resultCompare => {
          console.log('---res---');
          console.log(resultCompare);
          if (resultCompare) {
            res.status(200).send(coach);
            return;
          } else {
            res.status(200).send(false);
            return;
          }
        });
     } else {
        res.status(200).send(false);
        return;
     }
  }).catch(err => {
    res.status(500).send({
      message: "Error updating Coach with"
    });
    return;
  });
}


exports.findCoachesForCourse = (req, res) => {
 
  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!"
    });
    return;
  }

  CourseCoachesModel.findAll(
    {
      where: {
        courseId: req.body.courseId,
        isActive: true
      },
      include: [
        { model: CoachModel, as: 'Coach' },
      ],
      raw: true
    }).then(data => {
     
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Coach."
      });
    });

}

exports.findCoache = (req, res) => {
  if (!req.body.email) {
    res.status(400).send({
      message: "email can not be empty!"
    });
    return;
  }
  CoachModel.findOne({
    where: {
      email: req.body.email
    }, raw: true
  })
    .then(data => {
      console.log('find coach');
      console.log(data);
      if (data) {
        res.send(data);

      } else {
        res.send(false);
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Coach."
      });
    });
}

/*
find coach by id 
*/
exports.findCoacheById = (req, res) => {
  if (!req.body.id) {
    res.status(400).send({
      message: "id can not be empty!"
    });
    return;
  }
  
  CoachModel.findOne({
    where: {
      id: req.body.id
    }, raw: true
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Coach."
      });
    });
}


exports.findActiveCoachesCourses = (req, res) => {
    CourseCoachesModel.findAll(
      {
        where: {
          isActive: true
        },
        include: [
          { model: CoursesModel, as: 'Course' },
          { model: CoachModel, as: 'Coach'}
        ]
      })
      .then(data => {
        
        const parsedCourses = data.map((node) => node.get({ plain: true }));
      
        res.send(parsedCourses);
      })
      .catch(err => {
        console.log('------err-------');
        console.log(err);
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Coach."
        });
      });
}

exports.findCoachCourses = (req, res) => {

  if (!req.body.coachId) {
    res.status(400).send({
      message: "coachId can not be empty!"
    });
    return;
  }
  CourseCoachesModel.findAll(
    {
      where: {
        coachId: req.body.coachId,
        isActive: true
      },
      include: [
        { model: CoursesModel, as: 'Course' },
      ]
    })
    .then(data => {
      
      const parsedCourses = data.map((node) => node.get({ plain: true }));
     
      res.send(parsedCourses);
    })
    .catch(err => {
      console.log('------err-------');
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Coach."
      });
    });
}


// Retrieve all User from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  CoachModel.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Coach."
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {

};

// Update a User by the id in the request
exports.update = (req, res) => {

  const id = req.body.id;

  CoachModel.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Coach was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Task with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Coach with id=" + id
      });
    });

};


exports.startCourseForCoach = (req, res) => {

  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!"
    });
    return;
  }

  if (!req.body.coachId) {
    res.status(400).send({
      message: "name can not be empty!"
    });
    return;
  }
  CourseCoachesModel.update({ isActive: true }, {
    where:
    {
      courseId: req.body.courseId,
      coachId: req.body.coachId
    }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Coach was updated successfully."
        });
      } else {
        CourseCoachesModel.create({
          coachId: req.body.coachId,
          courseId: req.body.courseId,
          isActive: true
        })
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the COACH."
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Coach with id=" + id
      });
    });
}


exports.stopCourseForCoaches = (req, res) => {

  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!"
    });
    return;
  }

  if (!req.body.coachId) {
    res.status(400).send({
      message: "name can not be empty!"
    });
    return;
  }
  CourseCoachesModel.update({ isActive: false }, {
    where:
    {
      courseId: req.body.courseId,
      coachId: req.body.coachId
    }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Coach was updated successfully."
        });
      } else {
        CourseCoachesModel.create({
          coachId: req.body.coachId,
          courseId: req.body.courseId,
          isActive: false
        })
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the COACH."
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Coach with id=" + id
      });
    });
}





exports.findCourseCoaches = (req, res) => {
 
  if (!req.body.courseId) {
    res.status(400).send({
      message: "name can not be empty!"
    });
    return;
  }
  CourseCoachesModel.findAll({
    where: {
      courseId: req.body.courseId
    },
    raw: true
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Coach."
      });
    });

}


exports.delete = (req, res) => {

  const id = req.body.id;

  if (!req.body.id) {
    res.status(400).send({
      message: "Id can not be empty!"
    });
    return;
  }
  CoachModel.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Coach was destroy successfully."
        });
      } else {
        res.send({
          message: `Cannot update destroy with id=${id}. Maybe Coach was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error destroy with id=" + id
      });
    });

};


/*
coaches for admin ui  
*/

exports.findCoachesForAdminUI = async (req, res) => {
  //course id
  const courseId = req.body.courseId;

  if (!courseId) {
    res.status(400).send({
      message: "courseId can not be empty!"
    });
    return;
  }

  try {
    let coaches = await coachService.findCoachesForAdminUI(courseId);
    res.send(coaches);
  } catch (error) {
    res.status(500).send({
      message: "Error findCoachesForAdminUI" + error
    });
  }

}



// Функция для генерации случайного кода
function generateRandomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// const CourseStartCodesModel = require("../models").CourseStartCodes;

exports.generateCodeForCourse = async (req, res) => {
  if (!req.body.courseId) {
    res.status(400).send({
      message: "courseId can not be empty!"
    });
    return;
  }
  if (!req.body.coachId) {
    res.status(400).send({
      message: "coachId can not be empty!"
    });
    return;
  }

  const courseId = req.body.courseId;
  const coachId = req.body.coachId;
  const coachInfo = req.body.coachInfo ? req.body.coachInfo : '';

  const numberOfCodes = 50;
  const generatedCodes = [];

  const bulkData = [];
  for (let i = 0; i < numberOfCodes; i++) {
    const code = generateRandomCode(); // Здесь вызывается функция, которая генерирует случайный код
    bulkData.push({
      code: code,
      courseId: courseId,
      coachId: coachId,
      coachInfo: coachInfo,
      isActive: true
    });
  }

  const newCodes = await CourseStartCodesModel.bulkCreate(bulkData);
  generatedCodes.push(...newCodes);

  res.json({ codes: generatedCodes });
};


//get all codes for coach use coachId
exports.getAllCodesForCoach = async (req, res) => {
  if (!req.body.coachId) {
    res.status(400).send({
      message: "coachId can not be empty!"
    });
    return;
  }

  const coachId = req.body.coachId;

  const codes = await CourseStartCodesModel.findAll({
    where: {
      coachId: coachId
    }
  });

  res.json({ codes: codes });
}

//update alpha code
exports.updateAlphaCode = async (req, res) => {
  if (!req.body.id) {
    res.status(400).send({
      message: "id can not be empty!"
    });
    return;
  }
  if (!req.body.alphaCode) {
    res.status(400).send({
      message: "alphaCode can not be empty!"
    });
    return;
  }
  
  const id = req.body.id;
  const alphaCode = req.body.alphaCode;

  const updatedCode = await CourseStartCodesModel.update({ alphaCode: alphaCode }, {
    where: {
      id: id
    }
  });

  res.json({ code: updatedCode });
}