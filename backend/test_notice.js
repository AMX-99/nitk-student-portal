import dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function test() {
   console.log("Fetching notices...");
   const { data, error } = await supabaseAdmin.from('notices').select('*').limit(1);
   if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
   } else {
      console.log("No data:", data, error);
   }
}

test();
