
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = path.join(process.cwd(), '.env');
const envVars = fs.readFileSync(envFile, 'utf-8').split('\n').reduce((acc, line) => {
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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPCV3() {
  console.log('Calling execute_user_upsert_v3 RPC...');
  const res = await supabase.rpc('execute_user_upsert_v3', {
    p_auth_id: '00000000-0000-0000-0000-000000000000', // Dummy Auth ID
    p_name: 'Test Mediator V3',
    p_email: 'test_v3_' + Date.now() + '@example.com',
    p_role: 'mediador',
    p_school_id: null,
    p_municipio_id: null,
    p_password: null
  });

  console.log('FULL RESPONSE V3:', JSON.stringify(res, null, 2));
}

testRPCV3();
