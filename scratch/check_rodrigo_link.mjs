import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  console.log("Checking Schools...");
  const { data: schools, error: schoolsError } = await supabase.from('schools').select('id, uuid, name, inep');
  if (schoolsError) console.error("Error fetching schools:", schoolsError);
  else console.table(schools);

  console.log("\nChecking Users (Rodrigo)...");
  const { data: users, error: usersError } = await supabase.from('users').select('id, uuid, email, name, school_id, role').ilike('email', '%rodrigo%');
  if (usersError) console.error("Error fetching users:", usersError);
  else console.table(users);

  console.log("\nChecking Professor Details (Rodrigo)...");
  const { data: details, error: detailsError } = await supabase.from('professor_details').select('*').ilike('email', '%rodrigo%');
  if (detailsError) console.log("Note: professor_details might not have 'email' column or table doesn't exist.");
  else console.table(details);
}

checkData();
