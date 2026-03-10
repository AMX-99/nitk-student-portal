import * as studentService from './backend/services/student.service.js';
import * as teacherService from './backend/services/teacher.service.js';
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const studentAuthId = '7ed9570a-6da5-4552-ab5f-addcd859d909'; // Rahul Sharma
    const teacherAuthId = 'a1fbdde7-3932-4217-a065-276f7f631cd4'; // Amit Verma
    const courseId = 59;
    const newDate = '2026-04-01';

    // 1. Fetch student courses initially
    const initial = await studentService.getCourses(studentAuthId);
    const initialCourse = initial.find(c => c.code === 'CS-301');
    console.log("Before marking attendance:", initialCourse);

    // 2. Mark attendance
    const studentId = '577ea3e9-d836-4e09-b52e-484008fc0205';
    await teacherService.markAttendance(
        teacherAuthId, courseId, '2024-25', 5, 'A', newDate,
        [{ student_id: studentId, status: 'P' }]
    );
    console.log("Marked attendance as Present for", newDate);

    // 3. Fetch again
    const after = await studentService.getCourses(studentAuthId);
    const afterCourse = after.find(c => c.code === 'CS-301');
    console.log("After marking attendance:", afterCourse);
}

test();
