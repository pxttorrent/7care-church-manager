import https from 'https';

const testRichNotification = async () => {
  console.log('🧪 TESTANDO NOTIFICAÇÃO COM MÍDIA RICA...');
  
  const payload = {
    title: 'Teste Mídia Rica',
    message: 'Esta é uma notificação de teste com emojis! 🎉📱✨',
    type: 'general',
    userId: null,
    hasImage: true,
    hasAudio: true,
    imageName: 'teste.jpg',
    audioSize: 25600
  };

  const options = {
    hostname: '7care.netlify.app',
    port: 443,
    path: '/api/push/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(payload))
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Resposta:', JSON.parse(data));
        console.log('🎉 Notificação com mídia enviada com sucesso!');
        console.log('📱 Verifique se aparece com indicadores de mídia');
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro:', error);
      reject(error);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
};

testRichNotification().catch(console.error);
