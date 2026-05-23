import fs from 'fs';

const filePath = 'c:/Users/RAQUEL/Desktop/Projetos MicroSaas/5Projeto IncluiEdutec5/IncluiEduTec1/App.tsx';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('TeacherInclusivePlans')) {
    console.log(`${idx + 1}: ${line.trim()}`);
    // Print 10 lines after
    for (let i = 1; i <= 15; i++) {
      if (lines[idx + i]) {
        console.log(`  ${idx + 1 + i}: ${lines[idx + i].trim()}`);
      }
    }
  }
});
