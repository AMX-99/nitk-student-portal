import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { error } = await supabase.from('timetable_slots').insert({
    course_id: 1, // dummy
    day_of_week: 0,
    start_time: '09:00',
    end_time: '10:00',
    room: '', // dummy
    // department_id: '', 
    semester: 5,
    section: 'A',
    academic_year: '2024-25',
    slot_type: 'lecture'
  });
  console.log('Error:', error);
}

test();
