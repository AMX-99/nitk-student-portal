import supabaseAdmin from './backend/config/supabase.js';

async function restore() {
    const { data: teachers } = await supabaseAdmin.from('teachers').select('*');
    let restored = 0;
    for (let t of teachers) {
        if (t.email.includes('anita') || t.email.includes('priya')) {
            await supabaseAdmin.auth.admin.updateUserById(
                t.auth_id,
                { password: "password" } // Based on seed file or standard default?
            );
            restored++;
        }
    }
    console.log("Restored " + restored + " teachers passwords to 'password'");
}
restore();
