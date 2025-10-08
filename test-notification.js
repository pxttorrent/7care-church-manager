// Script para testar notificações
const testNotification = async () => {
  console.log('🧪 TESTANDO NOTIFICAÇÃO...');
  
  try {
    const response = await fetch('https://7care.netlify.app/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Teste SW v11',
        message: 'Esta notificação deve aparecer limpa, sem JSON!',
        type: 'general'
      })
    });
    
    const data = await response.json();
    console.log('✅ Resposta:', data);
    
    if (data.success) {
      console.log('🎉 Notificação enviada com sucesso!');
      console.log('📱 Verifique se aparece limpa no dispositivo');
    } else {
      console.error('❌ Erro:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
};

// Executar teste
testNotification();
