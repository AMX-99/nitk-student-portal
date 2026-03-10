import 'dotenv/config';
import axios from 'axios';
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const { data: user, error: userError } = await supabaseAdmin.auth.signInWithPassword({
            email: 'amit.verma@nitkkr.ac.in',
            password: 'password123'
        });
        if (userError) throw userError;
        const token = user.session.access_token;

        const res = await axios.post('http://localhost:5000/api/teachers/attendance', {
            course_id: 59,
            academic_year: '2024-25',
            semester: 5,
            section: 'A',
            date: '2026-03-10',
            records: [
                { student_id: '577ea3e9-d836-4e09-b52e-484008fc0205', status: 'P' }
            ]
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log("SUCCESS:", res.data);
    } catch (err) {
        console.error("FAILURE:", err?.response?.data || err);
    }
}
test();
