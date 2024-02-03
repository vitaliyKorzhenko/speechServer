const CoachModel = require("../models").Coaches;

//find coach by phone
async function findCoachByPhone(phone) {
    let coach = await CoachModel.findOne({
        where: {
            phone: phone
        },
        raw: true
    }).then(coachData => {
        return coachData;
    }).catch(err => {
        return null;
    });
    return coach;
}

//exports
module.exports = {
    findCoachByPhone: findCoachByPhone
};