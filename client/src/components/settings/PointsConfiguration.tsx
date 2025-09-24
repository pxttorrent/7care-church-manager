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
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePointsConfig } from '@/hooks/usePointsConfig';
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
  const { config, isLoading, saveConfig, resetConfig, updateConfig, getTotalMaxPoints, getConfigSummary, getCurrentParameterAverage, getCurrentUserAverage } = usePointsConfig();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  

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

  const handleCalculatePoints = async () => {
    try {
      toast({
        title: "🔄 Calculando pontos...",
        description: "Recalculando pontuação para todos os usuários com a configuração correta. Isso pode levar alguns minutos.",
      });
      
      const response = await fetch('/api/system/calculate-points-clean', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        // Invalidar cache das queries relacionadas aos usuários
        queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['missionary-profiles'] });
        
        toast({
          title: "✅ Pontuação Calculada Corretamente",
          description: `${result.updatedCount} usuários foram atualizados com sucesso! Total de pontos: ${result.totalCalculatedPoints}`,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao calcular pontuação. Tente novamente.",
        variant: "destructive",
      });
    }
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

      {/* Calculate Points Button */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Calcular Pontos de Cada Usuário
                </h3>
                <p className="text-xs text-blue-700">
                  Recalcula a pontuação de todos os usuários com base na configuração atual
                </p>
              </div>
            </div>
            <Button
              onClick={handleCalculatePoints}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-600 hover:bg-blue-100"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Pontos
            </Button>
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