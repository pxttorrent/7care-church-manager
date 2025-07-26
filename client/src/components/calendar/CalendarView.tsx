import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin,
  Users,
  Filter,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Culto da Manhã",
    description: "Culto principal de sábado",
    date: "2025-01-26",
    time: "09:00",
    duration: 120,
    location: "Igreja Central - Auditório Principal",
    type: "culto",
    attendees: 85,
    maxAttendees: 120,
    status: "confirmed",
    isRecurring: true,
    organizer: "Pastor João Silva"
  },
  {
    id: 2,
    title: "Escola Sabatina",
    description: "Estudo da lição",
    date: "2025-01-26",
    time: "08:00",
    duration: 60,
    location: "Igreja Central - Sala 1",
    type: "escola-sabatina",
    attendees: 45,
    maxAttendees: 60,
    status: "confirmed",
    isRecurring: true,
    organizer: "Maria Santos"
  },
  {
    id: 3,
    title: "Reunião de Jovens",
    date: "2025-01-27",
    time: "19:00",
    duration: 90,
    location: "Igreja Central - Sala dos Jovens",
    type: "jovens",
    attendees: 25,
    maxAttendees: 40,
    status: "scheduled",
    organizer: "Carlos Oliveira"
  },
  {
    id: 4,
    title: "Estudo Bíblico - Grupo 1",
    date: "2025-01-28",
    time: "19:30",
    duration: 60,
    location: "Casa da Família Silva",
    type: "estudo",
    attendees: 8,
    maxAttendees: 12,
    status: "confirmed",
    organizer: "Ana Costa"
  },
  {
    id: 5,
    title: "Reunião do Deaconato",
    date: "2025-01-29",
    time: "20:00",
    duration: 90,
    location: "Igreja Central - Sala de Reuniões",
    type: "deaconato",
    attendees: 6,
    maxAttendees: 8,
    status: "scheduled",
    organizer: "Pedro Almeida"
  }
];

const eventTypeColors = {
  culto: "bg-purple-100 text-purple-800 border-purple-200",
  "escola-sabatina": "bg-blue-100 text-blue-800 border-blue-200",
  jovens: "bg-green-100 text-green-800 border-green-200",
  deaconato: "bg-orange-100 text-orange-800 border-orange-200",
  reuniao: "bg-gray-100 text-gray-800 border-gray-200",
  estudo: "bg-yellow-100 text-yellow-800 border-yellow-200",
  outro: "bg-pink-100 text-pink-800 border-pink-200"
};

const eventTypeLabels = {
  culto: "Culto",
  "escola-sabatina": "Escola Sabatina",
  jovens: "Jovens",
  deaconato: "Deaconato",
  reuniao: "Reunião",
  estudo: "Estudo Bíblico",
  outro: "Outro"
};

interface CalendarViewProps {
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: () => void;
  view?: 'month' | 'week' | 'day';
}

export const CalendarView = ({ onEventClick, onNewEvent, view = 'week' }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<string>('');

  const getDaysInWeek = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockEvents.filter(event => {
      const matchesDate = event.date === dateStr;
      const matchesType = !selectedType || event.type === selectedType;
      return matchesDate && matchesType;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const weekDays = getDaysInWeek(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  const filteredEvents = selectedType 
    ? mockEvents.filter(event => event.type === selectedType)
    : mockEvents;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              data-testid="button-prev-week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[140px] text-center" data-testid="text-week-range">
              {formatWeekRange()}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              data-testid="button-next-week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            data-testid="button-export-calendar"
          >
            <Download className="h-4 w-4" />
          </Button>
          {onNewEvent && (
            <Button
              size="sm"
              onClick={onNewEvent}
              data-testid="button-new-event"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo Evento
            </Button>
          )}
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('')}
          data-testid="filter-all"
        >
          Todos ({mockEvents.length})
        </Button>
        {Object.entries(eventTypeLabels).map(([type, label]) => {
          const count = mockEvents.filter(e => e.type === type).length;
          if (count === 0) return null;
          
          return (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              data-testid={`filter-${type}`}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, index) => {
              const isToday = day.getTime() === today.getTime();
              const dayEvents = getEventsForDate(day);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "p-3 border-r last:border-r-0 min-h-[120px]",
                    isToday && "bg-primary/5"
                  )}
                  data-testid={`day-${day.toISOString().split('T')[0]}`}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs text-muted-foreground font-medium">
                      {getDayName(day)}
                    </div>
                    <div className={cn(
                      "text-sm font-semibold",
                      isToday && "text-primary"
                    )}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity",
                          eventTypeColors[event.type]
                        )}
                        onClick={() => onEventClick?.(event)}
                        data-testid={`event-${event.id}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEvents
              .filter(event => new Date(event.date + 'T' + event.time) >= new Date())
              .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
              .slice(0, 3)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                  data-testid={`upcoming-event-${event.id}`}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full mt-1.5",
                    eventTypeColors[event.type].split(' ')[0].replace('bg-', 'bg-')
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.attendees !== undefined && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees}/{event.maxAttendees} pessoas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="stat-total-events">
                  {filteredEvents.length}
                </div>
                <div className="text-xs text-muted-foreground">Total de Eventos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="stat-confirmed-events">
                  {filteredEvents.filter(e => e.status === 'confirmed').length}
                </div>
                <div className="text-xs text-muted-foreground">Confirmados</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Participação</div>
              <div className="space-y-1">
                {Object.entries(eventTypeLabels).map(([type, label]) => {
                  const typeEvents = filteredEvents.filter(e => e.type === type);
                  if (typeEvents.length === 0) return null;
                  
                  const totalAttendees = typeEvents.reduce((sum, e) => sum + (e.attendees || 0), 0);
                  const avgAttendees = Math.round(totalAttendees / typeEvents.length);
                  
                  return (
                    <div key={type} className="flex justify-between text-xs">
                      <span>{label}</span>
                      <span className="font-medium">{avgAttendees} pessoas/evento</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};