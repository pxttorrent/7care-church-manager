import { readdirSync, writeFileSync, statSync } from 'fs';
import { join, extname } from 'path';

// Função para listar todos os arquivos recursivamente
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Gerar manifest
function generateManifest() {
  const distPath = join(process.cwd(), 'dist');
  const allFiles = getAllFiles(distPath);
  
  // Filtrar apenas assets importantes
  const assets = allFiles
    .filter(file => {
      const ext = extname(file);
      return ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.html', '.json'].includes(ext);
    })
    .map(file => {
      // Converter caminho absoluto para relativo à raiz do site
      return '/' + file.replace(distPath + '/', '').replace(/\\/g, '/');
    })
    .filter(file => {
      // Excluir sw.js e outros service workers
      return !file.includes('sw.js') && !file.includes('sw-manifest.js');
    });

  // Criar conteúdo do manifest
  const manifestContent = `// Manifest de assets para cache offline - Gerado automaticamente
// Total de assets: ${assets.length}
self.OFFLINE_ASSETS = ${JSON.stringify(assets, null, 2)};
`;

  // Salvar arquivo
  const outputPath = join(distPath, 'sw-manifest.js');
  writeFileSync(outputPath, manifestContent, 'utf8');
  
  console.log(`✅ Manifest gerado: ${assets.length} assets`);
  console.log(`📄 Arquivo: ${outputPath}`);
  
  // Mostrar alguns exemplos
  console.log('\n📦 Exemplos de assets:');
  assets.slice(0, 10).forEach(asset => console.log(`  - ${asset}`));
  if (assets.length > 10) {
    console.log(`  ... e mais ${assets.length - 10} assets`);
  }
}

// Executar
generateManifest();

