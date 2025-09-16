import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Search, Filter, UserPlus, Shield, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown, Star, AlertTriangle, Clock, CheckCircle2, Heart, Mountain, ChevronDown, ChevronUp, EyeOff, Eye, TrendingUp, BarChart3, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserPoints } from '@/hooks/useUserPoints';
import { UserCard } from '@/components/users/UserCard';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { EditUserModal } from '@/components/users/EditUserModal';
import { ScheduleVisitModal } from '@/components/users/ScheduleVisitModal';
import { useVisits } from '@/hooks/useVisits';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockUsers = [
  {
    id: 1,
    name: "Pastor João Silva",
    email: "admin@7care.com",
    role: "admin",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "Hoje, 14:30",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    birthDate: "1975-03-15",
    civilStatus: "married",
    occupation: "Pastor",
    education: "Teologia",
    address: "Rua das Flores, 123, Centro, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Pastoral", "Administração"],
    baptismDate: "1995-12-25",
    previousReligion: "Adventista do 7º Dia",
    biblicalInstructor: "Pastor Antônio",
    isDonor: true,
    isOffering: true,
    points: 1500,
    level: "Pastor",
    attendance: 95,
    observations: "Líder experiente e dedicado"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@7care.com",
    role: "missionary",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "Ontem, 19:00",
    phone: "(11) 88888-8888",
    cpf: "234.567.890-11",
    birthDate: "1985-07-22",
    civilStatus: "single",
    occupation: "Professora",
    education: "Pedagogia",
    address: "Av. Paulista, 456, Bela Vista, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Escola Sabatina", "Deaconisas"],
    baptismDate: "2010-06-15",
    previousReligion: "Católica",
    biblicalInstructor: "Irmã Joana",
    isDonor: true,
    isOffering: true,
    points: 1200,
    level: "Missionário",
    attendance: 88,
    observations: "Muito ativa na evangelização"
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    role: "member",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "2 dias atrás",
    phone: "(11) 77777-7777",
    cpf: "345.678.901-22",
    birthDate: "1990-11-08",
    civilStatus: "married",
    occupation: "Engenheiro",
    education: "Engenharia Civil",
    address: "Rua Augusta, 789, Consolação, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Jovens", "Música"],
    baptismDate: "2015-04-18",
    previousReligion: "Evangélica",
    biblicalInstructor: "Pastor João",
    isDonor: false,
    isOffering: true,
    points: 800,
    level: "Membro Ativo",
    attendance: 75,
    observations: "Talentoso músico, toca piano"
  },
  {
    id: 4,
    name: "Ana Costa",
    email: "ana@email.com",
    role: "interested",
    church: "Igreja Central",
    status: "pending",
    lastLogin: "Nunca",
    phone: "(11) 66666-6666",
    cpf: "456.789.012-33",
    birthDate: "1988-02-14",
    civilStatus: "divorced",
    occupation: "Enfermeira",
    education: "Enfermagem",
    address: "Rua da Liberdade, 321, Liberdade, São Paulo, SP",
    churchCode: "IC001",
    departments: [],
    baptismDate: null,
    previousReligion: "Espírita",
    biblicalInstructor: "Maria Santos",
    isDonor: false,
    isOffering: false,
    points: 50,
    level: "Interessado",
    attendance: 12,
    observations: "Iniciando estudos bíblicos, muito interessada"
  },
  {
    id: 5,
    name: "Pedro Almeida",
    email: "pedro@email.com",
    role: "member",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "1 semana atrás",
    phone: "(11) 55555-5555",
    cpf: "567.890.123-44",
    birthDate: "1982-09-30",
    civilStatus: "single",
    occupation: "Designer",
    education: "Design Gráfico",
    address: "Rua Ibirapuera, 654, Vila Olímpia, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Comunicação", "Arte"],
    baptismDate: "2018-08-12",
    previousReligion: "Agnóstico",
    biblicalInstructor: "Carlos Oliveira",
    isDonor: true,
    isOffering: true,
    points: 950,
    level: "Membro",
    attendance: 82,
    observations: "Responsável pela arte visual da igreja"
  }
];

export default function Users() {
  const { user } = useAuth();
  const { data: userPointsData, isLoading: isLoadingPoints } = useUserPoints();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [churchFilter, setChurchFilter] = useState('all');
  const [mountainFilter, setMountainFilter] = useState<string | null>(null);
  const [interestedSituationFilter, setInterestedSituationFilter] = useState<string | null>(null);
  const [spiritualCheckInFilter, setSpiritualCheckInFilter] = useState<string | null>(null);
  const [missionaryProfileFilter, setMissionaryProfileFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showDiscipleDialog, setShowDiscipleDialog] = useState(false);
  const [userToDisciple, setUserToDisciple] = useState<any>(null);
  const [discipleMessage, setDiscipleMessage] = useState('');
  const [showMountainFilters, setShowMountainFilters] = useState(true);
  const [showInterestedStats, setShowInterestedStats] = useState(true);
  const [showSpiritualCheckInStats, setShowSpiritualCheckInStats] = useState(true);

  // Estados para autorização de discipulado
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch users from API with points calculated
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['/api/users/with-points'],
    queryFn: async () => {
      try {
        // WORKAROUND: Usar /api/users até resolver problema do /api/users/with-points
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Falha ao carregar usuários');
        }
        const data = await response.json();
        // Garantir que sempre retorne um array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        // Fallback para rota antiga se a nova falhar
        try {
          const fallbackResponse = await fetch('/api/users');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            return Array.isArray(fallbackData) ? fallbackData : [];
          }
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
        return [];
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Garantir que users seja sempre um array
  const users = Array.isArray(usersData) ? usersData : [];

  // Buscar relacionamentos do usuário logado (se for missionário)
  const { data: relationshipsData = [] } = useQuery({
    queryKey: ['user-relationships', user?.id],
    queryFn: async () => {
      if (!user?.id || user.role !== 'missionary') return [];
      
      const response = await fetch(`/api/relationships?missionaryId=${user.id}`);
      if (!response.ok) throw new Error('Erro ao buscar relacionamentos');
      return response.json();
    },
    enabled: !!user?.id && user.role === 'missionary'
  });

  // Buscar dados dos check-ins espirituais para os filtros
  const { data: spiritualCheckInData } = useQuery({
    queryKey: ['/api/spiritual-checkins/scores'],
    queryFn: async () => {
      const response = await fetch('/api/spiritual-checkins/scores');
      if (!response.ok) throw new Error('Failed to fetch spiritual check-ins');
      return response.json();
    },
    staleTime: 60000, // 1 minuto
  });

  // Buscar igrejas disponíveis
  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => {
      const response = await fetch('/api/churches');
      if (!response.ok) throw new Error('Erro ao buscar igrejas');
      return response.json();
    }
  });

  // Buscar solicitações de discipulado
  const { data: discipleshipRequests = [] } = useQuery({
    queryKey: ['discipleship-requests'],
    queryFn: async () => {
      const response = await fetch('/api/discipleship-requests');
      if (!response.ok) throw new Error('Erro ao buscar solicitações de discipulado');
      return response.json();
    }
  });

  // Buscar usuários com perfil missionário ativo
  // Não precisamos mais buscar perfis missionários - usamos apenas o campo role

  // Adicionar informação sobre solicitações pendentes de discipulado
  const usersWithDiscipleRequests = users.map((user: any) => ({
    ...user,
    hasPendingDiscipleRequest: discipleshipRequests.some((req: any) => 
      req.interestedId === user.id && req.status === 'pending'
    )
  }));

  // Função para determinar prioridade do usuário
  const getUserPriority = (user: any) => {
    if (user.status === 'pending') return 1; // Máxima prioridade
    if ((user.points || 0) < 300) return 2; // Abaixo do Monte Sinai
    if ((user.attendance || 0) < 50) return 3; // Baixa frequência
    if (!user.isApproved) return 4; // Não aprovado
    return 5; // Normal
  };

  // Função para lidar com o clique nos cards dos montes
  const handleMountainClick = (mountainKey: string | null) => {
    setMountainFilter(mountainKey);
    // Limpar outros filtros quando selecionar um monte
    if (mountainKey) {
      setSearchTerm('');
      setRoleFilter('all');
      setStatusFilter('all');
      setChurchFilter('all');
      setPriorityFilter('all');
      setMissionaryProfileFilter('all');
      setInterestedSituationFilter(null);
    }
  };

  // Função para lidar com o clique nos botões de situação dos interessados
  const handleInterestedSituationClick = (situationKey: string | null) => {
    setInterestedSituationFilter(situationKey);
    // Limpar outros filtros quando selecionar uma situação
    if (situationKey) {
      setSearchTerm('');
      setRoleFilter('all');
      setStatusFilter('all');
      setChurchFilter('all');
      setPriorityFilter('all');
      setMissionaryProfileFilter('all');
      setMountainFilter(null);
      setSpiritualCheckInFilter(null);
    }
  };

  // Função para lidar com o clique nos cards de check-in espiritual
  const handleSpiritualCheckInClick = (checkInKey: string | null) => {
    setSpiritualCheckInFilter(checkInKey);
    // Limpar outros filtros quando selecionar um check-in
    if (checkInKey) {
      setSearchTerm('');
      setRoleFilter('all');
      setStatusFilter('all');
      setChurchFilter('all');
      setPriorityFilter('all');
      setMissionaryProfileFilter('all');
      setMountainFilter(null);
      setInterestedSituationFilter(null);
    }
  };

  // Função para obter o nome do monte filtrado
  const getMountainFilterName = () => {
    if (!mountainFilter) return null;
    const mountainNames: { [key: string]: string } = {
      'vale': 'Vale do Jordão',
      'sinai': 'Monte Sinai',
      'nebo': 'Monte Nebo',
      'moria': 'Monte Moriá',
      'carmelo': 'Monte Carmelo',
      'hermon': 'Monte Hermon',
      'siao': 'Monte Sião',
      'oliveiras': 'Monte das Oliveiras',
      'topo': 'O Topo'
    };
    return mountainNames[mountainFilter];
  };

  // Função para contar usuários por monte considerando restrições de missionários
  const getUsersCountByMountain = (mountainKey: string) => {
    if (user?.role === 'missionary') {
      // Para missionários, contar apenas interessados vinculados
      return usersWithDiscipleRequests.filter((u: any) => {
        if (u.role !== 'interested') return false;
        
        // Verificar se está vinculado ao missionário
        const isAssigned = relationshipsData.some((rel: any) => 
          rel.interestedId === u.id && rel.status === 'active'
        );
        if (!isAssigned) return false;
        
        // Verificar pontos do monte
        const userPoints = u.points || 0;
        switch (mountainKey) {
          case 'vale': return userPoints >= 0 && userPoints < 300;
          case 'sinai': return userPoints >= 300 && userPoints < 400;
          case 'nebo': return userPoints >= 400 && userPoints < 500;
          case 'moria': return userPoints >= 500 && userPoints < 600;
          case 'carmelo': return userPoints >= 600 && userPoints < 700;
          case 'hermon': return userPoints >= 700 && userPoints < 800;
          case 'siao': return userPoints >= 800 && userPoints < 900;
          case 'oliveiras': return userPoints >= 900 && userPoints < 1000;
          case 'topo': return userPoints >= 1000;
          default: return false;
        }
      }).length;
    } else {
      // Para admins, contar todos os usuários
      const userPoints = (u: any) => u.points || 0;
      switch (mountainKey) {
        case 'vale': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 0 && userPoints(u) < 300).length;
        case 'sinai': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 300 && userPoints(u) < 400).length;
        case 'nebo': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 400 && userPoints(u) < 500).length;
        case 'moria': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 500 && userPoints(u) < 600).length;
        case 'carmelo': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 600 && userPoints(u) < 700).length;
        case 'hermon': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 700 && userPoints(u) < 800).length;
        case 'siao': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 800 && userPoints(u) < 900).length;
        case 'oliveiras': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 900 && userPoints(u) < 1000).length;
        case 'topo': return usersWithDiscipleRequests.filter((u: any) => userPoints(u) >= 1000).length;
        default: return 0;
      }
    }
  };

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = usersWithDiscipleRequests
    .filter((u: any) => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = !statusFilter || statusFilter === 'all' || u.status === statusFilter;
      const matchesChurch = churchFilter === 'all' || u.church === churchFilter;
      
      // Filtro de perfil missionário (agora baseado no campo role)
      let matchesMissionaryProfile = true;
      if (missionaryProfileFilter === 'missionary') {
        // Mostrar apenas usuários com role 'missionary'
        matchesMissionaryProfile = u.role === 'missionary';
      } else if (missionaryProfileFilter === 'non-missionary') {
        // Mostrar apenas usuários SEM role 'missionary'
        matchesMissionaryProfile = u.role !== 'missionary';
      }

      // Filtro por monte baseado nos pontos
      let matchesMountain = true;
      if (mountainFilter) {
        const userPoints = u.points || 0;
        switch (mountainFilter) {
          case 'vale':
            matchesMountain = userPoints >= 0 && userPoints < 300;
            break;
          case 'sinai':
            matchesMountain = userPoints >= 300 && userPoints < 400;
            break;
          case 'nebo':
            matchesMountain = userPoints >= 400 && userPoints < 500;
            break;
          case 'moria':
            matchesMountain = userPoints >= 500 && userPoints < 600;
            break;
          case 'carmelo':
            matchesMountain = userPoints >= 600 && userPoints < 700;
            break;
          case 'hermon':
            matchesMountain = userPoints >= 700 && userPoints < 800;
            break;
          case 'siao':
            matchesMountain = userPoints >= 800 && userPoints < 900;
            break;
          case 'oliveiras':
            matchesMountain = userPoints >= 900 && userPoints < 1000;
            break;
          case 'topo':
            matchesMountain = userPoints >= 1000;
            break;
          default:
            matchesMountain = true;
        }
      }

      // Filtro por situação dos interessados
      let matchesInterestedSituation = true;
      if (interestedSituationFilter) {
        if (interestedSituationFilter === 'no-situation') {
          matchesInterestedSituation = u.role === 'interested' && !u.interestedSituation;
        } else if (interestedSituationFilter === 'total') {
          matchesInterestedSituation = u.role === 'interested';
        } else {
          matchesInterestedSituation = u.role === 'interested' && u.interestedSituation === interestedSituationFilter;
        }
      }

      // Filtro por check-in espiritual
      let matchesSpiritualCheckIn = true;
      if (spiritualCheckInFilter) {
        // Filtro baseado nos scores emocionais dos check-ins (1-5)
        switch (spiritualCheckInFilter) {
          case 'score-1':
            matchesSpiritualCheckIn = u.emotionalScore === 1;
            break;
          case 'score-2':
            matchesSpiritualCheckIn = u.emotionalScore === 2;
            break;
          case 'score-3':
            matchesSpiritualCheckIn = u.emotionalScore === 3;
            break;
          case 'score-4':
            matchesSpiritualCheckIn = u.emotionalScore === 4;
            break;
          case 'score-5':
            matchesSpiritualCheckIn = u.emotionalScore === 5;
            break;
          case 'no-checkin':
            matchesSpiritualCheckIn = !u.emotionalScore;
            break;
          default:
            matchesSpiritualCheckIn = true;
        }
      }

      // Filtro para missionários: só podem ver interessados vinculados a eles
      let matchesMissionaryRestriction = true;
      if (user?.role === 'missionary') {
        if (u.role === 'interested') {
          // Verificar se o interessado está vinculado ao missionário
          const isAssigned = relationshipsData.some((rel: any) => 
            rel.interestedId === u.id && rel.status === 'active'
          );
          matchesMissionaryRestriction = isAssigned;
        } else if (u.id === user.id) {
          // Missionário pode ver seu próprio perfil
          matchesMissionaryRestriction = true;
        } else {
          // Missionário não pode ver outros usuários (exceto interessados vinculados)
          matchesMissionaryRestriction = false;
        }
      }
      
      return matchesSearch && matchesRole && matchesStatus && matchesChurch && matchesMountain && matchesInterestedSituation && matchesSpiritualCheckIn && matchesMissionaryProfile && matchesMissionaryRestriction;
    })
    .sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'points':
          aValue = a.points || 0;
          bValue = b.points || 0;
          break;
        case 'attendance':
          aValue = a.attendance || 0;
          bValue = b.attendance || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'priority':
          aValue = getUserPriority(a);
          bValue = getUserPriority(b);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const approveUserMutation = useMutation({
    mutationFn: (userId: number) => 
      fetch(`/api/users/${userId}/approve`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
      // Dispatch custom event to update dashboard
      window.dispatchEvent(new CustomEvent('user-approved'));
      toast({
        title: "Usuário aprovado",
        description: "O usuário foi aprovado com sucesso.",
      });
    }
  });

  const rejectUserMutation = useMutation({
    mutationFn: (userId: number) => 
      fetch(`/api/users/${userId}/reject`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
      // Dispatch custom event to update dashboard
      window.dispatchEvent(new CustomEvent('user-rejected'));
      toast({
        title: "Usuário rejeitado",
        description: "O usuário foi rejeitado.",
        variant: "destructive"
      });
    }
  });

  const handleApproveUser = (userId: number) => {
    approveUserMutation.mutate(userId);
  };

  const handleRejectUser = (userId: number) => {
    rejectUserMutation.mutate(userId);
  };

  const handleUserClick = (clickedUser: any) => {
    setSelectedUser(clickedUser);
    setShowUserModal(true);
  };

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number, data: any }) => 
      fetch(`/api/users/${userId}`, { 
        method: 'PUT', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
      // Dispatch custom event to update dashboard
      window.dispatchEvent(new CustomEvent('user-updated'));
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
    }
  });

  const handleUpdateUser = (userId: number, data: any) => {
    updateUserMutation.mutate({ userId, data });
    setSelectedUser((prev: any) => prev ? { ...prev, ...data } : null);
  };

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
      toast({
        title: "✅ Usuário excluído",
        description: "Usuário excluído com sucesso!",
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao excluir usuário",
        description: error.message || "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    },
  });

  const discipleUserMutation = useMutation({
    mutationFn: async ({ userId, message }: { userId: number; message: string }) => {
      const response = await fetch(`/api/users/${userId}/disciple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disciple user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "✅ Solicitação enviada",
        description: "Solicitação de discipulado enviada com sucesso!",
      });
      setShowDiscipleDialog(false);
      setUserToDisciple(null);
      setDiscipleMessage('');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao solicitar discipulado",
        description: error.message || "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    },
  });


  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDiscipleUser = (user: any) => {
    setUserToDisciple(user);
    setShowDiscipleDialog(true);
  };

  const handleDiscipleRequest = (user: any) => {
    // Encontrar a solicitação pendente para este usuário
    const request = discipleshipRequests.find((req: any) => 
      req.interestedId === user.id && req.status === 'pending'
    );
    
    if (request) {
      setSelectedRequest(request);
      setAdminNotes(request.adminNotes || '');
      setShowAuthorizationModal(true);
    }
  };

  // Funções para autorização de discipulado
  const handleProcessDiscipleRequest = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    try {
      const response = await fetch(`/api/discipleship-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          adminNotes: adminNotes.trim(), 
          processedBy: user?.id || 1
        })
      });
      
      if (!response.ok) throw new Error('Erro ao processar solicitação');
      
      // Atualizar cache
      queryClient.invalidateQueries({ queryKey: ['discipleship-requests'] });
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      
      // Fechar modal
      setShowAuthorizationModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      
      // Mostrar toast de sucesso
      toast({
        title: "✅ Solicitação processada!",
        description: `A solicitação foi ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro ao processar",
        description: error.message || "Não foi possível processar a solicitação.",
        variant: "destructive",
      });
    }
  };

  // Função para remover relacionamento ativo de discipulado
  const handleRemoveActiveDisciple = async (interestedId: number) => {
    try {
      // Primeiro, rejeitar TODAS as solicitações aprovadas para este interessado (não apenas as do usuário atual)
      const allApprovedRequests = discipleshipRequests.filter((req: any) => 
        req.interestedId === interestedId && req.status === 'approved'
      );
      
      console.log(`🔍 Rejeitando ${allApprovedRequests.length} solicitações aprovadas para interessado ${interestedId}`);
      
      // Rejeitar cada solicitação aprovada
      for (const request of allApprovedRequests) {
        console.log(`🔍 Rejeitando solicitação ID ${request.id} do missionário ${request.missionaryId}`);
        
        const rejectResponse = await fetch(`/api/discipleship-requests/${request.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'rejected',
            adminNotes: `Discipulado desvinculado pelo administrador - solicitação rejeitada automaticamente`,
            processedBy: user?.id || 1
          })
        });
        
        if (!rejectResponse.ok) {
          console.error(`❌ Erro ao rejeitar solicitação ${request.id}:`, await rejectResponse.text());
        } else {
          console.log(`✅ Solicitação ${request.id} rejeitada com sucesso`);
        }
      }
      
      // Buscar o relacionamento ativo para este interessado
      const response = await fetch(`/api/relationships/active/${interestedId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Erro ao remover discipulado');
      
      console.log('🔍 Relacionamento ativo removido, invalidando caches...');
      
      // Atualizar cache de forma mais agressiva e abrangente
      const cacheKeys = [
        'discipleship-requests',
        'all-discipleship-requests', 
        'relationships',
        'all-relationships',
        'users',
        'my-interested',
        'user-relationships'
      ];
      
      // Invalidar todos os caches
      cacheKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
        console.log(`🔍 Cache invalidado: ${key}`);
      });
      
      // Forçar refetch imediato de dados críticos
      const criticalKeys = [
        'discipleship-requests',
        'all-discipleship-requests',
        'relationships',
        'all-relationships'
      ];
      
      criticalKeys.forEach(key => {
        queryClient.refetchQueries({ queryKey: [key] });
        console.log(`🔍 Refetch forçado: ${key}`);
      });
      
      // Aguardar um pouco para garantir que as operações sejam concluídas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidar novamente para garantir sincronização
      cacheKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      
      console.log('✅ Cache atualizado com sucesso');
      
      // Mostrar toast de sucesso
      toast({
        title: "✅ Discipulado removido!",
        description: `O relacionamento foi removido e ${allApprovedRequests.length} solicitações foram rejeitadas automaticamente.`,
      });
    } catch (error: any) {
      console.error('❌ Erro ao remover discipulado:', error);
      toast({
        title: "❌ Erro ao remover",
        description: error.message || "Não foi possível remover o discipulado.",
        variant: "destructive",
      });
    }
  };



  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const { markVisit, isMarkingVisit } = useVisits();

  const handleMarkVisited = async (userId: number, visited: boolean, visitDate?: string) => {
    if (visitDate) {
      markVisit({ userId, visitDate });
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleScheduleVisit = (user: any) => {
    setSelectedUser(user);
    setShowScheduleModal(true);
  };

  const pendingCount = users.filter((u: any) => u.status === 'pending').length;

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive">Erro ao carregar usuários</p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users'] })}
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {user?.role === 'missionary' ? 'Meus Interessados' : 'Usuários'}
            </h1>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-pending-count">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </Badge>
            )}
            {user?.role === 'missionary' && (
              <Badge variant="secondary" className="ml-2">
                {relationshipsData.filter((rel: any) => rel.status === 'active').length} vinculado{relationshipsData.filter((rel: any) => rel.status === 'active').length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          

          
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <>
                <Button 
                  onClick={async () => {
                    try {
                      toast({
                        title: "🔄 Recalculando...",
                        description: "Calculando pontuação para todos os usuários. Isso pode levar alguns minutos.",
                      });
                      
                      const response = await fetch('/api/system/recalculate-all-points', { method: 'POST' });
                      const result = await response.json();
                      
                      if (result.success) {
                        queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
                        toast({
                          title: "✅ Pontuação Atualizada",
                          description: `${result.updatedUsers} usuários foram atualizados com sucesso!`,
                        });
                      } else {
                        throw new Error(result.error || 'Erro desconhecido');
                      }
                    } catch (error) {
                      toast({
                        title: "❌ Erro",
                        description: "Falha ao recalcular pontuação. Tente novamente.",
                        variant: "destructive",
                      });
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Recalcular Todas as Pontuações
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      toast({
                        title: "🔄 Gerenciando...",
                        description: "Gerenciando perfis missionários automaticamente.",
                      });
                      
                      const response = await fetch('/api/system/manage-missionary-roles', { method: 'POST' });
                      const result = await response.json();
                      
                      if (result.success) {
                        queryClient.invalidateQueries({ queryKey: ['missionary-profiles'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/users/with-points'] });
                        toast({
                          title: "✅ Perfis Gerenciados",
                          description: `${result.created} perfis criados, ${result.deactivated} desativados. Total ativo: ${result.totalActive}`,
                        });
                      } else {
                        throw new Error(result.error || 'Erro desconhecido');
                      }
                    } catch (error) {
                      toast({
                        title: "❌ Erro",
                        description: "Falha ao gerenciar roles missionários. Tente novamente.",
                        variant: "destructive",
                      });
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Gerenciar Roles Missionários
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary-dark" data-testid="button-new-user">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats como Badges Filtros Elegantes */}
        <div className="flex flex-wrap gap-4 mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/50 shadow-sm">
          {user?.role === 'admin' ? (
            <>
              <Badge
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'admin' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-0' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300/50 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
                data-testid="stat-admin"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Shield className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Administradores</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'admin').length}
                </span>
              </Badge>
              
              <Badge
                variant={roleFilter === 'member' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'member' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0' 
                    : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300/50 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'member' ? 'all' : 'member')}
                data-testid="stat-member"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <User className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Membros</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'member').length}
                </span>
              </Badge>
              
              <Badge
                variant={roleFilter === 'missionary' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'missionary' 
                    ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25 border-0' 
                    : 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-300/50 hover:from-violet-100 hover:to-violet-200 hover:border-violet-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'missionary' ? 'all' : 'missionary')}
                data-testid="stat-missionary"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Missionários</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'missionary').length}
                </span>
              </Badge>
              
              <Badge
                variant={roleFilter === 'interested' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'interested' 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25 border-0' 
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300/50 hover:from-amber-100 hover:to-amber-200 hover:border-amber-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'interested' ? 'all' : 'interested')}
                data-testid="stat-interested"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Star className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Interessados</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'interested').length}
                </span>
              </Badge>
            </>
          ) : user?.role === 'missionary' ? (
            <>
              <Badge
                variant="outline"
                className="group relative bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-300/50 cursor-default shadow-sm hover:shadow-md transition-all duration-300"
                data-testid="stat-my-interested"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Meus Interessados</span>
                <span className="ml-2 px-2 py-0.5 bg-violet-200/50 rounded-full text-sm font-bold">
                    {relationshipsData.filter((rel: any) => rel.status === 'active').length}
                </span>
              </Badge>
              
              <Badge
                variant="outline"
                className="group relative bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300/50 cursor-default shadow-sm hover:shadow-md transition-all duration-300"
                data-testid="stat-studying"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CheckCircle className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Estudando</span>
                <span className="ml-2 px-2 py-0.5 bg-emerald-200/50 rounded-full text-sm font-bold">
                    {filteredAndSortedUsers.filter((u: any) => u.interestedSituation === 'C').length}
                </span>
              </Badge>
              
              <Badge
                variant="outline"
                className="group relative bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300/50 cursor-default shadow-sm hover:shadow-md transition-all duration-300"
                data-testid="stat-ready-baptism"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Star className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Pronto Batismo</span>
                <span className="ml-2 px-2 py-0.5 bg-blue-200/50 rounded-full text-sm font-bold">
                    {filteredAndSortedUsers.filter((u: any) => u.interestedSituation === 'A').length}
                </span>
              </Badge>
              
              <Badge
                variant="outline"
                className="group relative bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300/50 cursor-default shadow-sm hover:shadow-md transition-all duration-300"
                data-testid="stat-new-contacts"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <AlertTriangle className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Novos Contatos</span>
                <span className="ml-2 px-2 py-0.5 bg-amber-200/50 rounded-full text-sm font-bold">
                    {filteredAndSortedUsers.filter((u: any) => u.interestedSituation === 'E').length}
                </span>
              </Badge>
            </>
          ) : (
            <>
              <Badge
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'admin' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-0' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300/50 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
                data-testid="stat-admin"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Shield className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Administradores</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'admin').length}
                </span>
              </Badge>
              
              <Badge
                variant={roleFilter === 'member' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'member' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0' 
                    : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300/50 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'member' ? 'all' : 'member')}
                data-testid="stat-member"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <User className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Membros</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'member').length}
                </span>
              </Badge>
              
              <Badge
                variant={roleFilter === 'missionary' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'missionary' 
                    ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25 border-0' 
                    : 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-300/50 hover:from-violet-100 hover:to-violet-200 hover:border-violet-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'missionary' ? 'all' : 'missionary')}
                data-testid="stat-missionary"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Missionários</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'missionary').length}
                </span>
              </Badge>
              
              <Badge
                variant={roleFilter === 'interested' ? 'default' : 'outline'}
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                  roleFilter === 'interested' 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25 border-0' 
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300/50 hover:from-amber-100 hover:to-amber-200 hover:border-amber-400'
                }`}
                onClick={() => setRoleFilter(roleFilter === 'interested' ? 'all' : 'interested')}
                data-testid="stat-interested"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Star className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-semibold tracking-wide">Interessados</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                    {users.filter((u: any) => u.role === 'interested').length}
                </span>
              </Badge>
            </>
          )}
        </div>

        {/* Mountain Stats - Usuários por Montes e Estatísticas */}
        <div className="space-y-4 mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 drop-shadow-sm" />
              {user?.role === 'missionary' ? 'Meus Interessados por Montes e Estatísticas' : 'Usuários por Montes e Estatísticas'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMountainFilters(!showMountainFilters)}
              className="h-7 px-3 text-xs flex items-center gap-1 bg-white/50 hover:bg-white/80 border-slate-300/50 hover:border-slate-400 transition-all duration-200"
              title={showMountainFilters ? "Esconder filtros e estatísticas" : "Mostrar filtros e estatísticas"}
            >
              {showMountainFilters ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Esconder
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Mostrar
                </>
              )}
            </Button>
            {mountainFilter && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                  Filtrado: {getMountainFilterName()}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMountainClick(null)}
                  className="h-7 px-3 text-xs bg-white/50 hover:bg-white/80 border-slate-300/50 hover:border-slate-400 transition-all duration-200"
                >
                  Limpar Filtro
                </Button>
              </div>
            )}
          </div>
          {showMountainFilters && (
            <div className="grid grid-cols-4 md:grid-cols-9 gap-3">
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'vale' 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25 border-0' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-300/50 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'vale' ? null : 'vale')}
              title="Clique para filtrar usuários deste monte"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('vale')}
                </div>
                  <div className="text-sm font-semibold mb-1">Vale</div>
                  <div className="text-xs opacity-80">0-299 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'sinai' 
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/25 border-0' 
                    : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-300/50 hover:from-orange-100 hover:to-orange-200 hover:border-orange-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'sinai' ? null : 'sinai')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('sinai')}
                </div>
                  <div className="text-sm font-semibold mb-1">Sinai</div>
                  <div className="text-xs opacity-80">300-399 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'nebo' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-0' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300/50 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'nebo' ? null : 'nebo')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('nebo')}
                </div>
                  <div className="text-sm font-semibold mb-1">Nebo</div>
                  <div className="text-xs opacity-80">400-499 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'moria' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-0' 
                    : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-300/50 hover:from-purple-100 hover:to-purple-200 hover:border-purple-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'moria' ? null : 'moria')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('moria')}
                </div>
                  <div className="text-sm font-semibold mb-1">Moriá</div>
                  <div className="text-xs opacity-80">500-599 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'carmelo' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0' 
                    : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300/50 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'carmelo' ? null : 'carmelo')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('carmelo')}
                </div>
                  <div className="text-sm font-semibold mb-1">Carmelo</div>
                  <div className="text-xs opacity-80">600-699 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'hermon' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 border-0' 
                    : 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-300/50 hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'hermon' ? null : 'hermon')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('hermon')}
                </div>
                  <div className="text-sm font-semibold mb-1">Hermon</div>
                  <div className="text-xs opacity-80">700-799 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'siao' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border-0' 
                    : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-300/50 hover:from-red-100 hover:to-red-200 hover:border-red-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'siao' ? null : 'siao')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('siao')}
                </div>
                  <div className="text-sm font-semibold mb-1">Sião</div>
                  <div className="text-xs opacity-80">800-899 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'oliveiras' 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-500/25 border-0' 
                    : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300/50 hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'oliveiras' ? null : 'oliveiras')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('oliveiras')}
                </div>
                  <div className="text-sm font-semibold mb-1">Oliveiras</div>
                  <div className="text-xs opacity-80">900-999 pts</div>
              </CardContent>
            </Card>
              
            <Card 
                className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                mountainFilter === 'topo' 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25 border-0' 
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300/50 hover:from-amber-100 hover:to-amber-200 hover:border-amber-400'
              }`}
              onClick={() => handleMountainClick(mountainFilter === 'topo' ? null : 'topo')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold mb-1">
                  {getUsersCountByMountain('topo')}
                </div>
                  <div className="text-sm font-semibold mb-1">O Topo</div>
                  <div className="text-xs opacity-80">1000+ pts</div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Points Overview Stats */}
          {showMountainFilters && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="group relative bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300/50 hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold text-blue-700 mb-1">
                    {filteredAndSortedUsers.filter((u: any) => (u.points || 0) > 0).length}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 mb-1">Com Pontos</div>
                  <div className="text-xs text-blue-500">
                    {filteredAndSortedUsers.length > 0 ? ((filteredAndSortedUsers.filter((u: any) => (u.points || 0) > 0).length / filteredAndSortedUsers.length) * 100).toFixed(1) : '0'}%
                  </div>
                </CardContent>
              </Card>
              <Card className="group relative bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300/50 hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold text-emerald-700 mb-1">
                    {filteredAndSortedUsers.filter((u: any) => (u.points || 0) > 0).length > 0 ? 
                      Math.round(filteredAndSortedUsers.reduce((sum: number, u: any) => sum + (u.points || 0), 0) / filteredAndSortedUsers.filter((u: any) => (u.points || 0) > 0).length) : 0}
                  </div>
                  <div className="text-sm font-semibold text-emerald-600 mb-1">Média</div>
                  <div className="text-xs text-emerald-500">Por Usuário</div>
                </CardContent>
              </Card>
              <Card className="group relative bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-300/50 hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-3 text-center relative z-10">
                  <div className="text-xl font-bold text-indigo-700 mb-1">
                    {filteredAndSortedUsers.length > 0 ? Math.max(...filteredAndSortedUsers.map((u: any) => u.points || 0)) : 0}
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mb-1">Maior</div>
                  <div className="text-xs text-indigo-500">Recorde</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Situação dos Interessados */}
        <div className="space-y-4 mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 drop-shadow-sm" />
              Situação dos Interessados
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInterestedStats(!showInterestedStats)}
              className="h-7 px-3 text-xs flex items-center gap-1 bg-white/50 hover:bg-white/80 border-slate-300/50 hover:border-slate-400 transition-all duration-200"
              title={showInterestedStats ? "Esconder estatísticas dos interessados" : "Mostrar estatísticas dos interessados"}
            >
              {showInterestedStats ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Esconder
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Mostrar
                </>
              )}
            </Button>
          </div>
          {showInterestedStats && (
            <>
              <div className="grid grid-cols-5 gap-3">
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'A'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0'
                      : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300/50 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'A' ? null : 'A')}
                  title="Clique para filtrar interessados Pronto para Batismo"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'A' ? 'text-white' : 'text-emerald-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested' && u.interestedSituation === 'A').length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'A' ? 'text-white' : 'text-emerald-600'}`}>Pronto para Batismo</div>
                    <div className={`text-xs ${interestedSituationFilter === 'A' ? 'text-white/90' : 'text-emerald-500'}`}>Tipo A</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'B'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-0'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300/50 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'B' ? null : 'B')}
                  title="Clique para filtrar interessados Detalhes Pessoais"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'B' ? 'text-white' : 'text-blue-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested' && u.interestedSituation === 'B').length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'B' ? 'text-white' : 'text-blue-600'}`}>Detalhes Pessoais</div>
                    <div className={`text-xs ${interestedSituationFilter === 'B' ? 'text-white/90' : 'text-blue-500'}`}>Tipo B</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'C'
                      ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25 border-0'
                      : 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-300/50 hover:from-violet-100 hover:to-violet-200 hover:border-violet-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'C' ? null : 'C')}
                  title="Clique para filtrar interessados Estudando Bíblia"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'C' ? 'text-white' : 'text-violet-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested' && u.interestedSituation === 'C').length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'C' ? 'text-white' : 'text-violet-600'}`}>Estudando Bíblia</div>
                    <div className={`text-xs ${interestedSituationFilter === 'C' ? 'text-white/90' : 'text-violet-500'}`}>Tipo C</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'D'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/25 border-0'
                      : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-300/50 hover:from-orange-100 hover:to-orange-200 hover:border-orange-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'D' ? null : 'D')}
                  title="Clique para filtrar interessados Quer Estudar"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'D' ? 'text-white' : 'text-orange-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested' && u.interestedSituation === 'D').length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'D' ? 'text-white' : 'text-orange-600'}`}>Quer Estudar</div>
                    <div className={`text-xs ${interestedSituationFilter === 'D' ? 'text-white/90' : 'text-orange-500'}`}>Tipo D</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'E'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25 border-0'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-300/50 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'E' ? null : 'E')}
                  title="Clique para filtrar interessados Contato Inicial"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'E' ? 'text-white' : 'text-gray-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested' && u.interestedSituation === 'E').length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'E' ? 'text-white' : 'text-gray-600'}`}>Contato Inicial</div>
                    <div className={`text-xs ${interestedSituationFilter === 'E' ? 'text-white/90' : 'text-gray-500'}`}>Tipo E</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Cards adicionais para interessados sem situação definida e total */}
              <div className="grid grid-cols-2 gap-3">
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'no-situation'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-500/25 border-0'
                      : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300/50 hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'no-situation' ? null : 'no-situation')}
                  title="Clique para filtrar interessados sem situação definida"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'no-situation' ? 'text-white' : 'text-yellow-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested' && !u.interestedSituation).length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'no-situation' ? 'text-white' : 'text-yellow-600'}`}>Sem Situação Definida</div>
                    <div className={`text-xs ${interestedSituationFilter === 'no-situation' ? 'text-white/90' : 'text-yellow-500'}`}>Precisa de Acompanhamento</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    interestedSituationFilter === 'total'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border-0'
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-300/50 hover:from-red-100 hover:to-red-200 hover:border-red-400'
                  }`}
                  onClick={() => handleInterestedSituationClick(interestedSituationFilter === 'total' ? null : 'total')}
                  title="Clique para filtrar todos os interessados"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 text-center relative z-10">
                    <div className={`text-xl font-bold mb-1 ${interestedSituationFilter === 'total' ? 'text-white' : 'text-red-700'}`}>
                      {filteredAndSortedUsers.filter((u: any) => u.role === 'interested').length}
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${interestedSituationFilter === 'total' ? 'text-white' : 'text-red-600'}`}>Total de Interessados</div>
                    <div className={`text-xs ${interestedSituationFilter === 'total' ? 'text-white/90' : 'text-red-500'}`}>Todos os Tipos</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Check-in Espiritual */}
        <div className="space-y-4 mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500 drop-shadow-sm" />
              Check-in Espiritual
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpiritualCheckInStats(!showSpiritualCheckInStats)}
              className="h-7 px-3 text-xs flex items-center gap-1 bg-white/50 hover:bg-white/80 border-purple-300/50 hover:border-purple-400 transition-all duration-200"
              title={showSpiritualCheckInStats ? "Esconder estatísticas de check-in espiritual" : "Mostrar estatísticas de check-in espiritual"}
            >
              {showSpiritualCheckInStats ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Esconder
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Mostrar
                </>
              )}
            </Button>
          </div>
          {showSpiritualCheckInStats && (
            <>
              <div className="grid grid-cols-5 gap-3">
                {/* Score 1 - Distante */}
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    spiritualCheckInFilter === 'score-1'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border-0'
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-300/50 hover:from-red-100 hover:to-red-200 hover:border-red-400'
                  }`}
                  onClick={() => handleSpiritualCheckInClick(spiritualCheckInFilter === 'score-1' ? null : 'score-1')}
                  title="Clique para filtrar usuários com score 1 (Distante)"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 text-center relative z-10">
                    <div className="text-lg mb-0.5">🍃</div>
                    <div className={`text-lg font-bold mb-0.5 ${spiritualCheckInFilter === 'score-1' ? 'text-white' : 'text-red-700'}`}>
                      {spiritualCheckInData?.scoreGroups?.['1']?.count || 0}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${spiritualCheckInFilter === 'score-1' ? 'text-white' : 'text-red-600'}`}>Distante</div>
                    <div className={`text-xs ${spiritualCheckInFilter === 'score-1' ? 'text-white/90' : 'text-red-500'}`}>Apocalipse 2:4</div>
                  </CardContent>
                </Card>
                
                {/* Score 2 - Buscando */}
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    spiritualCheckInFilter === 'score-2'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/25 border-0'
                      : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-300/50 hover:from-orange-100 hover:to-orange-200 hover:border-orange-400'
                  }`}
                  onClick={() => handleSpiritualCheckInClick(spiritualCheckInFilter === 'score-2' ? null : 'score-2')}
                  title="Clique para filtrar usuários com score 2 (Buscando)"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 text-center relative z-10">
                    <div className="text-lg mb-0.5">🔍</div>
                    <div className={`text-lg font-bold mb-0.5 ${spiritualCheckInFilter === 'score-2' ? 'text-white' : 'text-orange-700'}`}>
                      {spiritualCheckInData?.scoreGroups?.['2']?.count || 0}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${spiritualCheckInFilter === 'score-2' ? 'text-white' : 'text-orange-600'}`}>Buscando</div>
                    <div className={`text-xs ${spiritualCheckInFilter === 'score-2' ? 'text-white/90' : 'text-orange-500'}`}>Isaías 55:6</div>
                  </CardContent>
                </Card>
                
                {/* Score 3 - Enraizando */}
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    spiritualCheckInFilter === 'score-3'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-500/25 border-0'
                      : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300/50 hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-400'
                  }`}
                  onClick={() => handleSpiritualCheckInClick(spiritualCheckInFilter === 'score-3' ? null : 'score-3')}
                  title="Clique para filtrar usuários com score 3 (Enraizando)"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 text-center relative z-10">
                    <div className="text-lg mb-0.5">🌱</div>
                    <div className={`text-lg font-bold mb-0.5 ${spiritualCheckInFilter === 'score-3' ? 'text-white' : 'text-yellow-700'}`}>
                      {spiritualCheckInData?.scoreGroups?.['3']?.count || 0}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${spiritualCheckInFilter === 'score-3' ? 'text-white' : 'text-yellow-600'}`}>Enraizando</div>
                    <div className={`text-xs ${spiritualCheckInFilter === 'score-3' ? 'text-white/90' : 'text-yellow-500'}`}>Salmo 1:2</div>
                  </CardContent>
                </Card>
                
                {/* Score 4 - Frutificando */}
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    spiritualCheckInFilter === 'score-4'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-0'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300/50 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400'
                  }`}
                  onClick={() => handleSpiritualCheckInClick(spiritualCheckInFilter === 'score-4' ? null : 'score-4')}
                  title="Clique para filtrar usuários com score 4 (Frutificando)"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 text-center relative z-10">
                    <div className="text-lg mb-0.5">🌳</div>
                    <div className={`text-xl font-bold mb-0.5 ${spiritualCheckInFilter === 'score-4' ? 'text-white' : 'text-blue-700'}`}>
                      {spiritualCheckInData?.scoreGroups?.['4']?.count || 0}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${spiritualCheckInFilter === 'score-4' ? 'text-white' : 'text-blue-600'}`}>Frutificando</div>
                    <div className={`text-xs ${spiritualCheckInFilter === 'score-4' ? 'text-white/90' : 'text-blue-500'}`}>João 15:5</div>
                  </CardContent>
                </Card>
                
                                {/* Score 5 - Intimidade */}
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    spiritualCheckInFilter === 'score-5'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25 border-0'
                      : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-300/50 hover:from-green-100 hover:to-green-200 hover:border-green-400'
                  }`}
                  onClick={() => handleSpiritualCheckInClick(spiritualCheckInFilter === 'score-5' ? null : 'score-5')}
                  title="Clique para filtrar usuários com score 5 (Intimidade)"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 text-center relative z-10">
                    <div className="text-lg mb-0.5">✨</div>
                    <div className={`text-lg font-bold mb-0.5 ${spiritualCheckInFilter === 'score-5' ? 'text-white' : 'text-green-700'}`}>
                      {spiritualCheckInData?.scoreGroups?.['5']?.count || 0}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${spiritualCheckInFilter === 'score-5' ? 'text-white' : 'text-green-700'}`}>Intimidade</div>
                    <div className={`text-xs ${spiritualCheckInFilter === 'score-5' ? 'text-white/90' : 'text-green-500'}`}>Gênesis 5:24</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Card adicional para usuários sem check-in */}
              <div className="grid grid-cols-1 gap-3 mt-3">
                <Card 
                  className={`group relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    spiritualCheckInFilter === 'no-checkin'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25 border-0'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-300/50 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => handleSpiritualCheckInClick(spiritualCheckInFilter === 'no-checkin' ? null : 'no-checkin')}
                  title="Clique para filtrar usuários sem check-in espiritual"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 text-center relative z-10">
                    <div className={`text-lg font-bold mb-0.5 ${spiritualCheckInFilter === 'no-checkin' ? 'text-white' : 'text-gray-700'}`}>
                      {spiritualCheckInData?.usersWithoutCheckIn || 0}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${spiritualCheckInFilter === 'no-checkin' ? 'text-white' : 'text-gray-600'}`}>Sem Check-in</div>
                    <div className={`text-xs ${spiritualCheckInFilter === 'no-checkin' ? 'text-white/90' : 'text-gray-500'}`}>Precisa de Acompanhamento</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtros */}
            <div className="flex-1 min-w-[120px]">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger data-testid="select-role-filter">
                  <SelectValue placeholder="Papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="missionary">Missionário</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="interested">Interessado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            

            
            <div className="flex-1 min-w-[120px]">
              <Select value={churchFilter} onValueChange={setChurchFilter}>
                <SelectTrigger data-testid="select-church-filter">
                  <SelectValue placeholder="Igreja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as igrejas</SelectItem>
                  {churches.map((church: any) => (
                    <SelectItem key={church.id} value={church.name}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <Select value={missionaryProfileFilter} onValueChange={setMissionaryProfileFilter}>
                <SelectTrigger data-testid="select-missionary-profile-filter">
                                      <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os roles</SelectItem>
                  <SelectItem value="missionary">Missionários</SelectItem>
                  <SelectItem value="non-missionary">Não missionários</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Ordenação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[140px]">
                  {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                  {sortBy === 'name' && 'Nome'}
                  {sortBy === 'points' && 'Pontos'}
                  {sortBy === 'attendance' && 'Frequência'}
                  {sortBy === 'createdAt' && 'Data Cadastro'}
                  {sortBy === 'priority' && 'Prioridade'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Nome A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Nome Z-A
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('points'); setSortOrder('desc'); }}>
                  <Star className="h-4 w-4 mr-2" />
                  Maior Pontuação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('points'); setSortOrder('asc'); }}>
                  <Star className="h-4 w-4 mr-2" />
                  Menor Pontuação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('attendance'); setSortOrder('desc'); }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Maior Frequência
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('attendance'); setSortOrder('asc'); }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Menor Frequência
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); }}>
                  <Clock className="h-4 w-4 mr-2" />
                  Mais Recentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('createdAt'); setSortOrder('asc'); }}>
                  <Clock className="h-4 w-4 mr-2" />
                  Mais Antigos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('priority'); setSortOrder('asc'); }}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Prioridade (Alta → Baixa)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            

          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {/* Mensagem informativa para missionários */}
          {user?.role === 'missionary' && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Visualizando apenas seus interessados vinculados
                </span>
                <Badge variant="secondary" className="text-xs">
                  {relationshipsData.filter((rel: any) => rel.status === 'active').length} interessado{relationshipsData.filter((rel: any) => rel.status === 'active').length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-xs text-purple-600">
                Para ver todos os interessados, solicite acesso ao administrador
              </div>
            </div>
          )}
          
          {/* Indicador de filtro ativo */}
          {mountainFilter && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Mountain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Mostrando usuários do {getMountainFilterName()}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {filteredAndSortedUsers.length} usuário{filteredAndSortedUsers.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMountainClick(null)}
                className="h-7 px-3 text-xs"
              >
                Ver Todos
              </Button>
            </div>
          )}
          
          {filteredAndSortedUsers.map((u: any) => (
            <UserCard
              key={u.id}
              user={u}
              onClick={() => handleUserClick(u)}
              onApprove={() => handleApproveUser(u.id)}
              onReject={() => handleRejectUser(u.id)}
              onEdit={() => handleEditUser(u)}
              onDelete={() => handleDeleteUser(u)}
              onView={() => handleViewUser(u)}
              onScheduleVisit={() => handleScheduleVisit(u)}
              onMarkVisited={handleMarkVisited}
              onDisciple={() => handleDiscipleUser(u)}
              onDiscipleRequest={() => handleDiscipleRequest(u)}
              showActions={user?.role === 'admin'}
            />
          ))}
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8" data-testid="empty-state">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        )}

        {/* User Detail Modal */}
        <UserDetailModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onUpdate={handleUpdateUser}
        />

        {/* Edit User Modal */}
        <EditUserModal
          user={selectedUser}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateUser}
        />

        {/* Schedule Visit Modal */}
        <ScheduleVisitModal
          user={selectedUser}
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
        />

        {/* Delete User Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário "{userToDelete?.name}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Disciple User Dialog */}
        <AlertDialog open={showDiscipleDialog} onOpenChange={setShowDiscipleDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Solicitar Discipulado</AlertDialogTitle>
              <AlertDialogDescription>
                Digite uma mensagem para solicitar o discipulado de "{userToDisciple?.name}".
                Esta solicitação será enviada para aprovação do administrador.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="disciple-message" className="text-right text-sm font-medium">
                  Mensagem:
                </label>
                <textarea
                  id="disciple-message"
                  value={discipleMessage}
                  onChange={(e) => setDiscipleMessage(e.target.value)}
                  className="col-span-3 min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite sua mensagem de solicitação..."
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (userToDisciple && discipleMessage.trim()) {
                    discipleUserMutation.mutate({
                      userId: userToDisciple.id,
                      message: discipleMessage.trim()
                    });
                  }
                }}
                disabled={!discipleMessage.trim() || discipleUserMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {discipleUserMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Authorization Modal */}
        {showAuthorizationModal && selectedRequest && (
          <AlertDialog open={showAuthorizationModal} onOpenChange={setShowAuthorizationModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Autorizar Discipulado</AlertDialogTitle>
                <AlertDialogDescription>
                  Aprove ou rejeite a solicitação de discipulado
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Missionário:</span>
                      <div className="font-medium">
                        {usersWithDiscipleRequests.find(u => u.id === selectedRequest.missionaryId)?.name || `Usuário ${selectedRequest.missionaryId}`}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Interessado:</span>
                      <div className="font-medium">
                        {usersWithDiscipleRequests.find(u => u.id === selectedRequest.interestedId)?.name || `Usuário ${selectedRequest.interestedId}`}
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.notes && (
                    <div>
                      <span className="font-medium text-muted-foreground">Observações do Missionário:</span>
                      <div className="text-sm bg-muted/50 p-2 rounded mt-1">
                        {selectedRequest.notes}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium">Notas do Administrador:</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                      rows={3}
                      placeholder="Adicione observações sobre sua decisão..."
                    />
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowAuthorizationModal(false)}>Cancelar</AlertDialogCancel>
                
                {/* Botão para remover discipulado ativo (se houver) */}
                {selectedRequest.status === 'approved' && (
                  <AlertDialogAction 
                    onClick={() => handleRemoveActiveDisciple(selectedRequest.interestedId)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Remover Discipulado
                  </AlertDialogAction>
                )}
                
                <AlertDialogAction 
                  onClick={() => handleProcessDiscipleRequest('rejected')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Rejeitar
                </AlertDialogAction>
                <AlertDialogAction 
                  onClick={() => handleProcessDiscipleRequest('approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprovar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </MobileLayout>
  );
}