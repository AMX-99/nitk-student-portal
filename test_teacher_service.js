import * as teacherService from './backend/services/teacher.service.js';

async function test() {
    try {
        const courseId = 60; // CS-401
        const academicYear = '2024-25';
        const semester = 4;
        const section = 'A';

        console.log("Calling getCourseStudents...");
        const students = await teacherService.getCourseStudents(courseId, academicYear, semester, section);
        console.log("Returned Students Array:", JSON.stringify(students, null, 2));

    } catch (err) {
        console.error("Error:", err.message);
    }
}

test();
