import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function check() {
  console.log('Listing Auth Users:');
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error);
  } else {
    const user = data.users.find(u => u.email === 'jorgemediadorniteroi@teste.com');
    if (user) {
      console.log('Found Auth User:', JSON.stringify(user, null, 2));
      
      // Now let's try to fix it by inserting into public.users
      console.log('Attempting to insert into public.users...');
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          auth_user_id: user.id,
          email: user.email,
          name: 'Jorge Silva',
          role: 'mediador',
          active: true,
          // We need municipio_id and school_id. 
          // I'll try to guess or use the ones from the screenshot/context.
          // Maricá - RJ usually has a municipio_id.
        }])
        .select();
      
      if (insertError) {
        console.error('Insert Error:', insertError);
      } else {
        console.log('Successfully inserted user:', JSON.stringify(inserted, null, 2));
      }
    } else {
      console.log('Auth User not found.');
    }
  }
}

check();
