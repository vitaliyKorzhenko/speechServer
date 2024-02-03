const db = require("../models");
const Blocks = require("../models").Blocks;
const Op = db.Sequelize.Op;
const BlockTasks = require("../models").BlockTasks;

// Create and Save a new User
exports.create = (req, res) => {
    if (!req.body.name ) {
        res.status(400).send({
          message: "Name can not be empty!"
        });
        return;
      }
      if (!req.body.taskId) {
        res.status(400).send({
            message: "taskId can not be empty!"
        });
        return;
    }
      const block = {
        name: req.body.name,
        taskId: req.body.taskId,
        status: req.body.status ? req.body.status : 'active',
        number: 1
      };


      Blocks.findAll({
        where: { taskId: block.taskId},
        raw: true
    })
        .then(data => {
            if (typeof data !== 'undefined' && data.length > 0) {
                // the array is defined and has at least one element
                var maxNumber = Math.max.apply(Math, data.map(function (o) { return o.number; }));
                block.number = maxNumber + 1;
                Blocks.create(block, {raw: true})
                    .then(data => {

                        res.send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while creating the User."
                        });
                    });
            } else {
                Blocks.create(block, {raw:true})
                    .then(data => {

                        res.send(data);
                    })
                    .catch(err => {
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
};

// Retrieve all Blocks from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  
    Blocks.findAll({
        where: condition,
        include: [
            { model: BlockTasks, as: 'BlockTasks' },
        ]
    })
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



exports.forwardBlock = (req, res) => {
    //console.log('------forward Blocks --------');
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
  
    Blocks.update(
        { number: req.body.firstNumber },
        { where: { id: req.body.firstId } }
    )
        .then(result =>
            {
                Blocks.update(
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
  

  exports.update = (req, res) => {
    //console.log('--request--');
    //console.log(req.body.id);
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
    Blocks.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Blocks was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe Blocks was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Blocks with id=" + id
      });
    });
  
  };
  
  exports.delete = (req, res) => {
    //console.log('--request--');
    //console.log(req.body.id);
    const id = req.body.id;
  
    if (!req.body.id ) {
      res.status(400).send({
        message: "Id can not be empty!"
      });
      return;
    }
    Blocks.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Blocks was destroy successfully."
        });
      } else {
        res.send({
          message: `Cannot update destroy with id=${id}. Maybe Blocks was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error destroy with id=" + id
      });
    });
  
  };