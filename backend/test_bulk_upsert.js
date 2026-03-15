import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testBulkUpsert() {
  const { data: results } = await supabaseAdmin.from('results').select('id').limit(1);
  const existingId = results[0]?.id;
  
  if (!existingId) return console.log("No existing results");

  const resultsData = [
    {
      student_id: 'cad0edc5-a814-44da-a16c-cda055f69149',
      course_id: 59,
      teacher_id: '7a22bda2-8d70-40c5-b163-3c84f9c5bcc7',
      academic_year: '2024-25',
      semester: 3,
      section: 'A',
      internal_marks: 33,
      external_marks: 44,
      grade: 'A',
      grade_points: 9,
      // NO ID
    },
    {
      student_id: '577ea3e9-d836-4e09-b52e-484008fc0205',
      course_id: 59,
      teacher_id: '7a22bda2-8d70-40c5-b163-3c84f9c5bcc7',
      academic_year: '2024-25',
      semester: 3,
      section: 'A',
      internal_marks: 11,
      external_marks: 22,
      grade: 'B',
      grade_points: 8,
      id: existingId // HAS IS
    }
  ];

  const { data, error } = await supabaseAdmin.from('results').upsert(resultsData);
  console.log("Upsert Error:", error);
}

testBulkUpsert();
