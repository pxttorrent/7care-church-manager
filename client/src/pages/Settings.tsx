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
  EyeOff,
  Plus
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

  // Church management states
  const [editingChurch, setEditingChurch] = useState<number | null>(null);
  const [churchesList, setChurchesList] = useState([
    {
      id: 1,
      name: 'Igreja Adventista Central',
      address: 'Rua das Flores, 123 - Centro',
      active: true
    },
    {
      id: 2,
      name: 'Igreja Adventista Norte',
      address: 'Av. Brasil, 456 - Zona Norte',
      active: true
    },
    {
      id: 3,
      name: 'Igreja Adventista Sul',
      address: 'Rua da Paz, 789 - Zona Sul',
      active: false
    }
  ]);

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

  const processRealFile = async (file: File) => {
    try {
      setImportProgress(20);
      setImportStep('preview');
      
      const arrayBuffer = await file.arrayBuffer();
      
      if (file.name.endsWith('.xlsx')) {
        // Process Excel file
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setImportData(jsonData);
      } else if (file.name.endsWith('.csv')) {
        // Process CSV file
        const text = new TextDecoder().decode(arrayBuffer);
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const jsonData = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        
        setImportData(jsonData);
      }
      
      setTimeout(() => {
        setImportProgress(40);
        setImportStep('mapping');
      }, 500);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Erro no arquivo",
        description: "Não foi possível processar o arquivo. Verifique o formato.",
        variant: "destructive"
      });
    }
  };

  const toggleChurchStatus = (churchId: number) => {
    setChurchesList(prev => prev.map(church => 
      church.id === churchId 
        ? { ...church, active: !church.active }
        : church
    ));
    
    const church = churchesList.find(c => c.id === churchId);
    toast({
      title: church?.active ? "Igreja desativada" : "Igreja ativada",
      description: `${church?.name} foi ${church?.active ? 'desativada' : 'ativada'} com sucesso.`,
    });
  };

  const addNewChurch = () => {
    const newChurch = {
      id: Date.now(),
      name: 'Nova Igreja',
      address: 'Endereço da igreja',
      active: true
    };
    setChurchesList(prev => [...prev, newChurch]);
    setEditingChurch(newChurch.id);
    toast({
      title: "Igreja adicionada",
      description: "Nova igreja foi criada. Clique nos campos para editar.",
    });
  };

  const updateChurchField = (churchId: number, field: string, value: string) => {
    setChurchesList(prev => prev.map(church => 
      church.id === churchId 
        ? { ...church, [field]: value }
        : church
    ));
  };

  const deleteChurch = (churchId: number, churchName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a igreja "${churchName}"? Esta ação não pode ser desfeita.`)) {
      setChurchesList(prev => prev.filter(church => church.id !== churchId));
      toast({
        title: "Igreja excluída",
        description: `${churchName} foi removida do sistema.`,
        variant: "destructive"
      });
    }
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      "⚠️ ATENÇÃO: Esta ação irá excluir TODOS os dados do sistema permanentemente!\n\n" +
      "Isso inclui:\n" +
      "• Todos os usuários cadastrados\n" +
      "• Todas as reuniões e eventos\n" +
      "• Todas as mensagens e conversas\n" +
      "• Todos os registros de pontos e atividades\n" +
      "• Todas as notificações\n\n" +
      "Esta ação NÃO PODE SER DESFEITA!\n\n" +
      "Tem certeza que deseja continuar?"
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "ÚLTIMA CONFIRMAÇÃO:\n\n" +
      "Você tem ABSOLUTA CERTEZA que deseja excluir TODOS os dados do sistema?\n\n" +
      "Digite 'CONFIRMAR' no próximo prompt para prosseguir."
    );

    if (!doubleConfirm) return;

    const finalConfirm = prompt(
      "Para confirmar a exclusão de TODOS os dados, digite exatamente: CONFIRMAR"
    );

    if (finalConfirm !== "CONFIRMAR") {
      toast({
        title: "Operação cancelada",
        description: "A limpeza dos dados foi cancelada.",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/system/clear-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Sistema limpo com sucesso",
          description: result.message || "Todos os dados foram removidos do sistema.",
        });
        
        // Refresh the page to show empty state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Falha ao limpar dados');
      }
      
    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: "Erro ao limpar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };



  const validateImportData = () => {
    const errors: string[] = [];
    const duplicates: string[] = [];
    const emails = new Set();
    
    const validatedData = importData.map((row, index) => {
      const validatedRow = { ...row, valid: true, errors: [] };
      const lineNumber = index + 1;
      
      // Check required fields
      const name = row.nome || row.Nome || row.name;
      if (!name || name.toString().trim() === '') {
        errors.push(`Linha ${lineNumber}: Nome é obrigatório`);
        validatedRow.valid = false;
      }
      
      // Validate email
      const email = row.email || row.Email;
      if (email) {
        const emailStr = email.toString().trim();
        if (emailStr && !emailStr.includes('@')) {
          errors.push(`Linha ${lineNumber}: Email "${emailStr}" é inválido`);
          validatedRow.valid = false;
        }
        if (emails.has(emailStr)) {
          duplicates.push(`Linha ${lineNumber}: Email "${emailStr}" duplicado`);
          validatedRow.valid = false;
        } else {
          emails.add(emailStr);
        }
      }
      
      // Validate phone
      const phone = row.celular || row.Celular || row.telefone || row.Telefone || row.phone;
      if (phone) {
        const phoneStr = phone.toString().trim();
        if (phoneStr && phoneStr.length < 10) {
          errors.push(`Linha ${lineNumber}: Telefone "${phoneStr}" muito curto`);
          validatedRow.valid = false;
        }
      }
      
      // Validate role/type
      const tipo = row.tipo || row.Tipo || row.role;
      if (tipo) {
        const tipoStr = tipo.toString().toLowerCase();
        const validRoles = ['admin', 'missionary', 'member', 'interested', 'pastor', 'diácono', 'membro', 'interessado'];
        if (!validRoles.some(role => tipoStr.includes(role))) {
          errors.push(`Linha ${lineNumber}: Tipo "${tipo}" não reconhecido. Use: Admin, Missionary, Member ou Interested`);
          validatedRow.valid = false;
        }
      }
      
      return validatedRow;
    });
    
    setImportData(validatedData);
    setImportErrors([...errors, ...duplicates]);
    setImportDuplicates(duplicates);
  };

  const performImport = async () => {
    try {
      setImportStep('importing');
      setImportProgress(85);
      
      // Filter out only rows with critical errors (no name), allow others through
      const validRows = importData.filter(row => {
        const name = row.nome || row.Nome || row.name;
        return name && name.toString().trim() !== ''; // Only skip if no name at all
      });

      // Process in smaller batches to avoid payload size issues
      const batchSize = 50; // Process 50 users at a time
      let totalImported = 0;
      let totalSkipped = importData.length - validRows.length;

      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        
        const usersToImport = batch.map(row => {
          const originalPhone = row.Celular || row.celular || row.telefone || row.Telefone || row.phone;
          const formattedPhone = formatPhoneNumber(originalPhone);
          
          // Check if phone was too short
          const phoneWarning = originalPhone && !formattedPhone;
          
          return {
            name: row.Nome || row.nome || row.name || 'Usuário Importado',
            email: row.Email || row.email || `${(row.Nome || row.nome || 'usuario').toLowerCase().replace(/\s+/g, '.')}@igreja.com`,
            password: '123456', // Default password
            role: getRole(row.Tipo || row.tipo || row.role),
            church: row.Igreja || row.igreja || row.church || 'Igreja Principal',
            churchCode: row.Código || row.codigo || row.code,
            phone: formattedPhone,
            cpf: row.CPF || row.cpf,
            address: row.Endereço || row.endereco || row.address,
            birthDate: parseDate(row.Nascimento || row.nascimento || row.birthDate),
            baptismDate: parseDate(row.Batismo || row.batismo || row.baptismDate),
            civilStatus: row['Estado civil'] || row.estadoCivil || row.civilStatus,
            occupation: row.Ocupação || row.ocupacao || row.profissao || row.occupation,
            education: row['Grau de educação'] || row.educacao || row.education,
            isDonor: parseBooleanField(row.Dizimista || row.dizimista),
            isOffering: parseBooleanField(row.Ofertante || row.ofertante),
            isEnrolledES: parseBooleanField(row['Matriculado na ES'] || row.matriculadoES),
            hasLesson: parseBooleanField(row['Tem lição'] || row.temLicao),
            esPeriod: row['Período ES'] || row.periodoES,
            previousReligion: row['Religião anterior'] || row.religiaoAnterior,
            biblicalInstructor: row['Instrutor bíblico'] || row.instrutorBiblico,
            departments: row['Departamentos e cargos'] || row.departamentos,
            extraData: JSON.stringify({
              sexo: row.Sexo || row.sexo,
              idade: row.Idade || row.idade,
              codigo: row.Código || row.codigo,
              engajamento: row.Engajamento || row.engajamento,
              classificacao: row.Classificação || row.classificacao,
              phoneWarning: phoneWarning,
              originalPhone: phoneWarning ? originalPhone : null,
            dizimos12m: row['Dízimos - 12m'] || row.dizimos12m,
            ultimoDizimo: row['Último dízimo - 12m'] || row.ultimoDizimo,
            valorDizimo: row['Valor dízimo - 12m'] || row.valorDizimo,
            ofertas12m: row['Ofertas - 12m'] || row.ofertas12m,
            ultimaOferta: row['Última oferta - 12m'] || row.ultimaOferta,
            valorOferta: row['Valor oferta - 12m'] || row.valorOferta,
            ultimoMovimento: row['Último movimento'] || row.ultimoMovimento,
            dataUltimoMovimento: row['Data do último movimento'] || row.dataUltimoMovimento,
            tipoEntrada: row['Tipo de entrada'] || row.tipoEntrada,
            localidadeBatismo: row['Localidade do batismo'] || row.localidadeBatismo,
            batizadoPor: row['Batizado por'] || row.batizadoPor,
            idadeBatismo: row['Idade no Batismo'] || row.idadeBatismo,
            comoConheceu: row['Como conheceu a IASD'] || row.comoConheceu,
            fatorDecisivo: row['Fator decisivo'] || row.fatorDecisivo,
            comoEstudou: row['Como estudou a Bíblia'] || row.comoEstudou,
            instrutorBiblico2: row['Instrutor bíblico 2'] || row.instrutorBiblico2,
            temCargo: row['Tem cargo'] || row.temCargo,
            nomeMae: row['Nome da mãe'] || row.nomeMae,
            nomePai: row['Nome do pai'] || row.nomePai,
            bairro: row.Bairro || row.bairro,
            cidadeEstado: row['Cidade e Estado'] || row.cidadeEstado,
            cidadeNascimento: row['Cidade de nascimento'] || row.cidadeNascimento,
            estadoNascimento: row['Estado de nascimento'] || row.estadoNascimento,
            nomeUnidade: row['Nome da unidade'] || row.nomeUnidade,
            comunhao: row.Comunhão || row.comunhao,
            missao: row.Missão || row.missao,
            estudoBiblico: row['Estudo bíblico'] || row.estudoBiblico,
            batizouAlguem: row['Batizou alguém'] || row.batizouAlguem,
            presencaTotal: row['Total presença no cartão'] || row.presencaTotal,
            presencaQuizLocal: row['Presença no quiz local'] || row.presencaQuizLocal,
            presencaQuizOnline: row['Presença no quiz online'] || row.presencaQuizOnline,
            teveParticipacao: row['Teve participação'] || row.teveParticipacao,
            campoColaborador: row['Campo - colaborador'] || row.campoColaborador,
            areaColaborador: row['Área - colaborador'] || row.areaColaborador,
            funcaoColaborador: row['Função - colaborador'] || row.funcaoColaborador,
            camposVazios: row['Campos vazios/inválidos'] || row.camposVazios,
            cpfValido: row['CPF válido'] || row.cpfValido,
            alunoEducacao: row['Aluno educação Adv.'] || row.alunoEducacao,
            parentesco: row['Parentesco p/ c/ aluno'] || row.parentesco
            }),
            observations: [
            row['Como estudou a Bíblia'] && `Como estudou: ${row['Como estudou a Bíblia']}`,
            row['Teve participação'] && `Participação: ${row['Teve participação']}`,
            row['Campos vazios/inválidos'] && `Campos vazios: ${row['Campos vazios/inválidos']}`
            ].filter(Boolean).join(' | ') || null
          };
        });

        const response = await fetch('/api/users/bulk-import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ users: usersToImport })
        });

        const result = await response.json();
        
        if (response.ok) {
          totalImported += result.imported;
          
          // Update progress
          const progress = 85 + ((i + batchSize) / validRows.length) * 15;
          setImportProgress(Math.min(progress, 100));
        } else {
          throw new Error(result.error || 'Erro na importação');
        }
      }
      
      // Complete the import
      setImportProgress(100);
      setImportStep('complete');
      
      // Show the server's message which includes duplicate handling
      toast({
        title: "Importação concluída!",
        description: response.message || `${totalImported} usuários importados com sucesso`
      });
      
    } catch (error) {
      console.error('Import error:', error);
      
      // Show more detailed error information
      let errorMessage = "Ocorreu um erro durante a importação.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive"
      });
      setImportStep('validation');
    }
  };

  const getRole = (tipo: string): string => {
    if (!tipo) return 'member';
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('admin') || tipoLower.includes('pastor')) return 'admin';
    if (tipoLower.includes('mission') || tipoLower.includes('diácon')) return 'missionary';
    if (tipoLower.includes('interest') || tipoLower.includes('visit')) return 'interested';
    return 'member';
  };

  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    try {
      const dateStr = dateValue.toString();
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const parseBooleanField = (value: any): boolean => {
    if (!value) return false;
    const str = value.toString().toLowerCase();
    return str === 'sim' || str === 'true' || str === '1' || str === 'yes';
  };

  const formatPhoneNumber = (phone: any): string | null => {
    if (!phone) return null;
    
    const cleanPhone = phone.toString().replace(/[^0-9]/g, '');
    
    if (cleanPhone.length < 10) {
      return null; // Return null for short phones - will be ignored
    }
    
    let formattedPhone = '';
    
    // If doesn't start with 55 (Brazil code), add it
    if (!cleanPhone.startsWith('55') && cleanPhone.length === 11) {
      formattedPhone = '55' + cleanPhone;
    } else if (!cleanPhone.startsWith('55') && cleanPhone.length === 10) {
      formattedPhone = '55' + cleanPhone;
    } else {
      formattedPhone = cleanPhone;
    }
    
    // Format to +55(DDD)99999-9999 or +55(DDD)9999-9999
    if (formattedPhone.length === 13) { // 55 + 11 digits
      const countryCode = formattedPhone.substring(0, 2);
      const areaCode = formattedPhone.substring(2, 4);
      const firstPart = formattedPhone.substring(4, 9);
      const lastPart = formattedPhone.substring(9, 13);
      return `+${countryCode}(${areaCode})${firstPart}-${lastPart}`;
    } else if (formattedPhone.length === 12) { // 55 + 10 digits
      const countryCode = formattedPhone.substring(0, 2);
      const areaCode = formattedPhone.substring(2, 4);
      const firstPart = formattedPhone.substring(4, 8);
      const lastPart = formattedPhone.substring(8, 12);
      return `+${countryCode}(${areaCode})${firstPart}-${lastPart}`;
    } else {
      // Keep original if doesn't match expected format
      return cleanPhone;
    }
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

          {/* Church Management (Admin only) */}
          {user?.role === 'admin' && (
            <TabsContent value="church" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Gestão de Igrejas
                      </CardTitle>
                      <CardDescription>
                        Clique nos campos para editar diretamente
                      </CardDescription>
                    </div>
                    <Button
                      onClick={addNewChurch}
                      data-testid="add-church-button"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Igreja
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Tabela Responsiva */}
                  <div className="space-y-2">
                    {/* Header da Tabela - Apenas em Desktop */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm font-medium">
                      <div className="col-span-4">Nome da Igreja</div>
                      <div className="col-span-5">Endereço</div>
                      <div className="col-span-1 text-center">Status</div>
                      <div className="col-span-2 text-center">Ações</div>
                    </div>

                    {/* Lista de Igrejas */}
                    {churchesList.map((church) => (
                      <div key={church.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                        {/* Layout Mobile */}
                        <div className="sm:hidden space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-muted-foreground">Nome:</label>
                              <Badge variant={church.active ? 'secondary' : 'destructive'}>
                                {church.active ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                            <EditableField
                              value={church.name}
                              onSave={(value) => updateChurchField(church.id, 'name', value)}
                              className="font-medium"
                              data-testid={`church-name-${church.id}`}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Endereço:</label>
                            <EditableField
                              value={church.address}
                              onSave={(value) => updateChurchField(church.id, 'address', value)}
                              className="text-sm"
                              data-testid={`church-address-${church.id}`}
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant={church.active ? 'secondary' : 'default'}
                              size="sm"
                              onClick={() => toggleChurchStatus(church.id)}
                              className="flex-1"
                              data-testid={`toggle-church-${church.id}`}
                            >
                              {church.active ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteChurch(church.id, church.name)}
                              data-testid={`delete-church-${church.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Layout Desktop */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <EditableField
                              value={church.name}
                              onSave={(value) => updateChurchField(church.id, 'name', value)}
                              className="font-medium"
                              data-testid={`church-name-${church.id}`}
                            />
                          </div>
                          
                          <div className="col-span-5">
                            <EditableField
                              value={church.address}
                              onSave={(value) => updateChurchField(church.id, 'address', value)}
                              className="text-sm"
                              data-testid={`church-address-${church.id}`}
                            />
                          </div>
                          
                          <div className="col-span-1 flex justify-center">
                            <Badge variant={church.active ? 'secondary' : 'destructive'}>
                              {church.active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                          
                          <div className="col-span-2 flex gap-1 justify-center">
                            <Button
                              variant={church.active ? 'secondary' : 'default'}
                              size="sm"
                              onClick={() => toggleChurchStatus(church.id)}
                              data-testid={`toggle-church-${church.id}`}
                            >
                              {church.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteChurch(church.id, church.name)}
                              data-testid={`delete-church-${church.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {churchesList.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Nenhuma igreja cadastrada</p>
                        <p className="text-sm">Adicione a primeira igreja do sistema</p>
                      </div>
                    )}
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
                
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  data-testid="button-delete-data"
                  onClick={handleClearAllData}
                >
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
                        processRealFile(file);
                      }
                    }}
                    className="mt-4"
                    data-testid="file-upload"
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Colunas reconhecidas:</strong> Igreja, Nome, Código, Tipo, Sexo, Idade, Nascimento, Engajamento, Classificação, Dizimista, Ofertante, Email, Celular, CPF, Estado civil, Ocupação, Grau de educação, Batismo, Religião anterior, Instrutor bíblico, Departamentos e cargos, Nome da mãe/pai, Bairro, Endereço, Matriculado na ES, Tem lição, e muitos outros campos específicos da IASD.
                    <br />
                    <strong>Formatos aceitos:</strong> Telefone (qualquer formato), Email (com @), Datas (DD/MM/AAAA ou outros formatos), Valores Sim/Não para campos booleanos
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
                        <TableHead>Igreja</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Celular</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.Nome || row.nome || 'N/A'}</TableCell>
                          <TableCell>{row.Igreja || row.igreja || 'N/A'}</TableCell>
                          <TableCell>{row.Código || row.codigo || 'N/A'}</TableCell>
                          <TableCell>{row.Tipo || row.tipo || 'N/A'}</TableCell>
                          <TableCell>{row.Email || row.email || 'N/A'}</TableCell>
                          <TableCell>{row.Celular || row.celular || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={row.valid !== false ? 'secondary' : 'destructive'}>
                              {row.valid !== false ? 'Válido' : 'Erro'}
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
                  <Alert variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Avisos encontrados (linhas serão ignoradas):</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {importErrors.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                        {importErrors.length > 3 && (
                          <p className="text-sm">E mais {importErrors.length - 3} avisos...</p>
                        )}
                        <p className="text-sm font-medium mt-2">
                          Somente linhas sem nome serão ignoradas. Outros erros serão corrigidos automaticamente.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={performImport}
                    data-testid="start-import"
                  >
                    {importErrors.length > 0 ? 'Importar (ignorar erros)' : 'Iniciar Importação'}
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

  // Componente de Campo Editável Inline
  function EditableField({ 
    value, 
    onSave, 
    className = "", 
    ...props 
  }: { 
    value: string; 
    onSave: (value: string) => void; 
    className?: string;
    [key: string]: any;
  }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
      if (editValue.trim() !== value) {
        onSave(editValue.trim());
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isEditing) {
      return (
        <div className="flex gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="h-8 text-sm"
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`p-1 rounded cursor-text hover:bg-muted/50 transition-colors min-h-[32px] flex items-center ${className}`}
        {...props}
      >
        {value || 'Clique para editar'}
      </div>
    );
  }

}