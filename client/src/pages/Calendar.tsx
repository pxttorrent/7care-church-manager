import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';
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
  type: 'culto' | 'escola-sabatina' | 'jovens' | 'deaconato' | 'reuniao' | 'estudo' | 'outro';
  attendees?: number;
  maxAttendees?: number;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  isRecurring?: boolean;
  organizer: string;
}

export default function Calendar() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
        </div>
      </div>

      {/* Calendar Component */}
      <MonthlyCalendarView 
        onEventClick={handleEventClick}
        onNewEvent={handleNewEvent}
      />

      {/* Event Modal */}
      <EventModal
        event={selectedEvent || undefined}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        isEditing={isCreatingEvent}
      />
    </div>
  );
}