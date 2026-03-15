import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const email = 'priya.mehta@nitkkr.ac.in'; // Is this Priya's email?
        // Let's get the email of Priya from Auth or DB
        const { data: teacher } = await supabaseAdmin.from('teachers').select('*').ilike('name', '%Priya%').single();

        console.log("Teacher email is:", teacher.email);

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: teacher.email,
            password: 'password123'
        });

        if (error) {
            console.log("Auth Error!", error.message);
            return;
        }

        const token = data.session.access_token;

        const query = new URLSearchParams({
            academic_year: '2024-25',
            semester: 5,
            section: 'A'
        }).toString();

        const response = await fetch(`http://localhost:5000/api/teachers/courses/63/students?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const text = await response.text();
        console.log("HTTP STATUS:", response.status);
        console.log("HTTP BODY:", text);

    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}
test();
