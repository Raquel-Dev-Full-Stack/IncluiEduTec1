import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env', 'utf-8').split('\n');
const envVars = {};
envLines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  console.log('Checking constraints...');
  
  const queries = [
    {
      name: 'users (name, school_id)',
      sql: `SELECT count(*) FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
            WHERE tc.table_name = 'users' AND tc.constraint_type = 'UNIQUE' 
            AND kcu.column_name IN ('name', 'school_id')
            GROUP BY tc.constraint_name HAVING count(*) = 2`
    },
    {
      name: 'classes (name, school_id)',
      sql: `SELECT count(*) FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
            WHERE tc.table_name = 'classes' AND tc.constraint_type = 'UNIQUE' 
            AND kcu.column_name IN ('name', 'school_id')
            GROUP BY tc.constraint_name HAVING count(*) = 2`
    },
    {
      name: 'students (ra)',
      sql: `SELECT count(*) FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
            WHERE tc.table_name = 'students' AND tc.constraint_type = 'UNIQUE' 
            AND kcu.column_name = 'ra'`
    }
  ];

  for (const query of queries) {
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query.sql });
    if (error) {
      // If RPC execute_sql doesn't exist, we'll try a different approach
      console.log(`Could not check ${query.name}: ${error.message}`);
      continue;
    }
    console.log(`${query.name}: ${data && data.length > 0 ? 'Found' : 'Missing'}`);
  }
}

// Since I don't know if execute_sql exists, I'll try to just do a dummy upsert and catch error
async function testUpserts() {
    console.log('\nTesting upserts...');
    
    const tests = [
        { table: 'classes', cols: 'name,school_id' },
        { table: 'classes', cols: 'id' },
        { table: 'students', cols: 'ra' },
        { table: 'students', cols: 'id' },
        { table: 'users', cols: 'name,school_id' },
        { table: 'users', cols: 'email' },
        { table: 'users', cols: 'id' }
    ];

    for (const t of tests) {
        const { error } = await supabase.from(t.table).upsert([{}], { onConflict: t.cols });
        if (error && error.message.includes('unique or exclusion constraint')) {
            console.log(`[FAIL] ${t.table} with ${t.cols}: ${error.message}`);
        } else if (error) {
            console.log(`[PASS CONFLICT] ${t.table} with ${t.cols}: (Other error: ${error.message.substring(0, 50)}...)`);
        } else {
            console.log(`[SUCCESS] ${t.table} with ${t.cols}`);
        }
    }
}

testUpserts();
