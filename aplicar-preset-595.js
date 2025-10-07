/**
 * Script para aplicar preset de pontuação com média de 595 pontos
 * 
 * Uso: node aplicar-preset-595.js
 */

const preset = {
  "engajamento": {
    "baixo": 30,
    "medio": 60,
    "alto": 90
  },
  "classificacao": {
    "frequente": 135,
    "naoFrequente": 30
  },
  "dizimista": {
    "naoDizimista": 0,
    "pontual": 75,
    "sazonal": 150,
    "recorrente": 220
  },
  "ofertante": {
    "naoOfertante": 0,
    "pontual": 38,
    "sazonal": 60,
    "recorrente": 90
  },
  "tempoBatismo": {
    "doisAnos": 20,
    "cincoAnos": 40,
    "dezAnos": 60,
    "vinteAnos": 80,
    "maisVinte": 100
  },
  "cargos": {
    "umCargo": 15,
    "doisCargos": 30,
    "tresOuMais": 45
  },
  "nomeUnidade": {
    "comUnidade": 20
  },
  "temLicao": {
    "comLicao": 25
  },
  "totalPresenca": {
    "zeroATres": 0,
    "quatroASete": 30,
    "oitoATreze": 60
  },
  "escolaSabatina": {
    "comunhao": 3,
    "missao": 3,
    "estudoBiblico": 3,
    "batizouAlguem": 100,
    "discipuladoPosBatismo": 5
  },
  "cpfValido": {
    "valido": 20
  },
  "camposVaziosACMS": {
    "completos": 40
  }
};

async function aplicarPreset() {
  const URL_BASE = process.env.URL_BASE || 'https://7care.netlify.app';
  
  console.log('🎯 Aplicando preset de pontuação (média 595)...\n');
  
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
      console.log(`   🎯 Pontos totais: ${totalPoints}`);
      console.log(`   📊 Média de pontos: ${average}`);
      console.log(`   🎯 Meta: 595 pontos`);
      console.log(`   📈 Diferença: ${average - 595 >= 0 ? '+' : ''}${average - 595} pontos`);
      
      if (Math.abs(average - 595) <= 10) {
        console.log(`\n🎉 SUCESSO! Média dentro da meta (±10 pontos)!`);
      } else {
        console.log(`\n⚠️  Média fora da meta. Ajustes podem ser necessários.`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao aplicar preset:', error.message);
    process.exit(1);
  }
}

// Executar
aplicarPreset();

