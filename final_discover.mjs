import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Use RPC to get column names if possible
  const { data, error } = await supabase.rpc('get_table_info', { t_name: 'relatorios' });
  if (error) {
    console.log("RPC Error:", error.message);
    // Try to get one row and log it
    const { data: row } = await supabase.from('relatorios').select('*').limit(1);
    if (row && row.length > 0) {
      console.log("COLUMNS FOUND IN ROW:", Object.keys(row[0]));
    } else {
      console.log("Table is empty, trying to find columns via common names...");
      const common = ['student_id', 'aluno_id', 'school_id', 'escola_id', 'municipio_id', 'type', 'tipo', 'content', 'conteudo', 'description', 'descricao', 'id', 'created_at', 'updated_at', 'title', 'titulo', 'status'];
      for (const col of common) {
        const { error } = await supabase.from('relatorios').select(col).limit(0);
        if (!error) console.log(`Column '${col}' EXISTS`);
      }
    }
  } else {
    console.log("TABLE INFO:", data);
  }
}

run();
