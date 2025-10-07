import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, RefreshCw, Users } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';

export default function PushNotifications() {
  const { user } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('Aviso 7care');
  const [notificationMessage, setNotificationMessage] = useState('Olá! Esta é uma notificação de teste.');
  const [notificationType, setNotificationType] = useState('info');
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
    setLoading(true);
    try {
      const body: any = {
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        userId: selectedUserId === 'all' ? null : Number(selectedUserId)
      };
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao enviar notificação');
      }
      setShowNotificationModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <MobileLayout>
        <div className="p-4 text-center text-sm text-muted-foreground">Acesso restrito aos administradores.</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações Push
            </CardTitle>
            <CardDescription>Gerencie subscriptions e envie notificações personalizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subscriptions ativas:</span>
                    <span className="text-sm font-medium">{subscriptionsList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Usuários cadastrados:</span>
                    <span className="text-sm font-medium">{usersList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cobertura:</span>
                    <span className="text-sm font-medium">
                      {usersList.length > 0 ? Math.round((subscriptionsList.length / usersList.length) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Ações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setShowNotificationModal(true)} className="w-full" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Enviar Notificação
                  </Button>
                  <Button onClick={loadSubscriptions} variant="outline" className="w-full" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Lista
                  </Button>
                </CardContent>
              </Card>
            </div>

            {subscriptionsList.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Subscriptions Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {subscriptionsList.map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{subscription.user_name}</div>
                          <div className="text-xs text-muted-foreground">{subscription.user_email}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Enviar Notificação</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} />
              </div>
              <div>
                <Label>Mensagem</Label>
                <Input value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informativo</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destinatário</Label>
                <Select
                  value={String(selectedUserId)}
                  onValueChange={(val) => setSelectedUserId(val === 'all' ? 'all' : Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um destinatário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    {usersList.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowNotificationModal(false)}>Cancelar</Button>
                <Button onClick={sendNotification} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}



