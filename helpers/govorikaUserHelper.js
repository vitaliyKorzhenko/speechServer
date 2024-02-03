const GovorikaTgUsers = require('../models/').GovorikaTGUsers;
const UserProducts = require('../models/').UserProducts;
//find user by chatId
async function findGovorikaTgUser(chatId) {
  console.log('findGovorikaTgUser', chatId);

  let allClients = await GovorikaTgUsers.findAll({
    raw: true
  }).then(clientsData => {
    return clientsData;
  }).catch(err => {
    return null;
  });

  console.log('allClients', allClients);
  
  let client = await GovorikaTgUsers.findOne({
    where: {
      chatId: chatId
    },
    raw: true
  }).then(clientData => {
    return clientData;
  }).catch(err => {
    return null;
  });
  return client;
}

//find UserProduct by phone

async function findUserProduct(phone) {
    let userProduct = await UserProducts.findOne({
        where: {
        phone: phone
        },
        raw: true
    }).then(userProductData => {
        return userProductData;
    }).catch(err => {
        return null;
    });
    return userProduct;
}


//exports
module.exports = {
    findGovorikaTgUser: findGovorikaTgUser,
    findUserProduct: findUserProduct
};