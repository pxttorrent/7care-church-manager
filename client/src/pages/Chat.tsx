import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';

interface ChatUser {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Conversation {
  id: number;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  participants: ChatUser[];
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: number;
    senderName: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
}

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowNewChat(false);
  };

  const handleNewChat = () => {
    setShowNewChat(true);
    setSelectedConversation(null);
  };

  const getChatUser = (conversation: Conversation): ChatUser | undefined => {
    if (conversation.type === 'direct') {
      return conversation.participants[0];
    }
    return undefined;
  };

  return (
    <MobileLayout>
      <div className="p-4 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <ChatSidebar
              selectedConversationId={selectedConversation?.id}
              onConversationSelect={handleConversationSelect}
              onNewChat={handleNewChat}
            />
          </div>

          {/* Chat Interface */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <ChatInterface
                conversationId={selectedConversation.id}
                chatUser={getChatUser(selectedConversation)}
                isGroup={selectedConversation.type === 'group'}
                groupName={selectedConversation.type === 'group' ? selectedConversation.name : undefined}
                groupMembers={selectedConversation.type === 'group' ? selectedConversation.participants : undefined}
              />
            ) : showNewChat ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nova Conversa</h3>
                  <p className="text-muted-foreground">
                    Funcionalidade em desenvolvimento. Em breve você poderá iniciar novas conversas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa da lista para começar a conversar.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}