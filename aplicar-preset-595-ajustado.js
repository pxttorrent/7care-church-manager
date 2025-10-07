/**
 * Script para aplicar preset AJUSTADO de pontuação com média de 595 pontos
 * Versão 2 - Valores aumentados para compensar a diferença
 * 
 * Uso: node aplicar-preset-595-ajustado.js
 */

// Média atual: 462
// Meta: 595
// Diferença: +133 pontos necessários
// Fator de ajuste: 595/462 = 1.29

const preset = {
  "engajamento": {
    "baixo": 40,      // era 30 → +33%
    "medio": 80,      // era 60 → +33%
    "alto": 120       // era 90 → +33%
  },
  "classificacao": {
    "frequente": 180,     // era 135 → +33%
    "naoFrequente": 40    // era 30 → +33%
  },
  "dizimista": {
    "naoDizimista": 0,
    "pontual": 100,       // era 75 → +33%
    "sazonal": 200,       // era 150 → +33%
    "recorrente": 290     // era 220 → +32%
  },
  "ofertante": {
    "naoOfertante": 0,
    "pontual": 50,        // era 38 → +32%
    "sazonal": 80,        // era 60 → +33%
    "recorrente": 120     // era 90 → +33%
  },
  "tempoBatismo": {
    "doisAnos": 25,       // era 20 → +25%
    "cincoAnos": 50,      // era 40 → +25%
    "dezAnos": 80,        // era 60 → +33%
    "vinteAnos": 105,     // era 80 → +31%
    "maisVinte": 130      // era 100 → +30%
  },
  "cargos": {
    "umCargo": 20,        // era 15 → +33%
    "doisCargos": 40,     // era 30 → +33%
    "tresOuMais": 60      // era 45 → +33%
  },
  "nomeUnidade": {
    "comUnidade": 25      // era 20 → +25%
  },
  "temLicao": {
    "comLicao": 35        // era 25 → +40%
  },
  "totalPresenca": {
    "zeroATres": 0,
    "quatroASete": 40,    // era 30 → +33%
    "oitoATreze": 80      // era 60 → +33%
  },
  "escolaSabatina": {
    "comunhao": 4,        // era 3 → +33%
    "missao": 4,          // era 3 → +33%
    "estudoBiblico": 4,   // era 3 → +33%
    "batizouAlguem": 130, // era 100 → +30%
    "discipuladoPosBatismo": 7  // era 5 → +40%
  },
  "cpfValido": {
    "valido": 25          // era 20 → +25%
  },
  "camposVaziosACMS": {
    "completos": 50       // era 40 → +25%
  }
};

async function aplicarPreset() {
  const URL_BASE = process.env.URL_BASE || 'https://7care.netlify.app';
  
  console.log('🎯 Aplicando preset AJUSTADO de pontuação (média 595)...');
  console.log('📊 Ajuste aplicado: +29% nos valores para compensar diferença\n');
  
  try {
    console.log('📤 Enviando configuração para o servidor...');
    const response = await fetch(`${URL_BASE}/api/system/points-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preset)
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Configuração salva com sucesso!');
    console.log('📊 Resultado:', result);
    
    console.log('\n⏳ Aguardando recálculo automático...');
    console.log('🔄 Disparando recálculo de pontos...');
    
    const recalcResponse = await fetch(`${URL_BASE}/api/system/recalculate-points`, {
      method: 'POST'
    });
    
    if (recalcResponse.ok) {
      const recalcResult = await recalcResponse.json();
      console.log('✅ Recálculo iniciado:', recalcResult.message || 'Processando...');
    }
    
    // Aguardar alguns segundos e verificar status
    console.log('\n⏳ Monitorando progresso...');
    let progressAttempts = 0;
    const maxAttempts = 60; // 2 minutos
    
    while (progressAttempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
      
      const statusResponse = await fetch(`${URL_BASE}/api/system/recalculation-status`);
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        
        if (status.isRecalculating) {
          const progress = Math.round(status.progress || 0);
          const processed = status.processedUsers || 0;
          const total = status.totalUsers || 0;
          console.log(`📊 Progresso: ${progress}% (${processed}/${total} usuários)`);
        } else {
          console.log('✅ Recálculo concluído!');
          break;
        }
      }
      
      progressAttempts++;
    }
    
    // Verificar nova média
    console.log('\n📈 Verificando nova média de pontuação...');
    const usersResponse = await fetch(`${URL_BASE}/api/users`);
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      const totalPoints = nonAdminUsers.reduce((sum, u) => sum + (u.points || 0), 0);
      const average = Math.round(totalPoints / nonAdminUsers.length);
      
      console.log(`\n✅ RESULTADO FINAL:`);
      console.log(`   👥 Total de usuários: ${nonAdminUsers.length}`);
      console.log(`   🎯 Pontos totais: ${totalPoints.toLocaleString('pt-BR')}`);
      console.log(`   📊 Média de pontos: ${average}`);
      console.log(`   🎯 Meta: 595 pontos`);
      console.log(`   📈 Diferença: ${average - 595 >= 0 ? '+' : ''}${average - 595} pontos`);
      
      if (Math.abs(average - 595) <= 15) {
        console.log(`\n🎉 SUCESSO! Média dentro da meta (±15 pontos)!`);
      } else if (Math.abs(average - 595) <= 30) {
        console.log(`\n✅ PRÓXIMO DA META! Ajuste fino pode ser necessário.`);
      } else {
        console.log(`\n⚠️  Média fora da meta. Ajustes adicionais são necessários.`);
        
        // Sugerir novo ajuste
        const newFactor = 595 / average;
        console.log(`\n💡 SUGESTÃO: Multiplicar valores atuais por ${newFactor.toFixed(2)}x`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao aplicar preset:', error.message);
    process.exit(1);
  }
}

// Executar
aplicarPreset();

