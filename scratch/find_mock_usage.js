import fs from 'fs';

const content = fs.readFileSync('App.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Buscando MOCK_STUDENTS em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('MOCK_STUDENTS')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log('--- Buscando MOCK_ em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('MOCK_') && !line.includes('constants')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
