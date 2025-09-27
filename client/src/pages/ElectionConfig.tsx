import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Users, 
  Church, 
  Vote, 
  CheckCircle, 
  AlertCircle,
  Save,
  Play,
  UserCheck,
  Target,
  RefreshCw,
  Loader2,
  User,
  Info
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';

interface Church {
  id: number;
  name: string;
  code: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  church: string;
  role: string;
}

interface ElectionConfig {
  id?: number;
  churchId: number;
  churchName: string;
  voters: number[];
  criteria: {
    faithfulness: {
      enabled: boolean;
      punctual: boolean;
      seasonal: boolean;
      recurring: boolean;
    };
    attendance: {
      enabled: boolean;
      punctual: boolean;
      seasonal: boolean;
      recurring: boolean;
    };
    churchTime: {
      enabled: boolean;
      minimumMonths: number;
    };
    positionLimit: {
      enabled: boolean;
      maxPositions: number;
    };
  };
  positions: string[];
  status: 'draft' | 'active' | 'completed';
}

export default function ElectionConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [churches, setChurches] = useState<Church[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [configExists, setConfigExists] = useState(false);
  const [eligibleCandidates, setEligibleCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [config, setConfig] = useState<ElectionConfig>({
    churchId: 0,
    churchName: '',
    voters: [],
    criteria: {
      faithfulness: {
        enabled: true,
        punctual: true,
        seasonal: true,
        recurring: true
      },
      attendance: {
        enabled: true,
        punctual: true,
        seasonal: true,
        recurring: true
      },
      churchTime: {
        enabled: true,
        minimumMonths: 12
      },
      positionLimit: {
        enabled: true,
        maxPositions: 2
      }
    },
    positions: [
      // ADMINISTRAÇÃO
      
      // ANCIÃOS / ANCIÃS / DIRETORES
      'Primeiro Ancião(ã)',
      'Ancião/Anciã Teen',
      'Ancião/Anciã Jovem',
      'Secretário(a)',
      'Secretário(a) Associado(a)',
      'Secretário(a) Teen',
      'Tesoureiro(a)',
      'Tesoureiro(a) Associado(a)',
      'Tesoureiro(a) Teen',
      'Patrimônio',
      
      // DIACONATO
      'Diáconos',
      'Diácono(s) Teen',
      'Primeiro Diácono',
      'Diaconisas',
      'Diaconisa(s) Teen',
      'Primeira Diaconisa',
      
      // MORDOMIA CRISTÃ
      'Diretor(a)',
      'Diretor(a) Associado(a)',
      'Discípulo Teen',
      
      // NOVAS GERAÇÕES
      'Ministério da Criança – Coordenador(a)',
      'Ministério da Criança – Coordenador(a) Associado(a)',
      'Ministério dos Adolescentes – Coordenador(a)',
      'Ministério dos Adolescentes – Coordenador(a) Associado(a)',
      'Ministério Jovem – Diretor(a)',
      'Ministério Jovem – Diretor(a) Associado(a)',
      'Clube de Aventureiros – Diretor(a)',
      'Clube de Aventureiros – Diretor(a) Associado(a)',
      'Clube de Aventureiros – Discípulo Teen',
      'Clube de Desbravadores – Diretor(a)',
      'Clube de Desbravadores – Diretor(a) Associado(a)',
      'Clube de Desbravadores – Discípulo Teen',
      
      // ESCOLA SABATINA
      'Professores(as) das Unidades: Bebês',
      'Professores(as) das Unidades: Iniciantes',
      'Professores(as) das Unidades: Infantis',
      'Professores(as) das Unidades: Primários',
      'Professores(as) das Unidades: Pré-adolescentes',
      'Professores(as) das Unidades: Adolescentes',
      'Secretário(a) Escola Sabatina',
      'Diretor(a) Associado(a) Escola Sabatina',
      'Discípulo Teen Escola Sabatina',
      
      // MINISTÉRIO PESSOAL E EVANGELISMO
      'Diretor(a) Ministério Pessoal',
      'Diretor(a) Associado(a) Ministério Pessoal',
      'Discípulo Teen Ministério Pessoal',
      'Evangelismo – Diretor(a)',
      'Evangelismo – Diretor(a) Associado(a)',
      'Evangelismo – Secretário(a)',
      'Evangelismo – Discípulo Teen',
      'Coordenador(a) de Classes Bíblicas',
      'Coordenador(a) de Interessados',
      
      // AÇÃO SOLIDÁRIA ADVENTISTA (ASA)
      'Diretor(a) ASA',
      'Diretor(a) Associado(a) ASA',
      'Discípulo Teen ASA',
      
      // MINISTÉRIO DA FAMÍLIA
      'Casal Diretor',
      'Casal Associado',
      'Discípulo Teen Ministério da Família',
      
      // MINISTÉRIO DA MULHER
      'Diretora Ministério da Mulher',
      'Diretora Associada Ministério da Mulher',
      'Discípulo Teen Ministério da Mulher',
      
      // MINISTÉRIO DA RECEPÇÃO
      'Líder Ministério da Recepção',
      'Equipe Ministério da Recepção',
      
      // MINISTÉRIO DO HOMEM
      'Diretor Ministério do Homem',
      'Diretor Associado Ministério do Homem',
      'Discípulo Teen Ministério do Homem',
      
      // MINISTÉRIO DA SAÚDE
      'Diretor(a) Ministério da Saúde',
      'Diretor(a) Associado(a) Ministério da Saúde',
      'Discípulo Teen Ministério da Saúde',
      
      // MINISTÉRIO DAS POSSIBILIDADES
      'Diretor(a) Ministério das Possibilidades',
      'Diretor(a) Associado(a) Ministério das Possibilidades',
      'Discípulo Teen Ministério das Possibilidades',
      
      // MINISTÉRIO DA MÚSICA
      'Diretor(a) Ministério da Música',
      'Diretor(a) Associado(a) Ministério da Música',
      'Discípulo Teen Ministério da Música',
      
      // COMUNICAÇÃO
      'Diretor(a) Comunicação',
      'Diretor(a) Associado(a) Comunicação',
      'Social Media (redes sociais)',
      'Discípulo Teen Comunicação',
      
      // SONOPLASTIA
      'Diretor(a) Sonoplastia',
      'Diretor(a) Associado(a) Sonoplastia',
      'Equipe Sonoplastia'
    ],
    status: 'draft'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadChurches(),
          loadMembers(),
          loadConfig()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadChurches = async () => {
    try {
      const response = await fetch('/api/churches');
      if (response.ok) {
        const data = await response.json();
        setChurches(data || []);
      } else {
        console.error('Erro ao carregar igrejas:', response.status);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de igrejas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar igrejas",
        variant: "destructive",
      });
    }
  };

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas membros (incluindo status pending e approved)
        const membersOnly = (data || []).filter((user: any) => 
          user.role && user.role.includes('member') && (user.status === 'approved' || user.status === 'pending')
        );
        setMembers(membersOnly);
      } else {
        console.error('Erro ao carregar membros:', response.status);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de membros",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar membros",
        variant: "destructive",
      });
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/elections/config', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Config carregada:', data);
        
        // Verificar se há erro (configuração não encontrada)
        if (data.error) {
          console.log('Nenhuma configuração encontrada, usando padrões');
          return; // Usar configuração padrão
        }
        
        if (data && data.church_id) {
          // Garantir que todos os campos obrigatórios existam
          const configWithDefaults = {
            id: data.id,
            churchId: data.church_id || 0,
            churchName: data.church_name || '',
            voters: data.voters || [],
            criteria: {
              faithfulness: {
                enabled: data.criteria?.faithfulness?.enabled ?? true,
                punctual: data.criteria?.faithfulness?.punctual ?? false,
                seasonal: data.criteria?.faithfulness?.seasonal ?? false,
                recurring: data.criteria?.faithfulness?.recurring ?? false
              },
              attendance: {
                enabled: data.criteria?.attendance?.enabled ?? true,
                punctual: data.criteria?.attendance?.punctual ?? false,
                seasonal: data.criteria?.attendance?.seasonal ?? false,
                recurring: data.criteria?.attendance?.recurring ?? false
              },
              churchTime: {
                enabled: data.criteria?.churchTime?.enabled ?? true,
                minimumMonths: data.criteria?.churchTime?.minimumMonths ?? 12
              },
              positionLimit: {
                enabled: data.criteria?.positionLimit?.enabled ?? true,
                maxPositions: data.criteria?.positionLimit?.maxPositions ?? 2
              }
            },
            positions: data.positions || [],
            status: data.status || 'draft'
          };
          setConfig(configWithDefaults);
        }
      } else if (response.status === 404) {
        console.log('Nenhuma configuração encontrada, usando padrões');
        // Usar configuração padrão - não é um erro
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração de eleição",
        variant: "destructive",
      });
    }
  };

  const handleChurchChange = async (churchId: string) => {
    const church = churches.find(c => c.id?.toString() === churchId);
    if (church) {
      setConfig(prev => ({
        ...prev,
        churchId: church.id,
        churchName: church.name
      }));
      
      // Verificar se já existe uma configuração para esta igreja
      try {
        const response = await fetch('/api/elections/configs', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const configs = await response.json();
          const existingConfig = configs.find((c: any) => c.church_id === church.id);
          setConfigExists(!!existingConfig);
        }
      } catch (error) {
        console.error('Erro ao verificar configurações existentes:', error);
      }
      
      loadMembers(church.name);
    }
  };

  const handleVoterToggle = (memberId: number) => {
    setConfig(prev => ({
      ...prev,
      voters: (prev.voters || []).includes(memberId)
        ? (prev.voters || []).filter(id => id !== memberId)
        : [...(prev.voters || []), memberId]
    }));
  };

  const handleCriteriaChange = (field: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      
      // Ensure criteria object exists
      if (!newConfig.criteria) {
        newConfig.criteria = {
          faithfulness: { enabled: true, punctual: true, seasonal: true, recurring: true },
          attendance: { enabled: true, threshold: 75 },
          churchTime: { enabled: true, minimumMonths: 12 },
          positionLimit: { enabled: true, maxPositions: 2 }
        };
      }
      
      // Handle nested criteria updates
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!newConfig.criteria[parent]) {
          newConfig.criteria[parent] = {};
        }
        newConfig.criteria[parent][child] = value;
      } else {
        newConfig.criteria[field] = value;
      }
      
      return newConfig;
    });
  };

  const handlePositionToggle = (position: string) => {
    setConfig(prev => ({
      ...prev,
      positions: (prev.positions || []).includes(position)
        ? (prev.positions || []).filter(p => p !== position)
        : [...(prev.positions || []), position]
    }));
  };

  const loadEligibleCandidates = async () => {
    if (!config.churchId) return;
    
    setLoadingCandidates(true);
    try {
      const response = await fetch(`/api/elections/preview-candidates?churchId=${config.churchId}&criteria=${encodeURIComponent(JSON.stringify(config.criteria))}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEligibleCandidates(data.candidates || []);
      } else {
        throw new Error('Erro ao carregar candidatos elegíveis');
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar candidatos elegíveis",
        variant: "destructive",
      });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return config.churchId && config.churchName;
      case 2:
        return config.voters && config.voters.length > 0;
      case 3:
        return true; // Critérios são opcionais
      case 4:
        return config.positions && config.positions.length > 0;
      case 5:
        return true; // Preview de candidatos
      default:
        return false;
    }
  };

  const saveConfig = async () => {
    // Verificar se já existe uma configuração para esta igreja
    if (configExists) {
      toast({
        title: "Configuração já existe",
        description: "Já existe uma configuração para esta igreja. Use 'Editar' para modificar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/elections/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const data = await response.json();
        setConfigExists(true);
        // Atualizar o config com o ID retornado
        setConfig(prev => ({ ...prev, id: data.id }));
        toast({
          title: "Configuração salva",
          description: "Os parâmetros da nomeação foram salvos com sucesso.",
        });
        setCurrentStep(2); // Avança para o próximo passo
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const startElection = async () => {
    if (!config.voters || config.voters.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um votante.",
        variant: "destructive",
      });
      return;
    }

    if (!config.positions || config.positions.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um cargo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/elections/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          ...config,
          configId: config.id
        })
      });

      if (response.ok) {
        setConfig(prev => ({ ...prev, status: 'active' }));
        toast({
          title: "Eleição iniciada",
          description: "A eleição foi iniciada com sucesso. Os votantes já podem acessar a página de votação.",
        });
      } else {
        throw new Error('Erro ao iniciar eleição');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a eleição.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesChurch = member.church === config.churchName || config.churchName === '';
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesChurch && matchesSearch;
  });

  const selectedVoters = members.filter(member => 
    config.voters?.includes(member.id) || false
  );

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
          <p className="text-muted-foreground">Preparando configuração de eleição</p>
        </div>
      </MobileLayout>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas administradores podem configurar eleições.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Configuração de Nomeações</h1>
            <p className="text-muted-foreground">Configure os parâmetros da nomeação de liderança</p>
          </div>
        </div>

        {/* Indicador de Passos */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step === 1 && 'Igreja'}
              {step === 2 && 'Votantes'}
              {step === 3 && 'Critérios'}
              {step === 4 && 'Cargos'}
              {step === 5 && 'Candidatos'}
            </span>
            {step < 5 && (
              <div className={`w-8 h-0.5 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

        {/* Alerta de Configuração Existente */}
        {configExists && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuração já existe!</strong> Já existe uma configuração para esta igreja. 
              Você pode editar a configuração existente ou criar uma nova.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  Seleção da Igreja
                </CardTitle>
                <CardDescription>
                  Selecione qual igreja será feita a eleição de liderança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="church">Igreja</Label>
                  <Select value={config.churchId?.toString() || ''} onValueChange={handleChurchChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id?.toString() || ''}>
                          {church.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {config.churchName && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Eleição será realizada na igreja: <strong>{config.churchName}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Seleção de Votantes
                </CardTitle>
                <CardDescription>
                  Selecione quais membros da igreja "{config.churchName || 'Selecione uma igreja'}" poderão votar na eleição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!config.churchId ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Selecione uma igreja na aba "Configuração Básica" para visualizar os membros disponíveis.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Barra de Busca */}
                    <div className="space-y-2">
                      <Label htmlFor="voter-search">Buscar membros</Label>
                      <Input
                        id="voter-search"
                        type="text"
                        placeholder="Digite o nome ou email do membro para pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Contadores */}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        {filteredMembers.length} membro(s) encontrado(s)
                      </span>
                      <span>
                        {selectedVoters.length} votante(s) selecionado(s)
                      </span>
                    </div>

                    {/* Lista de Membros */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <Checkbox
                            id={`voter-${member.id}`}
                            checked={config.voters?.includes(member.id) || false}
                            onCheckedChange={() => handleVoterToggle(member.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-medium text-sm truncate">
                                  {member.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {member.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge variant="secondary" className="text-xs">
                                  {member.role}
                                </Badge>
                                <Badge 
                                  variant={member.status === 'approved' ? 'default' : 'outline'} 
                                  className="text-xs"
                                >
                                  {member.status === 'approved' ? 'Ativo' : 'Pendente'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {member.church}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredMembers.length === 0 && searchTerm && (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground mb-2">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum membro encontrado para "{searchTerm}"</p>
                          <p className="text-xs mt-1">Tente usar um termo de busca diferente</p>
                        </div>
                      </div>
                    )}

                    {filteredMembers.length === 0 && !searchTerm && (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground mb-2">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum membro encontrado para a igreja "{config.churchName}"</p>
                          <p className="text-xs mt-1">Verifique se a igreja foi selecionada corretamente</p>
                        </div>
                      </div>
                    )}

                    {/* Ações Rápidas */}
                    {filteredMembers.length > 0 && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allMemberIds = filteredMembers.map(m => m.id);
                            setConfig(prev => ({
                              ...prev,
                              voters: allMemberIds
                            }));
                          }}
                          className="flex-1"
                        >
                          Selecionar Todos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              voters: []
                            }));
                          }}
                          className="flex-1"
                        >
                          Limpar Seleção
                        </Button>
                      </div>
                    )}

                    {/* Votantes Selecionados */}
                    {selectedVoters.length > 0 && (
                      <div className="space-y-2">
                        <Label>Votantes selecionados ({selectedVoters.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedVoters.map((voter) => (
                            <Badge key={voter.id} variant="secondary" className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {voter.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Critérios de Candidatos
                </CardTitle>
                <CardDescription>
                  Defina os critérios que os candidatos devem atender
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {/* Fidelidade nos Dízimos e Ofertas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="faithfulness-enabled"
                          checked={config.criteria?.faithfulness?.enabled || false}
                          onCheckedChange={(checked) => handleCriteriaChange('faithfulness.enabled', checked)}
                        />
                        <Label htmlFor="faithfulness-enabled" className="cursor-pointer">
                          Fidelidade nos dízimos e ofertas
                        </Label>
                      </div>
                    </div>

                    {config.criteria?.faithfulness?.enabled && (
                      <div className="ml-6 space-y-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Tipos de fidelidade obrigatórios:</Label>
                          
                          {/* Campo inline para Pontual */}
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">P</span>
                              </div>
                              <div>
                                <Label className="font-medium text-sm">Pontual</Label>
                                <p className="text-xs text-muted-foreground">Dízimos pagos no prazo</p>
                              </div>
                            </div>
                            <Checkbox
                              id="punctual"
                              checked={config.criteria?.faithfulness?.punctual || false}
                              onCheckedChange={(checked) => handleCriteriaChange('faithfulness.punctual', checked)}
                            />
                          </div>

                          {/* Campo inline para Sazonal */}
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600">S</span>
                              </div>
                              <div>
                                <Label className="font-medium text-sm">Sazonal</Label>
                                <p className="text-xs text-muted-foreground">Ofertas especiais e campanhas</p>
                              </div>
                            </div>
                            <Checkbox
                              id="seasonal"
                              checked={config.criteria?.faithfulness?.seasonal || false}
                              onCheckedChange={(checked) => handleCriteriaChange('faithfulness.seasonal', checked)}
                            />
                          </div>

                          {/* Campo inline para Recorrente */}
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-purple-600">R</span>
                              </div>
                              <div>
                                <Label className="font-medium text-sm">Recorrente</Label>
                                <p className="text-xs text-muted-foreground">Contribuições regulares</p>
                              </div>
                            </div>
                            <Checkbox
                              id="recurring"
                              checked={config.criteria?.faithfulness?.recurring || false}
                              onCheckedChange={(checked) => handleCriteriaChange('faithfulness.recurring', checked)}
                            />
                          </div>
                        </div>

                        {/* Resumo dos critérios selecionados */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <Label className="text-sm font-medium text-blue-800">Critérios Ativos:</Label>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {config.criteria?.faithfulness?.punctual && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Pontual
                              </Badge>
                            )}
                            {config.criteria?.faithfulness?.seasonal && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Sazonal
                              </Badge>
                            )}
                            {config.criteria?.faithfulness?.recurring && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                Recorrente
                              </Badge>
                            )}
                            {!config.criteria?.faithfulness?.punctual && !config.criteria?.faithfulness?.seasonal && !config.criteria?.faithfulness?.recurring && (
                              <span className="text-xs text-muted-foreground">Nenhum critério selecionado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Presença Regular */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attendance-enabled"
                        checked={config.criteria?.attendance?.enabled || false}
                        onCheckedChange={(checked) => handleCriteriaChange('attendance.enabled', checked)}
                      />
                      <Label htmlFor="attendance-enabled" className="cursor-pointer">
                        Presença regular (teveParticipacao)
                      </Label>
                    </div>

                    {config.criteria?.attendance?.enabled && (
                      <div className="ml-6 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Tipos de participação aceitos:</Label>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="attendance-punctual"
                              checked={config.criteria?.attendance?.punctual || false}
                              onCheckedChange={(checked) => handleCriteriaChange('attendance.punctual', checked)}
                            />
                            <Label htmlFor="attendance-punctual" className="cursor-pointer text-sm">
                              Pontual (Recorrente)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="attendance-seasonal"
                              checked={config.criteria?.attendance?.seasonal || false}
                              onCheckedChange={(checked) => handleCriteriaChange('attendance.seasonal', checked)}
                            />
                            <Label htmlFor="attendance-seasonal" className="cursor-pointer text-sm">
                              Sazonal (Sazonal + Recorrente)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="attendance-recurring"
                              checked={config.criteria?.attendance?.recurring || false}
                              onCheckedChange={(checked) => handleCriteriaChange('attendance.recurring', checked)}
                            />
                            <Label htmlFor="attendance-recurring" className="cursor-pointer text-sm">
                              Recorrente (apenas Recorrente)
                            </Label>
                          </div>
                        </div>
                        
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <strong>Critérios de participação:</strong><br/>
                            • <strong>Pontual:</strong> Apenas membros com participação "Recorrente"<br/>
                            • <strong>Sazonal:</strong> Membros com participação "Sazonal" ou "Recorrente"<br/>
                            • <strong>Recorrente:</strong> Apenas membros com participação "Recorrente"<br/>
                            • <strong>Exclusão:</strong> Membros com "Sem participação" são automaticamente excluídos
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Tempo Mínimo de Igreja */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="church-time-enabled"
                        checked={config.criteria?.churchTime?.enabled || false}
                        onCheckedChange={(checked) => handleCriteriaChange('churchTime.enabled', checked)}
                      />
                      <Label htmlFor="church-time-enabled" className="cursor-pointer">
                        Tempo mínimo de igreja
                      </Label>
                    </div>

                    {config.criteria?.churchTime?.enabled && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="minimumMonths">Tempo mínimo em meses</Label>
                        <Input
                          id="minimumMonths"
                          type="number"
                          min="1"
                          max="120"
                          value={config.criteria?.churchTime?.minimumMonths || 12}
                          onChange={(e) => handleCriteriaChange('churchTime.minimumMonths', parseInt(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Membros com menos de {config.criteria?.churchTime?.minimumMonths || 12} meses na igreja não poderão ser candidatos
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Limite de Cargos por Pessoa */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="position-limit-enabled"
                        checked={config.criteria?.positionLimit?.enabled || false}
                        onCheckedChange={(checked) => handleCriteriaChange('positionLimit.enabled', checked)}
                      />
                      <Label htmlFor="position-limit-enabled" className="cursor-pointer">
                        Limite de cargos por pessoa
                      </Label>
                    </div>

                    {config.criteria?.positionLimit?.enabled && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="maxPositions">Máximo de cargos por pessoa</Label>
                        <Input
                          id="maxPositions"
                          type="number"
                          min="1"
                          max="4"
                          value={config.criteria?.positionLimit?.maxPositions || 2}
                          onChange={(e) => handleCriteriaChange('positionLimit.maxPositions', parseInt(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Uma pessoa pode ser eleita para no máximo {config.criteria?.positionLimit?.maxPositions || 2} cargo(s)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Cargos para Eleição
                </CardTitle>
                <CardDescription>
                  Selecione quais cargos serão eleitos organizados por categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* ANCIÃOS / ANCIÃS / DIRETORES */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-green-700">ANCIÃOS / ANCIÃS / DIRETORES</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {config.positions?.filter(pos => 
                      pos.includes('Ancião') || pos.includes('Secretário') || pos.includes('Tesoureiro') || pos.includes('Patrimônio')
                    ).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={true}
                          onCheckedChange={() => handlePositionToggle(position)}
                        />
                        <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1 text-sm">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DIACONATO */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h3 className="font-semibold text-purple-700">DIACONATO</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {config.positions?.filter(pos => 
                      pos.includes('Diácono') || pos.includes('Diaconisa')
                    ).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={true}
                          onCheckedChange={() => handlePositionToggle(position)}
                        />
                        <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1 text-sm">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MORDOMIA CRISTÃ */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <h3 className="font-semibold text-orange-700">MORDOMIA CRISTÃ</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {config.positions?.filter(pos => 
                      pos.includes('Mordomia') || (pos === 'Diretor(a)' && !pos.includes('Ministério')) || pos === 'Diretor(a) Associado(a)' || pos === 'Discípulo Teen'
                    ).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={true}
                          onCheckedChange={() => handlePositionToggle(position)}
                        />
                        <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1 text-sm">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NOVAS GERAÇÕES */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <h3 className="font-semibold text-pink-700">NOVAS GERAÇÕES</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {config.positions?.filter(pos => 
                      pos.includes('Criança') || pos.includes('Adolescentes') || pos.includes('Jovem') || pos.includes('Aventureiros') || pos.includes('Desbravadores')
                    ).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={true}
                          onCheckedChange={() => handlePositionToggle(position)}
                        />
                        <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1 text-sm">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ESCOLA SABATINA */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <h3 className="font-semibold text-indigo-700">ESCOLA SABATINA</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {config.positions?.filter(pos => 
                      pos.includes('Professores') || pos.includes('Escola Sabatina')
                    ).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={true}
                          onCheckedChange={() => handlePositionToggle(position)}
                        />
                        <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1 text-sm">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MINISTÉRIOS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <h3 className="font-semibold text-teal-700">MINISTÉRIOS ESPECIALIZADOS</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {config.positions?.filter(pos => 
                      pos.includes('Ministério') || pos.includes('ASA') || pos.includes('Evangelismo') || pos.includes('Classes Bíblicas') || pos.includes('Interessados') || pos.includes('Casal') || pos.includes('Recepção') || pos.includes('Possibilidades') || pos.includes('Música') || pos.includes('Comunicação') || pos.includes('Sonoplastia')
                    ).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={true}
                          onCheckedChange={() => handlePositionToggle(position)}
                        />
                        <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1 text-sm">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Passo 5: Preview de Candidatos Elegíveis */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidatos Elegíveis
                </CardTitle>
                <CardDescription>
                  Visualize os membros que atendem aos critérios definidos e podem ser candidatos nas nomeações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={loadEligibleCandidates} 
                    disabled={loadingCandidates || !config.churchId}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingCandidates ? 'animate-spin' : ''}`} />
                    {loadingCandidates ? 'Carregando...' : 'Atualizar Lista'}
                  </Button>
                  
                  {eligibleCandidates.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {eligibleCandidates.length} candidato(s) elegível(eis)
                    </div>
                  )}
                </div>

                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-lg text-gray-600">Carregando candidatos...</span>
                  </div>
                ) : eligibleCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum candidato elegível</h3>
                    <p className="text-gray-500 mb-4">
                      {config.churchId ? 
                        'Nenhum membro da igreja selecionada atende aos critérios definidos.' :
                        'Selecione uma igreja primeiro para visualizar os candidatos.'
                      }
                    </p>
                    {config.churchId && (
                      <Button onClick={loadEligibleCandidates} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {eligibleCandidates.map((candidate) => (
                        <Card key={candidate.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{candidate.name}</h4>
                                <p className="text-sm text-muted-foreground">{candidate.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge variant={candidate.status === 'approved' ? 'default' : 'secondary'}>
                                {candidate.status === 'approved' ? 'Ativo' : 'Pendente'}
                              </Badge>
                              <Badge variant="outline">
                                {candidate.role}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Tempo na igreja:</span>
                                <span>{candidate.monthsInChurch} meses</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Dizimista:</span>
                                <Badge variant={candidate.isTither ? 'default' : 'secondary'}>
                                  {candidate.isTither ? 'Sim' : 'Não'}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Ofertante:</span>
                                <Badge variant={candidate.isDonor ? 'default' : 'secondary'}>
                                  {candidate.isDonor ? 'Sim' : 'Não'}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Presença:</span>
                                <span>{candidate.attendance || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Esta lista mostra apenas os membros que atendem aos critérios definidos. 
                        Durante a nomeação, apenas estes membros poderão ser indicados como candidatos.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Navegação entre Passos */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <div className="flex gap-3">
            {currentStep < 5 ? (
              <Button 
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                disabled={!canProceedToNextStep()}
              >
                Próximo
              </Button>
            ) : (
              <>
                <Button 
                  onClick={saveConfig} 
                  disabled={saving || configExists}
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
                
                <Button 
                  onClick={startElection} 
                  disabled={loading}
                  variant="default"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Iniciando...' : 'Iniciar Nomeação'}
                </Button>
              </>
            )}
          </div>
        </div>

        {config.status === 'active' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nomeação ativa!</strong> Os votantes já podem acessar a página de votação.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MobileLayout>
  );
}
