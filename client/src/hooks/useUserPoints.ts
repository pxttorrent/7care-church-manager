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
      if (pointsConfig) {
        // USAR DIRETAMENTE OS PONTOS DA API EM VEZ DE CALCULAR
        const totalPoints = result.points;
        
        console.log('🔍 Usando pontos diretos da API:', totalPoints);
        console.log('🔍 Dados do usuário:', result.userData);
        console.log('🔍 Configuração de pontos:', pointsConfig);
        
        // Criar breakdown baseado nos pontos da API
        const breakdown = {
          engajamento: result.userData.engajamento && typeof result.userData.engajamento === 'string' ? 
            (result.userData.engajamento.toLowerCase().includes('baixo') ? pointsConfig.engajamento.baixo :
             result.userData.engajamento.toLowerCase().includes('médio') || result.userData.engajamento.toLowerCase().includes('medio') ? pointsConfig.engajamento.medio :
             result.userData.engajamento.toLowerCase().includes('alto') ? pointsConfig.engajamento.alto : 0) : 0,
          classificacao: result.userData.classificacao && typeof result.userData.classificacao === 'string' ? 
            (result.userData.classificacao.toLowerCase().includes('frequente') ? pointsConfig.classificacao.frequente : pointsConfig.classificacao.naoFrequente) : 0,
          dizimista: result.userData.dizimista && typeof result.userData.dizimista === 'string' ? 
            (result.userData.dizimista.toLowerCase().includes('não dizimista') || result.userData.dizimista.toLowerCase().includes('nao dizimista') ? pointsConfig.dizimista.naoDizimista :
             result.userData.dizimista.toLowerCase().includes('pontual') ? pointsConfig.dizimista.pontual :
             result.userData.dizimista.toLowerCase().includes('sazonal') ? pointsConfig.dizimista.sazonal :
             result.userData.dizimista.toLowerCase().includes('recorrente') ? pointsConfig.dizimista.recorrente : 0) : 0,
          ofertante: result.userData.ofertante && typeof result.userData.ofertante === 'string' ? 
            (result.userData.ofertante.toLowerCase().includes('não ofertante') || result.userData.ofertante.toLowerCase().includes('nao ofertante') ? pointsConfig.ofertante.naoOfertante :
             result.userData.ofertante.toLowerCase().includes('pontual') ? pointsConfig.ofertante.pontual :
             result.userData.ofertante.toLowerCase().includes('sazonal') ? pointsConfig.ofertante.sazonal :
             result.userData.ofertante.toLowerCase().includes('recorrente') ? pointsConfig.ofertante.recorrente : 0) : 0,
          tempoBatismo: result.userData.tempoBatismo ? 
            (result.userData.tempoBatismo >= 2 && result.userData.tempoBatismo < 5 ? pointsConfig.tempoBatismo.doisAnos :
             result.userData.tempoBatismo >= 5 && result.userData.tempoBatismo < 10 ? pointsConfig.tempoBatismo.cincoAnos :
             result.userData.tempoBatismo >= 10 && result.userData.tempoBatismo < 20 ? pointsConfig.tempoBatismo.dezAnos :
             result.userData.tempoBatismo >= 20 && result.userData.tempoBatismo < 30 ? pointsConfig.tempoBatismo.vinteAnos :
             result.userData.tempoBatismo >= 30 ? pointsConfig.tempoBatismo.maisVinte : 0) : 0,
          cargos: result.userData.cargos && result.userData.cargos.length > 0 ? 
            (result.userData.cargos.length === 1 ? pointsConfig.cargos.umCargo :
             result.userData.cargos.length === 2 ? pointsConfig.cargos.doisCargos :
             pointsConfig.cargos.tresOuMais) : 0,
          nomeUnidade: result.userData.nomeUnidade ? pointsConfig.nomeUnidade.comUnidade : 0,
          temLicao: result.userData.temLicao ? pointsConfig.temLicao.comLicao : 0,
          comunhao: result.userData.escolaSabatina?.comunhao ? (result.userData.escolaSabatina.comunhao * pointsConfig.escolaSabatina.comunhao) : 0,
          missao: result.userData.escolaSabatina?.missao ? (result.userData.escolaSabatina.missao * pointsConfig.escolaSabatina.missao) : 0,
          estudoBiblico: result.userData.escolaSabatina?.estudoBiblico ? (result.userData.escolaSabatina.estudoBiblico * pointsConfig.escolaSabatina.estudoBiblico) : 0,
          totalPresenca: result.userData.totalPresenca !== undefined ? 
            (result.userData.totalPresenca >= 0 && result.userData.totalPresenca <= 3 ? pointsConfig.totalPresenca.zeroATres :
             result.userData.totalPresenca >= 4 && result.userData.totalPresenca <= 7 ? pointsConfig.totalPresenca.quatroASete :
             pointsConfig.totalPresenca.oitoATreze) : 0,
          batizouAlguem: result.userData.escolaSabatina?.batizouAlguem ? pointsConfig.escolaSabatina.batizouAlguem : 0,
          discipuladoPosBatismo: result.userData.escolaSabatina?.discipuladoPosBatismo ? (result.userData.escolaSabatina.discipuladoPosBatismo * pointsConfig.escolaSabatina.discipuladoPosBatismo) : 0,
          cpfValido: result.userData.cpfValido ? pointsConfig.cpfValido.valido : 0,
          camposVaziosACMS: result.userData.camposVaziosACMS === false ? pointsConfig.camposVaziosACMS.completos : 0
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