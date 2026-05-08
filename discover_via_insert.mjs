import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('relatorios').insert({ titulo: 'TEST_DISCOVERY' }).select();
  if (error) {
    console.log("Insert error:", error.message);
  } else {
    console.log("COLUMNS FOUND IN INSERTED ROW:", Object.keys(data[0]));
    // Cleanup
    await supabase.from('relatorios').delete().eq('id', data[0].id);
  }
}

run();
