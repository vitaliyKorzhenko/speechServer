const TGUsers = require("../models").TGUsers;
const GovorikaTGUsers = require("../models").GovorikaTGUsers;
async function findTgUser (chatId) {
  
    let client = await TGUsers.findOne({
      where: {
        chatId: chatId
      },
      raw: true
    }).then(clientData => {
      return clientData;
    }).catch(err=> {
      return null;
    });
  
    return client;
  }


async function findGovorikaUser (chatId) {
    
      let client = await GovorikaTGUsers.findOne({
        where: {
          chatId: chatId
        },
        raw: true
      }).then(clientData => {
        return clientData;
      }).catch(err=> {
        return null;
      });
    
      return client;
    }


  module.exports = 
  {
      findTgUser: findTgUser,
      findGovorikaUser: findGovorikaUser
};



