
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

async function testUniqueAuth() {
  const auth_user_id = '00000000-0000-0000-0000-000000000001';
  console.log('Inserting first user with auth_user_id:', auth_user_id);
  const { data: d1, error: e1 } = await supabase.from('users').insert({ auth_user_id, name: 'Test 1', role: 'professor' }).select();
  if (e1) {
    console.error('Error 1:', e1);
    return;
  }
  console.log('Inserted 1:', d1[0].id);

  console.log('Inserting second user with same auth_user_id...');
  const { data: d2, error: e2 } = await supabase.from('users').insert({ auth_user_id, name: 'Test 2', role: 'professor' }).select();
  if (e2) {
    console.log('Error 2 (EXPECTED if unique):', e2.message);
  } else {
    console.log('Inserted 2 (NOT UNIQUE!):', d2[0].id);
    // Cleanup
    await supabase.from('users').delete().eq('auth_user_id', auth_user_id);
  }
}

testUniqueAuth();
