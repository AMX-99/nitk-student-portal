import * as teacherService from './backend/services/teacher.service.js';
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const authId = '36c6dd89-5757-4552-a9e3-966eae21adf0'; // Teacher auth id from attendance record
        const courseId = 59;
        const academicYear = '2024-25';
        const semester = 5;
        const section = 'A';
        const date = new Date().toISOString().split('T')[0]; // Today

        // Simulate one student
        const studentId = '577ea3e9-d836-4e09-b52e-484008fc0205';
        const records = [{ student_id: studentId, status: 'P' }];

        console.log("Marking...", { courseId, academicYear, semester, section, date, records });
        const res = await teacherService.markAttendance(authId, courseId, academicYear, semester, section, date, records);
        console.log("Success:", res);

    } catch (err) {
        console.error("Error:", err);
    }
}

test();
