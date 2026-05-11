import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function discover() {
  console.log('Fetching Jorge details...');
  const { data } = await supabase.from('users').select('id, auth_user_id, email').eq('email', 'jorgemediadorniteroi@teste.com').single();
  console.log('Jorge in DB:', data);
}

discover();
