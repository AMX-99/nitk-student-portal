import supabaseAdmin from './backend/config/supabase.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function checkTeachers() {
    try {
        console.log(`Checking database connectivity...`);
        const { data, error } = await supabaseAdmin.from('teachers').select('id').limit(1);
        if (error) {
            console.error('Database Error:', error);
        } else {
            console.log('Database connected. Found:', data.length, 'teachers.');

            const { data: anitas, error: anitaError } = await supabaseAdmin
                .from('teachers')
                .select('name, email')
                .ilike('name', '%Anita%');

            if (anitaError) {
                console.error('Error searching Anita:', anitaError);
            } else {
                console.log('--- Matching Teachers ---');
                anitas.forEach(t => console.log(` - ${t.name}: ${t.email}`));
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

checkTeachers();
