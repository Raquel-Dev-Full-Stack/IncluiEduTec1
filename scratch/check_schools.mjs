import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Buscar a escola do Paulo
  const { data: schoolPaulo, error: errP } = await supabase
    .from('schools')
    .select('id, name')
    .eq('id', '807a6f4e-740f-4411-ac56-93fe2470cd1a')
    .maybeSingle();

  // Buscar a escola do José Philipe
  const { data: schoolJose, error: errJ } = await supabase
    .from('schools')
    .select('id, name')
    .eq('id', 'c0641041-1489-438e-93c0-54007e864d90')
    .maybeSingle();

  console.log("Escola do Diretor Paulo:");
  console.log(schoolPaulo || errP);

  console.log("\nEscola do aluno José Philipe:");
  console.log(schoolJose || errJ);
}

run();
