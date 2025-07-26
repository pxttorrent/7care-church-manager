import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';

const mockCalls = [
  {
    id: 1,
    title: "Reunião de Liderança",
    participants: ["Pastor João", "Maria Santos", "Carlos Silva"],
    status: "active",
    startTime: "19:00",
    duration: "45 min"
  },
  {
    id: 2,
    title: "Estudo de Célula",
    participants: ["Ana Costa", "Pedro Lima"],
    status: "scheduled",
    startTime: "20:00",
    duration: "60 min"
  }
];

const VideoCall = () => {
  const { user } = useAuth();
  const [calls] = useState(mockCalls);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const startCall = () => {
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsMuted(false);
    setIsVideoOn(true);
  };

  if (isInCall) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="h-full bg-black text-white flex flex-col">
          {/* Video Area */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Reunião de Liderança</h2>
                    <p className="text-sm opacity-75">3 participantes</p>
                  </div>
                  <Badge className="bg-red-500">AO VIVO</Badge>
                </div>
              </div>
            </div>
            
            {/* Main Video */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold mb-4">
                  PJ
                </div>
                <p className="text-lg">Pastor João</p>
              </div>
            </div>

            {/* Participant Videos */}
            <div className="absolute bottom-20 right-4 space-y-2">
              <div className="w-20 h-28 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                  MS
                </div>
              </div>
              <div className="w-20 h-28 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                  {user?.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-black/80 backdrop-blur-sm">
            <div className="flex justify-center items-center gap-6">
              <Button
                size="lg"
                variant={isMuted ? "destructive" : "secondary"}
                className="rounded-full w-14 h-14"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16"
                onClick={endCall}
              >
                <Phone className="w-6 h-6" />
              </Button>

              <Button
                size="lg"
                variant={isVideoOn ? "secondary" : "destructive"}
                className="rounded-full w-14 h-14"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Videochamadas</h1>
            <p className="text-muted-foreground">Conecte-se com sua comunidade</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Nova
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={startCall}
          >
            <CardContent className="p-4 text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Iniciar Chamada</p>
              <p className="text-xs text-muted-foreground">Reunião rápida</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="font-medium">Agendar</p>
              <p className="text-xs text-muted-foreground">Para depois</p>
            </CardContent>
          </Card>
        </div>

        {/* Active/Scheduled Calls */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Suas Chamadas</h2>
          
          {calls.map((call) => (
            <Card key={call.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{call.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {call.participants.length} participantes
                    </div>
                  </div>
                  <Badge 
                    className={call.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}
                  >
                    {call.status === 'active' ? 'Ativa' : 'Agendada'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                  <span>{call.startTime}</span>
                  <span>{call.duration}</span>
                </div>

                <div className="flex gap-2">
                  {call.status === 'active' ? (
                    <Button 
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                      onClick={startCall}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1">
                        Editar
                      </Button>
                      <Button className="flex-1 bg-gradient-primary hover:opacity-90">
                        Iniciar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Calls */}
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle>Chamadas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Estudo de Jovens", time: "Ontem, 19:00", duration: "1h 15min" },
              { name: "Reunião de Oração", time: "Terça, 20:00", duration: "45min" },
              { name: "Aconselhamento", time: "Segunda, 14:30", duration: "30min" }
            ].map((call, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{call.name}</p>
                  <p className="text-sm text-muted-foreground">{call.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{call.duration}</p>
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default VideoCall;