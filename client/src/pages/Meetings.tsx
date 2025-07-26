import { useState } from 'react';
import { Calendar, Clock, User, Plus, Check, X, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';

const mockMeetings = [
  {
    id: 1,
    title: "Estudo Bíblico",
    date: "2024-12-23",
    time: "19:30",
    requester: "Maria Santos",
    status: "pending",
    type: "study",
    location: "Online",
    description: "Estudo sobre o livro de Romanos"
  },
  {
    id: 2,
    title: "Aconselhamento",
    date: "2024-12-24",
    time: "15:00",
    requester: "João Silva",
    status: "approved",
    type: "counseling",
    location: "Igreja Central",
    description: "Orientação espiritual"
  },
  {
    id: 3,
    title: "Evangelismo",
    date: "2024-12-25",
    time: "14:00",
    requester: "Ana Costa",
    status: "rejected",
    type: "evangelism",
    location: "Praça Central",
    description: "Ação evangelística no centro"
  }
];

const statusColors = {
  pending: "bg-yellow-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white"
};

const statusLabels = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado"
};

const typeLabels = {
  study: "Estudo",
  counseling: "Aconselhamento",
  evangelism: "Evangelismo",
  meeting: "Reunião"
};

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState(mockMeetings);
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  const handleApprove = (id: number) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === id ? { ...meeting, status: "approved" } : meeting
    ));
  };

  const handleReject = (id: number) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === id ? { ...meeting, status: "rejected" } : meeting
    ));
  };

  const canManageMeetings = user?.role === 'admin' || user?.role === 'missionary';

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie reuniões e estudos</p>
          </div>
          <Button 
            onClick={() => setShowNewMeeting(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {meetings.filter(m => m.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {meetings.filter(m => m.status === 'approved').length}
              </div>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {meetings.length}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{meeting.description}</p>
                    </div>
                    <Badge className={statusColors[meeting.status as keyof typeof statusColors]}>
                      {statusLabels[meeting.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {meeting.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {meeting.requester}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {meeting.location}
                    </div>
                  </div>

                  {canManageMeetings && meeting.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleReject(meeting.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Recusar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        onClick={() => handleApprove(meeting.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick New Meeting Form */}
        {showNewMeeting && (
          <Card className="shadow-divine border-primary">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Novo Agendamento
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewMeeting(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">Estudo Bíblico</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <User className="w-6 h-6 mb-2" />
                  <span className="text-sm">Aconselhamento</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <MapPin className="w-6 h-6 mb-2" />
                  <span className="text-sm">Evangelismo</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <Clock className="w-6 h-6 mb-2" />
                  <span className="text-sm">Reunião</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default Meetings;