const db = require("../models");
const TGUsers = require("../models").TGUsers;
const ClientsModel = require("../models").Clients;

const TGVideos = require("../models").TGVideos;
const DaliyPackagesModel = require("../models").DaliyPackages;
const { Op } = require('sequelize');
const aws = require('aws-sdk');
const request = require('request');

const spacesEndpoint = new aws.Endpoint('https://govorikavideo.sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'SCJSBFPLGPGTHIM5EA6H',
  secretAccessKey: 'OCf5ksssIjIdH4i62JV5pJNC3PrGGBTY7/6r13S5aJI'
});




// const Op = db.Sequelize.Op;

// Create and Save a new User
exports.create = (req, res) => {
  if (!req.body.chatId) {
    res.status(400).send({
      message: "chatId can not be empty!"
    });
    return;
  }

  var tgUser = {
    firstName: req.body.firstName ? req.body.firstName : '',
    lastName: req.body.lastName ? req.body.lastName : '',
    username: req.body.username ? req.body.username : '',
    chatId: req.body.chatId ? req.body.chatId.toString() : '',
    phone: req.body.phone ? req.body.phone.toString() : ''

  };
 
  TGUsers.findOne({
    where: {
      chatId: tgUser.chatId
    },
    raw: true
  }).then(tgUserRes => {
    if (tgUserRes) {
      // we have this user in db its ok (duplicate chat)
     
      TGUsers.update(
        {
          phone: tgUser.phone
        }, {
        where: {
          id: tgUserRes.id
        }
      })
        .then(tgUserData => {
          
          ClientsModel.update(
            {
              phone: tgUser.phone
            }, {
            where: {
              chatId: tgUser.chatId
            }
          })
            .then(data => {
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the User."
              });
            });
  
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        });
     
    } else {
      TGUsers.create(tgUser)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        });
    }
  }).catch(err => {
    //TODO:  не нужно ломать бота если сервак не включен!
    res.send(true);
  });
  // Save User in the database
};


exports.deleteVideo = (req, res) => {
 
  if (!req.body.tgvideo) {
    res.status(400).send({
      message: "tgvideo can not be empty!"
    });
    return;
  }
  var tgVideo = req.body.tgvideo;
  if (tgVideo.videoUrl) {
    let parsedUrls = tgVideo.videoUrl.split('/');
    s3.deleteObject({
       Key: parsedUrls[4],
      Bucket: 'clientVideos',
     
  }, function(error, data) { 
      if (error) {
        res.send(false);
      } else {
        TGVideos.destroy({
          where: { id: tgVideo.id }
        })
          .then(num => {
            if (num == 1) {
              res.send(true);
            } else {
              res.send({
                message: `Cannot update destroy with id=${id}. Maybe Exercise was not found or req.body is empty!`
              });
            }
          })
          .catch(err => {
            res.send(err);
          });
         
      }
  }); 
  } else {
    TGVideos.destroy({
      where: { id: tgVideo.id }
    })
      .then(num => {
        if (num == 1) {
          res.send(true);
        } else {
          res.send({
            message: `Cannot update destroy with id=${id}. Maybe Exercise was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.send(err);
      });
  }

  // res.send(true);
}

exports.createVideo = (req, res) => {
 

  if (!req.body.chatId) {
    res.status(400).send({
      message: "chatId can not be empty!"
    });
    return;
  }

  var tgVideo = {
    videoUrl: req.body.videoUrl ? req.body.videoUrl : '',
    chatId: req.body.chatId ? req.body.chatId.toString() : '',

  };
 
  var options = {
    uri: tgVideo.videoUrl,
    encoding: null
};
const fileKey = tgVideo.chatId + '-' +  new Date().getUTCMilliseconds() + '.mp4';
request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) { 
    } else {
        s3.putObject({
            Body: body,
            Key: fileKey,
            Bucket: 'clientVideos',
            ACL:'public-read'
        }, function(error, data) { 
            if (error) {
              
            } else {
                var newTgVideo = {
                  videoUrl: 'https://govorikavideo.sfo3.digitaloceanspaces.com/clientVideos/' + fileKey,
                  chatId: req.body.chatId ? req.body.chatId.toString() : '',
              
                };
                TGVideos.create(newTgVideo)
                .then(data => {
                  res.send(data);
                })
                .catch(err => {
                  //TODO: не будем бота ломать но нужен логер может
                  res.send(true);
                });
               
            }
        }); 
        
        // res.send(true);
    }   
});

  

}


exports.createMessage = (req, res) => {
  if (!req.body.chatId) {
    res.status(400).send({
      message: "chatId can not be empty!"
    });
    return;
  }

  var tgVideo = {
    messageText: req.body.messageText ? req.body.messageText : '',
    chatId: req.body.chatId ? req.body.chatId.toString() : '',

  };
  TGVideos.create(tgVideo)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
}

// Retrieve all User from the database.
exports.findAll = (req, res) => {
  TGUsers.findAll({ raw: true})
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


exports.findVideosForClientPackage = (req, res) => {
  var chatId;
  chatId = req.body.chatId ? req.body.chatId : null;
  var courseClientId = req.body.courseClientId ? req.body.courseClientId : null;
  if (!req.body.chatId) {
    res.status(500).send({
      message:
        err.message || "Need ChatId"
    });
  }
  if (!req.body.packageId) {
    res.status(500).send({
      message:
        err.message || "Need packageId"
    });
  }

  if (!courseClientId) {
    res.status(500).send({
      message:
        err.message || "Need courseClientId"
    });
  }
  var packageId = req.body.packageId;

  DaliyPackagesModel.findAll({
    where: {
      courseClientId: courseClientId
    },
    raw: true
  }).then(packages => {
      var currentPackage = packages.find(element => element.id == packageId);
    
        var filteredPackages = packages.filter(x => new Date(x.createdAt).getTime() > new Date(currentPackage.createdAt).getTime());
        // filteredPackages.sort((a, b) => Date.parse(a.createdAt) < Date.parse(b.createdAt));
        var minElement = filteredPackages.reduce(function (a, b) { return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b; }); 
        // var min = dates.reduce(function (a, b) { return a < b ? a : b; }); 


    var where =  {chatId: chatId};

    TGVideos.findAll({ raw: true, where  })
    .then(data => {

     const resultData =  data.filter(x => Date.parse(x.createdAt) > Date.parse(currentPackage.createdAt) && Date.parse(x.createdAt) <= Date.parse(minElement.createdAt));
    
      res.send(resultData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });

  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials."
    });
  });


 
};

exports.findVideos = (req, res) => {
  var chatId;
  chatId = req.body.chatId ? req.body.chatId : null;
  if (!req.body.chatId) {
    res.status(500).send({
      message:
        err.message || "Need ChatId"
    });
  }
  if (!req.body.packageId) {
    res.status(500).send({
      message:
        err.message || "Need packageId"
    });
  }
  var packageId = req.body.packageId;

  DaliyPackagesModel.findOne({
    where: {
      id: packageId
    },
    raw:true
  }).then(package => {
    var where = chatId ? {
      chatId: chatId,
      updatedAt: {
        [Op.gte]: package.updatedAt
      }
    } : null;
    TGVideos.findAll({ raw: true, where: where  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials."
    });
  });
 
};

exports.findAllVideos = (req, res) => {
  TGVideos.findAll({ raw: true  })
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

exports.editTgUser = (req, res) => {
  const id = req.body.id;
  let newUser = {
      id: id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      chatId: req.body.chatId,
      username: req.body.username,
      phone: req.body.phone
     
  }
  TGUsers.update(newUser, {
  where: { id: id }
})
  .then(num => {
    if (num == 1) {
      res.send({
        message: "User was updated, not it's not active user"
      });
    } else {
      res.send({
        message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating User with id=" + id
    });
  });

}

// Find a single User with an id
