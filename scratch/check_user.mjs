import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pRC7Z9GG8bjt2Ve9Y2vhJG7mgaz76k6Qh1YVqfgNR6U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Checking user: jorgemediadorniteroi@teste.com');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'jorgemediadorniteroi@teste.com');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('User data:', JSON.stringify(data, null, 2));
  }
}

check();
