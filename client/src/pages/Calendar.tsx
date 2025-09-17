import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, Upload, Trash2, Cake } from 'lucide-react';
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
import { ImportExcelModal } from '@/components/calendar/ImportExcelModal';
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showBirthdays, setShowBirthdays] = useState(false);

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
    const handleImportSuccess = (event: CustomEvent) => {
      if (event.detail && event.detail.type === 'calendar-events') {
        console.log(`📅 Importação de eventos bem-sucedida: ${event.detail.count} eventos importados`);
        // A data da última importação será atualizada automaticamente pelo Settings
      }
    };

    // Adicionar listener para o evento de importação bem-sucedida
    window.addEventListener('import-success', handleImportSuccess as EventListener);

    // Cleanup do listener
    return () => {
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
    console.log('Deleting event:', eventId);
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

  const handleImportComplete = () => {
    // Invalidar cache e recarregar eventos após importação
    queryClient.invalidateQueries({ queryKey: ['events'] });
    toast({
      title: "Agenda atualizada",
      description: "Os eventos foram importados e a agenda foi atualizada.",
    });
  };

  const handleClearAllEvents = async () => {
    const confirmed = window.confirm(
      "⚠️ ATENÇÃO: Esta ação irá excluir TODOS os eventos da agenda permanentemente!\n\n" +
      "Isso inclui:\n" +
      "• Todos os eventos criados\n" +
      "• Todos os eventos importados\n" +
      "• Todos os tipos de eventos\n\n" +
      "Esta ação NÃO PODE SER DESFEITA!\n\n" +
      "Tem certeza que deseja continuar?"
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "ÚLTIMA CONFIRMAÇÃO:\n\n" +
      "Você tem ABSOLUTA CERTEZA que deseja excluir TODOS os eventos da agenda?\n\n" +
      "Digite 'CONFIRMAR' no próximo prompt para prosseguir."
    );

    if (!doubleConfirm) return;

    const finalConfirm = prompt(
      "Para confirmar a exclusão de TODOS os eventos, digite exatamente: CONFIRMAR"
    );

    if (finalConfirm !== "CONFIRMAR") {
      toast({
        title: "Operação cancelada",
        description: "A limpeza dos eventos foi cancelada.",
      });
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        // Invalidar cache e recarregar eventos
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['events', user?.role] });
        toast({
          title: "Eventos removidos",
          description: result.message || "Todos os eventos foram removidos com sucesso.",
        });
      } else {
        throw new Error(result.error || 'Falha ao limpar eventos');
      }
      
    } catch (error) {
      console.error('Clear events error:', error);
      toast({
        title: "Erro ao limpar eventos",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
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
          </div>

          {/* Ações Administrativas */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground mr-2">Ações:</span>
              
              
              <Button 
                onClick={() => setShowImportModal(true)} 
                variant="outline" 
                size="sm" 
                className="h-8"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Excel
              </Button>
              
              <Button 
                onClick={handleClearAllEvents} 
                variant="destructive" 
                size="sm" 
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Eventos
              </Button>
            </div>
          )}
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

        {/* Import Excel Modal */}
        <ImportExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />


      </div>
    </MobileLayout>
  );
}