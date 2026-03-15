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

        const res = await axios.get('http://localhost:5000/api/teachers/courses/63/students', {
            params: {
                academic_year: '2024-25',
                semester: 5,
                section: 'A'
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("SUCCESS:", res.data.data.length, "Students");
        console.log("Students:", res.data.data);
    } catch (err) {
        console.error("FAILURE:", err?.response?.data || err.message);
    }
}
test();
