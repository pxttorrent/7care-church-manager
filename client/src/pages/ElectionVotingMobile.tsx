import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Vote, 
  Users, 
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft,
  User,
  RefreshCw,
  AlertCircle,
  Search,
  HelpCircle,
  X
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';

interface Candidate {
  id: number;
  name: string;
  unit: string;
  points: number;
  nominations: number;
  votes: number;
  percentage: number;
}

interface ElectionData {
  election: any;
  currentPosition: number;
  totalPositions: number;
  currentPositionName: string;
  currentPositionDescription?: string;
  candidates: Candidate[];
  phase: 'nomination' | 'oral_observations' | 'voting' | 'completed';
  hasVoted: boolean;
  hasNominated?: boolean;
  nominationCount?: number;
  maxNominationsPerVoter?: number;
  userVote?: number;
  votedCandidateName?: string;
}

export default function ElectionVotingMobile() {
  const { configId } = useParams<{ configId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [finishedNominating, setFinishedNominating] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Função para buscar eleições ativas e encontrar a correta
  const findActiveElection = async () => {
    try {
      const response = await fetch('/api/elections/active', {
        headers: {
          'x-user-id': user?.id?.toString() || '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Eleições ativas encontradas:', data);
        
        if (data.elections && data.elections.length > 0) {
          // Usar a primeira eleição ativa encontrada
          const activeElection = data.elections[0];
          console.log('🔍 Usando eleição ativa:', activeElection);
          return activeElection.config_id;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar eleições ativas:', error);
      return null;
    }
  };

  const loadElectionData = async (electionConfigId?: number, silentUpdate = false) => {
    try {
      // Só mostrar loading se não for uma atualização silenciosa
      if (!silentUpdate) {
        setLoading(true);
      }
      setError(null);
      
      // Se não foi fornecido um configId, tentar encontrar eleição ativa
      let targetConfigId = configId;
      if (!targetConfigId || targetConfigId === 'undefined') {
        console.log('🔍 ConfigId não fornecido, buscando eleição ativa...');
        const activeConfigId = await findActiveElection();
        if (activeConfigId) {
          targetConfigId = activeConfigId.toString();
          // Atualizar a URL se necessário
          if (window.location.pathname !== `/election-vote/${activeConfigId}`) {
            window.history.replaceState(null, '', `/election-vote/${activeConfigId}`);
          }
        } else {
          throw new Error('Nenhuma eleição ativa encontrada');
        }
      }

      console.log('🔍 Carregando dados da eleição com configId:', targetConfigId);

      const response = await fetch(`/api/elections/voting/${targetConfigId}`, {
        headers: {
          'x-user-id': user?.id?.toString() || '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados da eleição recebidos:', data);
        
        // Validar dados recebidos
        if (!data.election) {
          throw new Error('Dados da eleição inválidos');
        }

        // Se não há candidatos, tentar carregar sem filtros
        if (!data.candidates || data.candidates.length === 0) {
          console.log('⚠️ Nenhum candidato encontrado, tentando carregar todos os membros...');
          await loadAllMembers(data.election.id);
          return;
        }

        // Se a posição mudou, resetar o candidato selecionado
        if (electionData && electionData.currentPosition !== data.currentPosition) {
          console.log('🔄 Posição mudou, resetando candidato selecionado');
          setSelectedCandidate(null);
          setSubmitting(false);
          setFinishedNominating(false);
          setSelectedCandidates([]);
        }
        
        setElectionData(data);
        
        // Se o usuário já votou, mostrar o voto selecionado
        if (data.userVote) {
          setSelectedCandidate(data.userVote);
        } else if (!data.hasVoted && !data.hasNominated) {
          // Se não votou nem indicou, garantir que pode selecionar
          setSelectedCandidate(null);
        }
        
        setRetryCount(0); // Reset retry count on success
      } else if (response.status === 404) {
        // Se não encontrou eleição com este configId, tentar encontrar ativa
        console.log('❌ Eleição não encontrada, buscando eleição ativa...');
        const activeConfigId = await findActiveElection();
        if (activeConfigId && activeConfigId.toString() !== configId) {
          console.log('🔄 Redirecionando para eleição ativa:', activeConfigId);
          navigate(`/election-vote/${activeConfigId}`, { replace: true });
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eleição não encontrada');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar eleição');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da eleição:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Se ainda não tentou buscar eleição ativa, tentar agora
      if (retryCount === 0 && configId) {
        console.log('🔄 Tentando buscar eleição ativa...');
        setRetryCount(1);
        await loadElectionData();
        return;
      }
    } finally {
      // Só desativar loading se não for uma atualização silenciosa
      if (!silentUpdate) {
        setLoading(false);
      }
      // Após o primeiro carregamento, marcar como não sendo mais inicial
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  // Função para carregar todos os membros como candidatos (fallback)
  const loadAllMembers = async (electionId: number) => {
    try {
      console.log('🔍 Carregando todos os membros como candidatos...');
      
      // Buscar todos os membros da igreja
      const response = await fetch('/api/debug/users');
      if (response.ok) {
        const data = await response.json();
        console.log('👥 Membros encontrados:', data.users.length);
        
        // Converter membros em candidatos
        const candidates: Candidate[] = data.users.map((member: any) => ({
          id: member.id,
          name: member.name,
          unit: member.church || 'N/A',
          points: 0,
          nominations: 0,
          votes: 0,
          percentage: 0
        }));

        // Atualizar dados da eleição com candidatos
        setElectionData(prev => prev ? {
          ...prev,
          candidates
        } : null);

        toast({
          title: "Candidatos carregados",
          description: `${candidates.length} membros encontrados como candidatos elegíveis.`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar membros:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível carregar candidatos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (candidateId: number, phase: string) => {
    if (submitting || !electionData) return;
    
    // Buscar nome do candidato
    const candidate = electionData.candidates.find(c => c.id === candidateId);
    const candidateName = candidate?.name || 'candidato selecionado';
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/elections/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({
          configId: configId,
          candidateId,
          phase
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Não mostrar toast, vamos mostrar uma tela especial
        // Recarregar dados para atualizar o estado
        await loadElectionData();
        setSubmitting(false);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar voto');
      }
    } catch (error) {
      console.error('❌ Erro ao votar:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    loadElectionData();
  };

  // Toggle de seleção de candidato (para múltiplas indicações)
  const handleToggleCandidate = (candidateId: number) => {
    if (!electionData) return;
    
    const maxNominations = electionData.maxNominationsPerVoter || 1;
    
    if (selectedCandidates.includes(candidateId)) {
      // Remover da seleção
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      // Adicionar à seleção se não atingiu o limite
      if (selectedCandidates.length < maxNominations) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      } else {
        toast({
          title: "Limite atingido",
          description: `Você pode selecionar no máximo ${maxNominations} candidato(s).`,
          variant: "destructive",
        });
      }
    }
  };

  // Confirmar todas as indicações de uma vez
  const handleConfirmNominations = async () => {
    if (submitting || !electionData || selectedCandidates.length === 0) return;
    
    setSubmitting(true);
    try {
      console.log('🔄 Confirmando indicações:', selectedCandidates);
      
      // Enviar todas as indicações
      let successCount = 0;
      for (const candidateId of selectedCandidates) {
        console.log(`📤 Enviando indicação para candidato ${candidateId}...`);
        
        const response = await fetch('/api/elections/vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id?.toString() || ''
          },
          body: JSON.stringify({
            configId: configId,
            candidateId,
            phase: 'nomination'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`❌ Erro ao indicar candidato ${candidateId}:`, errorData);
          throw new Error(errorData.error || 'Erro ao registrar indicação');
        }
        
        console.log(`✅ Indicação registrada para candidato ${candidateId}`);
        successCount++;
      }
      
      console.log(`✅ Total de ${successCount} indicações registradas com sucesso`);
      
      // Marcar como finalizado
      setFinishedNominating(true);
      setSelectedCandidates([]);
      
      // Recarregar dados
      await loadElectionData();
      setSubmitting(false);
      
    } catch (error) {
      console.error('❌ Erro ao confirmar indicações:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível registrar suas indicações.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const getPhaseTitle = () => {
    if (!electionData) return '';
    
    switch (electionData.phase) {
      case 'nomination':
        return 'Fase de Indicações';
      case 'oral_observations':
        return 'Observações Orais';
      case 'voting':
        return 'Fase de Votação';
      case 'completed':
        return 'Eleição Finalizada';
      default:
        return 'Eleição';
    }
  };

  const getPhaseDescription = () => {
    if (!electionData) return '';
    
    switch (electionData.phase) {
      case 'nomination':
        return 'Selecione quem você indica para este cargo. Cada pessoa pode indicar apenas uma vez.';
      case 'oral_observations':
        return 'Aguarde as observações orais do pastor. Mantenha esta tela aberta para acompanhar.';
      case 'voting':
        return 'Selecione quem você escolhe para este cargo. Cada pessoa pode votar apenas uma vez.';
      case 'completed':
        return 'A eleição foi finalizada. Obrigado por sua participação!';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadElectionData();
    }
  }, [user?.id, configId]);

  // Atualização automática a cada 2 segundos após indicar ou votar
  useEffect(() => {
    if (!electionData) return;
    
    const shouldAutoRefresh = 
      (electionData.phase === 'nomination' && electionData.hasNominated) ||
      (electionData.phase === 'voting' && electionData.hasVoted);
    
    if (shouldAutoRefresh && user?.id) {
      console.log('🔄 Iniciando atualização automática a cada 2 segundos...');
      const interval = setInterval(() => {
        console.log('🔄 Atualizando dados da eleição (silencioso)...');
        loadElectionData(undefined, true); // true = silentUpdate
      }, 2000); // 2 segundos
      
      return () => {
        console.log('🛑 Parando atualização automática');
        clearInterval(interval);
      };
    }
  }, [electionData?.phase, electionData?.hasNominated, electionData?.hasVoted, user?.id]);

  // Só mostrar loading completo no carregamento inicial
  if (loading && isInitialLoad) {
    return (
      <MobileLayout>
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando eleição...</span>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="p-4 text-center space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!electionData) {
    return (
      <MobileLayout>
        <div className="p-4 text-center space-y-4">
          <Alert>
            <AlertDescription>
              Não foi possível carregar os dados da eleição.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Vote className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold">Eleição de Liderança</h1>
              <p className="text-sm text-muted-foreground">
                {electionData.election.church_name || 'Igreja'}
              </p>
            </div>
          </div>
          
          <Badge variant="outline">
            {electionData.currentPosition + 1} / {electionData.totalPositions}
          </Badge>
        </div>

        {/* Tela: Após indicar - aguardando votação */}
        {electionData.phase === 'nomination' && (electionData.hasNominated || finishedNominating) && (
          <Card className="border-blue-300 bg-blue-50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-blue-900">
                {electionData.nominationCount === 1 ? 'Indicação Registrada!' : 'Indicações Registradas!'}
              </h2>
              <p className="text-blue-800">
                Você fez <strong>{electionData.nominationCount || 0}</strong> de <strong>{electionData.maxNominationsPerVoter || 1}</strong> indicações permitidas.
              </p>
              <p className="text-blue-800">
                Visualize na tela principal os indicados.
              </p>
              <p className="text-sm text-blue-700">
                Aguarde o administrador iniciar a votação para continuar.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 pt-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Atualizando automaticamente...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tela: Após votar - aguardando contagem */}
        {electionData.phase === 'voting' && electionData.hasVoted && electionData.votedCandidateName && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-green-900">
                Voto Registrado!
              </h2>
              <p className="text-green-800 text-lg">
                Você votou em <strong>{electionData.votedCandidateName}</strong> para <strong>{electionData.currentPositionName}</strong>.
              </p>
              <p className="text-sm text-green-700">
                Aguarde a contagem de votos.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-green-600 pt-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Atualizando automaticamente...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Status - Só mostra se NÃO votou/indicou ainda */}
        {!((electionData.phase === 'nomination' && (electionData.hasNominated || finishedNominating)) || 
            (electionData.phase === 'voting' && electionData.hasVoted)) && (
          <Card className={`${
          electionData.phase === 'nomination' ? 'border-blue-200 bg-blue-50' :
          electionData.phase === 'voting' ? 'border-green-200 bg-green-50' :
          electionData.phase === 'oral_observations' ? 'border-yellow-200 bg-yellow-50' :
          'border-gray-200 bg-gray-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-semibold text-sm">{getPhaseTitle()}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {getPhaseDescription()}
            </p>
          </CardContent>
        </Card>
        )}

        {/* Position Info - Só mostra se NÃO votou/indicou ainda */}
        {!((electionData.phase === 'nomination' && (electionData.hasNominated || finishedNominating)) || 
            (electionData.phase === 'voting' && electionData.hasVoted)) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span>{electionData.currentPositionName}</span>
              {electionData.currentPositionDescription && (
                <button
                  onClick={() => setShowDescriptionModal(true)}
                  className="w-5 h-5 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <HelpCircle className="h-3 w-3 text-blue-600" />
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {electionData.candidates.length} candidato(s) elegível(is)
                </span>
              </div>
              {electionData.phase === 'nomination' && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-800">
                    {electionData.nominationCount || 0} / {electionData.maxNominationsPerVoter || 1} indicações
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Botões de ação para múltiplas indicações */}
        {electionData.phase === 'nomination' && 
         !electionData.hasNominated && 
         !finishedNominating && 
         selectedCandidates.length > 0 && (
          <Card className="border-blue-300 bg-blue-50 sticky top-0 z-10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">
                    {selectedCandidates.length} de {electionData.maxNominationsPerVoter || 1} selecionado(s)
                  </p>
                  <p className="text-xs text-blue-700">
                    {selectedCandidates.length === (electionData.maxNominationsPerVoter || 1) 
                      ? 'Limite atingido' 
                      : `Pode selecionar mais ${(electionData.maxNominationsPerVoter || 1) - selectedCandidates.length}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCandidates([])}
                    className="border-blue-300 text-blue-700"
                  >
                    Limpar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleConfirmNominations}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar {selectedCandidates.length === 1 ? 'Indicação' : 'Indicações'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidates List - Só mostra se NÃO votou/indicou ainda */}
        {!((electionData.phase === 'nomination' && (electionData.hasNominated || finishedNominating)) || 
            (electionData.phase === 'voting' && electionData.hasVoted)) && (
        <>
        {electionData.candidates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum candidato elegível</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {electionData.phase === 'nomination' 
                  ? 'Não há membros elegíveis para indicação neste momento.'
                  : 'Não há candidatos para votação neste momento.'
                }
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {electionData.phase === 'nomination' 
                ? (electionData.maxNominationsPerVoter || 1) > 1 
                  ? `Selecione até ${electionData.maxNominationsPerVoter} candidatos:`
                  : 'Indique um candidato:'
                : 'Escolha um candidato:'}
            </h3>
            
            {/* Search Field */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar candidato pelo nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground mt-2">
                  {electionData.candidates.filter(c => 
                    c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length} candidato(s) encontrado(s)
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {electionData.candidates
                .filter(candidate => 
                  candidate && 
                  candidate.name && 
                  candidate.id &&
                  candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map((candidate) => {
                  const isMultipleNominations = electionData.phase === 'nomination' && (electionData.maxNominationsPerVoter || 1) > 1;
                  const isSelected = isMultipleNominations 
                    ? selectedCandidates.includes(candidate.id)
                    : selectedCandidate === candidate.id;
                  
                  return (
                  <div
                    key={candidate.id}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${submitting ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!submitting) {
                        if (isMultipleNominations) {
                          handleToggleCandidate(candidate.id);
                        } else if (!electionData.hasVoted) {
                          setSelectedCandidate(candidate.id);
                        }
                      }
                    }}
                  >
                    <div className="flex flex-col h-full">
                      {/* Header com avatar e nome */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isSelected ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">
                              {electionData.phase === 'voting' ? candidate.votes : candidate.nominations}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{candidate.name}</p>
                        </div>
                      </div>

                      {/* Informações do candidato */}
                      <div className="space-y-2 mb-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            <User className="h-3 w-3 mr-1" />
                            {candidate.unit}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
                            {candidate.points} pts
                          </Badge>
                        </div>
                        {electionData.phase === 'voting' && candidate.votes > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            {candidate.votes} votos ({candidate.percentage.toFixed(1)}%)
                          </p>
                        )}
                      </div>

                      {/* Botão de ação - só aparece quando NÃO é múltiplas indicações */}
                      {!isMultipleNominations && !electionData.hasVoted && (electionData.phase === 'nomination' || electionData.phase === 'voting') && (
                        <div className="mt-auto">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(candidate.id, electionData.phase);
                            }}
                            disabled={submitting || selectedCandidate !== candidate.id}
                            className={`w-full text-xs ${
                              selectedCandidate === candidate.id
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            {electionData.phase === 'nomination' ? 'Indicar' : 'Votar'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Modal de Descrição do Cargo */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-blue-900">
                {electionData?.currentPositionName}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDescriptionModal(false)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Atribuições e Responsabilidades:</h3>
              <div className="text-blue-800 leading-relaxed whitespace-pre-line">
                {electionData?.currentPositionDescription}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDescriptionModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}