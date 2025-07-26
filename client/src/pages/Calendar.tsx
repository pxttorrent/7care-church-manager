import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  location?: string;
  type: 'estudos' | 'reunioes' | 'visitas' | 'oracao' | 'chamadas' | 'cultos' | 'igreja-local' | 'asr-geral' | 'asr-administrativo' | 'regional-distrital';
  attendees?: number;
  maxAttendees?: number;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  isRecurring?: boolean;
  organizer: string;
}

const eventTypes = [
  { id: 'estudos', label: 'Estudos', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { id: 'reunioes', label: 'Reuniões', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { id: 'visitas', label: 'Visitas', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  { id: 'oracao', label: 'Oração', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { id: 'chamadas', label: 'Chamadas', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' },
  { id: 'cultos', label: 'Cultos', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
  { id: 'igreja-local', label: 'Igreja Local', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  { id: 'asr-geral', label: 'ASR Geral', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  { id: 'asr-administrativo', label: 'ASR Administrativo', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
  { id: 'regional-distrital', label: 'Regional/Distrital', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
];

export default function Calendar() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(eventTypes.map(type => type.id));

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

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (isCreatingEvent) {
      toast({
        title: "Evento criado",
        description: "O novo evento foi criado com sucesso.",
      });
    } else {
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
      });
    }
    // In a real app, this would save to the backend
    console.log('Saving event:', eventData);
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
    setActiveFilters(eventTypes.map(type => type.id));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filtros */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFilters.length < eventTypes.length && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-between px-2 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Todos
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Limpar
                </Button>
              </div>
              {eventTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={activeFilters.includes(type.id)}
                  onCheckedChange={(checked) => handleFilterChange(type.id, checked)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    <span>{type.label}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleNewEvent} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filtros Ativos */}
      {activeFilters.length > 0 && activeFilters.length < eventTypes.length && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {activeFilters.map(filterId => {
            const type = eventTypes.find(t => t.id === filterId);
            return type ? (
              <Badge key={filterId} variant="secondary" className={type.color}>
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
        eventTypes={eventTypes}
      />

      {/* Event Modal */}
      <EventModal
        event={selectedEvent || undefined}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        isEditing={isCreatingEvent}
        eventTypes={eventTypes}
      />
    </div>
  );
}