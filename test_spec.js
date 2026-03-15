import supabaseAdmin from './backend/config/supabase.js';
import * as studentService from './backend/services/student.service.js';

async function test() {
    const studentId = '72ec6fba-ce09-44e7-95fe-b276a267e457';

    // Find their auth id
    const { data: student } = await supabaseAdmin.from('students').select('auth_id').eq('id', studentId).single();
    if (!student) return console.log("Student not found");

    const attendance = await studentService.getAttendance(student.auth_id);
    console.log("Attendance for manipulated student:", JSON.stringify(attendance, null, 2));
}

test();
