import fs from 'fs';

const content = fs.readFileSync('App.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Buscando StudentDetailsView em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('StudentDetailsView')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log('\n--- Buscando MOCK_STUDENTS em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('MOCK_STUDENTS')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log('\n--- Buscando session ou auth em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('supabase.auth') || line.includes('getSession') || line.includes('onAuthStateChange')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
