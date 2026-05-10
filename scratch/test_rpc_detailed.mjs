
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

async function testRPC() {
  console.log('Testing execute_user_upsert RPC...');
  const { data, error } = await supabase.rpc('execute_user_upsert', {
    p_auth_id: '00000000-0000-0000-0000-000000000000',
    p_name: 'Test RPC',
    p_email: 'test_rpc@example.com',
    p_role: 'mediador',
    p_school_id: null,
    p_municipio_id: null,
    p_password: null
  });

  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('RPC Success:', data);
  }
}

testRPC();
