
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

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsertJS() {
  console.log('Testing JS upsert on users...');
  const { error } = await supabase.from('users').upsert([
    { email: 'upsert_test@example.com', name: 'Test' }
  ], { onConflict: 'email' });

  if (error) {
    console.error('Upsert Error:', error);
  } else {
    console.log('Upsert Success!');
    await supabase.from('users').delete().eq('email', 'upsert_test@example.com');
  }
}

testUpsertJS();
