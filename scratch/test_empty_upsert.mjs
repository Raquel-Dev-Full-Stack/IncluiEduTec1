import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env', 'utf-8').split('\n');
const envVars = {};
envLines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmptyUpsert() {
    console.log('Testing empty upsert with onConflict...');
    const { error } = await supabase.from('users').upsert([], { onConflict: 'name,school_id' });
    if (error) {
        console.log('Error message:', error.message);
    } else {
        console.log('Empty upsert: OK');
    }
}

testEmptyUpsert();
