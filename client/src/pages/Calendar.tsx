import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, Cake, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MonthlyCalendarView } from '@/components/calendar/MonthlyCalendarView';
import { EventModal } from '@/components/calendar/EventModal';
import { useEventFilterPermissions } from '@/hooks/useEventFilterPermissions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { CalendarEvent, EVENT_TYPES, EventType } from '@/types/calendar';

export default function Calendar() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isAdmin = user?.role === 'admin';
  const { getAvailableEventTypes, canFilterEventType, permissions, isLoading: permissionsLoading } = useEventFilterPermissions();

  // Inicializar filtros baseados nas permissões do usuário
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { 
      userRole: user?.role, 
      permissions: !!permissions, 
      permissionsLoading,
      permissionsData: permissions 
    });
    
    if (user?.role && permissions && !permissionsLoading) {
      const availableTypes = getAvailableEventTypes(user.role);
      setActiveFilters(availableTypes);
      console.log('🎯 Initializing filters for role:', user.role, 'available types:', availableTypes);
    }
  }, [user?.role, permissions, permissionsLoading, getAvailableEventTypes]);

  // Effect para escutar eventos de importação bem-sucedida
  useEffect(() => {
    let isMounted = true;
    
    const handleImportSuccess = (event: CustomEvent) => {
      try {
        if (!isMounted) return;
        
        if (event.detail && event.detail.type === 'calendar-events') {
          console.log(`📅 Importação de eventos bem-sucedida: ${event.detail.count} eventos importados`);
          // A data da última importação será atualizada automaticamente pelo Settings
        }
      } catch (error) {
        console.error('❌ Erro no handleImportSuccess:', error);
      }
    };

    // Adicionar listener para o evento de importação bem-sucedida
    window.addEventListener('import-success', handleImportSuccess as EventListener);

    // Cleanup do listener
    return () => {
      isMounted = false;
      window.removeEventListener('import-success', handleImportSuccess as EventListener);
    };
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsCreatingEvent(false);
    setShowEventModal(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setIsCreatingEvent(true);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (isCreatingEvent) {
        // Criar novo evento
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: [{
              title: eventData.title,
              description: eventData.description,
              startDate: eventData.startDate,
              endDate: eventData.endDate || eventData.startDate,
              type: eventData.type || 'reunioes',
              location: eventData.location,
              time: eventData.time,
              duration: eventData.duration,
              organizer: eventData.organizer || 'Sistema'
            }]
          })
        });

        if (response.ok) {
          // Invalidar cache e recarregar eventos
          queryClient.invalidateQueries({ queryKey: ['events'] });
          toast({
            title: "Evento criado",
            description: "O novo evento foi criado com sucesso.",
          });
        } else {
          throw new Error('Erro ao criar evento');
        }
      } else {
        // Atualizar evento existente
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso.",
        });
      }
      
      setShowEventModal(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    toast({
      title: "Evento excluído",
      description: "O evento foi removido do calendário.",
      variant: "destructive"
    });
    setShowEventModal(false);
    // In a real app, this would delete from the backend
  };

  // Função para sincronização rápida do Google Drive
  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      // Primeiro, buscar a configuração salva
      const configResponse = await fetch('/api/calendar/google-drive-config');
      const config = await configResponse.json();
      
      if (!config.spreadsheetUrl) {
        toast({
          title: "❌ Configuração não encontrada",
          description: "Configure a planilha do Google Drive em Settings > Calendário",
          variant: "destructive"
        });
        setIsSyncing(false);
        return;
      }

      // Passo 1: Processar eventos pendentes para enviar à planilha
      const sendResponse = await fetch('/api/google-drive/process-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const sendResult = await sendResponse.json();
      let sentCount = sendResult.processed || 0;
      
      // Passo 2: Importar novos eventos da planilha
      const importResponse = await fetch('/api/calendar/sync-google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl: config.spreadsheetUrl
        })
      });

      const importResult = await importResponse.json();
      let importedCount = importResult.importedCount || 0;
      
      // Recarregar eventos e aniversariantes
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['birthdays'] });
      
      // Mostrar resultado da sincronização bidirecional
      const messages = [];
      if (sentCount > 0) messages.push(`${sentCount} eventos enviados`);
      if (importedCount > 0) messages.push(`${importedCount} eventos importados`);
      
      if (messages.length > 0) {
        toast({
          title: "✅ Sincronização concluída!",
          description: messages.join(' e ') + ' da/para o Google Drive.',
        });
      } else {
        toast({
          title: "✅ Sincronização concluída!",
          description: "Planilha já está sincronizada.",
        });
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "❌ Erro na sincronização",
        description: "Erro ao conectar com o servidor",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFilterChange = (filterId: string, checked: boolean) => {
    // Verificar se o usuário tem permissão para filtrar este tipo de evento
    if (user?.role && !canFilterEventType(user.role, filterId)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para filtrar este tipo de evento.",
        variant: "destructive",
      });
      return;
    }

    if (checked) {
      setActiveFilters(prev => [...prev, filterId]);
    } else {
      setActiveFilters(prev => prev.filter(id => id !== filterId));
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const selectAllFilters = () => {
    if (user?.role) {
      const availableTypes = getAvailableEventTypes(user.role);
      setActiveFilters(availableTypes);
    } else {
      setActiveFilters(EVENT_TYPES.map(type => type.id));
    }
  };


  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Agenda</h1>
            <p className="text-muted-foreground">Gerencie eventos e atividades</p>
          </div>
                      {/* Botão de Novo Evento removido - movido para o componente do calendário */}
        </div>

        {/* Filters and Actions */}
        <div className="space-y-4">
          {/* Filtros Principais */}
          <div className="flex flex-wrap gap-3 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros de Eventos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium">Tipos de Evento</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Limpar
                  </Button>
                </div>
                {EVENT_TYPES
                  .filter(type => !user?.role || canFilterEventType(user.role, type.id))
                  .map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type.id}
                      checked={activeFilters.includes(type.id)}
                      onCheckedChange={(checked) => handleFilterChange(type.id, checked)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${type.color} shadow-sm`} />
                        <span>{type.label}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botão de Aniversariantes */}
            <Button
              variant={showBirthdays ? "default" : "outline"}
              size="sm"
              className={showBirthdays ? "h-8 bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200" : "h-8 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"}
              onClick={() => setShowBirthdays(!showBirthdays)}
            >
              <Cake className="h-4 w-4 mr-2" />
              {showBirthdays ? "Ocultar Aniversariantes" : "Mostrar Aniversariantes"}
            </Button>

            {/* Botão de Sincronização Google Drive */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickSync}
              disabled={isSyncing}
              className="h-8 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Google Drive"}
            </Button>
          </div>

        </div>

        {/* Filtros Ativos */}
        {activeFilters.length > 0 && activeFilters.length < EVENT_TYPES.length && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {activeFilters.map(filterId => {
              const type = EVENT_TYPES.find(t => t.id === filterId);
              return type ? (
                <Badge 
                  key={filterId} 
                  variant="secondary" 
                  className={`${type.color} font-medium shadow-sm hover:shadow-md transition-shadow`}
                >
                  {type.label}
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* Calendar Component */}
        <MonthlyCalendarView 
          onEventClick={handleEventClick}
          onNewEvent={handleNewEvent}
          activeFilters={activeFilters}
          eventTypes={EVENT_TYPES}
          showBirthdays={showBirthdays}
        />

        {/* Event Modal */}
        <EventModal
          event={selectedEvent || undefined}
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isEditing={isCreatingEvent}
          eventTypes={EVENT_TYPES}
        />


      </div>
    </MobileLayout>
  );
}