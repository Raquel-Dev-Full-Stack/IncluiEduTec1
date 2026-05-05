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
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listConstraints() {
  const sql = `
    SELECT
        tc.table_name, 
        tc.constraint_name, 
        tc.constraint_type,
        string_agg(kcu.column_name, ',') as columns
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name IN ('classes', 'students', 'users', 'schools')
      AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
    GROUP BY 1, 2, 3;
  `;
  
  // We can't run arbitrary SQL easily without RPC, but we can try to find an RPC or use a trick.
  // Actually, let's try to query a table that might exist if the user followed my previous instructions.
  // In a previous convo, I might have created a helper function.
  
  // Let's try to just use the error messages again but with MORE combinations.
}

async function testCombinations() {
    console.log('Testing more combinations...');
    const tables = ['classes', 'students', 'users'];
    const possibleCols = ['name', 'school_id', 'ra', 'email', 'id', 'name,school_id', 'name,school_id,shift', 'ra,school_id'];
    
    for (const table of tables) {
        for (const cols of possibleCols) {
            const { error } = await supabase.from(table).upsert([{}], { onConflict: cols });
            if (error) {
                if (error.message.includes('unique or exclusion constraint')) {
                    // This combination is NOT a unique constraint
                } else {
                    console.log(`[MATCH FOUND] Table ${table} has unique constraint on: ${cols} (Error: ${error.message.substring(0, 40)})`);
                }
            } else {
                console.log(`[MATCH FOUND] Table ${table} has unique constraint on: ${cols} (Success!)`);
            }
        }
    }
}

testCombinations();
