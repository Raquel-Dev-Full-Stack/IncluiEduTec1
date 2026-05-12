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

async function inspectTriggers() {
  console.log('Inspecting users triggers...');
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: `
      SELECT 
        tgname, 
        pg_get_triggerdef(pg_trigger.oid) as definition 
      FROM pg_trigger 
      JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
      WHERE pg_class.relname = 'users'
    `
  });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Triggers:', JSON.stringify(data, null, 2));
  }
}

inspectTriggers();
