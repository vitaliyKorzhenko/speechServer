const db = require("../models");
const Category = require("../models").Categories;
const Op = db.Sequelize.Op;

// Create and Save a new User
exports.create = (req, res) => {
    if (!req.body.name ) {
        res.status(400).send({
          message: "Name can not be empty!"
        });
        return;
      }
      
      const category = {
        name: req.body.name ? req.body.name : '',
      };
    
      // Save User in the database
      const categoryName = req.body.name ;
      console.log(categoryName);
      Category.findOne({where: {name: categoryName}}).then(data => {
          console.log('find data');
          console.log(data);
          if (data) {
            res.status(500).send({
                message:
                 "Name is unique, create category with another name"
              });
          } else {
            Category.create(category)
            .then(data => {
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the category."
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



exports.createForCourse = (req, res) => {
  if (!req.body.name ) {
      res.status(400).send({
        message: "Name can not be empty!"
      });
      return;
    }
    
    const category = {
      name: req.body.name ? req.body.name : '',
    };
  
    // Save User in the database
    const categoryName = req.body.name ;
    console.log(categoryName);
    Category.findOne({where: {name: categoryName}}).then(data => {
        if (data) {
          res.send(data);
        } else {
          Category.create(category)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the category."
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







// Update a User by the id in the request
exports.update = (req, res) => {
  console.log('--request--');
  console.log(req.body.id);
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
  Category.update(req.body, {
  where: { id: id }
})
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Category was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update User with id=${id}. Maybe Category was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating User with id=" + id
    });
  });

};


exports.delete = (req, res) => {
  console.log('--request--');
  console.log(req.body.id);
  const id = req.body.id;

  if (!req.body.id ) {
    res.status(400).send({
      message: "Id can not be empty!"
    });
    return;
  }
  Category.destroy({
  where: { id: id }
})
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Category was destroy successfully."
      });
    } else {
      res.send({
        message: `Cannot update destroy with id=${id}. Maybe Category was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error destroy with id=" + id
    });
  });

};

// Retrieve all Category from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  
    Category.findAll({ where: condition })
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

  
