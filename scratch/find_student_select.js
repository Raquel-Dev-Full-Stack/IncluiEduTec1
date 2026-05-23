import fs from 'fs';

const content = fs.readFileSync('App.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Ocorrências de selectedStudentIdForView em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('selectedStudentIdForView')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log('--- Ocorrências de setSelectedStudentIdForView em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('setSelectedStudentIdForView')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
