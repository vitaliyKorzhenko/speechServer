const db = require("../models");
const CoachModel = require("../models").Coaches;
const CourseCoachesModel = require("../models").CourseCoaches;
const DaliyPackagesModel = require("../models").DaliyPackages;
const ClientCoaches = require("../models").ClientCoaches;
const Coaches = require("../models").Coaches;
/* 
Coach Service - db work with coaches
*/

/* 
find all coaches
*/

async function findAllCoaches() {
  let result = await CoachModel.findAll({
    where: {
      status: "active",
    },
    raw: true,
  })
    .then((coaches) => {
      return coaches;
    })
    .catch((err) => {
      return [];
    });
  return result;
}


/* 
    find active coaches for course!

*/

async function findActiveCoachesForCourse (courseId) {
    let result = await CourseCoachesModel.findAll({
      where: {
        isActive: true,
        courseId: courseId
      },
      raw: true,
    })
      .then((coaches) => {
        return coaches;
      })
      .catch((err) => {
        return [];
      });
    return result;
 }


 /* 
    find active coaches for course! 
    use UI MODEL

    use course id
*/
 async function findCoachesForAdminUI (courseId) {
    // result coaches with isActive - true or false
    let resultCoaches = [];


    //first find all coaches
    let allCoaches = await findAllCoaches();

    //find active coaches for course
    let activeCourseCoaches = await findActiveCoachesForCourse(courseId);

    allCoaches.forEach(coach => {
        let isActiveCoach = activeCourseCoaches.find(x => x.coachId == coach.id && x.isActive);
        if (isActiveCoach) {
          resultCoaches.push({
            coach: coach,
            isActive: true
          })
        } else {
          resultCoaches.push({
            coach: coach,
            isActive: false
          })
        }
    });
    return resultCoaches;
 }



 async function findClientStartAndEndDate (courseClientId) {
  console.log("courseClientId", courseClientId);
  let res = await DaliyPackagesModel.findAll(
    {
      where: {
        courseClientId: courseClientId,
      },
      raw: true
    }).then(packages => {
        var minElement;
        var maxElement;
        if (packages && packages.length > 0) {
            minElement = packages && packages.reduce(function (a, b) { return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? a : b; }); 
            maxElement = packages && packages.reduce(function (a, b) { return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? a : b; }); 
        }

      return {
        dateStart: minElement ? minElement.createdAt : "", 
        dateEnd: maxElement ? maxElement.createdAt : "", 
        lessonNumber: packages && packages.length > 0 ? packages.length : 0 };
    }).catch(err => {
      console.log("er")
       return null;
    });

    return res;
 }  



async function findActiveCoachesForCourseClient (courseClientId) {
  let result = await ClientCoaches.findAll({
    where: {
      status: 'Active',
      courseClientId: courseClientId
    },
    include: [
      { 
          model: Coaches, as: 'Coach'
          
      },
  ],
    raw: true,
  })
    .then((coaches) => {
      return coaches;
    })
    .catch((err) => {
      return [];
    });
  return result;
}

module.exports = {
    findCoachesForAdminUI: findCoachesForAdminUI,
    findClientStartAndEndDate: findClientStartAndEndDate,
    findActiveCoachesForCourseClient: findActiveCoachesForCourseClient
};
