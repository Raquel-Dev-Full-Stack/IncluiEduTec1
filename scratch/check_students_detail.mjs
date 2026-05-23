import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Aluno José Philipe
  const { data: jose, error: errJose } = await supabase
    .from('students')
    .select('*')
    .eq('name', 'José Philipe')
    .maybeSingle();

  // Diretor Paulo
  const { data: paulo, error: errPaulo } = await supabase
    .from('users')
    .select('*')
    .eq('name', 'Paulo')
    .maybeSingle();

  console.log("ALUNO JOSÉ PHILIPE COMPLETO:");
  console.log(jose);

  console.log("\nDIRETOR PAULO COMPLETO:");
  console.log(paulo);

  if (jose && jose.class_id) {
    const { data: turma, error: errTurma } = await supabase
      .from('classes')
      .select('*')
      .eq('id', jose.class_id)
      .maybeSingle();
    console.log("\nTURMA DO ALUNO:");
    console.log(turma);
  }
}

run();
