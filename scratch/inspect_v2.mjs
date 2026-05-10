
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envVars = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    acc[key] = value;
  }
  return acc;
}, {});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTable() {
  console.log('Inspecting users table...');
  
  // Try to get columns and constraints via a query that usually works in Supabase if we have service role
  const { data: cols, error: colErr } = await supabase.from('users').select('*').limit(1);
  if (colErr) console.error('Error selecting from users:', colErr);
  else console.log('Columns found:', Object.keys(cols[0] || {}));

  // Check if we can get function definitions
  const { data: functions, error: funcErr } = await supabase.rpc('get_functions_info', { schema_name: 'public' });
  if (funcErr) {
    console.error('Error listing functions (RPC get_functions_info might not exist):', funcErr);
    
    // Try to search for specific functions
    const checkFuncs = ['execute_user_upsert', 'execute_user_upsert_v2', 'execute_user_upsert_v3'];
    for (const f of checkFuncs) {
        const { error } = await supabase.rpc(f, {});
        if (error && error.code === 'PGRST202') {
            console.log(`Function ${f}: NOT FOUND`);
        } else {
            console.log(`Function ${f}: FOUND (or error other than Not Found)`);
        }
    }
  } else {
    console.log('Functions:', functions);
  }
}

inspectTable();
