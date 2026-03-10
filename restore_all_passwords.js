import supabaseAdmin from './backend/config/supabase.js';

async function restore() {
    const { data: teachers } = await supabaseAdmin.from('teachers').select('auth_id');
    let restoredT = 0;
    for (let t of (teachers || [])) {
        if (t.auth_id) {
            await supabaseAdmin.auth.admin.updateUserById(t.auth_id, { password: "Teacher@123" });
            restoredT++;
        }
    }
    console.log("Restored " + restoredT + " teachers passwords to 'Teacher@123'");

    const { data: students } = await supabaseAdmin.from('students').select('auth_id');
    let restoredS = 0;
    for (let s of (students || [])) {
        if (s.auth_id) {
            await supabaseAdmin.auth.admin.updateUserById(s.auth_id, { password: "Student@123" });
            restoredS++;
        }
    }
    console.log("Restored " + restoredS + " students passwords to 'Student@123'");

    const { data: admins } = await supabaseAdmin.from('admins').select('auth_id');
    let restoredA = 0;
    for (let a of (admins || [])) {
        if (a.auth_id) {
            await supabaseAdmin.auth.admin.updateUserById(a.auth_id, { password: "Admin@123" });
            restoredA++;
        }
    }
    console.log("Restored " + restoredA + " admins passwords to 'Admin@123'");
}

restore();
