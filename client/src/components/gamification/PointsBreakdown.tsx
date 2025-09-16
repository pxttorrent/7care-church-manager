import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Book, 
  Heart, 
  Calendar,
  Award,
  CheckCircle,
  Star,
  Target,
  Gift,
  Crown,
  Mountain,
  Lightbulb,
  ArrowUp
} from 'lucide-react';
import { getLevelByPoints, getMountName, getLevelIcon } from '@/lib/gamification';
import { MountIcon } from '@/components/ui/mount-icon';

interface PointsBreakdownProps {
  userData: any & { actualPoints?: number };
  showDetails?: boolean;
}

interface PointsConfig {
  engajamento: { baixo: number; medio: number; alto: number };
  classificacao: { frequente: number; naoFrequente: number };
  dizimista: { naoDizimista: number; pontual: number; sazonal: number; recorrente: number };
  ofertante: { naoOfertante: number; pontual: number; sazonal: number; recorrente: number };
  tempoBatismo: { doisAnos: number; cincoAnos: number; dezAnos: number; vinteAnos: number; maisVinte: number };
  cargos: { umCargo: number; doisCargos: number; tresOuMais: number };
  nomeUnidade: { comUnidade: number };
  temLicao: { comLicao: number };
  totalPresenca: { zeroATres: number; quatroASete: number; oitoATreze: number };
  escolaSabatina: { comunhao: number; missao: number; estudoBiblico: number; batizouAlguem: number; discipuladoPosBatismo: number };
  cpfValido: { valido: number };
  camposVaziosACMS: { completos: number };
}

export const PointsBreakdown = ({ userData, showDetails = true }: PointsBreakdownProps) => {
  const [pointsConfig, setPointsConfig] = useState<PointsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Debug: Log dos dados recebidos
  console.log('🔍 PointsBreakdown - Dados recebidos:', {
    userData,
    actualPoints: userData?.actualPoints,
    showDetails
  });
  
  // Buscar configuração de pontos do servidor
  useEffect(() => {
    const fetchPointsConfig = async () => {
      try {
        console.log('🔍 PointsBreakdown - Buscando configuração de pontos...');
        const response = await fetch('/api/system/points-config');
        if (response.ok) {
          const config = await response.json();
          console.log('🔍 PointsBreakdown - Configuração carregada:', config);
          setPointsConfig(config);
        } else {
          console.error('🔍 PointsBreakdown - Erro ao carregar configuração:', response.status);
        }
      } catch (error) {
        console.error('🔍 PointsBreakdown - Erro ao buscar configuração de pontos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPointsConfig();
  }, []);

  // Função para gerar dicas personalizadas para cada usuário
  const generatePersonalizedTips = (categoryName: string): string[] => {
    if (!pointsConfig) return [];
    
    const tips: string[] = [];
    
    switch (categoryName) {
      case 'Engajamento':
        if (userData.engajamento && typeof userData.engajamento === 'string') {
          const engajamento = userData.engajamento.toLowerCase();
          if (engajamento.includes('baixo')) {
            tips.push(`🔸 Participe mais ativamente dos cultos e eventos`);
            tips.push(`🔸 Envolva-se em grupos de estudo bíblico`);
            tips.push(`🔸 Ofereça-se para ajudar em atividades da igreja`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.engajamento.medio - pointsConfig.engajamento.baixo} pontos`);
          } else if (engajamento.includes('médio') || engajamento.includes('medio')) {
            tips.push(`🔸 Assuma mais responsabilidades na igreja`);
            tips.push(`🔸 Liderança em ministérios específicos`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.engajamento.alto - pointsConfig.engajamento.medio} pontos`);
          }
        } else {
          tips.push(`🔸 Informe seu nível de engajamento para receber pontos`);
        }
        break;
        
      case 'Classificação':
        if (userData.classificacao && typeof userData.classificacao === 'string') {
          const classificacao = userData.classificacao.toLowerCase();
          if (!classificacao.includes('frequente')) {
            tips.push(`🔸 Aumente sua frequência nos cultos`);
            tips.push(`🔸 Participe regularmente das atividades`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.classificacao.frequente - pointsConfig.classificacao.naoFrequente} pontos`);
          }
        } else {
          tips.push(`🔸 Informe sua classificação para receber pontos`);
        }
        break;
        
      case 'Fidelidade Regular com Dízimo':
        if (userData.dizimista && typeof userData.dizimista === 'string') {
          const dizimista = userData.dizimista.toLowerCase();
          if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) {
            tips.push(`🔸 Comece a contribuir com dízimo`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.dizimista.pontual - pointsConfig.dizimista.naoDizimista} pontos`);
          } else if (dizimista.includes('pontual')) {
            tips.push(`🔸 Torne-se dizimista sazonal`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.dizimista.sazonal - pointsConfig.dizimista.pontual} pontos`);
          } else if (dizimista.includes('sazonal')) {
            tips.push(`🔸 Torne-se dizimista recorrente`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.dizimista.recorrente - pointsConfig.dizimista.sazonal} pontos`);
          }
        } else {
          tips.push(`🔸 Informe seu status de dizimista para receber pontos`);
        }
        break;
        
      case 'Fidelidade Regular com Ofertas':
        if (userData.ofertante && typeof userData.ofertante === 'string') {
          const ofertante = userData.ofertante.toLowerCase();
          if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) {
            tips.push(`🔸 Comece a contribuir com ofertas`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.ofertante.pontual - pointsConfig.ofertante.naoOfertante} pontos`);
          } else if (ofertante.includes('pontual')) {
            tips.push(`🔸 Torne-se ofertante sazonal`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.ofertante.sazonal - pointsConfig.ofertante.pontual} pontos`);
          } else if (ofertante.includes('sazonal')) {
            tips.push(`🔸 Torne-se ofertante recorrente`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.ofertante.recorrente - pointsConfig.ofertante.sazonal} pontos`);
          }
        } else {
          tips.push(`🔸 Informe seu status de ofertante para receber pontos`);
        }
        break;
        
      case 'Tempo de Batismo':
        if (userData.tempoBatismo) {
          const tempo = userData.tempoBatismo;
          if (typeof tempo === 'number') {
            if (tempo < 2) {
              tips.push(`🔸 Continue crescendo espiritualmente`);
              tips.push(`🔸 Potencial de ganhar +${pointsConfig.tempoBatismo.doisAnos} pontos em 2 anos`);
            } else if (tempo < 5) {
              tips.push(`🔸 Potencial de ganhar +${pointsConfig.tempoBatismo.cincoAnos - pointsConfig.tempoBatismo.doisAnos} pontos em 3 anos`);
            } else if (tempo < 10) {
              tips.push(`🔸 Potencial de ganhar +${pointsConfig.tempoBatismo.dezAnos - pointsConfig.tempoBatismo.cincoAnos} pontos em 5 anos`);
            } else if (tempo < 20) {
              tips.push(`🔸 Potencial de ganhar +${pointsConfig.tempoBatismo.vinteAnos - pointsConfig.tempoBatismo.dezAnos} pontos em 10 anos`);
            }
          }
        } else {
          tips.push(`🔸 Informe seu tempo de batismo para receber pontos`);
        }
        break;
        
      case 'Cargos':
        if (userData.cargos && Array.isArray(userData.cargos)) {
          const numCargos = userData.cargos.length;
          if (numCargos === 0) {
            tips.push(`🔸 Candidate-se a um cargo na igreja`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.cargos.umCargo} pontos`);
          } else if (numCargos === 1) {
            tips.push(`🔸 Assuma um segundo cargo`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.cargos.doisCargos - pointsConfig.cargos.umCargo} pontos`);
          } else if (numCargos === 2) {
            tips.push(`🔸 Assuma um terceiro cargo`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.cargos.tresOuMais - pointsConfig.cargos.doisCargos} pontos`);
          }
        } else {
          tips.push(`🔸 Candidate-se a cargos na igreja para receber pontos`);
        }
        break;
        
      case 'Nome da Unidade':
        if (!userData.nomeUnidade || !userData.nomeUnidade.trim()) {
          tips.push(`🔸 Cadastre-se em uma unidade`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.nomeUnidade.comUnidade} pontos`);
        }
        break;
        
      case 'Tem Lição':
        if (!userData.temLicao) {
          tips.push(`🔸 Participe de estudos bíblicos`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.temLicao.comLicao} pontos`);
        }
        break;
        
      case 'Total de Presença':
        if (userData.totalPresenca !== undefined) {
          const presenca = userData.totalPresenca;
          if (presenca <= 3) {
            tips.push(`🔸 Aumente sua frequência nos cultos`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.totalPresenca.quatroASete - pointsConfig.totalPresenca.zeroATres} pontos`);
          } else if (presenca <= 7) {
            tips.push(`🔸 Continue aumentando sua presença`);
            tips.push(`🔸 Potencial de ganhar +${pointsConfig.totalPresenca.oitoATreze - pointsConfig.totalPresenca.quatroASete} pontos`);
          }
        } else {
          tips.push(`🔸 Informe sua frequência para receber pontos`);
        }
        break;
        
      case 'Batizou Alguém':
        if (!userData.batizouAlguem || userData.batizouAlguem === 0) {
          tips.push(`🔸 Envolva-se em evangelismo`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.escolaSabatina.batizouAlguem} pontos por batismo`);
        }
        break;
        
      case 'CPF Válido':
        if (!userData.cpfValido || userData.cpfValido !== 'Sim') {
          tips.push(`🔸 Atualize seu CPF no sistema`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.cpfValido.valido} pontos`);
        }
        break;
        
      case 'Campos Vazios ACMS':
        if (userData.camposVaziosACMS === true) {
          tips.push(`🔸 Complete todos os campos do seu perfil`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.camposVaziosACMS.completos} pontos`);
        }
        break;
        
      case 'Comunhão (ES)':
        if (!userData.escolaSabatina?.comunhao || userData.escolaSabatina.comunhao === 0) {
          tips.push(`🔸 Participe de atividades de comunhão`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.escolaSabatina.comunhao} pontos por atividade`);
        } else {
          tips.push(`🔸 Continue participando de comunhões`);
          tips.push(`🔸 Cada atividade vale +${pointsConfig.escolaSabatina.comunhao} pontos`);
        }
        break;
        
      case 'Missão (ES)':
        if (!userData.escolaSabatina?.missao || userData.escolaSabatina.missao === 0) {
          tips.push(`🔸 Envolva-se em atividades missionárias`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.escolaSabatina.missao} pontos por atividade`);
        } else {
          tips.push(`🔸 Continue com o trabalho missionário`);
          tips.push(`🔸 Cada atividade vale +${pointsConfig.escolaSabatina.missao} pontos`);
        }
        break;
        
      case 'Estudo Bíblico (ES)':
        if (!userData.escolaSabatina?.estudoBiblico || userData.escolaSabatina.estudoBiblico === 0) {
          tips.push(`🔸 Participe de estudos bíblicos`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.escolaSabatina.estudoBiblico} pontos por estudo`);
        } else {
          tips.push(`🔸 Continue estudando a Bíblia`);
          tips.push(`🔸 Cada estudo vale +${pointsConfig.escolaSabatina.estudoBiblico} pontos`);
        }
        break;
        
      case 'Batizou Alguém (ES)':
        if (!userData.escolaSabatina?.batizouAlguem || userData.escolaSabatina.batizouAlguem === 0) {
          tips.push(`🔸 Envolva-se em evangelismo`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.escolaSabatina.batizouAlguem} pontos por batismo`);
        } else {
          tips.push(`🔸 Continue liderando batismos`);
          tips.push(`🔸 Cada batismo vale +${pointsConfig.escolaSabatina.batizouAlguem} pontos`);
        }
        break;
        
      case 'Discipulado Pós-Batismo (ES)':
        if (!userData.escolaSabatina?.discipuladoPosBatismo || userData.escolaSabatina.discipuladoPosBatismo === 0) {
          tips.push(`🔸 Acompanhe novos batizados`);
          tips.push(`🔸 Potencial de ganhar +${pointsConfig.escolaSabatina.discipuladoPosBatismo} pontos por acompanhamento`);
        } else {
          tips.push(`🔸 Continue o discipulado`);
          tips.push(`🔸 Cada acompanhamento vale +${pointsConfig.escolaSabatina.discipuladoPosBatismo} pontos`);
        }
        break;
    }
    
    return tips;
  };


  
  // Se temos os pontos reais do usuário, usar eles
  const actualPoints = (userData as any).actualPoints || 0;
  const currentLevel = getLevelByPoints(actualPoints);
  
  // Calcular pontos de cada categoria baseado na configuração do servidor
  const calculateCategoryPoints = (categoryName: string): number => {
    if (!pointsConfig) return 0;
    
    try {
      switch (categoryName) {
        case 'Engajamento':
          if (userData.engajamento && typeof userData.engajamento === 'string') {
            const engajamento = userData.engajamento.toLowerCase();
            if (engajamento.includes('baixo')) return pointsConfig.engajamento.baixo;
            if (engajamento.includes('médio') || engajamento.includes('medio')) return pointsConfig.engajamento.medio;
            if (engajamento.includes('alto')) return pointsConfig.engajamento.alto;
          }
          return 0;
          
        case 'Classificação':
          if (userData.classificacao && typeof userData.classificacao === 'string') {
            const classificacao = userData.classificacao.toLowerCase();
            if (classificacao.includes('frequente')) return pointsConfig.classificacao.frequente;
            else return pointsConfig.classificacao.naoFrequente;
          }
          return 0;
          
        case 'Dizimista':
          if (userData.dizimista && typeof userData.dizimista === 'string') {
            const dizimista = userData.dizimista.toLowerCase();
            if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) return pointsConfig.dizimista.naoDizimista;
            if (dizimista.includes('pontual')) return pointsConfig.dizimista.pontual;
            if (dizimista.includes('sazonal')) return pointsConfig.dizimista.sazonal;
            if (dizimista.includes('recorrente')) return pointsConfig.dizimista.recorrente;
          }
          return 0;
          
        case 'Ofertante':
          if (userData.ofertante && typeof userData.ofertante === 'string') {
            const ofertante = userData.ofertante.toLowerCase();
            if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) return pointsConfig.ofertante.naoOfertante;
            if (ofertante.includes('pontual')) return pointsConfig.ofertante.pontual;
            if (ofertante.includes('sazonal')) return pointsConfig.ofertante.sazonal;
            if (ofertante.includes('recorrente')) return pointsConfig.ofertante.recorrente;
          }
          return 0;
          
        case 'Tempo de Batismo':
          if (userData.tempoBatismo) {
            if (typeof userData.tempoBatismo === 'string' && userData.tempoBatismo.length > 0) {
              if (userData.tempoBatismo.includes('2 a 4')) return pointsConfig.tempoBatismo.doisAnos;
              if (userData.tempoBatismo.includes('5 a 9')) return pointsConfig.tempoBatismo.cincoAnos;
              if (userData.tempoBatismo.includes('10 a 14')) return pointsConfig.tempoBatismo.dezAnos;
              if (userData.tempoBatismo.includes('15 a 19')) return pointsConfig.tempoBatismo.vinteAnos;
              if (userData.tempoBatismo.includes('20 a 29') || userData.tempoBatismo.includes('30+')) return pointsConfig.tempoBatismo.maisVinte;
            } else if (typeof userData.tempoBatismo === 'number') {
              if (userData.tempoBatismo >= 2 && userData.tempoBatismo < 5) return pointsConfig.tempoBatismo.doisAnos;
              if (userData.tempoBatismo >= 5 && userData.tempoBatismo < 10) return pointsConfig.tempoBatismo.dezAnos;
              if (userData.tempoBatismo >= 10 && userData.tempoBatismo < 20) return pointsConfig.tempoBatismo.vinteAnos;
              if (userData.tempoBatismo >= 20 && userData.tempoBatismo < 30) return pointsConfig.tempoBatismo.vinteAnos;
              if (userData.tempoBatismo >= 30) return pointsConfig.tempoBatismo.maisVinte;
            }
          }
          return 0;
          
        case 'Cargos':
          if (userData.cargos && Array.isArray(userData.cargos)) {
            const numCargos = userData.cargos.length;
            if (numCargos === 1) return pointsConfig.cargos.umCargo;
            if (numCargos === 2) return pointsConfig.cargos.doisCargos;
            if (numCargos >= 3) return pointsConfig.cargos.tresOuMais;
          }
          return 0;
          
        case 'Nome da Unidade':
          if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
            return pointsConfig.nomeUnidade.comUnidade;
          }
          return 0;
          
        case 'Tem Lição':
          if (userData.temLicao) {
            return pointsConfig.temLicao.comLicao;
          }
          return 0;
          
        case 'Total de Presença':
          if (userData.totalPresenca !== undefined) {
            const presenca = userData.totalPresenca;
            if (presenca >= 0 && presenca <= 3) return pointsConfig.totalPresenca.zeroATres;
            if (presenca >= 4 && presenca <= 7) return pointsConfig.totalPresenca.quatroASete;
            if (presenca >= 8 && presenca <= 13) return pointsConfig.totalPresenca.oitoATreze;
          }
          return 0;
          
        case 'Batizou Alguém':
          if (userData.batizouAlguem) {
            if (typeof userData.batizouAlguem === 'number') {
              return userData.batizouAlguem > 0 ? pointsConfig.escolaSabatina.batizouAlguem : 0;
            }
            return userData.batizouAlguem ? pointsConfig.escolaSabatina.batizouAlguem : 0;
          }
          return 0;
          
        case 'CPF Válido':
          if (userData.cpfValido) {
            if (typeof userData.cpfValido === 'string') {
              return userData.cpfValido === 'Sim' ? pointsConfig.cpfValido.valido : 0;
            }
            return userData.cpfValido ? pointsConfig.cpfValido.valido : 0;
          }
          return 0;
          
        case 'Campos Vazios ACMS':
          if (userData.camposVaziosACMS === false) {
            return pointsConfig.camposVaziosACMS.completos;
          }
          return 0;
          
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Erro ao calcular pontos para ${categoryName}:`, error);
      return 0;
    }
  };

  // Função para calcular pontos específicos da Escola Sabatina
  const calculateEscolaSabatinaPoints = (categoryName: string): number => {
    if (!pointsConfig) return 0;
    if (!userData.escolaSabatina) return 0;

    try {
      switch (categoryName) {
        case 'comunhao':
          return (userData.escolaSabatina.comunhao || 0) * pointsConfig.escolaSabatina.comunhao;
        case 'missao':
          return (userData.escolaSabatina.missao || 0) * pointsConfig.escolaSabatina.missao;
        case 'estudoBiblico':
          return (userData.escolaSabatina.estudoBiblico || 0) * pointsConfig.escolaSabatina.estudoBiblico;
        case 'batizouAlguem':
          return (userData.escolaSabatina.batizouAlguem || 0) * pointsConfig.escolaSabatina.batizouAlguem;
        case 'discipuladoPosBatismo':
          return (userData.escolaSabatina.discipuladoPosBatismo || 0) * pointsConfig.escolaSabatina.discipuladoPosBatismo;
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Erro ao calcular pontos para ${categoryName} da Escola Sabatina:`, error);
      return 0;
    }
  };
  
  interface Category {
    name: string;
    points: number;
    icon: any;
    color: string;
    bgColor: string;
    description: string;
  }

  const categories: Category[] = [
    {
      name: 'Engajamento',
      points: calculateCategoryPoints('Engajamento'),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Nível de participação e envolvimento',
    },
    {
      name: 'Classificação',
      points: calculateCategoryPoints('Classificação'),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Status de frequência na igreja',
    },
    {
      name: 'Fidelidade Regular com Dízimo',
      points: calculateCategoryPoints('Dizimista'),
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Fidelidade regular com dízimo',
    },
    {
      name: 'Fidelidade Regular com Ofertas',
      points: calculateCategoryPoints('Ofertante'),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Contribuição com ofertas',
    },
    {
      name: 'Tempo de Batismo',
      points: calculateCategoryPoints('Tempo de Batismo'),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Anos desde o batismo',
    },
    {
      name: 'Cargos',
      points: calculateCategoryPoints('Cargos'),
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Funções na igreja',
    },
    {
      name: 'Nome da Unidade',
      points: calculateCategoryPoints('Nome da Unidade'),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Unidade cadastrada',
    },
    {
      name: 'Tem Lição',
      points: calculateCategoryPoints('Tem Lição'),
      icon: Book,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Participação em estudos',
    },
    {
      name: 'Total de Presença',
      points: calculateCategoryPoints('Total de Presença'),
      icon: Calendar,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      description: 'Frequência nos cultos',
    },
    {
      name: 'CPF Válido',
      points: calculateCategoryPoints('CPF Válido'),
      icon: CheckCircle,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      description: 'Documentação em dia',
    },
    {
      name: 'Campos Vazios ACMS',
      points: calculateCategoryPoints('Campos Vazios ACMS'),
      icon: Mountain,
      color: 'text-stone-600',
      bgColor: 'bg-stone-50',
      description: 'Perfil completo no sistema'
    }
  ];

  // Pontuação máxima por categoria principal
  const getMaxPointsForCategory = (categoryName: string): number => {
    if (!pointsConfig) return 0;
    switch (categoryName) {
      case 'Engajamento':
        return pointsConfig.engajamento.alto;
      case 'Classificação':
        return pointsConfig.classificacao.frequente;
      case 'Fidelidade Regular com Dízimo':
      case 'Fidelidade regular com dízimo':
        return pointsConfig.dizimista.recorrente;
      case 'Fidelidade Regular com Ofertas':
        return pointsConfig.ofertante.recorrente;
      case 'Tempo de Batismo': {
        const t = pointsConfig.tempoBatismo;
        return Math.max(
          t.doisAnos || 0,
          t.cincoAnos || 0,
          t.dezAnos || 0,
          t.vinteAnos || 0,
          t.maisVinte || 0
        );
      }
      case 'Cargos':
        return pointsConfig.cargos.tresOuMais;
      case 'Nome da Unidade':
        return pointsConfig.nomeUnidade.comUnidade;
      case 'Tem Lição':
        return pointsConfig.temLicao.comLicao;
      case 'Total de Presença':
        return pointsConfig.totalPresenca.oitoATreze;
      case 'CPF Válido':
        return pointsConfig.cpfValido.valido;
      case 'Campos Vazios ACMS':
        return pointsConfig.camposVaziosACMS.completos;
      default:
        return 0;
    }
  };

  // Categorias detalhadas da Escola Sabatina
  const escolaSabatinaCategories: Category[] = [
    {
      name: 'Comunhão (ES)',
      points: calculateEscolaSabatinaPoints('comunhao'),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Participação em comunhão',
    },
    {
      name: 'Missão (ES)',
      points: calculateEscolaSabatinaPoints('missao'),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Atividades missionárias',
    },
    {
      name: 'Estudo Bíblico (ES)',
      points: calculateEscolaSabatinaPoints('estudoBiblico'),
      icon: Book,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Estudos bíblicos realizados',
    },
    {
      name: 'Batizou Alguém (ES)',
      points: calculateEscolaSabatinaPoints('batizouAlguem'),
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Liderança em batismos',
    },
    {
      name: 'Discipulado Pós-Batismo (ES)',
      points: calculateEscolaSabatinaPoints('discipuladoPosBatismo'),
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Acompanhamento pós-batismo',
    }
  ];

  // Calcular total da Escola Sabatina
  const totalEscolaSabatina = escolaSabatinaCategories.reduce((total, cat) => total + cat.points, 0);

  // Calcular total de todas as categorias
  const totalCalculated = categories.reduce((total, cat) => total + cat.points, 0) + totalEscolaSabatina;

  const totalPossiblePoints = 3000; // Estimativa baseada nos critérios
  const percentage = Math.round((actualPoints / totalPossiblePoints) * 100);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Detalhes da Pontuação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando configuração de pontos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (!pointsConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Detalhes da Pontuação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Erro ao carregar configuração de pontos
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Detalhes da Pontuação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{actualPoints}</div>
            <div className="text-sm text-muted-foreground">Pontos Reais do Usuário</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              <div className="flex items-center gap-2">
                <MountIcon iconType={getLevelIcon(actualPoints)} className="h-5 w-5" />
                <div className="text-sm font-medium">{getMountName(actualPoints)}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{currentLevel.name}</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{Math.round((actualPoints / 1000) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Completude</div>
            <Progress value={Math.round((actualPoints / 1000) * 100)} className="h-2 mt-2" />
          </div>
        </div>

        {showDetails && (
          <>
            {/* Categorias com pontos e dicas personalizadas */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Categorias Principais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const tips = generatePersonalizedTips(category.name);
                  const hasTips = tips.length > 0;
                  const maxPoints = getMaxPointsForCategory(category.name);
                  const isMax = maxPoints > 0 && category.points >= maxPoints;
                  
                  return (
                    <div
                      key={category.name}
                      className={`p-3 rounded-lg border ${category.bgColor} hover:shadow-md transition-shadow group min-w-0 ${isMax ? 'ring-2 ring-green-200 border-green-300' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className={`h-4 w-4 ${category.color} flex-shrink-0`} />
                          <span className="font-medium text-sm truncate">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {category.points} pts
                          </Badge>
                          {isMax && (
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                              Máximo
                            </Badge>
                          )}
                          {hasTips && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Lightbulb className="h-3 w-3 mr-1" />
                              Dicas
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Dicas personalizadas */}
                      {hasTips && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowUp className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-yellow-800">Como ganhar mais pontos:</span>
                          </div>
                          <div className="space-y-1">
                            {tips.map((tip, index) => (
                              <p key={index} className="text-xs text-yellow-700 leading-relaxed line-clamp-2">
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categorias da Escola Sabatina */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Escola Sabatina</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {escolaSabatinaCategories.map((category) => {
                  const IconComponent = category.icon;
                  const tips = generatePersonalizedTips(category.name);
                  const hasTips = tips.length > 0;
                  
                  return (
                    <div
                      key={category.name}
                      className={`p-3 rounded-lg border ${category.bgColor} hover:shadow-md transition-shadow group min-w-0`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className={`h-4 w-4 ${category.color} flex-shrink-0`} />
                          <span className="font-medium text-sm truncate">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {category.points} pts
                          </Badge>
                          {hasTips && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Lightbulb className="h-3 w-3 mr-1" />
                              Dicas
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Dicas personalizadas */}
                      {hasTips && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowUp className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-yellow-800">Como ganhar mais pontos:</span>
                          </div>
                          <div className="space-y-1">
                            {tips.map((tip, index) => (
                              <p key={index} className="text-xs text-yellow-700 leading-relaxed line-clamp-2">
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo dos Totais */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Resumo dos Totais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{totalCalculated}</div>
                  <div className="text-sm text-muted-foreground">Total Calculado</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{totalEscolaSabatina}</div>
                  <div className="text-sm text-muted-foreground">Total Escola Sabatina</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{actualPoints}</div>
                  <div className="text-sm text-muted-foreground">Pontos Reais</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 