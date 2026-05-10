
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

async function checkIndices() {
  // Use RPC to get index info if possible, or try a trick
  console.log('Checking for unique email constraint...');
  // Since I can't run raw SQL easily, I'll try to insert a duplicate email and see the error.
  const testEmail = 'test_duplicate_' + Math.random() + '@example.com';
  
  await supabase.from('users').insert({ email: testEmail, name: 'Test 1', role: 'mediador' });
  const { error } = await supabase.from('users').insert({ email: testEmail, name: 'Test 2', role: 'mediador' });
  
  if (error && error.code === '23505') {
    console.log('Email is UNIQUE (correct).');
  } else if (!error) {
    console.log('Email is NOT UNIQUE! (This is likely the problem).');
    // Cleanup
    await supabase.from('users').delete().eq('email', testEmail);
  } else {
    console.log('Unexpected error:', error);
  }
}

checkIndices();
