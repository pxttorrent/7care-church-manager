import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Users, 
  Vote, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Loader2,
  Plus,
  Settings
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useNavigate } from 'react-router-dom';

interface ElectionConfig {
  id: number;
  church_name: string;
  status: string;
  election_status?: string;
  created_at: string;
  election_created_at?: string;
  voters: number[];
  positions: string[];
  criteria: any;
}

export default function ElectionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [configs, setConfigs] = useState<ElectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadConfigs();
    
    if (autoRefresh) {
      const interval = setInterval(loadConfigs, 5000); // Atualiza a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/elections/configs');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de nomeação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async (configId: number) => {
    try {
      const response = await fetch('/api/elections/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configId })
      });

      if (response.ok) {
        toast({
          title: "Nomeação iniciada",
          description: "A nomeação foi iniciada com sucesso!",
        });
        loadConfigs();
      } else {
        throw new Error('Erro ao iniciar nomeação');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a nomeação.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (configId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/elections/config/${configId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Configuração excluída",
          description: "A configuração foi excluída com sucesso!",
        });
        loadConfigs();
      } else {
        throw new Error('Erro ao excluir configuração');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a configuração.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (config: ElectionConfig) => {
    if (config.election_status === 'active') {
      return (
        <Badge variant="default" className="bg-green-500">
          <Play className="w-3 h-3 mr-1" />
          Ativa
        </Badge>
      );
    } else if (config.status === 'draft') {
      return (
        <Badge variant="secondary">
          <Settings className="w-3 h-3 mr-1" />
          Rascunho
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <Pause className="w-3 h-3 mr-1" />
          Pausada
        </Badge>
      );
    }
  };

  const getPhaseProgress = (config: ElectionConfig) => {
    if (!config.election_status || config.election_status !== 'active') {
      return null;
    }

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Nomeação em Andamento</span>
          <span>Ativa</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Nomeações</h1>
              <p className="text-muted-foreground">Gerencie todas as nomeações da igreja</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Pausar' : 'Atualizar'}
            </Button>
            
            <Button
              onClick={() => navigate('/election-config')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Nomeação
            </Button>
          </div>
        </div>

        {configs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma nomeação configurada</h3>
              <p className="text-muted-foreground mb-4">
                Configure uma nova nomeação para começar o processo de eleição de liderança.
              </p>
              <Button onClick={() => navigate('/election-config')}>
                <Plus className="h-4 w-4 mr-2" />
                Configurar Nomeação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {configs.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{config.church_name}</CardTitle>
                      <CardDescription>
                        {config.positions.length} cargos • {config.voters.length} votantes
                      </CardDescription>
                    </div>
                    {getStatusBadge(config)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {config.voters.length} votantes
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Vote className="w-3 h-3 mr-1" />
                        {config.positions.length} cargos
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(config.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>

                    {getPhaseProgress(config)}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {config.election_status === 'active' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/election-dashboard/${config.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Acompanhar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/election-config?id=${config.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStartElection(config.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/election-config?id=${config.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {configs.length > 0 && (
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Múltiplas Nomeações:</strong> Você pode gerenciar várias nomeações simultaneamente. 
              Cada configuração é independente e pode estar em diferentes fases.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MobileLayout>
  );
}