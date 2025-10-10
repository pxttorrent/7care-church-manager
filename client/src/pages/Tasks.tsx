import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, User, Tag, CheckCircle, Circle, AlertCircle, Clock, Trash2, Edit3, MoreVertical, PlusCircle, CheckSquare2, RefreshCw, Upload, Download, Settings, Wifi, WifiOff, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { toast } from 'sonner';
import { useTasksGoogleDriveSync } from '@/hooks/useTasksGoogleDriveSync';
import { notificationService } from '@/lib/notificationService';
import { useOfflineData } from '@/hooks/useOfflineData';
import { offlineStorage } from '@/lib/offlineStorage';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_by: number;
  assigned_to?: number;
  created_by_name?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  tags?: string[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  church: string;
}

const priorityConfig = {
  high: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Alta'
  },
  medium: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: <Clock className="h-3 w-3" />,
    label: 'Média'
  },
  low: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <Circle className="h-3 w-3" />,
    label: 'Baixa'
  }
};

const statusConfig = {
  pending: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: <Circle className="h-3 w-3" />,
    label: 'Pendente'
  },
  in_progress: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Clock className="h-3 w-3" />,
    label: 'Em Progresso'
  },
  completed: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Concluída'
  }
};

export default function Tasks() {
  console.log('🚀 Tasks component loaded com suporte offline');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    due_date: '',
    assigned_to: 'none',
    tags: [] as string[]
  });

  const queryClient = useQueryClient();
  
  // Hook para sincronização com Google Sheets
  const {
    config: syncConfig,
    syncStatus,
    syncTasksNow,
    addTasksToSheet,
    configureSync
  } = useTasksGoogleDriveSync();

  // 🆕 Hook de armazenamento offline
  const {
    data: allTasks,
    loading: tasksLoading,
    syncing,
    isOnline,
    create: createTask,
    update: updateTask,
    remove: deleteTask,
    sync: syncOfflineData,
    syncInfo
  } = useOfflineData<Task>({
    storeName: 'tasks',
    endpoint: '/api/tasks',
    queryKey: ['tasks'],
    autoFetch: true,
    syncInterval: 30000 // 30 segundos
  });

  // Inicializar storage ao montar
  useEffect(() => {
    offlineStorage.init().then(() => {
      console.log('✅ OfflineStorage inicializado para Tasks');
    });
  }, []);

  // Buscar usuários
  const { data: usersData } = useQuery({
    queryKey: ['tasks-users'],
    queryFn: async () => {
      const response = await fetch('/api/tasks/users', {
        headers: { 'x-user-id': '1' }
      });
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      return response.json();
    }
  });

  // 🆕 Handlers usando armazenamento offline

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        due_date: newTask.due_date || undefined,
        assigned_to: newTask.assigned_to && newTask.assigned_to !== 'none' ? parseInt(newTask.assigned_to) : undefined,
        status: 'pending' as const,
        created_by: 1, // TODO: Pegar do contexto de autenticação
        tags: newTask.tags
      };

      await createTask(taskData as any);

      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: 'none',
        tags: []
      });

      // Mensagem diferente se estiver offline
      if (isOnline) {
        toast.success('Tarefa criada com sucesso!');
      } else {
        toast.success('Tarefa salva offline. Será sincronizada quando conectar.', {
          icon: '📴'
        });
      }

      // Notificar usuário atribuído (apenas se online)
      if (isOnline && newTask.assigned_to && newTask.assigned_to !== 'none') {
        try {
          await notificationService.notifyTaskCreated(
            newTask.title,
            parseInt(newTask.assigned_to)
          );
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);
        }
      }

    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        due_date: editingTask.due_date,
        assigned_to: editingTask.assigned_to,
        status: editingTask.status
      });

      setIsEditDialogOpen(false);
      setEditingTask(null);

      if (isOnline) {
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        toast.success('Tarefa atualizada offline. Será sincronizada quando conectar.', {
          icon: '📴'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      await deleteTask(taskId);

      if (isOnline) {
        toast.success('Tarefa deletada com sucesso!');
      } else {
        toast.success('Tarefa deletada offline. Será sincronizada quando conectar.', {
          icon: '📴'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao deletar tarefa');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateTask(task.id, { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });

      if (!isOnline) {
        toast.success('Status atualizado offline', { icon: '📴' });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  // Função para sincronização manual com Google Sheets
  const handleSyncWithGoogleSheets = async () => {
    setIsSyncing(true);
    
    try {
      console.log('🔄 Iniciando sincronização manual com Google Sheets...');
      
      // Buscar todas as tarefas do app
      const tasksResponse = await fetch('/api/tasks', {
        headers: { 'x-user-id': '1' }
      });
      
      if (!tasksResponse.ok) {
        throw new Error('Erro ao buscar tarefas');
      }
      
      const tasksData = await tasksResponse.json();
      const tasks = tasksData.tasks || [];
      
      console.log(`📊 Encontradas ${tasks.length} tarefas para sincronizar`);
      
      let sincronizadas = 0;
      
      // Sincronizar cada tarefa
      for (const task of tasks) {
        try {
          // Preparar dados da tarefa para o Google Apps Script
          const taskData = {
            id: task.id,
            titulo: task.title,
            descricao: task.description || '',
            status: task.status === 'completed' ? 'Concluída' : 
                   task.status === 'in_progress' ? 'Em Progresso' : 'Pendente',
            prioridade: task.priority === 'high' ? 'Alta' : 
                       task.priority === 'low' ? 'Baixa' : 'Média',
            responsavel: task.assigned_to_name || 'Sistema',
            criador: task.created_by_name || 'App',
            data_criacao: new Date(task.created_at).toLocaleDateString('pt-BR'),
            data_vencimento: task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem prazo',
            data_conclusao: task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-BR') : '',
            tags: task.tags?.join(',') || ''
          };
          
          // Enviar para Google Apps Script
          const scriptResponse = await fetch('https://script.google.com/macros/s/AKfycbw7ylcQvor2tlElCamOqsBKuFyb-tVLYIVejzIsJ-OsOFpe8lO15Sz0GMuCTiBzN3xh/exec', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'addTask',
              spreadsheetId: '1i-x-0KiciwACRztoKX-YHlXT4FsrAzaKwuH-hHkD8go',
              sheetName: 'tarefas',
              taskData: taskData
            })
          });
          
          if (scriptResponse.ok) {
            const result = await scriptResponse.json();
            if (result.success) {
              console.log(`✅ Tarefa "${task.title}" sincronizada`);
              sincronizadas++;
            }
          }
          
        } catch (error) {
          console.error(`❌ Erro ao sincronizar tarefa "${task.title}":`, error);
        }
      }
      
      toast.success(`Sincronização concluída! ${sincronizadas}/${tasks.length} tarefas sincronizadas com sucesso.`);
      
      // Atualizar a lista de tarefas
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast.error('Erro ao sincronizar com Google Sheets. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  const users = usersData?.users || [];

  // Filtrar tarefas (com suporte a filtros de status e prioridade)
  const filteredTasks = allTasks.filter((task: Task) => {
    // Filtro de busca
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de status
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    
    // Filtro de prioridade
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingTasks = filteredTasks.filter((task: Task) => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter((task: Task) => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter((task: Task) => task.status === 'completed');

  const TaskCard = ({ task }: { task: Task }) => {
    const isNotSynced = (task as any)._synced === false || (task as any)._localCreated === true;
    
    return (
      <Card className={`group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 mb-4 ${isNotSynced ? 'border-l-4 border-l-yellow-400' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 hover:text-gray-500" />
                  )}
                </button>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {task.title}
                </h3>
                {/* Indicador de não sincronizado */}
                {isNotSynced && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                    <CloudOff className="h-2 w-2 mr-1" />
                    Pendente
                  </Badge>
                )}
              </div>
            
            {task.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`${statusConfig[task.status].color} border`}>
                {statusConfig[task.status].icon}
                <span className="ml-1">{statusConfig[task.status].label}</span>
              </Badge>
              
              <Badge className={`${priorityConfig[task.priority].color} border`}>
                {priorityConfig[task.priority].icon}
                <span className="ml-1">{priorityConfig[task.priority].label}</span>
              </Badge>
              
              {task.assigned_to_name && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  <User className="h-3 w-3 mr-1" />
                  {task.assigned_to_name}
                </Badge>
              )}
            </div>
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
    );
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="text-center py-12">
      <div className="p-4 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );

  if (tasksLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Tarefas
                </h1>
                
                {/* 🆕 Indicador de Status Online/Offline */}
                {isOnline ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </Badge>
                )}

                {/* Indicador de sincronização */}
                {syncing && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Sincronizando...
                  </Badge>
                )}

                {/* Indicador de itens pendentes */}
                {syncInfo.pendingCount > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
                    <CloudOff className="h-3 w-3" />
                    {syncInfo.pendingCount} pendente{syncInfo.pendingCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-lg">
                Organize e acompanhe suas tarefas de forma eficiente
                {!isOnline && <span className="text-yellow-600 ml-2">• Modo offline - suas alterações serão sincronizadas quando conectar</span>}
              </p>
              
              {/* Status da última sincronização */}
              {syncInfo.lastSync && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>
                    Última sincronização: {new Date(syncInfo.lastSync).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {/* Botão de sincronização manual */}
              {isOnline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncOfflineData()}
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/settings', '_blank')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
            
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Nova Tarefa</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Digite o título da tarefa"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Descreva a tarefa em detalhes"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="due_date">Data de Vencimento</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="assigned_to">Responsável</Label>
                      <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem responsável</SelectItem>
                          {users.map((user: User) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="px-6"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        disabled={tasksLoading || syncing}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6"
                      >
                        {syncing ? 'Salvando...' : 'Criar Tarefa'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-8 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar tarefas por título, descrição ou responsável..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Tarefas */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
              <TabsTrigger value="pending" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Circle className="h-4 w-4 mr-2" />
                Pendentes ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                Em Progresso ({inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <CheckSquare2 className="h-4 w-4 mr-2" />
                Concluídas ({completedTasks.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingTasks.length === 0 ? (
                <EmptyState 
                  icon={Circle}
                  title="Nenhuma tarefa pendente"
                  description="Crie uma nova tarefa para começar a organizar seu trabalho"
                />
              ) : (
                pendingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>
            
            <TabsContent value="in_progress" className="space-y-4">
              {inProgressTasks.length === 0 ? (
                <EmptyState 
                  icon={Clock}
                  title="Nenhuma tarefa em progresso"
                  description="Mova tarefas pendentes para em progresso quando começar a trabalhar nelas"
                />
              ) : (
                inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedTasks.length === 0 ? (
                <EmptyState 
                  icon={CheckSquare2}
                  title="Nenhuma tarefa concluída"
                  description="Complete algumas tarefas para vê-las aparecer aqui"
                />
              ) : (
                completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>
          </Tabs>

          {/* Dialog de Edição */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Editar Tarefa</DialogTitle>
              </DialogHeader>
              
              {editingTask && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="edit-title">Título *</Label>
                    <Input
                      id="edit-title"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      placeholder="Digite o título da tarefa"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      placeholder="Descreva a tarefa em detalhes"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-priority">Prioridade</Label>
                      <Select value={editingTask.priority} onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as any })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-due_date">Data de Vencimento</Label>
                      <Input
                        id="edit-due_date"
                        type="date"
                        value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ''}
                        onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-assigned_to">Responsável</Label>
                    <Select 
                      value={editingTask.assigned_to?.toString() || 'none'} 
                      onValueChange={(value) => setEditingTask({ ...editingTask, assigned_to: value === 'none' ? undefined : parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem responsável</SelectItem>
                        {users.map((user: User) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="px-6"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateTask}
                      disabled={syncing}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6"
                    >
                      {syncing ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MobileLayout>
  );
}