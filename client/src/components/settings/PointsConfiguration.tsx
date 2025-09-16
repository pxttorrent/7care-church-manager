import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Gift, 
  Heart, 
  Calendar,
  Award,
  Target,
  CheckCircle,
  Book,
  Crown,
  Star,
  Mountain,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePointsConfig } from '@/hooks/usePointsConfig';

interface PointsConfig {
  engajamento: {
    baixo: number;
    medio: number;
    alto: number;
  };
  classificacao: {
    frequente: number;
    naoFrequente: number;
  };
  dizimista: {
    naoDizimista: number;
    pontual: number;
    sazonal: number;
    recorrente: number;
  };
  ofertante: {
    naoOfertante: number;
    pontual: number;
    sazonal: number;
    recorrente: number;
  };
  tempoBatismo: {
    doisAnos: number;
    cincoAnos: number;
    dezAnos: number;
    vinteAnos: number;
    maisVinte: number;
  };
  cargos: {
    umCargo: number;
    doisCargos: number;
    tresOuMais: number;
  };
  nomeUnidade: {
    comUnidade: number;
  };
  temLicao: {
    comLicao: number;
  };
  pontuacaoDinamica: {
    multiplicador: number;
  };
  totalPresenca: {
    zeroATres: number;
    quatroASete: number;
    oitoATreze: number;
  };
  escolaSabatina: {
    comunhao: number;
    missao: number;
    estudoBiblico: number;
    batizouAlguem: number;
    discipuladoPosBatismo: number;
  };
  cpfValido: {
    valido: number;
  };
  camposVaziosACMS: {
    semCamposVazios: number;
  };
}

const defaultConfig: PointsConfig = {
  engajamento: {
    baixo: 10,
    medio: 25,
    alto: 50,
  },
  classificacao: {
    frequente: 75,
    naoFrequente: 25
  },
  dizimista: {
    naoDizimista: 0,
    pontual: 25,
    sazonal: 50,
    recorrente: 100
  },
  ofertante: {
    naoOfertante: 0,
    pontual: 25,
    sazonal: 50,
    recorrente: 100
  },
  tempoBatismo: {
    doisAnos: 25,
    cincoAnos: 50,
    dezAnos: 100,
    vinteAnos: 150,
    maisVinte: 200
  },
  cargos: {
    umCargo: 50,
    doisCargos: 100,
    tresOuMais: 150
  },
  nomeUnidade: {
    comUnidade: 25
  },
  temLicao: {
    comLicao: 50
  },
  pontuacaoDinamica: {
    multiplicador: 5
  },
  totalPresenca: {
    zeroATres: 25,
    quatroASete: 50,
    oitoATreze: 100
  },
  escolaSabatina: {
    comunhao: 50,
    missao: 75,
    estudoBiblico: 100,
    batizouAlguem: 200,
    discipuladoPosBatismo: 25
  },
  cpfValido: {
    valido: 50
  },
  camposVaziosACMS: {
    semCamposVazios: 100
  }
};

export const PointsConfiguration = () => {
  const { config, isLoading, saveConfig, resetConfig, updateConfig, getTotalMaxPoints, getConfigSummary, getCurrentParameterAverage, getCurrentUserAverage, calculateDistrictAverage } = usePointsConfig();
  const { toast } = useToast();
  
  // Recuperar a última média do distrito salva no localStorage
  const [districtAverage, setDistrictAverage] = useState<number | null>(() => {
    const saved = localStorage.getItem('lastDistrictAverage');
    return saved ? Number(saved) : null;
  });
  const [currentSystemAverage, setCurrentSystemAverage] = useState<number>(0);
  const [adjustmentFactor, setAdjustmentFactor] = useState<number>(1);
  
  // Recuperar a data da última execução
  const [lastExecutionDate, setLastExecutionDate] = useState<string | null>(() => {
    return localStorage.getItem('lastDistrictAverageDate');
  });

  // Carregar média atual dos usuários
  useEffect(() => {
    const loadCurrentAverage = async () => {
      const average = await getCurrentUserAverage();
      setCurrentSystemAverage(average);
    };
    loadCurrentAverage();
  }, [getCurrentUserAverage]);

  // Ensure config is always defined
  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await saveConfig(config);
  };

  const handleReset = () => {
    resetConfig();
  };

  const handleCalculateDistrictAverage = async () => {
    if (!districtAverage) return;
    
    try {
      const result = await calculateDistrictAverage(districtAverage);
      if (result.success) {
        setCurrentSystemAverage(parseFloat(result.newAverage));
        setAdjustmentFactor(parseFloat(result.adjustmentFactor));
        
        // Salvar a média do distrito no localStorage para manter fixa
        localStorage.setItem('lastDistrictAverage', districtAverage.toString());
        
        // Salvar a data da execução
        const now = new Date().toLocaleString('pt-BR');
        localStorage.setItem('lastDistrictAverageDate', now);
        setLastExecutionDate(now);
        
        toast({
          title: "Média do distrito calculada!",
          description: `Configurações ajustadas para atingir média de ${districtAverage} pontos.`,
        });
      } else {
        toast({
          title: "Erro ao calcular média",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao calcular média",
        description: "Erro inesperado ao processar a solicitação",
        variant: "destructive"
      });
    }
  };

  const handleResetDistrictAverage = () => {
    setDistrictAverage(null);
    setCurrentSystemAverage(0);
    setAdjustmentFactor(1);
    setLastExecutionDate(null);
    // Remover a média do distrito do localStorage
    localStorage.removeItem('lastDistrictAverage');
    localStorage.removeItem('lastDistrictAverageDate');
  };

  const renderSection = (
    title: string,
    icon: any,
    section: keyof PointsConfig,
    fields: { key: string; label: string; description: string }[]
  ) => {
    const IconComponent = icon;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={field.key}
                    type="number"
                    min="0"
                    value={config[section]?.[field.key as keyof typeof config[typeof section]] || 0}
                    onChange={(e) => updateConfig(section, field.key, parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  <Badge variant="secondary" className="text-xs">
                    pontos
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Base de Cálculo do Sistema
          </h2>
          <p className="text-muted-foreground">
            Configure os pontos para cada critério de avaliação dos usuários
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando e recalculando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Atenção: Alterações afetam a base de cálculo de pontuação de todos os usuários. Os pontos serão recalculados automaticamente após salvar.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="space-y-6">
        {renderSection(
          "Engajamento",
          TrendingUp,
          "engajamento",
          [
            { key: "baixo", label: "Baixo", description: "Engajamento baixo" },
            { key: "medio", label: "Médio", description: "Engajamento médio" },
            { key: "alto", label: "Alto", description: "Engajamento alto" }
          ]
        )}

        {renderSection(
          "Classificação",
          Users,
          "classificacao",
          [
            { key: "frequente", label: "Frequente", description: "Usuários frequentes" },
            { key: "naoFrequente", label: "Não Frequente", description: "Usuários não frequentes" }
          ]
        )}

        {renderSection(
          "Dizimista",
          Gift,
          "dizimista",
          [
            { key: "naoDizimista", label: "Não dizimista", description: "Sem contribuição" },
            { key: "pontual", label: "Pontual (1-3 meses)", description: "Contribuição pontual" },
            { key: "sazonal", label: "Sazonal (4-7 meses)", description: "Contribuição sazonal" },
            { key: "recorrente", label: "Recorrente (8-12 meses)", description: "Contribuição recorrente" }
          ]
        )}

        {renderSection(
          "Ofertante",
          Heart,
          "ofertante",
          [
            { key: "naoOfertante", label: "Não ofertante", description: "Sem ofertas" },
            { key: "pontual", label: "Pontual (1-3 meses)", description: "Ofertas pontuais" },
            { key: "sazonal", label: "Sazonal (4-7 meses)", description: "Ofertas sazonais" },
            { key: "recorrente", label: "Recorrente (8-12 meses)", description: "Ofertas recorrentes" }
          ]
        )}

        {renderSection(
          "Tempo de Batismo",
          Calendar,
          "tempoBatismo",
          [
            { key: "doisAnos", label: "0-2 anos", description: "Batismo recente" },
            { key: "cincoAnos", label: "3-5 anos", description: "Batismo intermediário" },
            { key: "dezAnos", label: "6-10 anos", description: "Batismo consolidado" },
            { key: "vinteAnos", label: "11-20 anos", description: "Batismo maduro" },
            { key: "maisVinte", label: "20+ anos", description: "Batismo veterano" }
          ]
        )}

        {renderSection(
          "Cargos",
          Award,
          "cargos",
          [
            { key: "umCargo", label: "1 cargo", description: "Um cargo de liderança" },
            { key: "doisCargos", label: "2 cargos", description: "Dois cargos de liderança" },
            { key: "tresOuMais", label: "3+ cargos", description: "Três ou mais cargos" }
          ]
        )}

        {renderSection(
          "Nome da Unidade",
          CheckCircle,
          "nomeUnidade",
          [
            { key: "comUnidade", label: "Com unidade", description: "Unidade cadastrada" }
          ]
        )}

        {renderSection(
          "Tem Lição",
          Book,
          "temLicao",
          [
            { key: "comLicao", label: "Com lição", description: "Participação em estudos" }
          ]
        )}

        {renderSection(
          "Pontuação Dinâmica",
          Star,
          "pontuacaoDinamica",
          [
            { key: "multiplicador", label: "Multiplicador", description: "Multiplicador para valores 0-13" }
          ]
        )}

        {renderSection(
          "Total de Presença",
          Calendar,
          "totalPresenca",
          [
            { key: "zeroATres", label: "0-3 presenças", description: "Baixa frequência" },
            { key: "quatroASete", label: "4-7 presenças", description: "Frequência regular" },
            { key: "oitoATreze", label: "8-13 presenças", description: "Alta frequência" }
          ]
        )}

        {renderSection(
          "Escola Sabatina",
          Crown,
          "escolaSabatina",
          [
            { key: "comunhao", label: "Comunhão", description: "Presença na comunhão" },
            { key: "missao", label: "Missão", description: "Participação em missões" },
            { key: "estudoBiblico", label: "Estudo Bíblico", description: "Participação em estudos bíblicos" },
            { key: "batizouAlguem", label: "Batizou Alguém", description: "Liderança em batismos" },
            { key: "discipuladoPosBatismo", label: "Discipulado Pós-Batismo", description: "Participação em estudos de discipulado" }
          ]
        )}

        {renderSection(
          "CPF Válido",
          CheckCircle,
          "cpfValido",
          [
            { key: "valido", label: "Válido", description: "Documentação em dia" }
          ]
        )}

        {renderSection(
          "Campos Vazios ACMS",
          Mountain,
          "camposVaziosACMS",
          [
            { key: "semCamposVazios", label: "Sem campos vazios", description: "Perfil completo no sistema" }
          ]
        )}
      </div>

      {/* Média do Distrito */}
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Média do Distrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="districtAverage" className="text-sm font-medium">
                  Média Desejada
                </Label>
                <Input
                  id="districtAverage"
                  type="number"
                  placeholder={districtAverage ? `Última média: ${districtAverage}` : "Ex: 608"}
                  className="mt-1"
                  value={districtAverage || ''}
                  onChange={(e) => setDistrictAverage(e.target.value ? Number(e.target.value) : null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {districtAverage 
                    ? `Última média configurada: ${districtAverage} pontos` 
                    : "Digite a média desejada para o distrito"
                  }
                </p>
                {lastExecutionDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    📅 Última execução: {lastExecutionDate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCalculateDistrictAverage}
                  disabled={!districtAverage || isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {districtAverage && lastExecutionDate ? 'Recalcular' : 'Calcular'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetDistrictAverage}
                  disabled={isLoading}
                >
                  Resetar
                </Button>
              </div>
            </div>
            
            {districtAverage && (
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Média Atual dos Usuários: <span className="font-bold">{currentSystemAverage.toFixed(1)}</span>
                    </p>
                    <p className="text-sm text-orange-800">
                      Média Desejada: <span className="font-bold">{districtAverage}</span>
                    </p>
                    <p className="text-sm text-orange-800">
                      Fator de Ajuste: <span className="font-bold">{adjustmentFactor.toFixed(2)}x</span>
                    </p>
                  </div>
                  <Badge variant={adjustmentFactor > 1 ? "default" : "secondary"} className="text-sm">
                    {adjustmentFactor > 1 ? "Aumentar" : "Diminuir"} Pontuações
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Resumo da Base de Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {getTotalMaxPoints()}
              </div>
              <div className="text-sm text-muted-foreground">Pontos Máximos Possíveis</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getConfigSummary().categoriesCount}
              </div>
              <div className="text-sm text-muted-foreground">Categorias Configuradas</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {getConfigSummary().criteriaCount}
              </div>
              <div className="text-sm text-muted-foreground">Critérios de Pontuação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 