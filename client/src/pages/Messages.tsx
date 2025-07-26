import { useState } from 'react';
import { Send, Users, MessageSquare, Clock, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';

const mockMessages = [
  {
    id: 1,
    title: "Convite para Culto de Natal",
    content: "Queridos irmãos, convidamos todos para o culto especial de Natal...",
    recipients: ["Todos os membros"],
    sentBy: "Pastor João",
    sentAt: "2024-12-22 14:00",
    status: "sent",
    type: "broadcast"
  },
  {
    id: 2,
    title: "Lembrete: Reunião de Oração",
    content: "Lembramos sobre a reunião de oração amanhã às 20h...",
    recipients: ["Líderes"],
    sentBy: "Maria Santos", 
    sentAt: "2024-12-21 16:30",
    status: "sent",
    type: "group"
  },
  {
    id: 3,
    title: "Estudo Bíblico Cancelado",
    content: "O estudo bíblico de hoje foi cancelado devido...",
    recipients: ["Ana Costa", "Pedro Lima"],
    sentBy: "Maria Santos",
    sentAt: "2024-12-20 10:00", 
    status: "draft",
    type: "individual"
  }
];

const mockTemplates = [
  {
    id: 1,
    name: "Convite para Culto",
    content: "Querido(a) [NOME], convidamos você para participar do nosso culto no dia [DATA] às [HORA]. Será uma bênção tê-lo(a) conosco!"
  },
  {
    id: 2, 
    name: "Lembrete de Reunião",
    content: "Olá [NOME], lembramos sobre a reunião de [TIPO] marcada para [DATA] às [HORA]. Sua presença é importante!"
  },
  {
    id: 3,
    name: "Boas-vindas",
    content: "Seja bem-vindo(a) à nossa igreja, [NOME]! Estamos felizes em tê-lo(a) em nossa comunidade de fé."
  }
];

const Messages = () => {
  const { user } = useAuth();
  const [messages] = useState(mockMessages);
  const [templates] = useState(mockTemplates);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    recipients: 'all',
    scheduleTime: ''
  });

  const canSendMessages = user?.role === 'admin' || user?.role === 'missionary';

  const handleUseTemplate = (template: typeof mockTemplates[0]) => {
    setMessageForm(prev => ({
      ...prev,
      title: template.name,
      content: template.content
    }));
    setSelectedTemplate(template.id.toString());
  };

  const handleSendMessage = () => {
    console.log('Sending message:', messageForm);
    setShowNewMessage(false);
    setMessageForm({
      title: '',
      content: '',
      recipients: 'all',
      scheduleTime: ''
    });
    setSelectedTemplate('');
  };

  if (!canSendMessages) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas administradores e missionários podem enviar mensagens.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mensagens</h1>
            <p className="text-muted-foreground">Comunique-se com a igreja</p>
          </div>
          <Button 
            onClick={() => setShowNewMessage(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
              <p className="text-xs text-muted-foreground">Total enviadas</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.status === 'sent').length}
              </div>
              <p className="text-xs text-muted-foreground">Enviadas</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {messages.filter(m => m.status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </CardContent>
          </Card>
        </div>

        {/* New Message Form */}
        {showNewMessage && (
          <Card className="shadow-divine border-primary">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Nova Mensagem
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewMessage(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Templates */}
              <div>
                <Label>Templates</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="justify-start h-auto p-3"
                    >
                      <div className="text-left">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          {template.content.substring(0, 50)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={messageForm.title}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da mensagem"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Mensagem</Label>
                <Textarea
                  id="content"
                  value={messageForm.content}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Destinatários</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={messageForm.recipients === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageForm(prev => ({ ...prev, recipients: 'all' }))}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Todos
                  </Button>
                  <Button
                    variant={messageForm.recipients === 'members' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageForm(prev => ({ ...prev, recipients: 'members' }))}
                  >
                    Membros
                  </Button>
                  <Button
                    variant={messageForm.recipients === 'leaders' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageForm(prev => ({ ...prev, recipients: 'leaders' }))}
                  >
                    Líderes
                  </Button>
                  <Button
                    variant={messageForm.recipients === 'interested' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageForm(prev => ({ ...prev, recipients: 'interested' }))}
                  >
                    Interessados
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => console.log('Save as draft')}
                >
                  Salvar Rascunho
                </Button>
                <Button 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages History */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Mensagens Enviadas</h2>
          
          {messages.map((message) => (
            <Card key={message.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{message.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                    <Badge 
                      className={message.status === 'sent' ? 'bg-green-500' : 'bg-yellow-500'}
                    >
                      {message.status === 'sent' ? 'Enviada' : 'Rascunho'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {message.recipients.join(', ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(message.sentAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Enviado por: {message.sentBy}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Messages;