import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, User, Tag, CheckCircle, Circle, AlertCircle, Clock, Trash2, Edit3, PlusCircle, CheckSquare2, RefreshCw, Settings, Wifi, WifiOff, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { toast } from 'sonner';
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

// 🎯 CONFIGURAÇÃO DO GOOGLE SHEETS
const GOOGLE_SHEETS_CONFIG = {
  proxyUrl: '/api/google-sheets/proxy', // Proxy no servidor (evita CORS)
  spreadsheetId: '1i-x-0KiciwACRztoKX-YHlXT4FsrAzaKwuH-hHkD8go',
  sheetName: 'tarefas'
};

export default function Tasks() {
  console.log('🚀 Tasks - Sistema de sincronização simplificado');
  
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    due_date: '',
    assigned_to: 'none',
    tags: [] as string[]
  });
  
  // Hook de armazenamento offline (App ↔ Servidor)
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
    syncInterval: 30000
  });

  // Inicializar storage
  useEffect(() => {
    offlineStorage.init().then(() => {
      console.log('✅ Storage inicializado');
    });
  }, []);

  // Limpar seleções quando filtros mudarem
  useEffect(() => {
    setSelectedTasks([]);
  }, [searchTerm, selectedPriority, selectedStatus]);

  // Sincronização automática otimizada (apenas Google Sheets, servidor já sincroniza via hook)
  useEffect(() => {
    if (!isOnline) return;
    
    console.log('🔄 [AUTO] Iniciando sincronização otimizada com Google Sheets...');
    
    // Sincronizar apenas a cada 30 segundos (não a cada 2s)
    const syncInterval = setInterval(async () => {
      if (!isOnline) return;
      
      try {
        // Sincronizar DO Google Sheets PARA o app
        // O hook useOfflineData já cuida da sincronização com servidor
        console.log(`⬅️ [AUTO] Sincronizando do Google Sheets (30s)...`);
        await syncFromGoogleSheets(false); // false = sem toast
      } catch (error) {
        console.error('❌ [AUTO] Erro na sincronização:', error);
      }
    }, 30000); // A cada 30 segundos (não mais a cada 2s)
    
    return () => {
      console.log('🛑 [AUTO] Parando sincronização automática');
      clearInterval(syncInterval);
    };
  }, [isOnline]);

  // Sincronização inicial simplificada quando volta online
  useEffect(() => {
    if (!isOnline) return;
    
    console.log(`🌐 [AUTO] Online detectado - sincronizando em 2 segundos...`);
    
    const syncTimer = setTimeout(async () => {
      try {
        // O hook useOfflineData já cuida da sincronização com servidor
        // Aqui apenas sincronizamos com Google Sheets
        console.log('⬅️ [AUTO] Sincronizando do Google Sheets após voltar online...');
        await syncFromGoogleSheets(false);
        console.log('✅ [AUTO] Sincronização inicial concluída!');
      } catch (error) {
        console.error('❌ [AUTO] Erro na sincronização inicial:', error);
      }
    }, 2000); // 2 segundos após ficar online
    
    return () => clearTimeout(syncTimer);
  }, [isOnline]); // Dispara quando o status online muda

  // ========================================
  // 🎯 SINCRONIZAÇÃO COM GOOGLE SHEETS
  // ========================================
  
  /**
   * Adiciona uma tarefa específica ao Google Sheets
   */
  const addTaskToGoogleSheets = async (task: Task) => {
    if (!isOnline) {
      console.log('📴 Offline - adição no Google Sheets adiada');
      return;
    }

    try {
      console.log(`📤 [ADD] Adicionando tarefa ${task.id} ao Google Sheets...`);
      
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
        data_vencimento: task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '',
        data_conclusao: task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-BR') : '',
        tags: task.tags?.join(',') || ''
      };
      
      const response = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '1'
        },
        body: JSON.stringify({
          action: 'addTask',
          spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
          sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
          taskData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`✅ [ADD] Tarefa ${task.id} adicionada ao Google Sheets!`);
        } else {
          console.warn(`⚠️ [ADD] Falha ao adicionar tarefa ${task.id}:`, result);
        }
      } else {
        console.error(`❌ [ADD] Erro HTTP ${response.status} ao adicionar tarefa ${task.id}`);
      }
    } catch (error) {
      console.error(`❌ [ADD] Erro ao adicionar tarefa ${task.id} ao Google Sheets:`, error);
    }
  };

  /**
   * Atualiza uma tarefa específica no Google Sheets
   */
  const updateTaskInGoogleSheets = async (task: Task) => {
    if (!isOnline) {
      console.log('📴 Offline - atualização no Google Sheets adiada');
      return;
    }

    try {
      console.log(`📝 [UPDATE] Atualizando tarefa ${task.id} no Google Sheets...`);
      
      // Verificar se a tarefa ainda existe no servidor antes de atualizar
      const checkResponse = await fetch(`/api/tasks`, {
        headers: { 'x-user-id': '1' }
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const tasks = checkData.tasks || [];
        const taskExists = tasks.find((t: Task) => t.id === task.id);
        
        if (!taskExists) {
          console.log(`⚠️ [UPDATE] Tarefa ${task.id} não existe mais, cancelando atualização`);
          return;
        }
      }
      
      // Deletar a linha antiga do Google Sheets
      const deleteResult = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '1'
        },
        body: JSON.stringify({
          action: 'deleteTask',
          spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
          sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
          taskId: task.id
        })
      });
      
      // Adicionar com os dados atualizados
      await addTaskToGoogleSheets(task);
      
      console.log(`✅ [UPDATE] Tarefa ${task.id} atualizada no Google Sheets!`);
    } catch (error) {
      console.error(`❌ [UPDATE] Erro ao atualizar tarefa ${task.id} no Google Sheets:`, error);
    }
  };

  /**
   * Deleta uma tarefa específica do Google Sheets por ID
   */
  const deleteTaskFromGoogleSheets = async (taskId: number) => {
    if (!isOnline) {
      console.log('📴 Offline - deleção no Google Sheets adiada');
      return;
    }

    try {
      console.log(`🗑️ [DELETE] Deletando tarefa ${taskId} do Google Sheets...`);
      
      const response = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '1'
        },
        body: JSON.stringify({
          action: 'deleteTask',
          spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
          sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
          taskId: taskId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`✅ [DELETE] Tarefa ${taskId} deletada do Google Sheets (linha ${result.linha})`);
        } else {
          console.warn(`⚠️ [DELETE] Falha ao deletar tarefa ${taskId}:`, result.error);
        }
      } else {
        console.error(`❌ [DELETE] Erro HTTP ${response.status} ao deletar tarefa ${taskId}`);
      }
    } catch (error) {
      console.error(`❌ [DELETE] Erro ao deletar tarefa ${taskId} do Google Sheets:`, error);
    }
  };

  /**
   * Sincroniza DO Google Sheets PARA o servidor (BIDIRECIONAL)
   * Busca tarefas do Sheets e atualiza o servidor com as diferenças
   */
  const syncFromGoogleSheets = async (showToast = false) => {
    if (!isOnline) {
      console.log('📴 Offline - sincronização adiada');
      if (showToast) toast.error('Você está offline');
      return;
    }

    try {
      console.log('⬅️ [SYNC-FROM-SHEETS] Iniciando sincronização DO Google Sheets...');
      if (showToast) toast.info('Sincronizando do Google Sheets...');
      
      // 1. Buscar tarefas do Google Sheets
      const sheetsResponse = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '1'
        },
        body: JSON.stringify({
          action: 'getTasks',
          spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
          sheetName: GOOGLE_SHEETS_CONFIG.sheetName
        })
      });
      
      if (!sheetsResponse.ok) {
        throw new Error('Erro ao buscar tarefas do Google Sheets');
      }
      
      const sheetsData = await sheetsResponse.json();
      const sheetsTasks = sheetsData.tasks || [];
      console.log(`📊 [SYNC-FROM-SHEETS] ${sheetsTasks.length} tarefas no Google Sheets`);
      
      // 2. Buscar tarefas do servidor
      const serverResponse = await fetch('/api/tasks', {
        headers: { 
          'x-user-id': '1',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!serverResponse.ok) {
        throw new Error('Erro ao buscar tarefas do servidor');
      }
      
      const serverData = await serverResponse.json();
      const serverTasks = serverData.tasks || [];
      console.log(`💾 [SYNC-FROM-SHEETS] ${serverTasks.length} tarefas no servidor`);
      
      // 3. Comparar e sincronizar
      const serverTasksMap = new Map(serverTasks.map((t: Task) => [t.id, t]));
      const sheetsTasksMap = new Map(sheetsTasks.map((t: any) => [t.id, t]));
      
      let created = 0;
      let updated = 0;
      let deleted = 0;
      
      // 3a. Deletar tarefas que existem no servidor mas não no Sheets
      for (const serverTask of serverTasks) {
        if (!sheetsTasksMap.has(serverTask.id)) {
          console.log(`🗑️ [SYNC-FROM-SHEETS] Deletando tarefa ${serverTask.id} (não está no Sheets)`);
          try {
            await fetch(`/api/tasks/${serverTask.id}`, {
              method: 'DELETE',
              headers: { 'x-user-id': '1' }
            });
            deleted++;
          } catch (error) {
            console.error(`❌ Erro ao deletar tarefa ${serverTask.id}:`, error);
          }
        }
      }
      
      // 3b. Criar/Atualizar tarefas do Sheets no servidor
      for (const sheetsTask of sheetsTasks) {
        const serverTask = serverTasksMap.get(sheetsTask.id);
        
        if (!serverTask) {
          // Tarefa não existe no servidor - criar
          console.log(`➕ [SYNC-FROM-SHEETS] Criando tarefa ${sheetsTask.id} (nova no Sheets)`);
          try {
            await fetch('/api/tasks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': '1'
              },
              body: JSON.stringify({
                id: sheetsTask.id,
                title: sheetsTask.titulo,
                description: sheetsTask.descricao || '',
                status: sheetsTask.status === 'Concluída' ? 'completed' : 
                       sheetsTask.status === 'Em Progresso' ? 'in_progress' : 'pending',
                priority: sheetsTask.prioridade === 'Alta' ? 'high' :
                         sheetsTask.prioridade === 'Baixa' ? 'low' : 'medium',
                created_by: 1
              })
            });
            created++;
          } catch (error) {
            console.error(`❌ Erro ao criar tarefa ${sheetsTask.id}:`, error);
          }
        } else {
          // Tarefa existe - verificar se precisa atualizar
          const needsUpdate = 
            serverTask.title !== sheetsTask.titulo ||
            serverTask.description !== sheetsTask.descricao;
          
          if (needsUpdate) {
            console.log(`📝 [SYNC-FROM-SHEETS] Atualizando tarefa ${sheetsTask.id}`);
            try {
              await fetch(`/api/tasks/${sheetsTask.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': '1'
                },
                body: JSON.stringify({
                  title: sheetsTask.titulo,
                  description: sheetsTask.descricao || '',
                  status: sheetsTask.status === 'Concluída' ? 'completed' : 
                         sheetsTask.status === 'Em Progresso' ? 'in_progress' : 'pending',
                  priority: sheetsTask.prioridade === 'Alta' ? 'high' :
                           sheetsTask.prioridade === 'Baixa' ? 'low' : 'medium'
                })
              });
              updated++;
            } catch (error) {
              console.error(`❌ Erro ao atualizar tarefa ${sheetsTask.id}:`, error);
            }
          }
        }
      }
      
      // 4. Atualizar frontend
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.refetchQueries({ queryKey: ['tasks'], type: 'active' });
      
      console.log(`✅ [SYNC-FROM-SHEETS] Sincronização concluída:`);
      console.log(`   Criadas: ${created}`);
      console.log(`   Atualizadas: ${updated}`);
      console.log(`   Deletadas: ${deleted}`);
      
      if (showToast && (created > 0 || updated > 0 || deleted > 0)) {
        toast.success(`Sincronizado do Sheets: ${created} criadas, ${updated} atualizadas, ${deleted} deletadas`);
      }
      
    } catch (error) {
      console.error('❌ [SYNC-FROM-SHEETS] Erro:', error);
      if (showToast) toast.error('Erro ao sincronizar do Google Sheets');
    }
  };

  /**
   * Sincroniza TODAS as tarefas com Google Sheets via proxy do servidor
   * Evita problema de CORS
   */
  const syncWithGoogleSheets = async () => {
    if (!isOnline) {
      console.log('📴 Offline - sincronização adiada');
      return;
    }

    try {
      console.log('🔄 [SYNC] Iniciando sincronização com Google Sheets...');
      
      // Buscar TODAS as tarefas DIRETO DO SERVIDOR (não do cache)
      const tasksResponse = await fetch('/api/tasks', {
        headers: { 
          'x-user-id': '1',
          'Cache-Control': 'no-cache' // Força buscar do servidor
        }
      });
      
      if (!tasksResponse.ok) {
        console.error('❌ [SYNC] Erro ao buscar tarefas');
        return;
      }
      
      const tasksData = await tasksResponse.json();
      let tasks = tasksData.tasks || [];
      
      // GARANTIR que não há duplicatas (remover tarefas com ID temp)
      tasks = tasks.filter((task: Task) => !String(task.id).startsWith('temp_'));
      
      // Remover duplicatas por ID (caso ainda existam)
      const uniqueTasks = Array.from(new Map(tasks.map((task: Task) => [task.id, task])).values());
      
      console.log(`📊 [SYNC] ${uniqueTasks.length} tarefas únicas para sincronizar (filtradas de ${tasks.length})`);
      
      // PASSO 1: Limpar Google Sheets via proxy
      console.log('🗑️ [SYNC] Limpando Google Sheets...');
      try {
        const clearResponse = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': '1'
          },
          body: JSON.stringify({
            action: 'clearAllTasks',
            spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
            sheetName: GOOGLE_SHEETS_CONFIG.sheetName
          })
        });
        
        if (clearResponse.ok) {
          const clearResult = await clearResponse.json();
          console.log('✅ [SYNC] Google Sheets limpo:', clearResult);
        }
      } catch (error) {
        console.warn('⚠️ [SYNC] Erro ao limpar (continuar mesmo assim):', error);
      }
      
      // PASSO 2: Adicionar todas as tarefas ÚNICAS via proxy
      console.log('📤 [SYNC] Adicionando tarefas ao Google Sheets...');
      let synced = 0;
      let failed = 0;
      
      for (const task of uniqueTasks) {
        try {
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
            data_vencimento: task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '',
            data_conclusao: task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-BR') : '',
            tags: task.tags?.join(',') || ''
          };
          
          const response = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': '1'
            },
            body: JSON.stringify({
              action: 'addTask',
              spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
              sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
              taskData
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              synced++;
            } else {
              failed++;
              console.warn(`⚠️ [SYNC] Falha ao adicionar tarefa ${task.id}:`, result);
            }
          } else {
            failed++;
            console.error(`❌ [SYNC] Erro HTTP ${response.status} ao adicionar tarefa ${task.id}`);
          }
        } catch (error) {
          failed++;
          console.error(`⚠️ [SYNC] Erro ao sincronizar tarefa ${task.id}:`, error);
        }
      }
      
      console.log(`✅ [SYNC] Concluído: ${synced} sucesso, ${failed} falhas (total: ${tasks.length})`);
      
      if (synced > 0) {
        console.log(`📊 [SYNC] Google Sheets atualizado com ${synced} tarefas`);
      }
      
    } catch (error) {
      console.error('❌ [SYNC] Erro na sincronização:', error);
    }
  };

  // ========================================
  // SINCRONIZAÇÃO COM GOOGLE SHEETS
  // ========================================
  
  // ⚠️ SINCRONIZAÇÃO AUTOMÁTICA DESATIVADA
  // Motivo: Deletar tarefas usa função específica (deleteTaskFromGoogleSheets)
  // que deleta APENAS a linha da tarefa, sem relançar tudo
  // 
  // Para sincronização completa manual, use o botão "Servidor"
  
  // useEffect(() => {
  //   if (!isOnline || !allTasks) return;
  //   
  //   // Debounce de 5 segundos para evitar múltiplas sincronizações
  //   const timer = setTimeout(() => {
  //     console.log('🔄 [AUTO-SYNC] Sincronização automática iniciada...');
  //     syncWithGoogleSheets();
  //   }, 5000); // 5 segundos de delay
  //   
  //   return () => clearTimeout(timer);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [allTasks?.length, isOnline]); // Apenas quando o número de tarefas mudar

  // ========================================
  // HANDLERS
  // ========================================

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      console.log('➕ [CREATE] Iniciando criação de tarefa:', newTask.title);
      
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        due_date: newTask.due_date || undefined,
        assigned_to: newTask.assigned_to && newTask.assigned_to !== 'none' ? parseInt(newTask.assigned_to) : undefined,
        status: 'pending' as const,
        created_by: 1,
        tags: newTask.tags
      };

      const createdTask = await createTask(taskData as any);
      console.log('✅ [CREATE] Tarefa criada:', createdTask);

      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: 'none',
        tags: []
      });

      toast.success(isOnline ? 'Tarefa criada!' : 'Tarefa salva offline', {
        icon: isOnline ? '✅' : '📴'
      });
      
      // Se criou online, adicionar ao Google Sheets imediatamente
      // Se criou offline, a sincronização automática vai fazer full sync depois
      if (isOnline && createdTask && !String(createdTask.id).startsWith('temp_')) {
        addTaskToGoogleSheets(createdTask);
      }

      // Notificar usuário atribuído
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

      toast.success(isOnline ? 'Tarefa atualizada!' : 'Atualizada offline', {
        icon: isOnline ? '✅' : '📴'
      });
      
      // Atualizar no Google Sheets (se online)
      if (isOnline && editingTask) {
        updateTaskInGoogleSheets(editingTask);
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      console.log(`🗑️ [HANDLE] Iniciando deleção da tarefa ${taskId}...`);
      
      await deleteTask(taskId);
      console.log(`✅ [HANDLE] Tarefa ${taskId} deletada via hook`);
      
      // Forçar atualização do cache
      console.log(`🔄 [HANDLE] Invalidando cache...`);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.refetchQueries({ queryKey: ['tasks'] });
      console.log(`✅ [HANDLE] Cache atualizado`);
      
      toast.success(isOnline ? 'Tarefa deletada!' : 'Deletada offline', {
        icon: isOnline ? '✅' : '📴'
      });
      
      // Deletar do Google Sheets também (se online)
      if (isOnline) {
        console.log(`📤 [HANDLE] Deletando do Google Sheets...`);
        deleteTaskFromGoogleSheets(taskId);
      }
      
      console.log(`✅ [HANDLE] Deleção completa da tarefa ${taskId}`);
    } catch (error) {
      console.error('❌ [HANDLE] ERRO ao deletar tarefa:', error);
      console.error('   Tipo:', error.constructor.name);
      console.error('   Mensagem:', error.message);
      console.error('   Stack:', error.stack);
      toast.error(`Erro ao deletar tarefa: ${error.message}`);
    }
  };

  const handleToggleTaskSelection = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((task: Task) => task.id));
    }
  };

  const handleDeleteMultipleTasks = async () => {
    if (selectedTasks.length === 0) {
      toast.error('Selecione pelo menos uma tarefa');
      return;
    }

    const count = selectedTasks.length;
    if (!confirm(`Deletar ${count} tarefa${count > 1 ? 's' : ''}?`)) return;

    try {
      console.log(`🗑️ [MULTIPLE] Iniciando deleção de ${count} tarefas...`);
      
      // Salvar IDs antes de deletar
      const tasksToDelete = [...selectedTasks];
      
      for (const taskId of tasksToDelete) {
        console.log(`🗑️ [MULTIPLE] Deletando tarefa ${taskId}...`);
        await deleteTask(taskId);
      }
      
      console.log(`✅ [MULTIPLE] Todas as tarefas deletadas do servidor`);

      // Forçar atualização agressiva do cache
      console.log(`🔄 [MULTIPLE] Atualizando cache...`);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.refetchQueries({ queryKey: ['tasks'] });
      
      setSelectedTasks([]);

      toast.success(`${count} tarefa${count > 1 ? 's deletadas' : ' deletada'}!`);
      
      // Deletar cada tarefa do Google Sheets (se online)
      if (isOnline) {
        console.log(`📤 [MULTIPLE] Deletando do Google Sheets...`);
        for (const taskId of tasksToDelete) {
          deleteTaskFromGoogleSheets(taskId);
        }
      }
      
      console.log(`✅ [MULTIPLE] Deleção múltipla completa`);
    } catch (error) {
      console.error('❌ [MULTIPLE] ERRO ao deletar tarefas:', error);
      console.error('   Tipo:', error.constructor.name);
      console.error('   Mensagem:', error.message);
      toast.error(`Erro ao deletar tarefas: ${error.message}`);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateTask(task.id, { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      
      // Atualizar no Google Sheets (se online)
      if (isOnline) {
        const updatedTask = {
          ...task,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
        updateTaskInGoogleSheets(updatedTask);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

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

  const users = usersData?.users || [];

  // Filtrar tarefas
  const filteredTasks = allTasks.filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingTasks = filteredTasks.filter((task: Task) => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter((task: Task) => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter((task: Task) => task.status === 'completed');

  const TaskCard = ({ task }: { task: Task }) => {
    const isNotSynced = (task as any)._synced === false || (task as any)._localCreated === true;
    const isSelected = selectedTasks.includes(task.id);
    
    return (
      <Card className={`group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 mb-4 ${isNotSynced ? 'border-l-4 border-l-yellow-400' : ''} ${isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-4">
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
                {isNotSynced && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                    <CloudOff className="h-2 w-2 mr-1" />
                    Offline
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
          
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleEditTask(task)}
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              
              <Button
                onClick={() => handleDeleteTask(task.id)}
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Deletar</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleToggleTaskSelection(task.id)}>
              <span className="text-sm text-gray-600 hidden sm:inline">Selecionar</span>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggleTaskSelection(task.id)}
                className="flex-shrink-0"
                aria-label={`Selecionar tarefa ${task.title}`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto">{description}</p>
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
              </div>
              
              <p className="text-gray-600 text-lg">
                Organize e acompanhe suas tarefas
              </p>
              
              {syncInfo.lastSync && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>
                    Última sincronização: {new Date(syncInfo.lastSync).toLocaleString('pt-BR')}
                  </span>
                </div>
                )}

                {syncing && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Sincronizando...
                  </Badge>
                )}

                {syncInfo.pendingCount > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
                    <CloudOff className="h-3 w-3" />
                    {syncInfo.pendingCount} pendente{syncInfo.pendingCount > 1 ? 's' : ''}
                  </Badge>
                )}
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {/* Botões de sincronização manual - escondidos (automático ativo) */}
              {isOnline && false && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncOfflineData()}
                  disabled={syncing}
                  className="flex items-center gap-2"
                  title="Enviar dados pendentes ao servidor"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  Servidor
                </Button>
              )}
              
              {isOnline && false && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncFromGoogleSheets(true)}
                  className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  title="Sincronizar DO Google Sheets manualmente (automático a cada 2s)"
                >
                  <RefreshCw className="h-4 w-4" />
                  ⬅️ Sheets
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
                        <Label htmlFor="due_date">Vencimento</Label>
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
                          <SelectValue placeholder="Selecione" />
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
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        disabled={syncing}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        Criar Tarefa
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
                      placeholder="Buscar tarefas..."
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
                      <SelectItem value="all">Todos</SelectItem>
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
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barra de Seleção Múltipla */}
          {filteredTasks.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={handleSelectAllTasks}
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedTasks.length > 0 
                          ? `${selectedTasks.length} selecionada${selectedTasks.length > 1 ? 's' : ''}`
                          : 'Selecionar todas'
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {filteredTasks.length} tarefa{filteredTasks.length > 1 ? 's' : ''} disponível{filteredTasks.length > 1 ? 'is' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {selectedTasks.length > 0 && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTasks([])}
                        className="flex-1 sm:flex-none"
                      >
                        Desmarcar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteMultipleTasks}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar ({selectedTasks.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                  description="Crie uma nova tarefa para começar"
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
                  description="Mova tarefas pendentes para começar"
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
                  description="Complete tarefas para vê-las aqui"
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
                      placeholder="Digite o título"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      placeholder="Descreva a tarefa"
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
                      <Label htmlFor="edit-due_date">Vencimento</Label>
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
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editingTask.status} onValueChange={(value) => setEditingTask({ ...editingTask, status: value as any })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-assigned_to">Responsável</Label>
                    <Select 
                      value={editingTask.assigned_to?.toString() || 'none'} 
                      onValueChange={(value) => setEditingTask({ ...editingTask, assigned_to: value === 'none' ? undefined : parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
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
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateTask}
                      disabled={syncing}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Salvar
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

