const fs = require('fs');
const path = '/Users/filipevitolapeixoto/Downloads/7care.1609.25.1/client/src/components/gamification/PointsBreakdown.tsx';

let content = fs.readFileSync(path, 'utf8');

// Substituir pointsConfig por safeConfig nas linhas dentro de generatePersonalizedTips
// Pegar todo o conteúdo da função
const funcStart = content.indexOf('const generatePersonalizedTips');
const funcEnd = content.indexOf('const getPointsForCategory', funcStart);

if (funcStart > 0 && funcEnd > funcStart) {
  const funcContent = content.substring(funcStart, funcEnd);
  const fixedFuncContent = funcContent.replace(/pointsConfig\./g, 'safeConfig.');
  content = content.substring(0, funcStart) + fixedFuncContent + content.substring(funcEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Substituições realizadas com sucesso!');
