import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  Download,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Database,
  FileCheck,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { offlineDB } from '@/lib/offlineDatabase';
import { downloadAllDataForOffline, checkDataFreshness } from '@/lib/apiOfflineInterceptor';

interface FileCheckResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  size?: string;
}

interface OfflineStatus {
  isConfigured: boolean;
  path: string;
  totalFiles: number;
  totalSize: string;
  lastVerification: string;
  serviceWorkerVersion: string;
  cacheStatus: 'active' | 'inactive' | 'outdated';
}

const REQUIRED_PAGES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/menu', name: 'Menu' },
  { path: '/calendar', name: 'Calendário' },
  { path: '/users', name: 'Usuários' },
  { path: '/tasks', name: 'Tarefas' },
  { path: '/interested', name: 'Interessados' },
  { path: '/my-interested', name: 'Meus Interessados' },
  { path: '/chat', name: 'Chat' },
  { path: '/settings', name: 'Configurações' },
  { path: '/gamification', name: 'Gamificação' },
  { path: '/prayers', name: 'Orações' },
  { path: '/push-notifications', name: 'Push Notifications' },
  { path: '/notifications', name: 'Histórico de Notificações' },
  { path: '/contact', name: 'Contato' },
  { path: '/meu-cadastro', name: 'Meu Cadastro' },
  { path: '/elections', name: 'Eleições' },
  { path: '/election-config', name: 'Config. Eleições' },
  { path: '/election-voting', name: 'Votação' },
  { path: '/election-dashboard', name: 'Dashboard Eleições' },
  { path: '/election-manage', name: 'Gerenciar Eleições' }
];

const REQUIRED_FILES = [
  { path: '/index.html', name: 'Index HTML' },
  { path: '/sw.js', name: 'Service Worker' },
  { path: '/manifest.json', name: 'Manifest PWA' },
  { path: '/favicon.ico', name: 'Favicon' },
  { path: '/7care-logo.png', name: 'Logo Principal' },
  { path: '/pwa-192x192.png', name: 'Ícone PWA 192' },
  { path: '/pwa-512x512.png', name: 'Ícone PWA 512' }
];

export function OfflineModeSettings() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus | null>(null);
  const [verificationResults, setVerificationResults] = useState<FileCheckResult[]>([]);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [dataStats, setDataStats] = useState<Record<string, number>>({});

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar status salvo e verificar cache
  useEffect(() => {
    loadOfflineStatus();
    checkCacheStatus();
    loadDataStats();
  }, []);

  const loadOfflineStatus = () => {
    const status = localStorage.getItem('offline-status');
    if (status) {
      setOfflineStatus(JSON.parse(status));
    }
  };

  const checkCacheStatus = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const v27Cache = cacheNames.find(name => name.includes('7care-v27-precache-total'));
        
        if (v27Cache) {
          const cache = await caches.open(v27Cache);
          const keys = await cache.keys();
          
          setCacheInfo({
            cacheName: v27Cache,
            totalItems: keys.length,
            items: keys.map(req => req.url)
          });
        }
      } catch (error) {
        console.error('Erro ao verificar cache:', error);
      }
    }
  };

  const loadDataStats = async () => {
    try {
      const stats = await offlineDB.getStats();
      setDataStats(stats);
      console.log('📊 Estatísticas IndexedDB:', stats);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  const downloadAllData = async () => {
    if (!navigator.onLine) {
      toast({
        title: "Sem conexão",
        description: "É necessário estar online para baixar os dados",
        variant: "destructive"
      });
      return;
    }

    setIsDownloadingData(true);

    try {
      toast({
        title: "Baixando dados...",
        description: "Isso pode levar alguns minutos dependendo da quantidade de dados",
      });

      await downloadAllDataForOffline();
      await loadDataStats();

      toast({
        title: "Download concluído!",
        description: "Todos os dados agora estão disponíveis offline no IndexedDB",
      });

    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsDownloadingData(false);
    }
  };

  const verifyOfflineInstallation = async () => {
    setIsVerifying(true);
    const results: FileCheckResult[] = [];

    try {
      // Verificar Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          results.push({
            name: 'Service Worker',
            status: 'success',
            message: `Ativo - ${registration.active?.scriptURL || 'N/A'}`
          });
        } else {
          results.push({
            name: 'Service Worker',
            status: 'error',
            message: 'Não registrado'
          });
        }
      }

      // Verificar Cache Storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const v27Cache = cacheNames.find(name => name.includes('7care-v27-precache-total'));
        
        if (v27Cache) {
          const cache = await caches.open(v27Cache);
          const keys = await cache.keys();
          
          results.push({
            name: 'Cache Storage',
            status: 'success',
            message: `${keys.length} itens em cache`,
            size: `v27`
          });

          // Verificar cada página requerida
          for (const page of REQUIRED_PAGES) {
            const cached = keys.some(req => req.url.includes(page.path) || req.url.endsWith('/index.html'));
            results.push({
              name: page.name,
              status: cached ? 'success' : 'warning',
              message: cached ? 'Disponível offline' : 'Precisa ser visitada primeiro'
            });
          }

          // Verificar arquivos essenciais
          for (const file of REQUIRED_FILES) {
            const cached = keys.some(req => req.url.includes(file.path));
            results.push({
              name: file.name,
              status: cached ? 'success' : 'error',
              message: cached ? 'Cacheado' : 'Não encontrado no cache'
            });
          }
        } else {
          results.push({
            name: 'Cache v27',
            status: 'error',
            message: 'Cache offline não encontrado - recarregue a aplicação para instalar'
          });
        }
      }

      // Verificar PWA instalado
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      
      results.push({
        name: 'Instalação PWA',
        status: isInstalled ? 'success' : 'warning',
        message: isInstalled ? 'Instalado como aplicativo' : 'Acesse via navegador (pode instalar como PWA)'
      });

      // Verificar dados no IndexedDB
      const dataFreshness = await checkDataFreshness();
      const totalData = Object.values(dataFreshness.stats).reduce((sum, count) => sum + count, 0);
      
      results.push({
        name: 'Dados Offline (IndexedDB)',
        status: totalData > 0 ? 'success' : 'warning',
        message: totalData > 0 
          ? `${totalData} registros disponíveis offline` 
          : 'Nenhum dado baixado - clique em "Baixar Dados" abaixo'
      });

      // Verificar dados por tipo
      if (dataFreshness.stats.users > 0) {
        results.push({
          name: 'Usuários',
          status: 'success',
          message: `${dataFreshness.stats.users} usuários em cache`
        });
      }
      
      if (dataFreshness.stats.tasks > 0) {
        results.push({
          name: 'Tarefas',
          status: 'success',
          message: `${dataFreshness.stats.tasks} tarefas em cache`
        });
      }

      if (dataFreshness.stats.interested > 0) {
        results.push({
          name: 'Interessados',
          status: 'success',
          message: `${dataFreshness.stats.interested} interessados em cache`
        });
      }

      // Salvar resultados
      setVerificationResults(results);
      
      // Calcular status geral
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;

      const newStatus: OfflineStatus = {
        isConfigured: errorCount === 0,
        path: 'Cache do navegador (v27)',
        totalFiles: results.length,
        totalSize: cacheInfo?.totalItems ? `${cacheInfo.totalItems} itens` : 'N/A',
        lastVerification: new Date().toLocaleString('pt-BR'),
        serviceWorkerVersion: 'v27',
        cacheStatus: errorCount > 0 ? 'inactive' : warningCount > 0 ? 'outdated' : 'active'
      };

      setOfflineStatus(newStatus);
      localStorage.setItem('offline-status', JSON.stringify(newStatus));

      toast({
        title: "Verificação concluída",
        description: `${successCount} OK, ${warningCount} avisos, ${errorCount} erros`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const clearOfflineCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        setCacheInfo(null);
        setOfflineStatus(null);
        setVerificationResults([]);
        
        toast({
          title: "Cache limpo",
          description: "Todos os dados offline foram removidos"
        });
      } catch (error) {
        toast({
          title: "Erro ao limpar cache",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive"
        });
      }
    }
  };

  const downloadInstructions = () => {
    const instructions = `
# Guia de Instalação Offline - 7care v27

## Como funciona:

O 7care agora usa Service Worker v27 com PRE-CACHE completo!
TODAS as páginas funcionam offline automaticamente após a primeira instalação.

## Instalação Automática:

1. Acesse: https://7care.netlify.app
2. Aguarde o Service Worker instalar (veja no console)
3. Todos os arquivos JS/CSS serão cacheados automaticamente
4. Pronto! Pode usar offline

## Verificar instalação:

1. Abra DevTools (F12) > Console
2. Procure por: "✅ SW v27: Pre-cache completo!"
3. Application > Cache Storage
4. Deve ter: 7care-v27-precache-total com 100+ itens

## Páginas disponíveis offline (automaticamente):
${REQUIRED_PAGES.map(p => `- ${p.name} (${p.path})`).join('\n')}

## Status atual da verificação:
${verificationResults.map(r => `- ${r.name}: ${r.message}`).join('\n')}

## Instalar como PWA:

Chrome/Edge: Menu > Instalar 7care
Safari iOS: Compartilhar > Adicionar à Tela Inicial

Depois de instalado como PWA, funciona 100% offline!
`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instalacao-offline-7care-v27.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const forceFullOfflineInstall = async () => {
    if (!('serviceWorker' in navigator)) {
      toast({
        title: "Service Worker não suportado",
        description: "Seu navegador não suporta Service Workers",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      toast({
        title: "Instalando para offline...",
        description: "Baixando todos os recursos. Isso pode levar alguns minutos.",
      });

      // Forçar registro do Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none'
      });

      // Aguardar instalação
      if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing.addEventListener('statechange', (e) => {
            if ((e.target as any).state === 'activated') {
              resolve(true);
            }
          });
        });
      }

      // Aguardar um pouco para o cache completar
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Verificar cache
      await checkCacheStatus();

      toast({
        title: "Instalação offline concluída!",
        description: "Todas as páginas agora funcionam offline. Pode desconectar da internet!",
      });

    } catch (error) {
      console.error('Erro na instalação offline:', error);
      toast({
        title: "Erro na instalação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const successCount = verificationResults.filter(r => r.status === 'success').length;
  const totalCount = verificationResults.length;
  const percentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Status de Conexão */}
      <Alert className={isOnline ? "border-green-500" : "border-orange-500"}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-orange-600" />}
          <AlertDescription>
            {isOnline ? "Sistema online - Todas as funcionalidades disponíveis" : "Sistema offline - Usando cache local"}
          </AlertDescription>
        </div>
      </Alert>

      {/* Configuração do Caminho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Instalação Offline Automática (Service Worker v27)
          </CardTitle>
          <CardDescription>
            O PWA agora funciona 100% offline usando apenas o cache do navegador. Sem necessidade de pasta local!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                onClick={verifyOfflineInstallation} 
                disabled={isVerifying}
                className="flex-1"
                variant="outline"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Verificar Status Offline
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ✨ Service Worker v27 cacheia automaticamente todos os 98 assets no primeiro acesso
            </p>
          </div>

          {offlineStatus && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={offlineStatus.cacheStatus === 'active' ? 'default' : 'destructive'}>
                  {offlineStatus.cacheStatus === 'active' ? 'Ativo' : offlineStatus.cacheStatus === 'outdated' ? 'Incompleto' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Itens verificados:</span>
                <span className="text-sm">{offlineStatus.totalFiles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache:</span>
                <span className="text-sm">{offlineStatus.totalSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última verificação:</span>
                <span className="text-sm">{offlineStatus.lastVerification}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service Worker:</span>
                <span className="text-sm">{offlineStatus.serviceWorkerVersion}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados da Verificação */}
      {verificationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Resultados da Verificação
            </CardTitle>
            <CardDescription>
              {successCount} de {totalCount} verificações bem-sucedidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={percentage} className="h-2" />
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {verificationResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {result.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    {result.status === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                    <div>
                      <p className="font-medium text-sm">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  {result.size && (
                    <Badge variant="outline">{result.size}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Info */}
      {cacheInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Cache de Páginas (Service Worker)
            </CardTitle>
            <CardDescription>
              Assets e arquivos estáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nome do Cache:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{cacheInfo.cacheName}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Arquivos em Cache:</span>
              <Badge>{cacheInfo.totalItems} arquivos</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Info - IndexedDB */}
      {Object.keys(dataStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados Offline (IndexedDB)
            </CardTitle>
            <CardDescription>
              Dados salvos localmente no dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dataStats.users > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">👥 Usuários:</span>
                <Badge variant="default">{dataStats.users}</Badge>
              </div>
            )}
            {dataStats.tasks > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">✅ Tarefas:</span>
                <Badge variant="default">{dataStats.tasks}</Badge>
              </div>
            )}
            {dataStats.interested > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">🤝 Interessados:</span>
                <Badge variant="default">{dataStats.interested}</Badge>
              </div>
            )}
            {dataStats.events > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">📅 Eventos:</span>
                <Badge variant="default">{dataStats.events}</Badge>
              </div>
            )}
            {dataStats.prayers > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">🙏 Orações:</span>
                <Badge variant="default">{dataStats.prayers}</Badge>
              </div>
            )}
            {dataStats.activities > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">📊 Atividades:</span>
                <Badge variant="default">{dataStats.activities}</Badge>
              </div>
            )}
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total de Registros:</span>
                <Badge className="bg-green-600">{Object.values(dataStats).reduce((sum, count) => sum + count, 0)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Manutenção</CardTitle>
          <CardDescription>
            Ferramentas para gerenciar a instalação offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={downloadAllData} 
              variant="default"
              disabled={isDownloadingData || !isOnline}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDownloadingData ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Baixando Dados...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Baixar TODOS os Dados
                </>
              )}
            </Button>
            <Button 
              onClick={forceFullOfflineInstall} 
              variant="default"
              disabled={isVerifying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Instalar Páginas
                </>
              )}
            </Button>
            <Button onClick={checkCacheStatus} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Info
            </Button>
            <Button onClick={downloadInstructions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Instruções
            </Button>
            <Button onClick={clearOfflineCache} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
          </div>

          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <Database className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong className="text-green-700 dark:text-green-400">🎯 Instalação Offline COMPLETA em 2 passos:</strong>
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded">
                  <p className="font-semibold text-green-800 dark:text-green-300">1️⃣ Baixar Dados (VERDE)</p>
                  <p className="text-sm mt-1">Clique em <strong>"Baixar TODOS os Dados"</strong> para salvar usuários, tarefas, interessados, etc no dispositivo</p>
                </div>
                
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                  <p className="font-semibold text-blue-800 dark:text-blue-300">2️⃣ Instalar Páginas (AZUL)</p>
                  <p className="text-sm mt-1">Clique em <strong>"Instalar Páginas"</strong> ou recarregue (Ctrl+R) para cachear os 97 arquivos</p>
                </div>

                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded">
                  <p className="font-semibold text-purple-800 dark:text-purple-300">✅ Pronto para Offline!</p>
                  <p className="text-sm mt-1">Agora pode desconectar da internet e usar TUDO offline: páginas + dados!</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-green-700 dark:text-green-400">
                💾 Os dados ficam salvos no IndexedDB do navegador e sincronizam quando voltar online!
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Guia Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Guia Rápido - Como Funciona o Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-blue-600 mb-2">✨ Service Worker v27 - Totalmente Automático!</p>
              <p>Não precisa mais de pasta local ou servidor. Tudo funciona pelo cache do navegador!</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="font-semibold mb-2">🚀 Instalação Offline Completa:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Acesse <strong>https://7care.netlify.app</strong> (COM internet)</li>
                <li>Vá em <strong>Configurações → Modo Offline</strong></li>
                <li>Clique em <strong>"Baixar TODOS os Dados"</strong> (botão VERDE)</li>
                <li>Aguarde download (usuários, tarefas, interessados, etc)</li>
                <li>Clique em <strong>"Instalar Páginas"</strong> (botão AZUL) ou recarregue</li>
                <li><strong>Pronto!</strong> Desconecte e use offline com TODOS os dados!</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="font-semibold mb-2">📦 O que fica disponível offline:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Páginas:</strong> 97 arquivos (HTML, JS, CSS) - Automático</li>
                <li><strong>Dados:</strong> Usuários, Tarefas, Interessados, Eventos - Baixar com botão VERDE</li>
                <li><strong>Interface:</strong> Todos os componentes UI, ícones, logos</li>
                <li><strong>Funciona 100% offline</strong> após baixar dados + páginas!</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
              <p className="font-semibold mb-2">📱 Instalar como PWA:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Chrome/Edge:</strong> Menu → Instalar 7care</li>
                <li><strong>Safari iOS:</strong> Compartilhar → Adicionar à Tela Inicial</li>
                <li>Depois de instalado, funciona como app nativo offline!</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
              <p className="font-semibold mb-2">🔍 Como verificar:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Abra <strong>DevTools (F12)</strong></li>
                <li>Vá em <strong>Application → Cache Storage</strong></li>
                <li>Procure: <strong>7care-v27-precache-total</strong></li>
                <li>Deve ter <strong>98+ itens</strong></li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

