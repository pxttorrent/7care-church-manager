import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PointsCalculator, UserData } from '@/lib/pointsCalculator';

interface UserPointsData {
  points: number;
  userData: UserData;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  breakdown: any;
  total: number;
}

export const useUserPoints = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UserPointsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsConfig, setPointsConfig] = useState<any>(null);

  // Buscar configuração de pontuação
  useEffect(() => {
    const fetchPointsConfig = async () => {
      try {
        const response = await fetch('/api/system/points-config');
        if (response.ok) {
          const config = await response.json();
          setPointsConfig(config);
        }
      } catch (err) {
        console.warn('Não foi possível carregar configuração de pontuação:', err);
      }
    };

    fetchPointsConfig();
  }, []);

  const fetchUserPoints = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Buscando dados de pontuação para usuário:', user.id);
      const response = await fetch(`/api/users/${user.id}/points-details`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados de pontuação: ${response.status}`);
      }

      const result = await response.json();
      console.log('Dados recebidos do servidor:', result);
      
      // Verificar se userData existe
      if (!result.userData) {
        console.warn('userData não encontrado, criando dados padrão');
        result.userData = {
          engajamento: 'Baixo',
          classificacao: 'A resgatar',
          dizimista: 'Não dizimista',
          ofertante: 'Não ofertante',
          tempoBatismo: 0,
          cargos: [],
          nomeUnidade: null,
          temLicao: false,
          comunhao: 0,
          missao: 0,
          estudoBiblico: 0,
          totalPresenca: 0,
          batizouAlguem: false,
          discipuladoPosBatismo: 0,
          cpfValido: false,
          camposVaziosACMS: false
        };
      }
      
      // Adicionar os pontos reais do usuário aos dados
      result.userData.actualPoints = result.points;
      
      // Se temos configuração do banco, usar ela para cálculo correto
      if (pointsConfig && typeof pointsConfig === 'object') {
        // USAR DIRETAMENTE OS PONTOS DA API EM VEZ DE CALCULAR
        const totalPoints = result.points;
        
        console.log('🔍 Usando pontos diretos da API:', totalPoints);
        console.log('🔍 Dados do usuário:', result.userData);
        console.log('🔍 Configuração de pontos:', pointsConfig);
        
        // Garantir que objetos aninhados existam
        const safeConfig = {
          engajamento: pointsConfig.engajamento || {},
          classificacao: pointsConfig.classificacao || {},
          dizimista: pointsConfig.dizimista || {},
          ofertante: pointsConfig.ofertante || {},
          tempoBatismo: pointsConfig.tempoBatismo || {},
          cargos: pointsConfig.cargos || {},
          nomeUnidade: pointsConfig.nomeUnidade || {},
          temLicao: pointsConfig.temLicao || {},
          escolaSabatina: pointsConfig.escolaSabatina || {},
          totalPresenca: pointsConfig.totalPresenca || {},
          cpfValido: pointsConfig.cpfValido || {},
          camposVaziosACMS: pointsConfig.camposVaziosACMS || {}
        };
        
        // Criar breakdown baseado nos pontos da API (COM PROTEÇÃO PARA EVITAR ERROS)
        const breakdown = {
          engajamento: result.userData.engajamento && typeof result.userData.engajamento === 'string' ? 
            (result.userData.engajamento.toLowerCase().includes('baixo') ? (safeConfig.engajamento?.baixo || 0) :
             result.userData.engajamento.toLowerCase().includes('médio') || result.userData.engajamento.toLowerCase().includes('medio') ? (safeConfig.engajamento?.medio || 0) :
             result.userData.engajamento.toLowerCase().includes('alto') ? (safeConfig.engajamento?.alto || 0) : 0) : 0,
          classificacao: result.userData.classificacao && typeof result.userData.classificacao === 'string' ? 
            (result.userData.classificacao.toLowerCase().includes('frequente') ? (safeConfig.classificacao?.frequente || 0) : (safeConfig.classificacao?.naoFrequente || 0)) : 0,
          dizimista: result.userData.dizimista && typeof result.userData.dizimista === 'string' ? 
            (result.userData.dizimista.toLowerCase().includes('não dizimista') || result.userData.dizimista.toLowerCase().includes('nao dizimista') ? (safeConfig.dizimista?.naoDizimista || 0) :
             result.userData.dizimista.toLowerCase().includes('pontual') ? (safeConfig.dizimista?.pontual || 0) :
             result.userData.dizimista.toLowerCase().includes('sazonal') ? (safeConfig.dizimista?.sazonal || 0) :
             result.userData.dizimista.toLowerCase().includes('recorrente') ? (safeConfig.dizimista?.recorrente || 0) : 0) : 0,
          ofertante: result.userData.ofertante && typeof result.userData.ofertante === 'string' ? 
            (result.userData.ofertante.toLowerCase().includes('não ofertante') || result.userData.ofertante.toLowerCase().includes('nao ofertante') ? (safeConfig.ofertante?.naoOfertante || 0) :
             result.userData.ofertante.toLowerCase().includes('pontual') ? (safeConfig.ofertante?.pontual || 0) :
             result.userData.ofertante.toLowerCase().includes('sazonal') ? (safeConfig.ofertante?.sazonal || 0) :
             result.userData.ofertante.toLowerCase().includes('recorrente') ? (safeConfig.ofertante?.recorrente || 0) : 0) : 0,
          tempoBatismo: result.userData.tempoBatismo ? 
            (result.userData.tempoBatismo >= 2 && result.userData.tempoBatismo < 5 ? (safeConfig.tempoBatismo?.doisAnos || 0) :
             result.userData.tempoBatismo >= 5 && result.userData.tempoBatismo < 10 ? (safeConfig.tempoBatismo?.cincoAnos || 0) :
             result.userData.tempoBatismo >= 10 && result.userData.tempoBatismo < 20 ? (safeConfig.tempoBatismo?.dezAnos || 0) :
             result.userData.tempoBatismo >= 20 && result.userData.tempoBatismo < 30 ? (safeConfig.tempoBatismo?.vinteAnos || 0) :
             result.userData.tempoBatismo >= 30 ? (safeConfig.tempoBatismo?.maisVinte || 0) : 0) : 0,
          cargos: result.userData.cargos && result.userData.cargos.length > 0 ? 
            (result.userData.cargos.length === 1 ? (safeConfig.cargos?.umCargo || 0) :
             result.userData.cargos.length === 2 ? (safeConfig.cargos?.doisCargos || 0) :
             (safeConfig.cargos?.tresOuMais || 0)) : 0,
          nomeUnidade: result.userData.nomeUnidade ? (safeConfig.nomeUnidade?.comUnidade || 0) : 0,
          temLicao: result.userData.temLicao ? (safeConfig.temLicao?.comLicao || 0) : 0,
          comunhao: result.userData.escolaSabatina?.comunhao ? (result.userData.escolaSabatina.comunhao * (safeConfig.escolaSabatina?.comunhao || 0)) : 0,
          missao: result.userData.escolaSabatina?.missao ? (result.userData.escolaSabatina.missao * (safeConfig.escolaSabatina?.missao || 0)) : 0,
          estudoBiblico: result.userData.escolaSabatina?.estudoBiblico ? (result.userData.escolaSabatina.estudoBiblico * (safeConfig.escolaSabatina?.estudoBiblico || 0)) : 0,
          totalPresenca: result.userData.totalPresenca !== undefined ? 
            (result.userData.totalPresenca >= 0 && result.userData.totalPresenca <= 3 ? (safeConfig.totalPresenca?.zeroATres || 0) :
             result.userData.totalPresenca >= 4 && result.userData.totalPresenca <= 7 ? (safeConfig.totalPresenca?.quatroASete || 0) :
             (safeConfig.totalPresenca?.oitoATreze || 0)) : 0,
          batizouAlguem: result.userData.escolaSabatina?.batizouAlguem ? (safeConfig.escolaSabatina?.batizouAlguem || 0) : 0,
          discipuladoPosBatismo: result.userData.escolaSabatina?.discipuladoPosBatismo ? (result.userData.escolaSabatina.discipuladoPosBatismo * (safeConfig.escolaSabatina?.discipuladoPosBatismo || 0)) : 0,
          cpfValido: result.userData.cpfValido ? (safeConfig.cpfValido?.valido || 0) : 0,
          camposVaziosACMS: result.userData.camposVaziosACMS === false ? (safeConfig.camposVaziosACMS?.completos || 0) : 0
        };
        
        setData({
          ...result,
          breakdown,
          total: totalPoints
        });
        
        // Definir actualPoints como o valor da API
        result.userData.actualPoints = totalPoints;
        
        console.log('🔍 Dados finais configurados (usando API):', {
          total: totalPoints,
          actualPoints: result.userData.actualPoints,
          breakdown
        });
      } else {
        // Fallback para cálculo padrão se não tiver configuração
        const { total, breakdown } = PointsCalculator.calculateDetailedPoints(result.userData);
        console.log('Breakdown calculado (fallback):', breakdown);
        console.log('Total calculado (fallback):', total);
        
        setData({
          ...result,
          breakdown,
          total
        });
        
        // Definir actualPoints como o valor da API
        result.userData.actualPoints = result.points;
        
        console.log('🔍 Dados finais configurados (fallback):', {
          total,
          actualPoints: result.userData.actualPoints,
          breakdown
        });
      }
    } catch (err) {
      console.error('Erro ao buscar dados de pontuação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, [user?.id, pointsConfig]);

  const refetch = () => {
    fetchUserPoints();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
}; 