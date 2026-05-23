import fs from 'fs';

const content = fs.readFileSync('App.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Buscando localStorage em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('localStorage')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log('\n--- Buscando setStudents ou similar em App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('setStudents') || line.includes('fetchStudents') || line.includes('studentsData')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log('\n--- Buscando a função fetchData em App.tsx ---');
let insideFetchData = false;
let openBrackets = 0;
let lineCount = 0;
lines.forEach((line, index) => {
  if (line.includes('const fetchData =') || line.includes('async function fetchData')) {
    insideFetchData = true;
    console.log(`Linha de início de fetchData: ${index + 1}`);
  }
  if (insideFetchData) {
    lineCount++;
    if (lineCount < 100) {
      console.log(`${index + 1}: ${line}`);
    }
  }
});
