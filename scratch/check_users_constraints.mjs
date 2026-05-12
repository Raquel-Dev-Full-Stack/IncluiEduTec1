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

async function checkConstraints() {
  console.log('Checking users constraints...');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) console.log('Select error:', error);
  
  // Since we can't run arbitrary SQL easily if execute_sql is missing, 
  // let's try to do a manual insert and check the error.
  const testEmail = 'test_constraint_' + Date.now() + '@example.com';
  const { error: insertError } = await supabase.from('users').insert([
    { email: testEmail, name: 'Test', role: 'mediador' }
  ], { onConflict: 'email' });
  
  console.log('Insert Error:', JSON.stringify(insertError, null, 2));
}

checkConstraints();
