
const DailyPackageModel = require("../models").DaliyPackages;
const DailyTaskModel = require("../models").DaliyTasks;
//update DailyPackage status by id
const updateDailyPackageStatus = async (id, status) => {
    return await DailyPackageModel.update({
        status: status
    }, {
        where: {
            id: id
        }
    });
}

//check if daily package have active tasks
const checkDailyPackageTasks = async (packageId) => {
    const tasks =  await DailyTaskModel.findAll({
        where: {
            packageId: packageId,
            status: 'active'
        }
    });
    if (tasks && tasks.length > 0) {
        return true;
    } else {
        return false;
    }
}

//update daily task status by id
const updateDailyTaskStatus = async (id, status) => {
    return await DailyTaskModel.update({
        status: status
    }, {
        where: {
            id: id
        }
    });
}

//check is daily task expired
const checkDailyTaskExpired = async (id) => {
    const task = await DailyTaskModel.findOne({
        where: {
            id: id,
            status: 'expired'
        }
    });
    if (task) {
        return true;
    } else {
        return false;
    }
}


const updatePackageStatusToOld = async(courseClientId) => {
    try {
      let result = await DailyPackageModel.update({ status: 'old' }, {
        where: {
          courseClientId: courseClientId
        }
      }).then(num => {
        return true;
      })
        .catch(err => {
          return true;
        });
      return result;
    } catch (error) {
      return true;
    }
  }

//export all functions
module.exports = {
    updateDailyPackageStatus,
    checkDailyPackageTasks,
    updateDailyTaskStatus,
    checkDailyTaskExpired,
    updatePackageStatusToOld
}