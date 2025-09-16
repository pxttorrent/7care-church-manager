import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Mock events data
const mockEvents = [
  {
    id: 1,
    title: "Culto Dominical",
    date: "2024-12-22",
    time: "19:00",
    type: "culto",
    location: "Santuário Principal",
    attendees: 250,
    description: "Culto de celebração e adoração"
  },
  {
    id: 2,
    title: "Estudo Bíblico - Jovens",
    date: "2024-12-23",
    time: "19:30",
    type: "estudo",
    location: "Sala 2",
    attendees: 35,
    description: "Estudo do livro de Romanos"
  },
  {
    id: 3,
    title: "Reunião de Oração",
    date: "2024-12-24",
    time: "20:00",
    type: "oracao",
    location: "Capela",
    attendees: 80,
    description: "Momento de intercessão e comunhão"
  },
  {
    id: 4,
    title: "Célula de Evangelismo",
    date: "2024-12-25",
    time: "14:00",
    type: "celula",
    location: "Casa da Família Silva",
    attendees: 15,
    description: "Evangelismo no bairro Vila Nova"
  }
];

const eventTypeColors = {
  culto: "bg-primary text-primary-foreground",
  estudo: "bg-secondary text-secondary-foreground",
  oracao: "bg-accent text-accent-foreground",
  celula: "bg-muted text-muted-foreground"
};

const eventTypeLabels = {
  culto: "Culto",
  estudo: "Estudo",
  oracao: "Oração",
  celula: "Célula"
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events] = useState(mockEvents);

  const filteredEvents = events.filter(event => event.date === selectedDate);

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      day: number;
      dateStr: string;
      hasEvents: boolean;
      isSelected: boolean;
      isToday: boolean;
    } | null> = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvents = events.some(event => event.date === dateStr);
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      days.push({
        day,
        dateStr,
        hasEvents,
        isSelected,
        isToday
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Agenda</h1>
            <p className="text-muted-foreground">Gerencie eventos e atividades da igreja</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 text-center text-sm cursor-pointer rounded-md transition-colors ${
                      day
                        ? `hover:bg-muted ${
                            day.isSelected
                              ? 'bg-primary text-primary-foreground'
                              : day.isToday
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground'
                          }`
                        : ''
                    }`}
                    onClick={() => day && setSelectedDate(day.dateStr)}
                  >
                    {day && (
                      <div className="relative">
                        <span>{day.day}</span>
                        {day.hasEvents && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle>
                Eventos do Dia
              </CardTitle>
              <CardDescription>
                {new Date(selectedDate).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <div key={event.id} className="p-4 border rounded-lg space-y-2 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge className={eventTypeColors[event.type as keyof typeof eventTypeColors]}>
                        {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {event.attendees} participantes
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento agendado para este dia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos programados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map(event => (
                <div key={event.id} className="p-4 border rounded-lg space-y-2 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm">{event.title}</h3>
                    <Badge className={`${eventTypeColors[event.type as keyof typeof eventTypeColors]} text-xs`}>
                      {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;