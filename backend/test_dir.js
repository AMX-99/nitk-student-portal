import supabaseAdmin from './config/supabase.js';
async function test() {
  const { data, error } = await supabaseAdmin.from('teachers').select('id, name, email, phone, designation, office_hours, bio, department:department_id(name, code)').order('name');
  console.log(error || data);
}
test();
