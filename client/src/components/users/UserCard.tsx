import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  MapPin, 
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  CheckSquare,
  Square,
  Star,
  Calendar,
  BookOpen,
  Heart
} from "lucide-react";
import { getMountName, getLevelName, getLevelIcon } from "@/lib/gamification";
import { MountIcon } from "@/components/ui/mount-icon";


import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect, useCallback } from "react";
import { MarkVisitModal } from "./MarkVisitModal";
import { DiscipuladoresManager } from "./DiscipuladoresManager";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UserCardProps {
  user: any;
  onClick?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onScheduleVisit?: () => void;
  onWhatsApp?: () => void;
  onMarkVisited?: (userId: number, visited: boolean, visitDate?: string) => Promise<void>;
  onDisciple?: () => void;
  onDiscipleRequest?: () => void; // Adicionado para controlar a requisição de discipulado
  showActions?: boolean;
  relationshipsData?: any[]; // Adicionado para receber os dados de relacionamentos
}

export const UserCard = ({ 
  user, 
  onClick, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete, 
  onView, 
  onScheduleVisit, 
  onWhatsApp, 
  onMarkVisited, 
  onDisciple,
  onDiscipleRequest, // Adicionado para controlar a requisição de discipulado
  showActions = true,
  relationshipsData = [] // Adicionado para receber os dados de relacionamentos
}: UserCardProps) => {
  const [showMarkVisitModal, setShowMarkVisitModal] = useState(false);
  const [isMarkingVisit, setIsMarkingVisit] = useState(false);
  const [localVisitedState, setLocalVisitedState] = useState(false);

  const [potentialMissionaries, setPotentialMissionaries] = useState<any[]>([]);
  const [currentDiscipuladores, setCurrentDiscipuladores] = useState<any[]>([]);
  const [isUpdatingSituation, setIsUpdatingSituation] = useState(false);
  const [openSituationPopover, setOpenSituationPopover] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [userSpiritual, setUserSpiritual] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showVisitHistory, setShowVisitHistory] = useState(false);
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);


  
  // Estado local para o usuário para evitar mutação direta
  const [localUser, setLocalUser] = useState(user);

  // Sincronizar estado local quando user prop mudar
  useEffect(() => {
    setLocalUser(user);
    setDataLoaded(false); // Reset data loaded state when user changes
  }, [user]);

  // Sincronizar estado de visita com dados reais do banco
  useEffect(() => {
    console.log('🔄 [UserCard] Sincronizando estado de visita para usuário:', user?.name, 'extraData:', user?.extraData);
    
    if (user?.extraData) {
      try {
        let extraData;
        if (typeof user.extraData === 'string') {
          extraData = JSON.parse(user.extraData);
        } else {
          extraData = user.extraData;
        }
        
        console.log('🔄 [UserCard] ExtraData parseado:', extraData);
        console.log('🔄 [UserCard] Visited:', extraData.visited, 'VisitCount:', extraData.visitCount);
        
        // Sincronizar o estado local com os dados reais do banco
        setLocalVisitedState(extraData.visited === true);
      } catch (error) {
        console.error('❌ [UserCard] Erro ao parsear extraData:', error);
        setLocalVisitedState(false);
      }
    } else {
      console.log('🔄 [UserCard] Nenhum extraData encontrado, definindo como não visitado');
      setLocalVisitedState(false);
    }
  }, [user?.extraData]);

  // Não precisamos mais verificar perfil missionário - usamos apenas o campo role

  // Buscar estado espiritual do usuário
  useEffect(() => {
    const fetchUserSpiritual = async () => {
      try {
        const response = await fetch(`/api/emotional-checkins/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Pegar o check-in mais recente
            setUserSpiritual(data[0]);
          } else {
            // Não há check-ins disponíveis
            setUserSpiritual(null);
          }
        } else {
          // API retornou erro, não há check-ins
          setUserSpiritual(null);
        }
      } catch (error) {
        // Erro na requisição, não há check-ins
        console.log(`Check-in espiritual não disponível para ${user.name}:`, error.message);
        setUserSpiritual(null);
      }
    };

    if (user?.id && currentUser?.role === 'admin') {
      fetchUserSpiritual();
    } else {
      // Resetar estado se não for admin
      setUserSpiritual(null);
    }
  }, [user?.id, currentUser?.role]);

  const getPhotoUrl = () => {
    if (!localUser?.profilePhoto) return undefined;
    return String(localUser.profilePhoto).startsWith('http')
      ? localUser.profilePhoto
      : `/uploads/${localUser.profilePhoto}`;
  };

  // Carregar lista de membros que podem ser missionários e discipuladores atuais
  useEffect(() => {
    if (localUser.role === 'interested' && localUser.id && !dataLoaded) {
      setDataLoaded(true);
      // Usar Promise.all para carregar dados em paralelo
      Promise.all([
        loadPotentialMissionaries(),
        loadCurrentDiscipuladores()
      ]).catch(error => {
        console.error('Erro ao carregar dados:', error);
      });
    }
  }, [localUser.role, localUser.id, dataLoaded]);

  const loadPotentialMissionaries = useCallback(async () => {
    try {
      // Buscar membros e usuários com perfil missionário
      const [membersResponse, missionaryProfilesResponse] = await Promise.all([
        fetch('/api/users?role=member'),
        fetch('/api/missionary-profiles/users')
      ]);
      
      if (membersResponse.ok && missionaryProfilesResponse.ok) {
        const members = await membersResponse.json();
        const missionaryUsers = await missionaryProfilesResponse.json();
        
        // Combinar e remover duplicatas por ID
        const allPotential = [...members, ...missionaryUsers];
        const uniquePotential = allPotential.filter((member, index, self) => 
          index === self.findIndex(u => u.id === member.id)
        );
        
        setPotentialMissionaries(uniquePotential);
      } else {
        console.error('Erro ao carregar usuários:', membersResponse.status, missionaryProfilesResponse.status);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  }, []); // Empty dependency array to prevent recreation

  const loadCurrentDiscipuladores = useCallback(async () => {
    try {
      const response = await fetch(`/api/relationships?interestedId=${localUser.id}`);
      if (response.ok) {
        const relationships = await response.json();
        setCurrentDiscipuladores(relationships);
      }
    } catch (error) {
      console.error('Erro ao carregar discipuladores:', error);
    }
  }, [localUser.id]);

  const handleDiscipuladoresChange = useCallback((newDiscipuladores: any[]) => {
    setCurrentDiscipuladores(newDiscipuladores);
  }, []);



  const getSituationLabel = (situation: string | null) => {
    if (!situation) return 'Não definido';
    
    switch (situation) {
      case 'A': return 'Pronto para o Batismo';
      case 'B': return 'Detalhes Pessoais (Decidido ao Batismo)';
      case 'C': return 'Estudando a Bíblia';
      case 'D': return 'Quer Estudar a Bíblia';
      case 'E': return 'Contato Inicial';
      default: return 'Não definido';
    }
  };

  const getSituationColor = (situation: string | null) => {
    if (!situation) return 'bg-gray-100 text-gray-800';
    
    switch (situation) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-purple-100 text-purple-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSituationChange = async (newSituation: string) => {
    // Se selecionou "none", converte para null
    const valueToSave = newSituation === "none" ? null : newSituation;
    
    if (valueToSave === localUser.interestedSituation) return;
    
    setIsUpdatingSituation(true);
    try {
      const response = await fetch(`/api/users/${localUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interestedSituation: valueToSave })
      });
      
      if (response.ok) {
        setLocalUser((prev: any) => ({ ...prev, interestedSituation: valueToSave }));
        
        // Disparar evento para atualizar o dashboard
        window.dispatchEvent(new CustomEvent('user-updated', { 
          detail: { 
            userId: localUser.id, 
            type: 'situation-changed',
            situation: valueToSave 
          } 
        }));
        
        toast({
          title: "✅ Situação atualizada",
          description: `Situação de ${localUser.name} alterada para "${valueToSave ? getSituationLabel(valueToSave) : 'Não definida'}"`,
        });
      } else {
        throw new Error('Erro ao atualizar situação');
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao atualizar situação",
        description: "Não foi possível atualizar a situação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSituation(false);
    }
  };





  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'missionary': return 'bg-blue-500 text-white';
      case 'member': return 'bg-green-500 text-white';
      case 'interested': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'missionary': return 'Missionário';
      case 'member': return 'Membro';
      case 'interested': return 'Interessado';
      default: return 'Desconhecido';
    }
  };

  // Verificar se o usuário tem relacionamentos ativos como missionário
  const hasActiveRelationships = () => {
    if (!relationshipsData || !localUser) return false;
    return relationshipsData.some((rel: any) => 
      rel.missionaryId === localUser.id && rel.status === 'active'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getSpiritualEmoji = (score: number) => {
    switch (score) {
      case 1: return { emoji: '🍃', label: 'Distante', color: 'bg-red-100 text-red-800' };
      case 2: return { emoji: '🔍', label: 'Buscando', color: 'bg-orange-100 text-orange-800' };
      case 3: return { emoji: '🌱', label: 'Enraizando', color: 'bg-yellow-100 text-yellow-800' };
      case 4: return { emoji: '🍃', label: 'Frutificando', color: 'bg-blue-100 text-blue-800' };
      case 5: return { emoji: '✨', label: 'Intimidade', color: 'bg-green-100 text-green-800' };
      default: return null;
    }
  };

  // Função para determinar prioridade do usuário
  const getUserPriority = () => {
    if (localUser.status === 'pending') return { level: 'high', label: 'Pendente', color: 'border-yellow-500 bg-yellow-50' };
    if ((localUser.points || 0) < 300) return { level: 'high', label: 'Abaixo do Monte Sinai', color: 'border-orange-500 bg-orange-50' };
    if ((localUser.attendance || 0) < 50) return { level: 'medium', label: 'Baixa Frequência', color: 'border-blue-500 bg-blue-50' };
    if (!localUser.isApproved) return { level: 'medium', label: 'Não Aprovado', color: 'border-purple-500 bg-purple-50' };
    return { level: 'low', label: 'Normal', color: 'border-green-500 bg-green-50' };
  };

  const priority = getUserPriority();

  // Check if user has phone warning
  const hasPhoneWarning = () => {
    try {
      if (localUser.extraData) {
        let extraData;
        if (typeof localUser.extraData === 'string') {
          extraData = JSON.parse(localUser.extraData);
        } else {
          extraData = localUser.extraData;
        }
        return extraData.phoneWarning === true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Check if user has been visited (including local state)
  const isVisited = () => {
    // Se o estado local está true, considera como visitado
    if (localVisitedState) {
      console.log('🔄 [UserCard] isVisited: true (localVisitedState)');
      return true;
    }
    
    try {
      if (localUser.extraData) {
        let extraData;
        if (typeof localUser.extraData === 'string') {
          extraData = JSON.parse(localUser.extraData);
        } else {
          extraData = localUser.extraData;
        }
        const visited = extraData.visited === true;
        console.log('🔄 [UserCard] isVisited:', visited, 'extraData:', extraData);
        return visited;
      }
      console.log('🔄 [UserCard] isVisited: false (no extraData)');
      return false;
    } catch (error) {
      console.error('❌ [UserCard] Erro em isVisited:', error);
      return false;
    }
  };

  // Check if user has been visited multiple times
  const getVisitCount = () => {
    try {
      if (localUser.extraData) {
        let extraData;
        if (typeof localUser.extraData === 'string') {
          extraData = JSON.parse(localUser.extraData);
        } else {
          extraData = localUser.extraData;
        }
        const count = extraData.visitCount || 0;
        console.log('🔄 [UserCard] getVisitCount:', count, 'extraData:', extraData);
        return count;
      }
      console.log('🔄 [UserCard] getVisitCount: 0 (no extraData)');
      return 0;
    } catch (error) {
      console.error('❌ [UserCard] Erro em getVisitCount:', error);
      return 0;
    }
  };

  // Get last visit date
  const getLastVisitDate = () => {
    try {
      if (localUser.extraData) {
        let extraData;
        if (typeof localUser.extraData === 'string') {
          extraData = JSON.parse(localUser.extraData);
        } else {
          extraData = localUser.extraData;
        }
        return extraData.lastVisitDate;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Format visit date for display with Brazil timezone
  const formatVisitDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      // Se a data já tem timezone info (formato ISO), usa diretamente
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = new Date(dateString);
      } else {
        // Se é apenas data (YYYY-MM-DD), adiciona timezone do Brasil
        date = new Date(dateString + 'T00:00:00-03:00');
      }
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dateString);
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  };

  // Get current date in Brazil timezone
  const getBrazilDate = () => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const year = brazilTime.getFullYear();
    const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
    const day = String(brazilTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load visit history for a user
  const loadVisitHistory = async (userId: number) => {
    try {
      const response = await fetch(`/api/visits/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setVisitHistory(data);
      } else {
        setVisitHistory([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de visitas:', error);
      setVisitHistory([]);
    }
  };

  // Handle double click to reset visit counter
  const handleVisitButtonClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    console.log('🖱️ [CLICK] Botão de visita clicado:', {
      currentTime,
      lastClickTime,
      timeDiff,
      isDoubleClick: timeDiff < 500,
      user: localUser.name,
      currentVisits: getVisitCount()
    });
    
    if (timeDiff < 500) { // Double click within 500ms
      console.log('🔄 [DOUBLE] Duplo clique detectado - zerando visitas');
      handleResetVisits();
    } else {
      console.log('👆 [SINGLE] Clique simples - marcando visita');
      handleMarkVisited();
    }
    
    setLastClickTime(currentTime);
  };

  // Reset all visits for a user
  const handleResetVisits = async () => {
    console.log('🔄 [RESET] Iniciando reset de visitas para usuário:', localUser.id);
    
    try {
      const response = await fetch(`/api/visits/user/${localUser.id}/reset`, {
        method: 'DELETE'
      });
      
      console.log('🔄 [RESET] Resposta da API:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 [RESET] Dados da resposta:', data);
        
        // Reset local state
        setLocalVisitedState(false);
        setLocalUser(prev => ({
          ...prev,
          extraData: {
            ...(typeof prev.extraData === 'string' ? JSON.parse(prev.extraData) : prev.extraData || {}),
            visited: false,
            visitCount: 0,
            lastVisitDate: null
          }
        }));
        
        console.log('✅ [RESET] Estado local atualizado');
        
        toast({
          title: "🔄 Contador de visitas zerado",
          description: `Todas as visitas de ${localUser.name} foram removidas.`,
        });
      } else {
        const errorData = await response.json();
        console.error('❌ [RESET] Erro na API:', errorData);
        throw new Error('Erro ao zerar visitas');
      }
    } catch (error) {
      console.error('❌ [RESET] Erro ao zerar visitas:', error);
      toast({
        title: "❌ Erro ao zerar visitas",
        description: "Não foi possível zerar o contador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Validate WhatsApp number
  const isValidWhatsAppNumber = (phone?: string) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const handleMarkVisited = () => {
    if (isVisited() || localVisitedState) {
      // Se já foi visitado, abre o modal para nova visita
      setShowMarkVisitModal(true);
    } else {
      // Se não foi visitado, marca como visitado com data atual (Brasil)
      const visitDate = getBrazilDate();
      
      // Atualiza o estado local imediatamente para feedback visual
      setLocalVisitedState(true);
      
      // Atualiza o extraData local para refletir a nova visita
      const currentVisitCount = getVisitCount();
      const newExtraData = {
        ...(typeof localUser.extraData === 'string' ? JSON.parse(localUser.extraData) : localUser.extraData || {}),
        visited: true,
        lastVisitDate: visitDate,
        visitCount: currentVisitCount + 1
      };
      
      setLocalUser(prev => ({
        ...prev,
        extraData: newExtraData
      }));
      
      // Mostra toast de sucesso
      toast({
        title: "✅ Visita realizada registrada!",
        description: `Primeira visita para ${localUser.name} foi marcada como realizada. Visitômetro atualizado.`,
      });
      
      // Chama a função de marcar visita com tratamento de erro
      try {
        onMarkVisited?.(localUser.id, true, visitDate);
      } catch (error) {
        // Reverte o estado local em caso de erro
        setLocalVisitedState(false);
        setLocalUser(prev => ({
          ...prev,
          extraData: {
            ...(typeof localUser.extraData === 'string' ? JSON.parse(localUser.extraData) : localUser.extraData || {}),
            visited: false,
            visitCount: currentVisitCount
          }
        }));
        toast({
          title: "❌ Erro ao marcar visita",
          description: "Não foi possível marcar a visita. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConfirmVisit = async (visitDate: string) => {
    setIsMarkingVisit(true);
    try {
      await onMarkVisited?.(localUser.id, true, visitDate);
      setShowMarkVisitModal(false);
      
      // Atualiza o estado local após confirmação
      setLocalVisitedState(true);
      
      // Atualiza o extraData local para refletir a nova visita
      const currentVisitCount = getVisitCount();
      const newExtraData = {
        ...(typeof localUser.extraData === 'string' ? JSON.parse(localUser.extraData) : localUser.extraData || {}),
        visited: true,
        lastVisitDate: visitDate,
        visitCount: currentVisitCount + 1
      };
      
      setLocalUser(prev => ({
        ...prev,
        extraData: newExtraData
      }));
      
      const isNewVisit = currentVisitCount === 0;
      const visitText = isNewVisit ? 'primeira visita' : 'nova visita';
      
      toast({
        title: "✅ Visita realizada registrada!",
        description: `${visitText.charAt(0).toUpperCase() + visitText.slice(1)} para ${localUser.name} foi marcada como realizada em ${formatVisitDate(visitDate)}. Visitômetro atualizado.`,
      });
    } catch (error) {
      console.error('Erro ao marcar visita:', error);
      // Reverte o estado local em caso de erro
      setLocalVisitedState(false);
      toast({
        title: "❌ Erro ao marcar visita",
        description: "Não foi possível marcar a visita. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingVisit(false);
    }
  };

  const handleWhatsApp = () => {
    if (isValidWhatsAppNumber(localUser.phone)) {
      const cleanPhone = localUser.phone.replace(/\D/g, '');
      const message = `Olá ${localUser.name}! Como você está?`;
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Função para gerar nome de usuário para primeiro acesso
  const generateFirstAccessUsername = (fullName: string) => {
    if (!fullName) return '';
    
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].toLowerCase();
    }
    
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts[nameParts.length - 1].toLowerCase();
    
    return `${firstName}.${lastName}`;
  };



  // Verificar se o endereço precisa ser truncado




  return (
    <Card 
      className={`transition-all duration-200 border-l-4 ${priority.color} ${
        isVisited() 
          ? "border-green-200 bg-green-50/30" 
          : ""
      }`}
      data-testid={`card-user-${localUser.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div 
              className={`relative ${currentUser?.role === 'admin' && getPhotoUrl() ? 'cursor-zoom-in' : ''}`}
              onClick={(e) => {
                if (currentUser?.role === 'admin' && getPhotoUrl()) {
                  e.stopPropagation();
                  setIsPhotoPreviewOpen(true);
                }
              }}
              title={currentUser?.role === 'admin' && getPhotoUrl() ? 'Ver foto' : undefined}
              role={currentUser?.role === 'admin' && getPhotoUrl() ? 'button' : undefined}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={getPhotoUrl()}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {localUser.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {hasPhoneWarning() && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1" title="Telefone inválido durante importação">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-foreground truncate" data-testid={`text-username-${localUser.id}`}>
                  {localUser.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Badge className={getRoleColor(localUser.role)} data-testid={`badge-role-${localUser.id}`}>
                    {getRoleLabel(localUser.role)}
                  </Badge>
                  {localUser.role === 'member' && hasActiveRelationships() && (
                    <Badge className="bg-blue-500 text-white" data-testid={`badge-missionary-${localUser.id}`}>
                      Missionário
                    </Badge>
                  )}
                </div>
                
                
                {localUser.status === 'pending' && (
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(localUser.status)} cursor-pointer hover:opacity-80 transition-opacity`} 
                    data-testid={`badge-status-${localUser.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove?.();
                    }}
                    title="Clique para aprovar"
                  >
                    {getStatusLabel(localUser.status)}
                  </Badge>
                )}

                {/* Situação do Interessado - Apenas para usuários interessados */}
                {localUser.role === 'interested' && (
                  <div className="flex items-center gap-2">
                    <Popover open={openSituationPopover}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          role="combobox"
                          className="h-6 w-auto min-w-[140px] text-xs border-0 bg-transparent p-0 hover:bg-transparent"
                          disabled={isUpdatingSituation}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSituationPopover(!openSituationPopover);
                          }}
                        >
                          {localUser.interestedSituation ? getSituationLabel(localUser.interestedSituation) : "Selecionar situação"}
                          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 z-50" side="bottom" align="start">
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-sm font-medium">Selecionar Situação</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenSituationPopover(false)}
                            className="h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                        <Command>
                          <CommandInput placeholder="Digite para buscar situação..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma situação encontrada.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="none"
                                onSelect={() => {
                                  handleSituationChange("none");
                                  setOpenSituationPopover(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    !localUser.interestedSituation ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                Selecionar situação
                              </CommandItem>
                              <CommandItem
                                value="A"
                                onSelect={() => {
                                  handleSituationChange("A");
                                  setOpenSituationPopover(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    localUser.interestedSituation === "A" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                A - Pronto para o Batismo
                              </CommandItem>
                              <CommandItem
                                value="B"
                                onSelect={() => {
                                  handleSituationChange("B");
                                  setOpenSituationPopover(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    localUser.interestedSituation === "B" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                B - Detalhes Pessoais (Decidido ao Batismo)
                              </CommandItem>
                              <CommandItem
                                value="C"
                                onSelect={() => {
                                  handleSituationChange("C");
                                  setOpenSituationPopover(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    localUser.interestedSituation === "C" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                C - Estudando a Bíblia
                              </CommandItem>
                              <CommandItem
                                value="D"
                                onSelect={() => {
                                  handleSituationChange("D");
                                  setOpenSituationPopover(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    localUser.interestedSituation === "D" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                D - Quer Estudar a Bíblia
                              </CommandItem>
                              <CommandItem
                                value="E"
                                onSelect={() => {
                                  handleSituationChange("E");
                                  setOpenSituationPopover(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    localUser.interestedSituation === "E" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                E - Contato Inicial
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    <Badge 
                      className={`${getSituationColor(localUser.interestedSituation)} text-xs px-2 py-0`}
                      title={getSituationLabel(localUser.interestedSituation)}
                    >
                      {localUser.interestedSituation || 'Não definida'}
                    </Badge>
                  </div>
                )}

                {/* Badge de autorização de discipulado para administradores */}
                {currentUser?.role === 'admin' && localUser.hasPendingDiscipleRequest && (
                  <Badge 
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiscipleRequest?.();
                    }}
                    title="Clique para autorizar discipulado"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Autorizar
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                {/* Usuário para primeiro acesso */}
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate" data-testid={`text-first-access-${localUser.id}`}>
                    <strong>{generateFirstAccessUsername(localUser.name)}</strong>
                  </span>
                </div>
                
                {/* Gerenciador de Discipuladores - Apenas para usuários interessados */}
                {localUser.role === 'interested' && (
                  <div className="mt-2">
                    <DiscipuladoresManager
                      interestedId={localUser.id}
                      currentDiscipuladores={currentDiscipuladores}
                      potentialMissionaries={potentialMissionaries}
                      onDiscipuladoresChange={handleDiscipuladoresChange}
                    />
                  </div>
                )}
                
                {localUser.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span data-testid={`text-phone-${localUser.id}`}>{localUser.phone}</span>
                  </div>
                )}
                
                {localUser.church && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate" data-testid={`text-church-${localUser.id}`}>{localUser.church}</span>
                  </div>
                )}
                
                {localUser.address && (
                  <div className="flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm text-muted-foreground break-words"
                        data-testid={`text-address-${localUser.id}`}
                      >
                        {localUser.address}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Informações de Gamificação - Monte e Pontuação */}
                {localUser.points !== undefined && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">{localUser.points || 0} pts</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <MountIcon iconType={getLevelIcon(localUser.points || 0)} className="h-3 w-3" />
                      <span className="text-xs font-medium" title={getLevelName(localUser.points || 0)}>
                        {getMountName(localUser.points || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Indicador de Estado Espiritual - Apenas para admins */}
                {currentUser?.role === 'admin' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      <span className="text-xs font-medium">Check-in Espiritual:</span>
                    </div>
                    
                    {userSpiritual ? (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getSpiritualEmoji(userSpiritual.emotionalScore)?.emoji}</span>
                        <Badge className={`${getSpiritualEmoji(userSpiritual.emotionalScore)?.color} text-xs px-2 py-0`}>
                          {getSpiritualEmoji(userSpiritual.emotionalScore)?.label}
                        </Badge>
                        
                        {userSpiritual.prayerRequest && (
                          <div className="flex items-center gap-1 ml-2">
                            <MessageCircle className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">Pedido de oração</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-0">
                        Não realizado
                      </Badge>
                    )}
                  </div>
                )}
                

              </div>
              
              {/* Informações de visita */}
              {isVisited() && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Visitado</span>
                  </div>
                  {getVisitCount() > 1 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-700">
                      {getVisitCount()} visitas
                    </Badge>
                  )}
                  {getLastVisitDate() && (
                    <span className="text-muted-foreground">
                      Última: {formatVisitDate(getLastVisitDate()!)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {/* Primeira linha - Botões principais */}
              <div className="flex items-center gap-1 flex-wrap">
                {/* Botão de Marcar Visita */}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isMarkingVisit}
                  className={`h-8 w-8 p-0 transition-all duration-200 ${
                    isVisited() 
                      ? "text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border border-green-200" 
                      : "text-blue-600 hover:text-blue-700"
                  } ${isMarkingVisit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisitButtonClick();
                  }}
                  title={isVisited() ? "🖱️ Clique: nova visita | ⚡ Duplo clique: zerar contador" : "Marcar visita como realizada"}
                >
                  {isMarkingVisit ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : isVisited() ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>

                {/* Indicador discreto de múltiplas visitas - clicável para ver histórico */}
                {getVisitCount() > 1 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1 py-0 bg-green-100 text-green-700 border border-green-200 cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadVisitHistory(localUser.id);
                      setShowVisitHistory(true);
                    }}
                    title="Clique para ver histórico de visitas"
                  >
                    {getVisitCount()}x
                  </Badge>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.();
                  }}
                  title="Visualizar detalhes"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Segunda linha - Botões secundários */}
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleVisit?.();
                  }}
                  title="Agendar visita futura"
                >
                  <Calendar className="h-4 w-4" />
                </Button>

                {isValidWhatsAppNumber(localUser.phone) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsApp();
                    }}
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}



                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  title="Excluir usuário"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

            </div>
          )}
        </div>
      </CardContent>
      
      {/* Modal para marcar visita */}
      <MarkVisitModal
        isOpen={showMarkVisitModal}
        onClose={() => setShowMarkVisitModal(false)}
        onConfirm={handleConfirmVisit}
        userName={localUser.name}
        isLoading={isMarkingVisit}
        visitCount={getVisitCount()}
        lastVisitDate={getLastVisitDate()}
      />

      {/* Visualização ampliada da foto (admin) */}
      <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Foto de {localUser.name}</DialogTitle>
            <DialogDescription>
              Visualização ampliada da foto de perfil.
            </DialogDescription>
          </DialogHeader>
          {getPhotoUrl() ? (
            <img
              src={getPhotoUrl()}
              alt={`Foto de ${localUser.name}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-md"
            />
          ) : (
            <div className="text-sm text-muted-foreground">Este usuário ainda não possui foto de perfil.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de histórico de visitas */}
      <Dialog open={showVisitHistory} onOpenChange={setShowVisitHistory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Histórico de Visitas - {localUser.name}
            </DialogTitle>
            <DialogDescription>
              Todas as visitas realizadas para este usuário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {visitHistory.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {visitHistory.map((visit, index) => (
                  <div key={visit.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Visita #{visitHistory.length - index}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatVisitDate(visit.visit_date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma visita registrada</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total: {visitHistory.length} visita{visitHistory.length !== 1 ? 's' : ''}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowVisitHistory(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </Card>
  );
};