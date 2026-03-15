import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function test() {
   const { data, error } = await supabaseAdmin.from('notices').select('*').limit(1);
   if (data) {
       fs.writeFileSync('schema_out.txt', JSON.stringify(Object.keys(data[0] || {})));
   } else {
       fs.writeFileSync('schema_out.txt', JSON.stringify(error));
   }
}
test();
