import fs from 'fs';
import path from 'path';

const componentsDir = 'components';
const files = fs.readdirSync(componentsDir);

console.log('--- Buscando referências a StudentDetailsView na pasta components ---');
files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.statSync(filePath).isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.vue'))) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('StudentDetailsView')) {
      console.log(`Encontrado em components/${file}`);
    }
  }
});
