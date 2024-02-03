const db = require("../models");
const CourseCategories = require("../models").CourseCategories;
const Op = db.Sequelize.Op;
const Categories = require("../models").Categories;

// Create and Save a new User
exports.create = (req, res) => {
    if (!req.body.courseId ) {
        res.status(400).send({
          message: "courseId can not be empty!"
        });
        return;
      }
      
      if (!req.body.categoryId ) {
        res.status(400).send({
          message: "categoryId can not be empty!"
        });
        return;
      }


      const courseCategory = {
        courseId: req.body.courseId ? req.body.courseId : '',
        categoryId: req.body.categoryId ? req.body.categoryId : 'active',
        number: 1
      };
    
      // Save Courses in the database
      const name = req.body.name ;
      CourseCategories.findOne({where: {courseId: courseCategory.courseId, categoryId: courseCategory.categoryId }}).then(data => {
          if (data) {
            res.status(400).send({
                message:
                 "courseId + categoryId, is unique"
              });
          } else {

            CourseCategories.findAll({
                where: { courseId: courseCategory.courseId },
                raw: true
            })
                .then(data => {
        
                    //console.log('----CourseCategories------');
                    //console.log(data);
                    if (typeof data !== 'undefined' && data.length > 0) {
                        // the array is defined and has at least one element
                        var maxNumber = Math.max.apply(Math, data.map(function (o) { return o.number; }));
                        //console.log(maxNumber);
                        courseCategory.number = maxNumber + 1;
                        CourseCategories.create(courseCategory)
                            .then(data => {
        
                                res.send(data);
                            })
                            .catch(err => {
                                //console.log("Catch create ");
                                //console.log(err);
                                res.status(500).send({
                                    message: err.message || "Some error occurred while creating the User."
                                });
                            });
                    } else {
                        CourseCategories.create(courseCategory)
                            .then(data => {
        
                                res.send(data);
                            })
                            .catch(err => {
                                //console.log("Catch create ");
                                //console.log(err);
                                res.status(500).send({
                                    message: err.message || "Some error occurred while creating the User."
                                });
                            });
                    }
        
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving tutorials."
                    });
                });

          }

      }).catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
      }); 
     
  
};




// Retrieve all Category from the database.
exports.findAll = (req, res) => {
    if (!req.body.courseId ) {
        res.status(400).send({
          message: "courseId can not be empty!"
        });
        return;
      }
      
    CourseCategories.findAll(
      {
        where: {courseId: req.body.courseId},
        include: [
          { model: Categories, as: 'Category' }
        ]
      
    },
    
    )
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

  


exports.forwardСategory = (req, res) => {
  //console.log('------forward category --------');
  //console.log(req.body);
   if (!req.body.firstId) {
      res.status(400).send({
          message: "firstId can not be empty!"
      });
      return;
  }
  if (!req.body.secondId) {
      res.status(400).send({
          message: "secondId can not be empty!"
      });
      return;
  }
  if (!req.body.firstNumber) {
      res.status(400).send({
          message: "firstNumber can not be empty!"
      });
      return;
  }
  if (!req.body.secondNumber) {
      res.status(400).send({
          message: "firstNumber can not be empty!"
      });
      return;
  }
  // res.send('dsfsdf');

  CourseCategories.update(
      { number: req.body.firstNumber },
      { where: { id: req.body.firstId } }
  )
      .then(result =>
          {
            CourseCategories.update(
                  { number: req.body.secondNumber },
                  { where: { id: req.body.secondId } }
              )
                  .then(result =>
                      {
                           res.send('updated success');

                      }
                  )
                  .catch(err =>
                      {
          
                      }
                  );
          }
      )
      .catch(err =>
          {

          }
      );
};



