import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data, error } = await supabaseAdmin.rpc('get_foreign_keys');
    console.log("If RPC fails we bypass. Error:", error?.message);

    // Directly querying pg_catalog via raw SQL isn't supported through normal supabase client `from()`
    // but we can just query the tables to get openapi spec!
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    const swagger = await res.json();
    console.log("Swagger paths:", Object.keys(swagger.paths));
    console.log("Enrollment relationships:", swagger.definitions?.enrollments?.relationships || "none");
}

test();
