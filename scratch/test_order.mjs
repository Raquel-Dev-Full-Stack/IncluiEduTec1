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

async function testOrder() {
    console.log('Testing classes order...');
    const { error: err1 } = await supabase.from('classes').upsert([{}], { onConflict: 'name,school_id' });
    console.log('name,school_id:', err1 ? err1.message.substring(0, 50) : 'SUCCESS');

    const { error: err2 } = await supabase.from('classes').upsert([{}], { onConflict: 'school_id,name' });
    console.log('school_id,name:', err2 ? err2.message.substring(0, 50) : 'SUCCESS');
}

testOrder();
