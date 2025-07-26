import { useState } from 'react';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';

const mockChats = [
  {
    id: 1,
    name: "Pastor João Silva",
    lastMessage: "Que Deus te abençoe!",
    lastTime: "14:30",
    unreadCount: 2,
    avatar: "PJ",
    isOnline: true
  },
  {
    id: 2,
    name: "Maria Santos",
    lastMessage: "Confirmo presença na reunião",
    lastTime: "13:45",
    unreadCount: 0,
    avatar: "MS",
    isOnline: true
  },
  {
    id: 3,
    name: "Grupo Jovens",
    lastMessage: "Vamos nos encontrar às 19h",
    lastTime: "12:20",
    unreadCount: 5,
    avatar: "GJ",
    isOnline: false,
    isGroup: true
  },
  {
    id: 4,
    name: "Carlos Oliveira", 
    lastMessage: "Obrigado pela oração",
    lastTime: "11:15",
    unreadCount: 0,
    avatar: "CO",
    isOnline: false
  }
];

const mockMessages = [
  {
    id: 1,
    senderId: 2,
    senderName: "Maria Santos",
    content: "Olá! Como você está?",
    timestamp: "14:25",
    isOwn: false
  },
  {
    id: 2,
    senderId: 1,
    senderName: "Você",
    content: "Oi Maria! Estou bem, obrigado. E você?",
    timestamp: "14:26",
    isOwn: true
  },
  {
    id: 3,
    senderId: 2,
    senderName: "Maria Santos", 
    content: "Estou ótima! Você vai participar da reunião amanhã?",
    timestamp: "14:27",
    isOwn: false
  },
  {
    id: 4,
    senderId: 1,
    senderName: "Você",
    content: "Sim, confirmo presença. Que horas mesmo?",
    timestamp: "14:28",
    isOwn: true
  },
  {
    id: 5,
    senderId: 2,
    senderName: "Maria Santos",
    content: "Às 19h no salão principal. Confirmo presença na reunião",
    timestamp: "14:30",
    isOwn: false
  }
];

const Chat = () => {
  const { user } = useAuth();
  const [chats] = useState(mockChats);
  const [messages] = useState(mockMessages);
  const [selectedChat, setSelectedChat] = useState<number | null>(2);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedChatData = chats.find(chat => chat.id === selectedChat);
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MobileLayout>
      <div className="h-full flex flex-col">
        {!selectedChat ? (
          // Chat List View
          <div className="flex-1 p-4 space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Chat</h1>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <Card 
                  key={chat.id} 
                  className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                          {chat.avatar}
                        </div>
                        {chat.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold truncate">{chat.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{chat.lastTime}</span>
                            {chat.unreadCount > 0 && (
                              <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Chat Detail View
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-background border-b p-4 flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedChat(null)}
              >
                ←
              </Button>
              
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {selectedChatData?.avatar}
                </div>
                {selectedChatData?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="font-semibold">{selectedChatData?.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedChatData?.isOnline ? 'Online' : 'Visto por último hoje'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Chat;