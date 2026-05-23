import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/RAQUEL/Desktop/Projetos MicroSaas/5Projeto IncluiEdutec5/IncluiEduTec1/components/TeacherInclusivePlans.tsx';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('.id') && !line.includes('?.id')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
