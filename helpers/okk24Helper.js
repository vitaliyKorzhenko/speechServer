const OkkCourses = require('../models').OkkCourses
const Courses = require('../models').Courses;
//find okk course by okkId

async function findOkkCourseByOkkId(okkId) {
    try {
        let okkCourse = await OkkCourses.findOne({
            where: {
                okkId: okkId
            },
            raw: true
        })
        return okkCourse
    } catch (error) {
        console.log(error)
        return null
    }
}

//find course by id

async function findCourseById(courseId) {
    try {
        let course = await Courses.findOne({
            where: {
                id: courseId
            },
            raw: true
        })
        return course
    } catch (error) {
        console.log(error)
        return null
    }
}

//exports
module.exports = {
    findOkkCourseByOkkId: findOkkCourseByOkkId,
    findCourseById: findCourseById
}