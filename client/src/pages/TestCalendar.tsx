import React from 'react';
import { SimpleCalendarView } from '../components/calendar/SimpleCalendarView';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  location?: string;
  type: string;
  capacity?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  createdBy?: number;
  churchId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function TestCalendar() {
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendário de Teste
          </h1>
          <p className="text-gray-600">
            Versão simplificada e funcional do calendário
          </p>
        </div>

        {/* Calendário */}
        <SimpleCalendarView onEventClick={handleEventClick} />

        {/* Modal de detalhes do evento */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {selectedEvent.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedEvent.description && (
                  <p className="text-gray-600">{selectedEvent.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(selectedEvent.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  {selectedEvent.endDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Até: {new Date(selectedEvent.endDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedEvent.location}
                    </div>
                  )}
                  
                  {selectedEvent.capacity && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Capacidade: {selectedEvent.capacity} pessoas
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedEvent(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
