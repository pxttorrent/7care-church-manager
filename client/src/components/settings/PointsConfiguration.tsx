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
  AlertTriangle,
  Calculator,
  Loader2,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
    baixo: 200,
    medio: 400,
    alto: 600,
  },
  classificacao: {
    frequente: 300,
    naoFrequente: 150
  },
  dizimista: {
    naoDizimista: 0,
    pontual: 100,
    sazonal: 200,
    recorrente: 300
  },
  ofertante: {
    naoOfertante: 0,
    pontual: 60,
    sazonal: 120,
    recorrente: 180
  },
  tempoBatismo: {
    doisAnos: 100,
    cincoAnos: 200,
    dezAnos: 400,
    vinteAnos: 600,
    maisVinte: 800
  },
  cargos: {
    umCargo: 200,
    doisCargos: 400,
    tresOuMais: 600
  },
  nomeUnidade: {
    comUnidade: 100
  },
  temLicao: {
    comLicao: 120
  },
  pontuacaoDinamica: {
    multiplicador: 25
  },
  totalPresenca: {
    zeroATres: 0,
    quatroASete: 200,
    oitoATreze: 400
  },
  escolaSabatina: {
    comunhao: 40,
    missao: 60,
    estudoBiblico: 20,
    batizouAlguem: 400,
    discipuladoPosBatismo: 80
  },
  cpfValido: {
    valido: 100
  },
  camposVaziosACMS: {
    semCamposVazios: 200
  }
};

export const PointsConfiguration = () => {
  const [config, setConfig] = useState<PointsConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Carregar configurações do backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsInitialLoading(true);
        const response = await fetch('/api/system/points-config');
        if (response.ok) {
          const backendConfig = await response.json();
          setConfig(backendConfig);
        } else {
          console.log('Usando configuração padrão');
          setConfig(defaultConfig);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setConfig(defaultConfig);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/points-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar no servidor');
      }
      
      const result = await response.json();
      
      if (result.updatedUsers > 0) {
        toast({
          title: "✅ Configurações salvas!",
          description: `${result.updatedUsers} usuários tiveram seus pontos recalculados automaticamente.`,
        });
      } else {
        toast({
          title: "✅ Configurações salvas!",
          description: "As configurações foram salvas com sucesso.",
        });
      }
      
      // Invalidar cache das queries relacionadas aos usuários
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculatePoints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/recalculate-points', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao recalcular pontos');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Pontos recalculados!",
          description: `${result.updatedCount || 0} usuários tiveram seus pontos atualizados.`,
        });
      } else {
        throw new Error(result.message || 'Erro ao recalcular pontos');
      }
      
      // Invalidar cache das queries relacionadas aos usuários
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error('Erro ao recalcular pontos:', error);
      toast({
        title: "❌ Erro ao recalcular",
        description: "Não foi possível recalcular os pontos dos usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/points-config/reset', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao resetar no servidor');
      }
      
      const result = await response.json();
      
      // Recarregar configurações do backend
      const configResponse = await fetch('/api/system/points-config');
      if (configResponse.ok) {
        const backendConfig = await configResponse.json();
        setConfig(backendConfig);
      } else {
        setConfig(defaultConfig);
      }
      
      if (result.updatedUsers > 0) {
        toast({
          title: "✅ Configurações resetadas!",
          description: `${result.updatedUsers} usuários tiveram seus pontos recalculados automaticamente.`,
        });
      } else {
        toast({
          title: "✅ Configurações resetadas!",
          description: "As configurações foram resetadas com sucesso.",
        });
      }
      
      // Invalidar cache das queries relacionadas aos usuários
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      toast({
        title: "❌ Erro ao resetar",
        description: "Não foi possível resetar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (section: keyof PointsConfig, field: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getTotalMaxPoints = () => {
    return (
      (config.engajamento?.alto || 0) +
      (config.classificacao?.frequente || 0) +
      (config.dizimista?.recorrente || 0) +
      (config.ofertante?.recorrente || 0) +
      (config.tempoBatismo?.maisVinte || 0) +
      (config.cargos?.tresOuMais || 0) +
      (config.nomeUnidade?.comUnidade || 0) +
      (config.temLicao?.comLicao || 0) +
      (config.totalPresenca?.oitoATreze || 0) +
      (config.escolaSabatina?.comunhao || 0) +
      (config.escolaSabatina?.missao || 0) +
      (config.escolaSabatina?.estudoBiblico || 0) +
      (config.escolaSabatina?.batizouAlguem || 0) +
      (config.escolaSabatina?.discipuladoPosBatismo || 0) +
      (config.cpfValido?.valido || 0) +
      (config.camposVaziosACMS?.semCamposVazios || 0)
    );
  };

  const getConfigSummary = () => {
    return {
      categoriesCount: Object.keys(config).length,
      criteriaCount: Object.values(config).reduce((total, section) => {
        return total + Object.keys(section).length;
      }, 0)
    };
  };

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }


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
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isLoading ? 'Resetando...' : 'Resetar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCalculatePoints}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isLoading ? 'Calculando...' : 'Calcular Pontos'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
              Atenção: Alterações afetam a base de cálculo de pontuação de todos os usuários. Use "Calcular Pontos" para recalcular manualmente ou "Salvar" para salvar e recalcular automaticamente.
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