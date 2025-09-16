import React, { useMemo, useCallback, useState } from 'react';
import { Calendar, Users, MessageSquare, Video, BarChart3, Clock, Heart, Plus, TrendingUp, UserCheck, Sparkles } from 'lucide-react';
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

  // Fetch real dashboard statistics from API with optimized caching
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    // Configurações para atualização em tempo real
    staleTime: 0, // Sempre considerado desatualizado
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    refetchOnWindowFocus: true, // Atualizar quando a janela ganha foco
    refetchOnMount: true, // Atualizar quando o componente é montado
    refetchOnReconnect: true, // Atualizar quando reconecta
  });

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
    enabled: !!user?.id && user.role === 'missionary',
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
    if (!userEvents || userEvents.length === 0) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const parse = (v: any) => {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const intersects = (start: Date | null, end: Date | null, a: Date, b: Date) => {
      if (!start && !end) return false;
      const s = start ?? end ?? a;
      const e = end ?? start ?? s;
      return s < b && e >= a;
    };

    return userEvents.filter((e: any) =>
      intersects(parse(e.startDate), parse(e.endDate), monthStart, nextMonthStart)
    ).length;
  }, [userEvents]);

  // Componente auxiliar para exibir próximo evento (ordenando pela data futura mais próxima)
  const NextEventDisplay: React.FC<{ events: any[] }> = ({ events }) => {
    const parse = (v: any) => {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };
    const upcoming = [...events]
      .map(e => ({ ...e, _start: parse(e.startDate) }))
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
    enabled: !!user?.id && (user.role === 'member' || user.role === 'missionary'),
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
    enabled: !!user?.id && (user.role === 'member' || user.role === 'missionary'),
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


  // Use real data when available, fallback to default values
  const stats = useMemo(() => {
    const calculatedStats = (dashboardStats as any) || {
      totalUsers: 0,
      totalInterested: 0,
      totalChurches: 0,
      pendingApprovals: 0,
      thisWeekEvents: 0,
      totalEvents: 0,
      approvedUsers: 0,
      totalMembers: 0,
      totalMissionaries: 0
    };
    
    // Debug: log das estatísticas
    console.log('📊 Dashboard: Stats calculated:', calculatedStats);
    console.log('📊 Dashboard: Raw dashboardStats:', dashboardStats);
    
    return calculatedStats;
  }, [dashboardStats]);



  // Memoize quick actions to prevent unnecessary re-renders
  const quickActions = useMemo(() => ({
    admin: [
      { title: "Gerenciar Usuários", icon: Users, action: () => navigate('/users'), color: "from-blue-500 to-blue-600", bgColor: "bg-gradient-to-br from-blue-500 to-blue-600" },
      { title: "Ver Relatórios", icon: BarChart3, action: () => navigate('/reports'), color: "from-green-500 to-green-600", bgColor: "bg-gradient-to-br from-green-500 to-green-600" },
      { title: "Configurações", icon: MessageSquare, action: () => navigate('/settings'), color: "from-purple-500 to-purple-600", bgColor: "bg-gradient-to-br from-purple-500 to-purple-600" },
      { title: "Check-in Espiritual", icon: Heart, action: () => setShowCheckIn(true), color: "from-pink-500 to-pink-600", bgColor: "bg-gradient-to-br from-pink-500 to-pink-600" }
    ],
    missionary: [
      { title: "Meus Interessados", icon: Heart, action: () => navigate('/my-interested'), color: "from-red-500 to-red-600", bgColor: "bg-gradient-to-br from-red-500 to-red-600" },
      { title: "Nova Reunião", icon: Plus, action: () => navigate('/meetings'), color: "from-blue-500 to-blue-600", bgColor: "bg-gradient-to-br from-blue-500 to-blue-600" },
      { title: "Enviar Mensagem", icon: MessageSquare, action: () => navigate('/messages'), color: "from-green-500 to-green-600", bgColor: "bg-gradient-to-br from-green-500 to-green-600" },
      { title: "Check-in Espiritual", icon: TrendingUp, action: () => setShowCheckIn(true), color: "from-pink-500 to-pink-600", bgColor: "bg-gradient-to-br from-pink-500 to-pink-600" }
    ],
    member: [
      { title: "Ver Agenda", icon: Calendar, action: () => navigate('/calendar'), color: "from-blue-500 to-blue-600", bgColor: "bg-gradient-to-br from-blue-500 to-blue-600" },
      { title: "Chat", icon: MessageSquare, action: () => navigate('/chat'), color: "from-green-500 to-green-600", bgColor: "bg-gradient-to-br from-green-500 to-green-600" },
      { title: "Videochamadas", icon: Video, action: () => navigate('/video-calls'), color: "from-purple-500 to-purple-600", bgColor: "bg-gradient-to-br from-purple-500 to-purple-600" },
      { title: "Check-in Espiritual", icon: Heart, action: () => setShowCheckIn(true), color: "from-pink-500 to-pink-600", bgColor: "bg-gradient-to-br from-pink-500 to-pink-600" }
    ],
    interested: [
      { title: "Próximos Estudos", icon: Calendar, action: () => navigate('/calendar'), color: "from-blue-500 to-blue-600", bgColor: "bg-gradient-to-br from-blue-500 to-blue-600" },
      { title: "Agendar Reunião", icon: Clock, action: () => navigate('/meetings'), color: "from-green-500 to-green-600", bgColor: "bg-gradient-to-br from-green-500 to-green-600" },
      { title: "Check-in Espiritual", icon: Heart, action: () => setShowCheckIn(true), color: "from-pink-500 to-pink-600", bgColor: "bg-gradient-to-br from-pink-500 to-pink-600" }
    ]
  }), [navigate]);





  // Set up automatic invalidation when users are updated
  React.useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
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
    if (!birthdays.all || birthdays.all.length === 0) return null;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Criar datas de aniversário para este ano
    const birthdaysThisYear = birthdays.all.map((user: any) => {
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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Total de Usuários</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {isLoading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs text-gray-600 mt-1">{stats.approvedUsers} usuários aprovados</p>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Interessados</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
              <Heart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              {isLoading ? '...' : stats.totalInterested}
            </div>
            <p className="text-xs text-gray-600 mt-1">Pessoas em processo de interesse</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Aprovações Pendentes</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              {isLoading ? '...' : stats.pendingApprovals}
            </div>
            <p className="text-xs text-gray-600 mt-1">Aguardando aprovação</p>
          </CardContent>
        </Card>

        {/* Card de Membros */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Membros</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              {isLoading ? '...' : stats.totalMembers}
            </div>
            <p className="text-xs text-gray-600 mt-1">Membros ativos da igreja</p>
          </CardContent>
        </Card>

        {/* Card de Missionários */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Missionários</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <Heart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {isLoading ? '...' : stats.totalMissionaries}
            </div>
            <p className="text-xs text-gray-600 mt-1">Discipuladores ativos</p>
          </CardContent>
        </Card>



        {/* Card de Check-ins Emocionais */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Check-ins Emocionais</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
              <Heart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
              {spiritualCheckInsLoading ? '...' : (spiritualCheckIns?.length || 0)}
            </div>
                          <p className="text-xs text-gray-600 mt-1">Últimos check-ins espirituais dos membros</p>
          </CardContent>
        </Card>
      </div>

      {/* Special Components Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
    const totalChurchInterested = churchInterested?.length || 0;
    const userActiveRelationships = userRelationships?.filter((rel: any) => 
      rel.missionaryId === user?.id && rel.status === 'active'
    ) || [];
    const userPendingRelationships = userRelationships?.filter((rel: any) => 
      rel.missionaryId === user?.id && rel.status === 'pending'
    ) || [];
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

          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700">Total de Eventos</CardTitle>
              <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <BarChart3 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {/* Eventos deste mês */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eventos deste mês:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
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
    const totalChurchInterested = churchInterested?.length || 0;
    const userActiveRelationships = userRelationships?.filter((rel: any) => 
      rel.missionaryId === user?.id && rel.status === 'active'
    ) || [];
    const userPendingRelationships = userRelationships?.filter((rel: any) => 
      rel.missionaryId === user?.id && rel.status === 'pending'
    ) || [];
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
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Eventos Disponíveis</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {/* Total de eventos visíveis para o perfil */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponíveis para você:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {userEventsLoading ? '...' : userEvents?.length || 0}
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Eventos visíveis"></div>
                </div>
              </div>
              
              {/* Eventos desta semana */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Eventos desta semana:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
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

        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Usuários</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              {isLoading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs text-gray-600 mt-1">Na comunidade</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuickActions = () => {
    // Usar as mesmas ações do member para missionary e member
    const roleForActions = (user?.role === 'missionary' || user?.role === 'member') ? 'member' : user?.role;
    const actions = quickActions[roleForActions as keyof typeof quickActions] || [];
    
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Ações Rápidas
          </CardTitle>
          <CardDescription className="text-gray-600">Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`h-auto p-6 flex flex-col items-center gap-3 ${action.bgColor} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 text-white font-medium`}
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-center">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

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
        
        <div className="relative space-y-8 p-6 max-w-7xl mx-auto">
          
          {/* Quick Actions - Movido para o topo */}
          {renderQuickActions()}
          
          {/* Role-specific Dashboard */}
          {user.role === 'admin' && (
            <>
              {renderAdminDashboard()}
            </>
          )}
          {(user.role === 'missionary' || user.role === 'member') && renderMemberDashboard()}
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