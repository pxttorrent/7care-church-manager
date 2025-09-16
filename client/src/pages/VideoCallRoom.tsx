import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCall } from '@/components/video/VideoCall';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Calendar,
  MapPin,
  Video,
  Phone
} from 'lucide-react';

interface MeetingInfo {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  organizer: string;
  participants: number;
  maxParticipants?: number;
  type: 'culto' | 'reuniao' | 'estudo' | 'outro';
  status: 'waiting' | 'active' | 'ended';
}

const mockMeetingInfo: MeetingInfo = {
  id: 'meeting-123',
  title: 'Reunião da Liderança',
  description: 'Reunião mensal para discussão de assuntos administrativos e planejamento',
  startTime: '2025-01-26T19:00:00',
  duration: 90,
  organizer: 'Pastor João Silva',
  participants: 8,
  maxParticipants: 15,
  type: 'reuniao',
  status: 'active'
};

export default function VideoCallRoom() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>(mockMeetingInfo);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    // In a real app, fetch meeting info by meetingId
    if (meetingId) {
      setMeetingInfo(prev => ({ ...prev, id: meetingId }));
    }
  }, [meetingId]);

  const handleJoinMeeting = () => {
    setHasJoined(true);
  };

  const handleLeaveMeeting = () => {
    navigate('/meetings');
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'culto':
        return 'bg-purple-100 text-purple-800';
      case 'reuniao':
        return 'bg-blue-100 text-blue-800';
      case 'estudo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'culto':
        return 'Culto';
      case 'reuniao':
        return 'Reunião';
      case 'estudo':
        return 'Estudo Bíblico';
      default:
        return 'Outro';
    }
  };

  if (hasJoined) {
    return (
      <VideoCall
        callId={meetingInfo.id}
        isHost={user?.role === 'admin' || user?.name === meetingInfo.organizer}
        onEndCall={handleLeaveMeeting}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/meetings')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          
          <Badge className={getTypeColor(meetingInfo.type)}>
            {getTypeLabel(meetingInfo.type)}
          </Badge>
          
          <Badge
            variant={meetingInfo.status === 'active' ? 'default' : 'secondary'}
            data-testid="badge-status"
          >
            {meetingInfo.status === 'active' ? 'Ativa' : 
             meetingInfo.status === 'waiting' ? 'Aguardando' : 'Finalizada'}
          </Badge>
        </div>

        {/* Meeting Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {meetingInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {meetingInfo.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(meetingInfo.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(meetingInfo.startTime)} - {meetingInfo.duration} min</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {meetingInfo.participants} participantes
                    {meetingInfo.maxParticipants && ` / ${meetingInfo.maxParticipants} máx`}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Organizado por:</span>
                  <div className="font-medium">{meetingInfo.organizer}</div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">ID da Reunião:</span>
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {meetingInfo.id}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participant List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes ({meetingInfo.participants})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Organizer */}
              <div className="flex items-center justify-between p-2 rounded bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {meetingInfo.organizer.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{meetingInfo.organizer}</div>
                    <div className="text-xs text-muted-foreground">Organizador</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Host</Badge>
              </div>
              
              {/* Other participants placeholder */}
              {Array.from({ length: meetingInfo.participants - 1 }, (_, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="text-sm">Participante {i + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Join Meeting */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Pronto para participar?</h3>
            <p className="text-sm text-muted-foreground">
              Clique no botão abaixo para entrar na reunião
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleJoinMeeting}
              className="bg-primary hover:bg-primary-dark"
              data-testid="button-join-meeting"
            >
              <Video className="h-5 w-5 mr-2" />
              Entrar na Reunião
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleJoinMeeting}
              data-testid="button-join-audio"
            >
              <Phone className="h-5 w-5 mr-2" />
              Entrar apenas com Áudio
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Certifique-se de que seu microfone e câmera estão funcionando
          </p>
        </div>
      </div>
    </div>
  );
}