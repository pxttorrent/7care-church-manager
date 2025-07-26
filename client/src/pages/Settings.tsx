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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Eye,
  EyeOff
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
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'mapping' | 'validation' | 'importing' | 'complete'>('upload');
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importDuplicates, setImportDuplicates] = useState<any[]>([]);
  const [lastImportDate, setLastImportDate] = useState<string | null>('2025-01-20T14:30:00Z');

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
            <CardContent className="space-y-4">
              {/* Data da Última Importação */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Última Importação</p>
                    <p className="text-xs text-muted-foreground">
                      {lastImportDate ? (
                        `${new Date(lastImportDate).toLocaleDateString('pt-BR')} às ${new Date(lastImportDate).toLocaleTimeString('pt-BR')}`
                      ) : (
                        'Nenhuma importação realizada'
                      )}
                    </p>
                  </div>
                  {lastImportDate && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor((Date.now() - new Date(lastImportDate).getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" data-testid="button-export">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowImportModal(true)}
                  data-testid="button-import"
                >
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

      {/* Modal de Importação */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar Usuários
            </DialogTitle>
            <DialogDescription>
              Importe dados de usuários a partir de arquivos Excel (.xlsx) ou CSV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso da Importação</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={importStep === 'upload' ? 'text-primary font-medium' : ''}>
                  Upload
                </span>
                <span className={importStep === 'preview' ? 'text-primary font-medium' : ''}>
                  Preview
                </span>
                <span className={importStep === 'mapping' ? 'text-primary font-medium' : ''}>
                  Mapeamento
                </span>
                <span className={importStep === 'validation' ? 'text-primary font-medium' : ''}>
                  Validação
                </span>
                <span className={importStep === 'importing' ? 'text-primary font-medium' : ''}>
                  Importando
                </span>
                <span className={importStep === 'complete' ? 'text-primary font-medium' : ''}>
                  Concluído
                </span>
              </div>
            </div>

            {/* Upload Step */}
            {importStep === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Selecione o arquivo</h3>
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: .xlsx, .csv (máximo 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImportFile(file);
                        simulateFileProcessing();
                      }
                    }}
                    className="mt-4"
                    data-testid="file-upload"
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Colunas esperadas:</strong> Igreja, Nome, Código, Tipo, Sexo, Idade, Nascimento, Engajamento, Classificação, Dizimista, Email, Celular, etc.
                    <br />
                    <strong>Formatos de dados:</strong> Telefone (+5511999999999), Email (válido), Data (DD/MM/AAAA)
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Preview Step */}
            {importStep === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Preview dos Dados</h3>
                  <Badge variant="secondary">
                    {importData.length} registros encontrados
                  </Badge>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Igreja</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.nome || 'N/A'}</TableCell>
                          <TableCell>{row.email || 'N/A'}</TableCell>
                          <TableCell>{row.celular || 'N/A'}</TableCell>
                          <TableCell>{row.tipo || 'N/A'}</TableCell>
                          <TableCell>{row.igreja || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={row.valid ? 'secondary' : 'destructive'}>
                              {row.valid ? 'Válido' : 'Erro'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {importData.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Mostrando 5 de {importData.length} registros
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setImportStep('mapping');
                      setImportProgress(50);
                    }}
                    data-testid="continue-mapping"
                  >
                    Continuar para Mapeamento
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportStep('upload');
                      setImportProgress(0);
                      setImportFile(null);
                    }}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}

            {/* Mapping Step */}
            {importStep === 'mapping' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mapeamento de Colunas</h3>
                <p className="text-sm text-muted-foreground">
                  Confirme o mapeamento automático das colunas ou ajuste conforme necessário
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: 'nome', label: 'Nome', required: true },
                    { field: 'email', label: 'Email', required: true },
                    { field: 'celular', label: 'Telefone', required: true },
                    { field: 'tipo', label: 'Tipo de Usuário', required: true },
                    { field: 'igreja', label: 'Igreja', required: false },
                    { field: 'nascimento', label: 'Data de Nascimento', required: false }
                  ].map((mapping) => (
                    <div key={mapping.field} className="space-y-2">
                      <Label>
                        {mapping.label}
                        {mapping.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Select defaultValue={mapping.field}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={mapping.field}>
                            {mapping.field.charAt(0).toUpperCase() + mapping.field.slice(1)}
                          </SelectItem>
                          <SelectItem value="none">Não mapear</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setImportStep('validation');
                      setImportProgress(75);
                      validateImportData();
                    }}
                    data-testid="continue-validation"
                  >
                    Continuar para Validação
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportStep('preview');
                      setImportProgress(25);
                    }}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}

            {/* Validation Step */}
            {importStep === 'validation' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validação dos Dados</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{importData.filter(r => r.valid).length}</p>
                          <p className="text-sm text-muted-foreground">Registros válidos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{importErrors.length}</p>
                          <p className="text-sm text-muted-foreground">Erros encontrados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <X className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">{importDuplicates.length}</p>
                          <p className="text-sm text-muted-foreground">Duplicatas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {importErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Erros encontrados:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {importErrors.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                        {importErrors.length > 3 && (
                          <p className="text-sm">E mais {importErrors.length - 3} erros...</p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setImportStep('importing');
                      setImportProgress(90);
                      performImport();
                    }}
                    disabled={importErrors.length > 0}
                    data-testid="start-import"
                  >
                    {importErrors.length > 0 ? 'Corrija os erros primeiro' : 'Iniciar Importação'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportStep('mapping');
                      setImportProgress(50);
                    }}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}

            {/* Importing Step */}
            {importStep === 'importing' && (
              <div className="space-y-4 text-center">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <div>
                  <h3 className="text-lg font-medium">Importando dados...</h3>
                  <p className="text-sm text-muted-foreground">
                    Processando {importData.filter(r => r.valid).length} registros válidos
                  </p>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {importStep === 'complete' && (
              <div className="space-y-4 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                <div>
                  <h3 className="text-lg font-medium text-green-600">Importação Concluída!</h3>
                  <p className="text-sm text-muted-foreground">
                    {importData.filter(r => r.valid).length} usuários importados com sucesso
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportStep('upload');
                    setImportProgress(0);
                    setImportFile(null);
                    setImportData([]);
                    setLastImportDate(new Date().toISOString());
                  }}
                  data-testid="close-import"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );

  // Import helper functions
  function simulateFileProcessing() {
    setImportStep('preview');
    setImportProgress(25);
    
    // Simulate parsing Excel/CSV data
    const mockData = [
      {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '+5511999999999',
        tipo: 'member',
        igreja: 'Igreja Central',
        nascimento: '15/03/1985',
        valid: true
      },
      {
        nome: 'Maria Santos',
        email: 'maria@email.com',
        celular: '+5511888888888',
        tipo: 'missionary',
        igreja: 'Igreja Central',
        nascimento: '22/07/1990',
        valid: true
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro-invalid-email',
        celular: '11999999999',
        tipo: 'member',
        igreja: 'Igreja Norte',
        nascimento: '10/12/1978',
        valid: false
      }
    ];
    
    setImportData(mockData);
  }

  function validateImportData() {
    const errors: string[] = [];
    const duplicates: any[] = [];
    
    importData.forEach((row, index) => {
      if (!row.nome) errors.push(`Linha ${index + 1}: Nome é obrigatório`);
      if (!row.email || !row.email.includes('@')) errors.push(`Linha ${index + 1}: Email inválido`);
      if (!row.celular || !row.celular.startsWith('+55')) errors.push(`Linha ${index + 1}: Telefone deve estar no formato +5511999999999`);
    });
    
    setImportErrors(errors);
    setImportDuplicates(duplicates);
  }

  function performImport() {
    // Simulate import process
    setTimeout(() => {
      setImportStep('complete');
      setImportProgress(100);
      
      toast({
        title: "Importação concluída",
        description: `${importData.filter(r => r.valid).length} usuários importados com sucesso.`,
      });
    }, 2000);
  }
}