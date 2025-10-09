import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  Download,
  FolderOpen,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Database,
  FileCheck,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [offlinePath, setOfflinePath] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus | null>(null);
  const [verificationResults, setVerificationResults] = useState<FileCheckResult[]>([]);
  const [cacheInfo, setCacheInfo] = useState<any>(null);

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

  // Carregar configuração salva
  useEffect(() => {
    const savedPath = localStorage.getItem('offline-installation-path');
    if (savedPath) {
      setOfflinePath(savedPath);
      loadOfflineStatus(savedPath);
    }
    checkCacheStatus();
  }, []);

  const loadOfflineStatus = (path: string) => {
    const status = localStorage.getItem('offline-status');
    if (status) {
      setOfflineStatus(JSON.parse(status));
    }
  };

  const checkCacheStatus = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const v24Cache = cacheNames.find(name => name.includes('7care-v24-offline-complete'));
        
        if (v24Cache) {
          const cache = await caches.open(v24Cache);
          const keys = await cache.keys();
          
          setCacheInfo({
            cacheName: v24Cache,
            totalItems: keys.length,
            items: keys.map(req => req.url)
          });
        }
      } catch (error) {
        console.error('Erro ao verificar cache:', error);
      }
    }
  };

  const verifyOfflineInstallation = async () => {
    if (!offlinePath) {
      toast({
        title: "Caminho não especificado",
        description: "Por favor, especifique o caminho da instalação offline",
        variant: "destructive"
      });
      return;
    }

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
        const v24Cache = cacheNames.find(name => name.includes('7care-v24-offline-complete'));
        
        if (v24Cache) {
          const cache = await caches.open(v24Cache);
          const keys = await cache.keys();
          
          results.push({
            name: 'Cache Storage',
            status: 'success',
            message: `${keys.length} itens em cache`,
            size: `v24`
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
            name: 'Cache v24',
            status: 'error',
            message: 'Cache offline não encontrado - visite a aplicação online primeiro'
          });
        }
      }

      // Verificar se o caminho especificado parece válido
      if (offlinePath.includes('7careoffiline') || offlinePath.includes('7care') || offlinePath.includes('offline')) {
        results.push({
          name: 'Caminho da Instalação',
          status: 'success',
          message: `Configurado: ${offlinePath}`
        });
      } else {
        results.push({
          name: 'Caminho da Instalação',
          status: 'warning',
          message: 'Caminho configurado pode não estar correto'
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
        path: offlinePath,
        totalFiles: results.length,
        totalSize: cacheInfo?.totalItems ? `${cacheInfo.totalItems} itens` : 'N/A',
        lastVerification: new Date().toLocaleString('pt-BR'),
        serviceWorkerVersion: 'v24',
        cacheStatus: errorCount > 0 ? 'inactive' : warningCount > 0 ? 'outdated' : 'active'
      };

      setOfflineStatus(newStatus);
      localStorage.setItem('offline-status', JSON.stringify(newStatus));
      localStorage.setItem('offline-installation-path', offlinePath);

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
# Guia de Instalação Offline - 7care

## Como configurar:

1. Copie a pasta de instalação offline para:
   ${offlinePath || '/Users/[seu-usuario]/Downloads/7careoffiline'}

2. Abra o Terminal e execute:
   cd ${offlinePath || '/caminho/para/pasta'}
   ./start-offline.sh

3. Abra no navegador:
   http://localhost:8080/paginas.html

4. Clique em TODAS as páginas para cachear

5. Depois pode usar offline!

## Páginas que precisam ser visitadas:
${REQUIRED_PAGES.map(p => `- ${p.name} (${p.path})`).join('\n')}

## Status atual da verificação:
${verificationResults.map(r => `- ${r.name}: ${r.message}`).join('\n')}
`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instalacao-offline-7care.txt';
    a.click();
    URL.revokeObjectURL(url);
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
            <FolderOpen className="h-5 w-5" />
            Configuração da Instalação Offline
          </CardTitle>
          <CardDescription>
            Especifique o caminho onde a instalação offline está localizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offline-path">Caminho da Instalação</Label>
            <div className="flex gap-2">
              <Input
                id="offline-path"
                value={offlinePath}
                onChange={(e) => setOfflinePath(e.target.value)}
                placeholder="/Users/usuario/Downloads/7careoffiline"
                className="flex-1"
              />
              <Button onClick={verifyOfflineInstallation} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Verificar
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Exemplo: /Users/filipe/Downloads/7careoffiline
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
              Informações do Cache
            </CardTitle>
            <CardDescription>
              Cache do Service Worker ativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nome do Cache:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{cacheInfo.cacheName}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Itens em Cache:</span>
              <Badge>{cacheInfo.totalItems}</Badge>
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
            <Button onClick={checkCacheStatus} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Cache Info
            </Button>
            <Button onClick={downloadInstructions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Instruções
            </Button>
            <Button onClick={clearOfflineCache} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Para que o modo offline funcione corretamente:
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Acesse a aplicação COM internet primeiro</li>
                <li>Navegue por TODAS as páginas que deseja usar offline</li>
                <li>Aguarde cada página carregar completamente (10 seg)</li>
                <li>O Service Worker cacheará automaticamente</li>
                <li>Depois pode desconectar e usar offline!</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Guia Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Guia Rápido - Instalação Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p><strong>1. Onde está a instalação?</strong></p>
            <code className="block bg-muted p-2 rounded">
              /Users/filipevitolapeixoto/Downloads/7careoffiline
            </code>

            <p className="mt-4"><strong>2. Como iniciar o servidor local?</strong></p>
            <code className="block bg-muted p-2 rounded">
              cd /Users/filipevitolapeixoto/Downloads/7careoffiline<br/>
              ./start-offline.sh
            </code>

            <p className="mt-4"><strong>3. Como acessar?</strong></p>
            <code className="block bg-muted p-2 rounded">
              http://localhost:8080/paginas.html
            </code>

            <p className="mt-4"><strong>4. Arquivos importantes:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>LEIA-ME-PRIMEIRO.txt - Guia de início</li>
              <li>paginas.html - Índice visual de todas as páginas</li>
              <li>start-offline.sh - Script de inicialização</li>
              <li>README.md - Documentação completa</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

