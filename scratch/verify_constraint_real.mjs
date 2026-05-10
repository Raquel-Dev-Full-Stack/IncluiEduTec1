
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

async function inspectConstraints() {
  console.log('Inspecting constraints on public.users...');
  // We can't query pg_catalog directly via standard RPC usually, 
  // but we can try to trigger errors or use common inspection RPCs if they exist.
  
  // Try to insert a duplicate email to see if it fails with unique constraint error
  const testEmail = 'duplicate_test@example.com';
  
  console.log('Inserting first user...');
  await supabase.from('users').insert({ email: testEmail, name: 'Test 1', role: 'mediador' });
  
  console.log('Inserting duplicate user...');
  const { error } = await supabase.from('users').insert({ email: testEmail, name: 'Test 2', role: 'mediador' });
  
  if (error) {
    console.log('Constraint found (expected):', error.message);
  } else {
    console.log('NO UNIQUE CONSTRAINT FOUND ON EMAIL! Duplicate inserted successfully.');
    // Cleanup
    await supabase.from('users').delete().eq('email', testEmail);
  }
}

inspectConstraints();
