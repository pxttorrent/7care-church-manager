import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Vote, 
  CheckCircle, 
  Clock, 
  UserCheck,
  Users,
  Target,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';

interface Candidate {
  id: number;
  name: string;
  email: string;
  church: string;
  faithfulnessPunctual: boolean;
  faithfulnessSeasonal: boolean;
  faithfulnessRecurring: boolean;
  attendancePercentage: number;
  monthsInChurch: number;
  eligible: boolean;
}

interface Position {
  id: string;
  name: string;
  candidates: Candidate[];
  currentVote?: number;
}

interface ElectionStatus {
  active: boolean;
  currentPosition: number;
  positions: Position[];
  totalPositions: number;
  votedPositions: number;
}

export default function ElectionVoting() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [electionStatus, setElectionStatus] = useState<ElectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadElectionStatus();
  }, []);

  const loadElectionStatus = async () => {
    try {
      const response = await fetch('/api/elections/status', {
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setElectionStatus(data);
      } else if (response.status === 404) {
        setElectionStatus(null);
      }
    } catch (error) {
      console.error('Erro ao carregar status da eleição:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (positionId: string, candidateId: number) => {
    setVoting(true);
    try {
      const response = await fetch('/api/elections/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({
          positionId,
          candidateId
        })
      });

      if (response.ok) {
        toast({
          title: "Voto registrado",
          description: "Seu voto foi registrado com sucesso.",
        });
        
        // Atualizar status local
        setElectionStatus(prev => {
          if (!prev) return prev;
          
          const updatedPositions = prev.positions.map(pos => {
            if (pos.id === positionId) {
              return { ...pos, currentVote: candidateId };
            }
            return pos;
          });

          return {
            ...prev,
            positions: updatedPositions,
            votedPositions: prev.votedPositions + 1
          };
        });
      } else {
        throw new Error('Erro ao registrar voto');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  if (!electionStatus) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Nenhuma Eleição Ativa</h2>
          <p className="text-muted-foreground">
            Não há eleições ativas no momento. Aguarde o administrador iniciar uma nova eleição.
          </p>
        </div>
      </MobileLayout>
    );
  }

  if (!electionStatus.active) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Eleição Finalizada</h2>
          <p className="text-muted-foreground">
            A eleição foi finalizada. Os resultados serão divulgados em breve.
          </p>
        </div>
      </MobileLayout>
    );
  }

  const currentPosition = electionStatus.positions[electionStatus.currentPosition];
  const progress = (electionStatus.votedPositions / electionStatus.totalPositions) * 100;

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Vote className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Nomeação de Liderança</h1>
            <p className="text-muted-foreground">Eleição de cargos da igreja</p>
          </div>
        </div>

        {/* Progresso da eleição */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso da Eleição</span>
                <span className="text-sm text-muted-foreground">
                  {electionStatus.votedPositions} de {electionStatus.totalPositions} cargos
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Posição atual */}
        {currentPosition && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {currentPosition.name}
              </CardTitle>
              <CardDescription>
                Selecione o candidato para este cargo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPosition.candidates.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum candidato elegível encontrado para este cargo.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {currentPosition.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        currentPosition.currentVote === candidate.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => submitVote(currentPosition.id, candidate.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {currentPosition.currentVote === candidate.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {candidate.faithfulnessPunctual && (
                            <Badge variant="outline" className="text-xs">
                              Pontual
                            </Badge>
                          )}
                          {candidate.faithfulnessSeasonal && (
                            <Badge variant="outline" className="text-xs">
                              Sazonal
                            </Badge>
                          )}
                          {candidate.faithfulnessRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recorrente
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            Presença: {candidate.attendancePercentage}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {candidate.monthsInChurch} meses na igreja
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status da votação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Status da Votação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {electionStatus.positions.map((position, index) => (
                <div
                  key={position.id}
                  className={`p-3 border rounded-lg flex items-center justify-between ${
                    index === electionStatus.currentPosition
                      ? 'border-blue-500 bg-blue-50'
                      : position.currentVote
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === electionStatus.currentPosition
                        ? 'bg-blue-500 text-white'
                        : position.currentVote
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{position.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {index === electionStatus.currentPosition && (
                      <Badge variant="default">Atual</Badge>
                    )}
                    {position.currentVote && index !== electionStatus.currentPosition && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {voting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Registrando voto...</span>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
