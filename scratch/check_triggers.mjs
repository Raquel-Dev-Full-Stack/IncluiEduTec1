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

async function checkTriggers() {
  console.log('Checking users triggers...');
  const { data, error } = await supabase.rpc('get_db_metrics');
  // If we can't run arbitrary SQL, let's look at the triggers list if returned by metrics
  console.log(JSON.stringify(data?.triggers, null, 2));
}

checkTriggers();
