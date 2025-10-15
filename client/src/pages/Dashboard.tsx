import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, Video, CheckSquare, Clock, Heart, Plus, TrendingUp, UserCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BirthdayCard } from '@/components/dashboard/BirthdayCard';
import { Visitometer } from '@/components/dashboard/Visitometer';
import { QuickGamificationCard } from '@/components/dashboard/QuickGamificationCard';

import { MountainProgress } from '@/components/dashboard/MountainProgress';
import { SpiritualCheckInModal } from '@/components/dashboard/SpiritualCheckInModal';
import { useSpiritualCheckIn } from '@/hooks/useSpiritualCheckIn';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/use-toast';
// Removido useBirthdays - usando apenas query unificada

const Dashboard = React.memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { shouldShowCheckIn, markCheckInComplete } = useSpiritualCheckIn();
  // Removido useBirthdays - usando apenas a query unificada
  const { toast } = useToast();
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Limpar cache antigo de tarefas ao carregar o Dashboard
  useEffect(() => {
    console.log('🧹 Dashboard: LIMPANDO CACHE COMPLETO...');
    queryClient.removeQueries({ queryKey: ['tasks-from-sheets'] }); // Remove cache antigo
    queryClient.removeQueries({ queryKey: ['tasks'] }); // Remove cache de tarefas
    queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Força refresh da query atual
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] }); // Força refresh da API dashboard
    
    console.log('🧹 Dashboard: Cache limpo! Forçando refresh completo...');
  }, [queryClient]);

  // BUSCAR dados de usuários da mesma query da página Users
  const { data: usersData } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      console.log('🔄 Dashboard: Buscando usuários da API...');
      const response = await fetch('/api/users');
      if (!response.ok) {
        console.error('❌ Dashboard: Erro ao buscar usuários:', response.status);
        return [];
      }
      const data = await response.json();
      console.log(`✅ Dashboard: ${data.length} usuários carregados`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  // CONFIGURAÇÃO EXATA DA PÁGINA TASKS
  const GOOGLE_SHEETS_CONFIG = {
    proxyUrl: '/api/google-sheets/proxy',
    spreadsheetId: '1i-x-0KiciwACRztoKX-YHlXT4FsrAzaKwuH-hHkD8go',
    sheetName: 'tarefas'
  };

  // USAR EXATAMENTE A MESMA QUERY DA PÁGINA TASKS
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('📖 [DASHBOARD] Buscando tarefas DO GOOGLE SHEETS (fonte da verdade)...');
      
      // Buscar DIRETO do Google Sheets (IGUAL à página Tasks)
      const response = await fetch(GOOGLE_SHEETS_CONFIG.proxyUrl, {
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
      
      if (!response.ok) throw new Error('Erro ao buscar tarefas do Google Sheets');
      
      const data = await response.json();
      const tasks = data.tasks || [];
      
      console.log('🔍 [DASHBOARD] DADOS BRUTOS DO GOOGLE SHEETS:');
      console.log('🔍 Resposta completa:', data);
      console.log('🔍 Array de tarefas:', tasks);
      console.log('🔍 Número de tarefas retornadas:', tasks.length);
      
      // Converter formato do Sheets para formato do app (IGUAL à página Tasks)
      const convertedTasks = tasks.map((sheetTask: any) => ({
        id: sheetTask.id,
        title: sheetTask.titulo || '',
        description: sheetTask.descricao || '',
        status: sheetTask.status === 'Concluída' ? 'completed' : 
                sheetTask.status === 'Em Progresso' ? 'in_progress' : 'pending',
        priority: sheetTask.prioridade === 'Alta' ? 'high' :
                  sheetTask.prioridade === 'Baixa' ? 'low' : 'medium',
        assigned_to_name: sheetTask.responsavel || '',
        created_by_name: sheetTask.criador || '',
        church: sheetTask.igreja || '',
        created_at: sheetTask.data_criacao ? new Date(sheetTask.data_criacao.split('/').reverse().join('-')).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: sheetTask.data_vencimento || '',
        completed_at: sheetTask.data_conclusao || '',
        tags: sheetTask.tags ? sheetTask.tags.split(',').filter(Boolean) : []
      }));
      
      console.log(`✅ [DASHBOARD] ${convertedTasks.length} tarefas carregadas DO GOOGLE SHEETS`);
      
      // Log específico para verificar contagem
      const pendingCount = convertedTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const completedCount = convertedTasks.filter(t => t.status === 'completed').length;
      
      console.log(`📊 [DASHBOARD] CONTAGEM DAS TAREFAS:`);
      console.log(`📊 Total: ${convertedTasks.length}`);
      console.log(`📊 Pendentes: ${pendingCount}`);
      console.log(`📊 Concluídas: ${completedCount}`);
      
      // Log detalhado de cada tarefa
      console.log('🔍 [DASHBOARD] LISTA DETALHADA DE TAREFAS:');
      convertedTasks.forEach((task, index) => {
        console.log(`🔍 Tarefa ${index + 1}:`, {
          id: task.id,
          title: task.title,
          status: task.status,
          statusOriginal: tasks[index]?.status
        });
      });
      
      return convertedTasks;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos - dados não mudam tão frequentemente
    refetchInterval: 5 * 60 * 1000, // 5 minutos - menos frequente
    refetchOnWindowFocus: false // Não refetch a cada foco
  });

  // Fetch real dashboard statistics from API with optimized caching
  const { data: dashboardStatsRaw, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    // Configurações otimizadas para performance
    staleTime: 2 * 60 * 1000, // 2 minutos - dados não mudam tão frequentemente
    refetchInterval: 5 * 60 * 1000, // 5 minutos - menos frequente
    refetchOnWindowFocus: false, // Não refetch a cada foco
    refetchOnMount: true, // Atualizar quando o componente é montado
    refetchOnReconnect: true, // Atualizar quando reconecta
    enabled: !!user?.id, // Só executar se tiver usuário
  });

  // USAR dados reais das páginas correspondentes
  const dashboardStats = useMemo(() => {
    console.log('🔍 Dashboard: Calculando stats...');
    console.log('🔍 usersData:', usersData?.length || 0);
    console.log('🔍 tasksData:', tasksData?.length || 0);
    
    // Calcular stats de usuários da página Users
    const totalUsers = usersData?.length || 0;
    const totalMembers = usersData?.filter((u: any) => u.role === 'member' || u.role === 'admin').length || 0;
    const totalMissionaries = usersData?.filter((u: any) => u.role?.includes('missionary')).length || 0;
    const totalInterested = usersData?.filter((u: any) => u.role === 'interested').length || 0;
    const approvedUsers = usersData?.filter((u: any) => u.status === 'approved').length || 0;
    
    // Calcular stats de tarefas EXATAMENTE como a página Tasks
    let totalTasks = 0;
    let pendingTasks = 0;
    let completedTasks = 0;
    
    if (tasksData && Array.isArray(tasksData)) {
      totalTasks = tasksData.length;
      
      // Log detalhado para debug
      console.log('🔍 Dashboard: Analisando tarefas (IGUAL à página Tasks)...');
      console.log('🔍 Total de tarefas:', totalTasks);
      
      const pendingList = tasksData.filter((t: any) => t.status === 'pending' || t.status === 'in_progress');
      const completedList = tasksData.filter((t: any) => t.status === 'completed');
      
      console.log('🔍 Tarefas pendentes:', pendingList.length, pendingList.map(t => ({ id: t.id, title: t.title, status: t.status })));
      console.log('🔍 Tarefas concluídas:', completedList.length, completedList.map(t => ({ id: t.id, title: t.title, status: t.status })));
      
      pendingTasks = pendingList.length;
      completedTasks = completedList.length;
    }
    
    const stats = {
      totalUsers,
      totalMembers,
      totalMissionaries,
      totalInterested,
      approvedUsers,
      totalTasks,
      pendingTasks,
      completedTasks,
      // Manter outros stats da API se existirem
      totalPrayers: dashboardStatsRaw?.totalPrayers || 0,
      totalVisits: dashboardStatsRaw?.totalVisits || 0,
      totalActivities: dashboardStatsRaw?.totalActivities || 0,
      totalPoints: dashboardStatsRaw?.totalPoints || 0
    };
    
    console.log('📊 Dashboard: Stats calculados:', stats);
    
    // Log específico do card de tarefas
    console.log(`🎯 [CARD TAREFAS] VALOR FINAL EXIBIDO:`);
    console.log(`🎯 Total de tarefas: ${stats.totalTasks}`);
    console.log(`🎯 Tarefas pendentes: ${stats.pendingTasks}`);
    console.log(`🎯 Tarefas concluídas: ${stats.completedTasks}`);
    
    return stats;
  }, [dashboardStatsRaw, tasksData, usersData]);

  // Fetch birthday data with shorter cache for real-time updates
  const { data: birthdayData, isLoading: birthdayLoading } = useQuery({
    queryKey: ['/api/users/birthdays', user?.id, user?.role],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (user?.id) {
        headers['x-user-id'] = user.id.toString();
        headers['x-user-role'] = user.role;
      }
      
      const response = await fetch('/api/users/birthdays', { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0, // Always consider stale
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnects
  });

  // Fetch visit data for visitometer with optimized caching
  const { data: visitData, refetch: refetchVisits, isLoading: visitsLoading } = useQuery({
    queryKey: ['/api/dashboard/visits'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/visits');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes instead of every minute
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch missionary relationships for interested count
  const { data: missionaryRelationships, isLoading: relationshipsLoading } = useQuery({
    queryKey: ['/api/relationships/missionary', user?.id],
    queryFn: async () => {
      if (!user?.id || user.role !== 'missionary') {
        console.log('🔍 Dashboard: User not missionary or no ID:', { userId: user?.id, role: user?.role });
        return [];
      }
      console.log('🔍 Dashboard: Fetching relationships for missionary:', user.id);
      const response = await fetch(`/api/relationships/missionary/${user.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Dashboard: Relationships data:', data);
      return data;
    },
    enabled: !!user?.id && user.role.includes('missionary'),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 15 minutes
  });

  // Fetch events filtered by user role for dashboard cards
  const { data: userEvents, isLoading: userEventsLoading } = useQuery({
    queryKey: ['/api/events', user?.role],
    queryFn: async () => {
      if (!user?.role) {
        console.log('🔍 Dashboard: No user role available');
        return [];
      }
      console.log('🔍 Dashboard: Fetching events for role:', user.role);
      const response = await fetch(`/api/events?role=${user.role}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Dashboard: Events data for role', user.role, ':', data.length, 'events');
      return data;
    },
    enabled: !!user?.role,
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

      // Fetch spiritual check-ins for admin dashboard
  const { data: spiritualCheckIns, isLoading: spiritualCheckInsLoading } = useQuery({
    queryKey: ['/api/emotional-checkins/admin'],
    queryFn: async () => {
      if (user?.role !== 'admin') return [];
      const response = await fetch('/api/emotional-checkins/admin');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: user?.role === 'admin',
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Contagem de eventos deste mês visíveis ao usuário logado
  const eventsThisMonthCount = useMemo(() => {
    if (!userEvents || !Array.isArray(userEvents) || userEvents.length === 0) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const parse = (v: any) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const intersects = (start: Date | null, end: Date | null, a: Date, b: Date) => {
      if (!start && !end) return false;
      const s = start ?? end ?? a;
      const e = end ?? start ?? s;
      return s < b && e >= a;
    };

    return userEvents.filter((e: any) => {
      if (!e || typeof e !== 'object') return false;
      // Eventos usam 'date' e 'end_date' no banco (snake_case)
      const startDate = e.startDate || e.date;
      const endDate = e.endDate || e.end_date || e.date;
      return intersects(parse(startDate), parse(endDate), monthStart, nextMonthStart);
    }).length;
  }, [userEvents]);

  // Componente auxiliar para exibir próximo evento (ordenando pela data futura mais próxima)
  const NextEventDisplay: React.FC<{ events: any[] }> = ({ events }) => {
    if (!events || !Array.isArray(events)) {
      return <p className="text-xs text-gray-500">Sem próximos eventos</p>;
    }
    
    const parse = (v: any) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };
    const upcoming = [...events]
      .filter(e => e && typeof e === 'object')
      .map(e => {
        // Eventos usam 'date' no banco (snake_case)
        const startDate = e.startDate || e.date;
        return { ...e, _start: parse(startDate) };
      })
      .filter(e => e._start && e._start >= new Date())
      .sort((a, b) => (a._start as Date).getTime() - (b._start as Date).getTime());

    if (upcoming.length === 0) {
      return (
        <p className="text-xs text-gray-500">Sem próximos eventos</p>
      );
    }
    const ev = upcoming[0];
    const dt = ev._start as Date;
    const dateText = dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    return (
      <div className="flex items-center gap-3 rounded-xl border border-blue-100/60 bg-gradient-to-br from-white to-blue-50/40 p-3 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-blue-700/70">Próximo evento</div>
          <div className="text-sm font-semibold text-gray-800 truncate">{ev.title || 'Sem título'}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-gray-500">Data</div>
          <div className="text-sm font-semibold text-gray-800">{dateText}</div>
        </div>
      </div>
    );
  };

  // Componente auxiliar para exibir aniversariante do dia ou próximo aniversário
  const BirthdayDisplay: React.FC<{ birthdays: any }> = ({ birthdays }) => {
    if (birthdayLoading) {
      return (
        <p className="text-xs text-gray-500">Carregando...</p>
      );
    }

    if (birthdays.today && birthdays.today.length > 0) {
      // Aniversariante do dia
      return (
        <div className="flex items-center gap-3 rounded-xl border border-pink-100/60 bg-gradient-to-br from-white to-pink-50/40 p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-700">
            <span className="text-lg">🎂</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide text-pink-700/70">Aniversariante do dia</div>
            <div className="text-sm font-semibold text-gray-800 truncate">{birthdays.today[0].name}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-500">Hoje</div>
            <div className="text-sm font-semibold text-gray-800">🎉</div>
          </div>
        </div>
      );
    } else {
      // Próximo aniversário
      const nextBirthday = getNextBirthday(birthdays);
      if (nextBirthday) {
        return (
          <div className="flex items-center gap-3 rounded-xl border border-pink-100/60 bg-gradient-to-br from-white to-pink-50/40 p-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-700">
              <span className="text-lg">🎂</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-wide text-pink-700/70">Próximo aniversário</div>
              <div className="text-sm font-semibold text-gray-800 truncate">{nextBirthday.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-500">Data</div>
              <div className="text-sm font-semibold text-gray-800">{formatBirthdayDate(nextBirthday.nextBirthday)}</div>
            </div>
          </div>
        );
      }
      return (
        <p className="text-xs text-gray-500">Sem aniversários próximos</p>
      );
    }
  };

  // Fetch church interested data for members
  const { data: churchInterested, isLoading: churchInterestedLoading } = useQuery({
    queryKey: ['/api/my-interested', user?.id],
    queryFn: async () => {
      if (!user?.id || (user.role !== 'member' && user.role !== 'missionary')) {
        console.log('🔍 Dashboard: User not member/missionary or no ID:', { userId: user?.id, role: user?.role });
        return [];
      }
      console.log('🔍 Dashboard: Fetching church interested for user:', user.id);
      const response = await fetch('/api/my-interested', {
        headers: {
          'x-user-id': user.id.toString()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Dashboard: Church interested data:', data);
      return data;
    },
    enabled: !!user?.id && (user.role.includes('member') || user.role.includes('missionary')),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 15 minutes
  });

  // Fetch user relationships for members
  const { data: userRelationships, isLoading: userRelationshipsLoading } = useQuery({
    queryKey: ['/api/relationships', user?.id],
    queryFn: async () => {
      if (!user?.id || (user.role !== 'member' && user.role !== 'missionary')) {
        console.log('🔍 Dashboard: User not member/missionary or no ID:', { userId: user?.id, role: user?.role });
        return [];
      }
      console.log('🔍 Dashboard: Fetching user relationships for user:', user.id);
      const response = await fetch('/api/relationships');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Dashboard: User relationships data:', data);
      return data;
    },
    enabled: !!user?.id && (user.role.includes('member') || user.role.includes('missionary')),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 15 minutes
  });

  // Fetch user detailed data for gamification
  const { data: userDetailedData, isLoading: userDetailedDataLoading } = useQuery({
    queryKey: ['/api/users', user?.id, 'points-details'],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 Dashboard: No user ID available for points details');
        return null;
      }
      console.log('🔍 Dashboard: Fetching points details for user:', user.id);
      const response = await fetch(`/api/users/${user.id}/points-details`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Dashboard: User points details data:', data);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 15 minutes
  });


  // Usar dados reais das páginas correspondentes
  const stats = useMemo(() => {
    console.log('📊 Dashboard: Calculando stats finais...');
    console.log('📊 dashboardStats:', dashboardStats);
    
    const calculatedStats = {
      // Usar dados calculados do dashboardStats (que vem das páginas)
      totalUsers: dashboardStats?.totalUsers || 0,
      totalInterested: dashboardStats?.totalInterested || 0,
      totalMembers: dashboardStats?.totalMembers || 0,
      totalMissionaries: dashboardStats?.totalMissionaries || 0,
      approvedUsers: dashboardStats?.approvedUsers || 0,
      totalTasks: dashboardStats?.totalTasks || 0,
      pendingTasks: dashboardStats?.pendingTasks || 0,
      completedTasks: dashboardStats?.completedTasks || 0,
      
      // Manter outros campos da API original se existirem
      interestedBeingDiscipled: dashboardStatsRaw?.interestedBeingDiscipled || 0,
      totalChurches: dashboardStatsRaw?.totalChurches || 0,
      pendingApprovals: dashboardStatsRaw?.pendingApprovals || 0,
      thisWeekEvents: dashboardStatsRaw?.thisWeekEvents || 0,
      totalEvents: dashboardStatsRaw?.totalEvents || 0,
      totalPrayers: dashboardStats?.totalPrayers || 0,
      totalVisits: dashboardStats?.totalVisits || 0,
      totalActivities: dashboardStats?.totalActivities || 0,
      totalPoints: dashboardStats?.totalPoints || 0
    };
    
    // Debug: log das estatísticas finais
    console.log('📊 Dashboard: Stats finais calculados:', calculatedStats);
    
    return calculatedStats;
  }, [dashboardStats, dashboardStatsRaw]);








  // Set up automatic invalidation when users are updated
  React.useEffect(() => {
    let isMounted = true;
    
    const handleUserUpdate = (event: CustomEvent) => {
      try {
        if (!isMounted) return;
        
        console.log('🔄 Dashboard: User updated event received:', event.detail);
        
        // Invalidar queries relacionadas ao dashboard imediatamente
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/visits'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        
        // Se foi uma mudança de missionário, invalidar também os relacionamentos
        if (event.detail?.type === 'missionary-assigned' || event.detail?.type === 'missionary-removed') {
          queryClient.invalidateQueries({ queryKey: ['/api/relationships'] });
          queryClient.invalidateQueries({ queryKey: ['/api/relationships/missionary'] });
        }
        
        // Se foi uma reversão de role, invalidar tudo
        if (event.detail?.type === 'role-reverted') {
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        }
        
        // Se foi uma desativação de perfil missionário, invalidar tudo
        if (event.detail?.type === 'missionary-profile-deactivated') {
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/users'] });
          queryClient.invalidateQueries({ queryKey: ['/api/missionary-profiles'] });
        }
        
        console.log('✅ Dashboard: Cache invalidado');
      } catch (error) {
        console.error('❌ Erro no handleUserUpdate:', error);
      }
    };

    // Listen for custom events when users are updated
    window.addEventListener('user-updated', handleUserUpdate as EventListener);
    window.addEventListener('user-approved', handleUserUpdate as EventListener);
    window.addEventListener('user-rejected', handleUserUpdate as EventListener);
    window.addEventListener('user-imported', handleUserUpdate as EventListener);
    
    // Adicionar listener para mudanças de relacionamentos
    window.addEventListener('relationship-updated', handleUserUpdate as EventListener);
    window.addEventListener('relationship-created', handleUserUpdate as EventListener);
    window.addEventListener('relationship-deleted', handleUserUpdate as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener('user-updated', handleUserUpdate as EventListener);
      window.removeEventListener('user-approved', handleUserUpdate as EventListener);
      window.removeEventListener('user-rejected', handleUserUpdate as EventListener);
      window.removeEventListener('user-imported', handleUserUpdate as EventListener);
      window.removeEventListener('relationship-updated', handleUserUpdate as EventListener);
      window.removeEventListener('relationship-created', handleUserUpdate as EventListener);
      window.removeEventListener('relationship-deleted', handleUserUpdate as EventListener);
    };
  }, [queryClient, refetchVisits]);

  // Sistema de atualização em tempo real mais robusto
  React.useEffect(() => {
    if (!user || !dashboardStats) return;

    // Função para atualizar estatísticas
    const updateStats = async () => {
      try {
        console.log('🔄 Dashboard: Atualizando estatísticas em tempo real...');
        
        // Invalidar cache e forçar refetch
        await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        
        console.log('✅ Dashboard: Estatísticas atualizadas com sucesso');
      } catch (error) {
        console.error('❌ Dashboard: Erro ao atualizar estatísticas:', error);
      }
    };

    // Atualizar a cada 30 segundos para manter dados frescos
    const interval = setInterval(updateStats, 30000);
    
    // Também atualizar quando a janela ganha foco (usuário volta à aba)
    const handleFocus = () => {
      console.log('🔄 Dashboard: Janela ganhou foco, atualizando estatísticas...');
      updateStats();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, dashboardStats, queryClient]);

  // Verificação automática de perfis missionários para administradores
  React.useEffect(() => {
    if (user?.role === 'admin' && dashboardStats) {
      // Verificar se há missionários sem relacionamentos ativos
      const checkMissionaryProfiles = async () => {
        try {
          const response = await fetch('/api/system/check-missionary-profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.correctedCount > 0) {
              console.log(`🔄 Dashboard: ${result.correctedCount} perfis corrigidos automaticamente`);
              
              // Atualizar dashboard silenciosamente
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/users'] });
              queryClient.invalidateQueries({ queryKey: ['/api/missionary-profiles'] });
            }
          }
        } catch (error) {
          console.error('❌ Erro na verificação automática de perfis missionários:', error);
        }
      };
      
      // Executar verificação após 2 segundos para não bloquear o carregamento inicial
      const timer = setTimeout(checkMissionaryProfiles, 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.role, dashboardStats, queryClient]);

  // Função para encontrar o próximo aniversário
  const getNextBirthday = (birthdays: any) => {
    if (!birthdays || !birthdays.all || !Array.isArray(birthdays.all) || birthdays.all.length === 0) return null;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Criar datas de aniversário para este ano
    const birthdaysThisYear = birthdays.all
      .filter((user: any) => user && typeof user === 'object' && user.birthDate)
      .map((user: any) => {
        const birthDate = new Date(user.birthDate);
        const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        
        // Se o aniversário já passou este ano, considerar para o próximo ano
        if (birthdayThisYear < today) {
          birthdayThisYear.setFullYear(currentYear + 1);
        }
        
        return {
          ...user,
          nextBirthday: birthdayThisYear
        };
      });
    
    // Ordenar por data do próximo aniversário
    birthdaysThisYear.sort((a: any, b: any) => a.nextBirthday - b.nextBirthday);
    
    return birthdaysThisYear[0];
  };

  // Função para formatar a data
  const formatBirthdayDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const renderAdminDashboard = () => (
    <div className="space-y-4 lg:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/30 opacity-100 group-hover:from-blue-600/30 group-hover:to-blue-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-blue-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Total de Usuários</CardTitle>
            <div className="p-1 lg:p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 lg:p-6">
            <div className="text-xl lg:text-4xl font-bold text-white drop-shadow-lg">
              {isLoading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs lg:text-sm text-white/80 mt-1">{stats.approvedUsers} usuários aprovados</p>
            <Button 
              onClick={() => navigate('/users')}
              className="mt-2 lg:mt-3 h-7 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <Users className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
              <span className="hidden sm:inline">Gerenciar Usuários</span>
              <span className="sm:hidden">Usuários</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-800/30 opacity-100 group-hover:from-red-600/30 group-hover:to-red-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/30 to-red-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Pessoas interessadas</CardTitle>
            <div className="p-1 lg:p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 lg:p-6 space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-xl lg:text-4xl font-bold text-white drop-shadow-lg">
                {isLoading ? '...' : stats.totalInterested}
              </div>
              <span className="text-xs lg:text-sm text-white/80">Interessados</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/20">
              <div className="text-lg lg:text-2xl font-bold text-white/90 drop-shadow">
                {isLoading ? '...' : stats.interestedBeingDiscipled || 0}
              </div>
              <span className="text-xs lg:text-sm text-white/80 leading-tight">
                Estão Sendo Discipuladas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-orange-800/30 opacity-100 group-hover:from-orange-600/30 group-hover:to-orange-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/30 to-orange-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Tarefas</CardTitle>
            <div className="p-1 lg:p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <CheckSquare className="h-3 w-3 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 lg:p-6 space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-xl lg:text-4xl font-bold text-white drop-shadow-lg">
                {isLoading ? '...' : stats.pendingApprovals}
              </div>
              <span className="text-xs lg:text-sm text-white/80">Pendentes</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/20">
              <div className="text-lg lg:text-2xl font-bold text-white/90 drop-shadow">
                {isLoading ? '...' : stats.completedTasks || 0}
              </div>
              <span className="text-xs lg:text-sm text-white/80 leading-tight">
                Concluídas
              </span>
            </div>
            <Button 
              onClick={() => navigate('/tasks')}
              className="mt-2 lg:mt-3 h-7 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0 w-full"
            >
              <CheckSquare className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
              <span className="hidden sm:inline">Gerenciar Tarefas</span>
              <span className="sm:hidden">Tarefas</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card de Membros */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-800/30 opacity-100 group-hover:from-green-600/30 group-hover:to-green-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/30 to-green-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Membros</CardTitle>
            <div className="p-1 lg:p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 lg:p-6">
            <div className="text-xl lg:text-4xl font-bold text-white drop-shadow-lg">
              {isLoading ? '...' : stats.totalMembers}
            </div>
            <p className="text-xs lg:text-sm text-white/80 mt-1">Membros ativos da igreja</p>
          </CardContent>
        </Card>

        {/* Card de Missionários */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/30 opacity-100 group-hover:from-purple-600/30 group-hover:to-purple-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-purple-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Missionários</CardTitle>
            <div className="p-1 lg:p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 lg:p-6">
            <div className="text-xl lg:text-4xl font-bold text-white drop-shadow-lg">
              {isLoading ? '...' : stats.totalMissionaries}
            </div>
            <p className="text-xs lg:text-sm text-white/80 mt-1">Discipuladores ativos</p>
          </CardContent>
        </Card>



        {/* Card de Check-ins Espirituais */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-pink-800/30 opacity-100 group-hover:from-pink-600/30 group-hover:to-pink-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-pink-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Check-ins Espirituais</CardTitle>
            <div className="p-1 lg:p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <span className="text-sm lg:text-base filter brightness-0 invert">🙏</span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 lg:p-6">
            <div className="text-xl lg:text-4xl font-bold text-white drop-shadow-lg">
              {spiritualCheckInsLoading ? '...' : (spiritualCheckIns?.length || 0)}
            </div>
            <p className="text-xs lg:text-sm text-white/80 mt-1">Últimos check-ins espirituais dos membros</p>
            <Button 
              onClick={() => setShowCheckIn(true)}
              className="mt-2 lg:mt-3 h-7 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <span className="mr-1 filter brightness-0 invert">🙏</span>
              <span className="hidden sm:inline">Fazer meu check-in</span>
              <span className="sm:hidden">Check-in</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Special Components Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Visitômetro */}
        <div className="group">
          <Visitometer
            visitsCompleted={visitData?.completed || 0}
            visitsExpected={visitData?.expected || 0}
            totalVisits={visitData?.totalVisits || 0}
            visitedPeople={visitData?.visitedPeople || 0}
            percentage={visitData?.percentage || 0}
            isLoading={isLoading || visitsLoading}
            onRefresh={refetchVisits}
          />
        </div>

        {/* Card de Aniversariantes */}
        <div className="group">
          <BirthdayCard
            birthdaysToday={birthdayData?.today || []}
            birthdaysThisMonth={birthdayData?.thisMonth || []}
            isLoading={birthdayLoading}
          />
        </div>
      </div>
    </div>
  );

  const renderMissionaryDashboard = () => {
    // Calcular estatísticas de interessados para missionários
    const totalChurchInterested = (churchInterested && Array.isArray(churchInterested)) ? churchInterested.length : 0;
    const userActiveRelationships = (userRelationships && Array.isArray(userRelationships)) ? userRelationships.filter((rel: any) => 
      rel && typeof rel === 'object' && rel.missionaryId === user?.id && rel.status === 'active'
    ) : [];
    const userPendingRelationships = (userRelationships && Array.isArray(userRelationships)) ? userRelationships.filter((rel: any) => 
      rel && typeof rel === 'object' && rel.missionaryId === user?.id && rel.status === 'pending'
    ) : [];
    const totalUserInterested = userActiveRelationships.length + userPendingRelationships.length;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Estatísticas de Interessados */}
          <Card
            onClick={() => navigate('/my-interested')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/my-interested'); }}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700">Interessados</CardTitle>
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Heart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {/* Interessados Vinculados */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vinculados a você:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      {userRelationshipsLoading ? '...' : totalUserInterested}
                    </span>
                    <div className="flex items-center gap-1">
                      {userActiveRelationships.length > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Ativos"></div>
                      )}
                      {userPendingRelationships.length > 0 && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Pendentes"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Total da Igreja */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total da igreja:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {churchInterestedLoading ? '...' : totalChurchInterested}
                  </span>
                </div>
                
                {/* Barra de Progresso */}
                {totalChurchInterested > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Seu alcance</span>
                      <span>{totalChurchInterested > 0 ? Math.round((totalUserInterested / totalChurchInterested) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      value={totalChurchInterested > 0 ? (totalUserInterested / totalChurchInterested) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
              <div className="pt-2">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-blue-700"
                  onClick={() => navigate('/my-interested')}
                >
                  Toque para ver detalhes
                </Button>
              </div>
            </CardContent>
            <div className="px-6 pb-4">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-blue-700"
                onClick={() => navigate('/calendar')}
              >
                Toque para ver detalhes
              </Button>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/calendar')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/calendar'); }}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700">Eventos do Mês</CardTitle>
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {userEventsLoading ? '...' : eventsThisMonthCount}
              </div>
              <p className="text-xs text-gray-600 mt-1">Neste mês</p>
              
              {/* Aniversariante do dia ou próximo aniversário */}
              <div className="mt-3">
                <BirthdayDisplay birthdays={birthdayData} />
              </div>
            </CardContent>
            <div className="px-6 pb-4">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-blue-700"
                onClick={() => navigate('/my-interested')}
              >
                Toque para ver detalhes
              </Button>
            </div>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-emerald-800/30 opacity-100 group-hover:from-emerald-600/30 group-hover:to-emerald-800/40 transition-all duration-300"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/30 to-emerald-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Total de Eventos</CardTitle>
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
                <BarChart3 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {/* Eventos deste mês */}
                <div className="flex items-center justify-between">
                  <span className="text-sm lg:text-base text-white/80">Eventos deste mês:</span>
                  <span className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                    {userEventsLoading ? '...' : eventsThisMonthCount}
                  </span>
                </div>
                {/* Próximo evento */}
                <div className="mt-2">
                  <NextEventDisplay events={userEvents || []} />
                </div>
                {/* Removido detalhe de acesso discriminado */}
                

              </div>
              
            </CardContent>
            <div className="px-6 pb-4">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-blue-700"
                onClick={() => navigate('/calendar')}
              >
                Toque para ver detalhes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderMemberDashboard = () => {
    // Calcular estatísticas de interessados
    const totalChurchInterested = (churchInterested && Array.isArray(churchInterested)) ? churchInterested.length : 0;
    const userActiveRelationships = (userRelationships && Array.isArray(userRelationships)) ? userRelationships.filter((rel: any) => 
      rel && typeof rel === 'object' && rel.missionaryId === user?.id && rel.status === 'active'
    ) : [];
    const userPendingRelationships = (userRelationships && Array.isArray(userRelationships)) ? userRelationships.filter((rel: any) => 
      rel && typeof rel === 'object' && rel.missionaryId === user?.id && rel.status === 'pending'
    ) : [];
    const totalUserInterested = userActiveRelationships.length + userPendingRelationships.length;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Estatísticas de Interessados */}
          <Card 
            onClick={() => navigate('/my-interested')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/my-interested'); }}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700">Interessados</CardTitle>
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Heart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 flex-1">
              <div className="space-y-3">
                {/* Interessados Vinculados */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vinculados a você:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      {userRelationshipsLoading ? '...' : totalUserInterested}
                    </span>
                    <div className="flex items-center gap-1">
                      {userActiveRelationships.length > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Ativos"></div>
                      )}
                      {userPendingRelationships.length > 0 && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Pendentes"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Total da Igreja */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total da igreja:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {churchInterestedLoading ? '...' : totalChurchInterested}
                  </span>
                </div>
                
                {/* Barra de Progresso */}
                {totalChurchInterested > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Seu alcance</span>
                      <span>{totalChurchInterested > 0 ? Math.round((totalUserInterested / totalChurchInterested) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      value={totalChurchInterested > 0 ? (totalUserInterested / totalChurchInterested) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <div className="px-6 pb-4 mt-auto">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-blue-700"
                onClick={() => navigate('/my-interested')}
              >
                Toque para ver detalhes
              </Button>
            </div>
          </Card>

          <Card 
            onClick={() => navigate('/calendar')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/calendar'); }}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700">Eventos do Mês</CardTitle>
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 flex-1">
              <div className="space-y-3">
                {/* Eventos deste mês */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eventos deste mês:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    {userEventsLoading ? '...' : eventsThisMonthCount}
                  </span>
                </div>
                {/* Próximo evento */}
                <div className="mt-2">
                  <NextEventDisplay events={userEvents || []} />
                </div>
                
                {/* Aniversariante do dia ou próximo aniversário */}
                <div className="mt-2">
                  <BirthdayDisplay birthdays={birthdayData} />
                </div>
                
                {/* Removido detalhe de acesso discriminado para membros */}

              </div>
            </CardContent>
            <div className="px-6 pb-4 mt-auto">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-blue-700"
                onClick={() => navigate('/calendar')}
              >
                Toque para ver detalhes
              </Button>
            </div>
          </Card>

          {/* Card de Gamificação Rápida */}
          <QuickGamificationCard 
            showDetails={true} 
            userData={{
              ...userDetailedData?.userData,
              actualPoints: userDetailedData?.points
            }}
          />
        </div>
      </div>
    );
  };

  const renderInterestedDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-cyan-800/30 opacity-100 group-hover:from-cyan-600/30 group-hover:to-cyan-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-cyan-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Eventos Disponíveis</CardTitle>
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {/* Total de eventos visíveis para o perfil */}
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-white/80">Disponíveis para você:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                    {userEventsLoading ? '...' : userEvents?.length || 0}
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Eventos visíveis"></div>
                </div>
              </div>
              
              {/* Eventos desta semana */}
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Eventos desta semana:</span>
                <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {isLoading ? '...' : userEvents?.length || 0}
                </span>
              </div>
              
              {/* Barra de Progresso */}
              {stats.totalEvents > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Seu acesso</span>
                    <span>{stats.totalEvents > 0 ? Math.round(((userEvents?.length || 0) / stats.totalEvents) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={stats.totalEvents > 0 ? ((userEvents?.length || 0) / stats.totalEvents) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              )}
              
              
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-indigo-800/30 opacity-100 group-hover:from-indigo-600/30 group-hover:to-indigo-800/40 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/30 to-indigo-600/40 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm lg:text-base font-semibold text-white drop-shadow-md">Total Usuários</CardTitle>
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg group-hover:bg-white/30 transition-all duration-300">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
              {isLoading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs lg:text-sm text-white/80 mt-1">Na comunidade</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );


  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-200 via-blue-200 to-slate-300">
        <div className="text-center p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">Carregando...</h2>
          <p className="text-gray-600">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-blue-400/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        
        <div className="relative space-y-4 lg:space-y-8 p-3 lg:p-6 max-w-7xl mx-auto">
          
          
          {/* Role-specific Dashboard */}
          {user.role === 'admin' && (
            <>
              {renderAdminDashboard()}
            </>
          )}
          {(user.role.includes('missionary') || user.role.includes('member')) && renderMemberDashboard()}
          {user.role === 'interested' && renderInterestedDashboard()}

                      {/* Spiritual Check-in Modal */}
          <SpiritualCheckInModal 
            isOpen={showCheckIn || shouldShowCheckIn} 
            onClose={() => {
              setShowCheckIn(false);
              markCheckInComplete();
            }} 
          />
        </div>
      </div>
    </MobileLayout>
  );
});

export default Dashboard;