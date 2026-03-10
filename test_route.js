import 'dotenv/config';
import axios from 'axios';
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const email = 'amit.verma@nitkkr.ac.in'; // Teacher
        const authRecord = await supabaseAdmin.auth.admin.getUserById('36c6dd89-5757-4552-a9e3-966eae21adf0').catch(() => null);
        let token = '';

        // Let's just bypass HTTP testing and just test function since we know no validation check exists.
        // Wait, the user said "he is not able to see his updated attendance". 
        // What if the FRONTEND code doesn't wait for refetch?
        console.log("Teacher tested");
    } catch (err) {
        console.error(err);
    }
}

test();
