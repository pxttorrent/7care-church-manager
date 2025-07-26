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
    title: "Estudo Bíblico",
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
  },
  {
    id: 6,
    title: "Culto da Manhã",
    date: "2025-02-02",
    time: "09:00",
    duration: 120,
    location: "Igreja Central - Auditório Principal",
    type: "culto",
    attendees: 90,
    maxAttendees: 120,
    status: "confirmed",
    isRecurring: true,
    organizer: "Pastor João Silva"
  },
  {
    id: 7,
    title: "Escola Sabatina",
    date: "2025-02-02",
    time: "08:00",
    duration: 60,
    location: "Igreja Central - Sala 1",
    type: "escola-sabatina",
    attendees: 50,
    maxAttendees: 60,
    status: "confirmed",
    isRecurring: true,
    organizer: "Maria Santos"
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

interface MonthlyCalendarViewProps {
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: () => void;
  onDateClick?: (date: string) => void;
}

export function MonthlyCalendarView({ onEventClick, onNewEvent, onDateClick }: MonthlyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredEvents = mockEvents.filter(event => {
    if (selectedFilter === 'all') return true;
    return event.type === selectedFilter;
  });

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventsByDate = (date: string) => {
    return filteredEvents.filter(event => event.date === date);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateString);
    }
    
    return days;
  };

  const monthDays = getDaysInMonth(currentDate);
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const isToday = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const handleDateClick = (dateString: string | null) => {
    if (!dateString) return;
    setSelectedDate(dateString);
    onDateClick?.(dateString);
  };

  const getEventsForDay = (dateString: string | null) => {
    if (!dateString) return [];
    return getEventsByDate(dateString);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                data-testid="previous-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                data-testid="next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                onClick={onNewEvent}
                className="bg-primary hover:bg-primary-dark"
                data-testid="new-event"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Evento
              </Button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                data-testid="filter-all"
              >
                Todos
              </Button>
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <Button
                  key={type}
                  variant={selectedFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(type)}
                  data-testid={`filter-${type}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Calendar Grid */}
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground border-b"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {monthDays.map((dateString, index) => {
              const dayEvents = getEventsForDay(dateString);
              const isCurrentDay = isToday(dateString);
              const isSelected = selectedDate === dateString;

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] p-1 border border-border cursor-pointer hover:bg-muted/50 transition-colors",
                    isCurrentDay && "bg-primary/10 border-primary",
                    isSelected && "bg-primary/20",
                    !dateString && "bg-muted/20 cursor-not-allowed"
                  )}
                  onClick={() => handleDateClick(dateString)}
                  data-testid={dateString ? `calendar-day-${dateString}` : `empty-day-${index}`}
                >
                  {dateString && (
                    <>
                      {/* Day number */}
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isCurrentDay && "text-primary font-bold"
                      )}>
                        {parseInt(dateString.split('-')[2])}
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs p-1 rounded border cursor-pointer hover:opacity-80",
                              eventTypeColors[event.type]
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick?.(event);
                            }}
                            data-testid={`event-${event.id}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-75">
                              {formatTime(event.time)}
                            </div>
                          </div>
                        ))}
                        
                        {/* Show "+X more" if there are more events */}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Eventos do dia {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForDay(selectedDate).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento neste dia</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={onNewEvent}
                    data-testid="add-event-selected-date"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Evento
                  </Button>
                </div>
              ) : (
                getEventsForDay(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onEventClick?.(event)}
                    data-testid={`detailed-event-${event.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        {event.description && (
                          <p className="text-muted-foreground mt-1">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(event.time)} ({event.duration}min)</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.attendees && event.maxAttendees && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees}/{event.maxAttendees}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Badge className={eventTypeColors[event.type]}>
                        {eventTypeLabels[event.type]}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}