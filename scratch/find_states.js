import fs from 'fs';

const content = fs.readFileSync('App.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Declaracoes de estado ao redor da linha 70 a 160 ---');
for (let i = 70; i < 160; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
