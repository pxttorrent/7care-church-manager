import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings,
  Users,
  MessageCircle,
  Share2,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: number;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHost: boolean;
  isPresenter: boolean;
}

interface VideoCallProps {
  callId?: string;
  isHost?: boolean;
  onEndCall?: () => void;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
}

const mockParticipants: Participant[] = [
  {
    id: 1,
    name: 'Pastor João Silva',
    isMuted: false,
    isVideoOn: true,
    isHost: true,
    isPresenter: true
  },
  {
    id: 2,
    name: 'Maria Santos',
    isMuted: false,
    isVideoOn: true,
    isHost: false,
    isPresenter: false
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    isMuted: true,
    isVideoOn: false,
    isHost: false,
    isPresenter: false
  },
  {
    id: 4,
    name: 'Ana Costa',
    isMuted: false,
    isVideoOn: true,
    isHost: false,
    isPresenter: false
  }
];

export const VideoCall = ({ 
  callId = 'call-123', 
  isHost = false,
  onEndCall,
  onToggleAudio,
  onToggleVideo 
}: VideoCallProps) => {
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleAudio = () => {
    setIsAudioOn(prev => !prev);
    onToggleAudio?.();
  };

  const handleToggleVideo = () => {
    setIsVideoOn(prev => !prev);
    onToggleVideo?.();
  };

  const handleScreenShare = () => {
    setIsScreenSharing(prev => !prev);
  };

  const handleEndCall = () => {
    onEndCall?.();
  };

  const currentUser = participants.find(p => p.isHost === isHost) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== currentUser.id);
  const totalParticipants = participants.length;

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold" data-testid="call-title">
              Reunião da Liderança
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span data-testid="call-duration">{formatDuration(callDuration)}</span>
              <span>•</span>
              <span data-testid="participant-count">{totalParticipants} participantes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white border-white/30 hover:bg-white/10"
            data-testid="button-participants"
          >
            <Users className="h-4 w-4 mr-1" />
            {totalParticipants}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white border-white/30 hover:bg-white/10"
            data-testid="button-chat"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className={cn(
            "grid gap-4 h-full",
            totalParticipants === 1 ? "grid-cols-1" :
            totalParticipants === 2 ? "grid-cols-2" :
            totalParticipants <= 4 ? "grid-cols-2 grid-rows-2" :
            "grid-cols-3 grid-rows-2"
          )}>
            {/* Main/Current User Video */}
            <div className={cn(
              "relative bg-gray-900 rounded-lg overflow-hidden",
              totalParticipants === 2 ? "col-span-1" : "col-span-2 row-span-2"
            )}>
              {isVideoOn ? (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-4xl font-bold text-primary">
                    {currentUser.name.charAt(0)}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <VideoOff className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* User info overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="text-white font-medium" data-testid="current-user-name">
                  {currentUser.name} {isHost && '(Host)'}
                </span>
                {!isAudioOn && (
                  <MicOff className="h-4 w-4 text-red-500" />
                )}
                {currentUser.isPresenter && (
                  <Badge className="bg-primary text-white text-xs">
                    Apresentando
                  </Badge>
                )}
              </div>
            </div>

            {/* Other Participants */}
            {otherParticipants.slice(0, 5).map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                data-testid={`participant-${participant.id}`}
              >
                {participant.isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {participant.name.charAt(0)}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <VideoOff className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Participant info */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="text-white text-sm font-medium">
                    {participant.name}
                  </span>
                  {participant.isMuted && (
                    <MicOff className="h-3 w-3 text-red-500" />
                  )}
                  {participant.isHost && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-gray-900 border-l border-gray-700">
            {showParticipants && (
              <Card className="m-4 bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">
                    Participantes ({totalParticipants})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {participant.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">
                            {participant.name}
                          </div>
                          {participant.isHost && (
                            <div className="text-xs text-yellow-400">Host</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {participant.isMuted ? (
                          <MicOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4 text-green-500" />
                        )}
                        {participant.isVideoOn ? (
                          <Video className="h-4 w-4 text-green-500" />
                        ) : (
                          <VideoOff className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {showChat && (
              <Card className="m-4 bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">Chat da Reunião</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 text-sm">
                    Funcionalidade de chat em desenvolvimento
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            onClick={handleToggleAudio}
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-toggle-audio"
          >
            {isAudioOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            onClick={handleToggleVideo}
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-toggle-video"
          >
            {isVideoOn ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={handleScreenShare}
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-screen-share"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-share"
          >
            <Share2 className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-end-call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};