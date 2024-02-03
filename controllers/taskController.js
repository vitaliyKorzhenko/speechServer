const db = require("../models");
const Task = require("../models").Task;
const Op = db.Sequelize.Op;

// name: DataTypes.STRING,
//     videoLink: DataTypes.STRING,
//     isActive: DataTypes.STRING
// Create and Save a new User
exports.create = (req, res) => {
   
    if (!req.body.name) {
        res.status(400).send({
          message: "name can not be empty!"
        });
        return;
    }

    if (!req.body.videoLink) {
        res.status(400).send({
          message: "videoLink can not be empty!"
        });
        return;
      }
      
      const task = {
        name: req.body.name ? req.body.name : '',
        videoLink: req.body.videoLink ? req.body.videoLink : '',
        isActive:  'true',
      };
    
      // Save User in the database
      Task.create(task, {raw:true})
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the TASK."
          });
        });
  
};

// Retrieve all User from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  
    Task.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving TASK."
        });
      });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  
};

// Update a User by the id in the request
exports.update = (req, res) => {
    
    const id = req.body.id;

    Task.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Task was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Task with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Task with id=" + id
      });
    });
  
};


// Update a User by the id in the request
exports.disable = (req, res) => {
    const id = req.body.id;
    let newTask = {
        id: id,
        isActive: 'false'
    }
    Task.update(newTask, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Task was updated, not it's not active TASK"
        });
      } else {
        res.send({
          message: `Cannot update Task with id=${id}. Maybe Task was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Task with id=" + id
      });
    });
  
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  
};



