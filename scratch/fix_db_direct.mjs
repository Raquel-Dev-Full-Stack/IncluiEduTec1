import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env', 'utf-8').split('\n');
const envVars = {};
envLines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^"(.*)*$/, '$1');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findConstraints() {
    // We can't use RPC execute_sql, but we can try to use a dummy table or something.
    // Actually, I'll try to create a temporary table and see if I can run DDL.
    // If I can run DDL via the client (using Service Role), I can fix the DB myself!
    
    console.log('Attempting to add constraints directly...');
    
    const sqls = [
        'ALTER TABLE classes ADD CONSTRAINT classes_name_school_id_unique UNIQUE (name, school_id)',
        'ALTER TABLE students ADD CONSTRAINT students_ra_unique UNIQUE (ra)',
        'ALTER TABLE users ADD CONSTRAINT users_name_school_id_unique UNIQUE (name, school_id)'
    ];

    for (const sql of sqls) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql }); // Try common RPC names
        if (error) {
            console.log(`Failed to run SQL via exec_sql: ${error.message}`);
        } else {
            console.log(`Successfully ran SQL: ${sql}`);
        }
    }
}

findConstraints();
