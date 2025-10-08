import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, Send, RefreshCw, Users, Check, AlertCircle,
  TrendingUp, Zap
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Service Worker agora atualiza automaticamente via main.tsx

export default function PushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('general');
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>('all');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    loadUsers();
    loadSubscriptions();
  }, [user]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return;
      const data = await res.json();
      setUsersList(data.users || data || []);
    } catch {}
  };

  const loadSubscriptions = async () => {
    try {
      const res = await fetch('/api/push/subscriptions');
      if (!res.ok) return;
      const data = await res.json();
      setSubscriptionsList(data.subscriptions || data || []);
    } catch {}
  };

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        userId: selectedUserId === 'all' ? null : Number(selectedUserId)
      };

      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar notificação');
      }

      const data = await res.json();

      toast({
        title: "🎉 Notificação enviada!",
        description: `Enviada para ${data.sentTo || subscriptionsList.length} usuário(s)`
      });

      // Limpar formulário
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationType('general');
      setSelectedUserId('all');
      setShowNotificationModal(false);

    } catch (e) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
              <p className="text-sm text-gray-600">Esta página é exclusiva para administradores.</p>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
        {/* Header com gradiente */}
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Notificações Push</h1>
            </div>
            <p className="text-blue-100">Envie notificações para todos os usuários</p>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscriptions Ativas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{subscriptionsList.length}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-xl">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Cadastrados</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{usersList.length}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Cobertura</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {usersList.length > 0 ? Math.round((subscriptionsList.length / usersList.length) * 100) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-purple-100 rounded-xl">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => setShowNotificationModal(true)} 
            size="lg"
            className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
          >
            <Bell className="h-6 w-6 mr-3" />
            Nova Notificação
          </Button>
          <Button 
            onClick={loadSubscriptions} 
            variant="outline" 
            size="lg"
            className="h-16 border-2 hover:bg-gray-50 transition-all duration-300 text-lg font-semibold"
          >
            <RefreshCw className="h-6 w-6 mr-3" />
            Atualizar Lista
          </Button>
        </div>

        {/* Lista de subscriptions */}
        {subscriptionsList.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Subscriptions Ativas ({subscriptionsList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subscriptionsList.map((subscription, index) => (
                  <div 
                    key={subscription.id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {subscription.user_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{subscription.user_name}</div>
                        <div className="text-xs text-gray-500">{subscription.user_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-400">
                        {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de envio */}
        <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bell className="h-6 w-6 text-blue-600" />
                Nova Notificação
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Título */}
              <div>
                <Label className="text-sm font-semibold">Título da Notificação</Label>
                <Input 
                  value={notificationTitle} 
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Ex: Novo evento esta semana!"
                  className="mt-1.5"
                />
              </div>

              {/* Mensagem */}
              <div>
                <Label className="text-sm font-semibold">Mensagem</Label>
                <Textarea 
                  value={notificationMessage} 
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              {/* Tipo e destinatário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Tipo</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">📢 Geral</SelectItem>
                      <SelectItem value="announcement">📣 Anúncio</SelectItem>
                      <SelectItem value="reminder">⏰ Lembrete</SelectItem>
                      <SelectItem value="urgent">🚨 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Destinatário</Label>
                  <Select
                    value={String(selectedUserId)}
                    onValueChange={(val) => setSelectedUserId(val === 'all' ? 'all' : Number(val))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">👥 Todos ({subscriptionsList.length})</SelectItem>
                      {usersList.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNotificationModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={sendNotification}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Notificação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
