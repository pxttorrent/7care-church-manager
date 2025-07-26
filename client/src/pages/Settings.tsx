import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Database,
  Mail,
  Phone,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MobileLayout } from '@/components/layout/MobileLayout';

interface SettingsData {
  profile: {
    name: string;
    email: string;
    phone: string;
    church: string;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    meetingReminders: boolean;
    messageAlerts: boolean;
    weeklyReport: boolean;
  };
  privacy: {
    profileVisible: boolean;
    contactInfoVisible: boolean;
    attendanceVisible: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'pt' | 'en' | 'es';
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  };
  church: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    meetingDays: string[];
  };
}

const initialSettings: SettingsData = {
  profile: {
    name: 'Pastor João Silva',
    email: 'admin@7care.com',
    phone: '(11) 99999-9999',
    church: 'Igreja Central'
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    meetingReminders: true,
    messageAlerts: true,
    weeklyReport: false
  },
  privacy: {
    profileVisible: true,
    contactInfoVisible: false,
    attendanceVisible: true
  },
  appearance: {
    theme: 'system',
    language: 'pt',
    dateFormat: 'dd/mm/yyyy'
  },
  church: {
    name: 'Igreja Adventista Central',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 3333-4444',
    email: 'contato@igrejacentral.org',
    website: 'www.igrejacentral.org',
    meetingDays: ['saturday', 'wednesday']
  }
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas aos valores padrão.",
    });
  };

  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <MobileLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="text-xs">Perfil</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notificações</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs">Privacidade</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs">Aparência</TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="church" className="text-xs">Igreja</TabsTrigger>
            )}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                      data-testid="input-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={settings.profile.phone}
                      onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="church">Igreja</Label>
                    <Input
                      id="church"
                      value={settings.profile.church}
                      onChange={(e) => updateSetting('profile', 'church', e.target.value)}
                      data-testid="input-church"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Notificações por email</div>
                    <div className="text-xs text-muted-foreground">Receba atualizações por email</div>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                    data-testid="switch-email-notifications"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Notificações push</div>
                    <div className="text-xs text-muted-foreground">Notificações no dispositivo</div>
                  </div>
                  <Switch
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushEnabled', checked)}
                    data-testid="switch-push-notifications"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Lembretes de reuniões</div>
                    <div className="text-xs text-muted-foreground">Avisos antes dos eventos</div>
                  </div>
                  <Switch
                    checked={settings.notifications.meetingReminders}
                    onCheckedChange={(checked) => updateSetting('notifications', 'meetingReminders', checked)}
                    data-testid="switch-meeting-reminders"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Alertas de mensagens</div>
                    <div className="text-xs text-muted-foreground">Notificações de novas mensagens</div>
                  </div>
                  <Switch
                    checked={settings.notifications.messageAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'messageAlerts', checked)}
                    data-testid="switch-message-alerts"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Relatório semanal</div>
                    <div className="text-xs text-muted-foreground">Resumo das atividades da semana</div>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReport}
                    onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReport', checked)}
                    data-testid="switch-weekly-report"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidade
                </CardTitle>
                <CardDescription>
                  Controle a visibilidade das suas informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Perfil visível</div>
                    <div className="text-xs text-muted-foreground">Outros membros podem ver seu perfil</div>
                  </div>
                  <Switch
                    checked={settings.privacy.profileVisible}
                    onCheckedChange={(checked) => updateSetting('privacy', 'profileVisible', checked)}
                    data-testid="switch-profile-visible"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Informações de contato</div>
                    <div className="text-xs text-muted-foreground">Mostrar telefone e email no perfil</div>
                  </div>
                  <Switch
                    checked={settings.privacy.contactInfoVisible}
                    onCheckedChange={(checked) => updateSetting('privacy', 'contactInfoVisible', checked)}
                    data-testid="switch-contact-visible"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Frequência visível</div>
                    <div className="text-xs text-muted-foreground">Mostrar sua frequência nos eventos</div>
                  </div>
                  <Switch
                    checked={settings.privacy.attendanceVisible}
                    onCheckedChange={(checked) => updateSetting('privacy', 'attendanceVisible', checked)}
                    data-testid="switch-attendance-visible"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a interface do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => updateSetting('appearance', 'theme', value)}
                  >
                    <SelectTrigger data-testid="select-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={(value: 'pt' | 'en' | 'es') => updateSetting('appearance', 'language', value)}
                  >
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de data</Label>
                  <Select
                    value={settings.appearance.dateFormat}
                    onValueChange={(value: any) => updateSetting('appearance', 'dateFormat', value)}
                  >
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                      <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Church Settings (Admin only) */}
          {user?.role === 'admin' && (
            <TabsContent value="church" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configurações da Igreja
                  </CardTitle>
                  <CardDescription>
                    Gerencie as informações da igreja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="church-name">Nome da Igreja</Label>
                      <Input
                        id="church-name"
                        value={settings.church.name}
                        onChange={(e) => updateSetting('church', 'name', e.target.value)}
                        data-testid="input-church-name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="church-phone">Telefone</Label>
                      <Input
                        id="church-phone"
                        value={settings.church.phone}
                        onChange={(e) => updateSetting('church', 'phone', e.target.value)}
                        data-testid="input-church-phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="church-email">Email</Label>
                      <Input
                        id="church-email"
                        type="email"
                        value={settings.church.email}
                        onChange={(e) => updateSetting('church', 'email', e.target.value)}
                        data-testid="input-church-email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="church-website">Website</Label>
                      <Input
                        id="church-website"
                        value={settings.church.website}
                        onChange={(e) => updateSetting('church', 'website', e.target.value)}
                        data-testid="input-church-website"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="church-address">Endereço</Label>
                    <Input
                      id="church-address"
                      value={settings.church.address}
                      onChange={(e) => updateSetting('church', 'address', e.target.value)}
                      data-testid="input-church-address"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex-1"
            data-testid="button-save"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
            data-testid="button-reset"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>

        {/* Data Management */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestão de Dados
              </CardTitle>
              <CardDescription>
                Backup e restauração de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" data-testid="button-export">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                
                <Button variant="outline" className="flex-1" data-testid="button-import">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
                
                <Button variant="destructive" className="flex-1" data-testid="button-delete-data">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}