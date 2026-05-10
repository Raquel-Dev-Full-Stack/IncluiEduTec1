
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

async function checkDuplicates() {
  console.log('Checking for duplicate emails in users table...');
  const { data, error } = await supabase.from('users').select('email');
  
  if (error) {
    console.error('Query Error:', error);
    return;
  }

  const counts = {};
  data.forEach(u => {
    if (u.email) {
      counts[u.email] = (counts[u.email] || 0) + 1;
    }
  });

  const duplicates = Object.keys(counts).filter(email => counts[email] > 1);
  if (duplicates.length > 0) {
    console.log('DUPLICATE EMAILS FOUND:');
    duplicates.forEach(email => {
      console.log(`${email}: ${counts[email]} occurrences`);
    });
  } else {
    console.log('No duplicate emails found.');
  }
}

checkDuplicates();
