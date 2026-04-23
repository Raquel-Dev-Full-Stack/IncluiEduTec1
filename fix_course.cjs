const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'components', 'CourseTab.tsx');
let content = fs.readFileSync(filePath, 'utf8');
// Remove tipo video - substitui por leitura
content = content.split("type: 'video'").join("type: 'leitura'");
// Remove badge de video do typeConfig (mantém só leitura, atividade, quiz)
content = content.split("video:      { icon: 'fa-play-circle',   label: 'Vídeo',     color: 'bg-blue-100 text-blue-700' },").join('');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Tipos video removidos com sucesso!');
