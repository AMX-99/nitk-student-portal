import supabaseAdmin from './backend/config/supabase.js';
import * as teacherService from './backend/services/teacher.service.js';

async function test() {
    const courseId = 63; // CS-502
    const academicYear = '2024-25';
    const semester = 5;
    const section = 'A';

    try {
        const students = await teacherService.getCourseStudents(courseId, academicYear, semester, section);
        console.log("Students found using service:", students.length);
    } catch (err) {
        console.error("Service error:", err.message);
    }

    // Raw query without semester
    const { data, error } = await supabaseAdmin.from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('academic_year', academicYear)
        .eq('section', section);

    console.log("Raw enrollments:", data?.length, "Rows:", data);
}

test();
