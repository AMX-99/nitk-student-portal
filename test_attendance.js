import * as studentService from './backend/services/student.service.js';
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const authId = '7ed9570a-6da5-4552-ab5f-addcd859d909'; // Rahul Sharma
        const attendance = await studentService.getAttendance(authId);
        console.log("Formatted Attendance:", JSON.stringify(attendance, null, 2));
    } catch (err) {
        console.error(err);
    }
}

test();
