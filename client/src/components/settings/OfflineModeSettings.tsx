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
  Loader2,
  Info,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  count?: number;
}

interface CacheInfo {
  cacheName: string;
  totalItems: number;
  apiItems: number;
  pageItems: number;
  lastUpdate: string;
}

export function OfflineModeSettings() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats[]>([]);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão restaurada",
        description: "Dados serão sincronizados automaticamente",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo offline ativado",
        description: "Usando dados em cache",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar informações do cache ao montar
  useEffect(() => {
    checkCacheStatus();
  }, []);

  const checkCacheStatus = async () => {
    setIsVerifying(true);
    
    try {
      if (!('caches' in window)) {
        toast({
          title: "Cache não suportado",
          description: "Seu navegador não suporta CacheStorage",
          variant: "destructive"
        });
        return;
      }

      const cacheNames = await caches.keys();
      const stats: CacheStats[] = [];
      
      // Verificar Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.active) {
          stats.push({
            name: 'Service Worker',
            status: 'success',
            message: 'Ativo e funcionando'
          });
        } else {
          stats.push({
            name: 'Service Worker',
            status: 'warning',
            message: 'Não registrado - recarregue a página'
          });
        }
      }

      // Verificar cache de páginas (v27)
      const pageCache = cacheNames.find(name => name.includes('7care-v27-precache-total'));
      if (pageCache) {
        const cache = await caches.open(pageCache);
        const keys = await cache.keys();
        
        stats.push({
          name: 'Cache de Páginas',
          status: 'success',
          message: 'Todas as páginas disponíveis offline',
          count: keys.length
        });
      } else {
        stats.push({
          name: 'Cache de Páginas',
          status: 'warning',
          message: 'Recarregue a página para instalar'
        });
      }

      // Verificar cache de API
      const apiCache = cacheNames.find(name => name.includes('7care-api-v27'));
      if (apiCache) {
        const cache = await caches.open(apiCache);
        const keys = await cache.keys();
        
        const apiEndpoints = keys.filter(req => req.url.includes('/api/'));
        
        stats.push({
          name: 'Cache de Dados (API)',
          status: apiEndpoints.length > 0 ? 'success' : 'warning',
          message: apiEndpoints.length > 0 
            ? 'Dados disponíveis offline' 
            : 'Navegue pelas páginas online para cachear dados',
          count: apiEndpoints.length
        });

        // Verificar endpoints específicos
        const usersCache = apiEndpoints.find(req => req.url.includes('/api/users'));
        if (usersCache) {
          stats.push({
            name: 'Usuários',
            status: 'success',
            message: 'Dados cacheados'
          });
        }

        const tasksCache = apiEndpoints.find(req => req.url.includes('/api/tasks'));
        if (tasksCache) {
          stats.push({
            name: 'Tarefas',
            status: 'success',
            message: 'Dados cacheados'
          });
        }

        const interestedCache = apiEndpoints.find(req => req.url.includes('/api/interested'));
        if (interestedCache) {
          stats.push({
            name: 'Interessados',
            status: 'success',
            message: 'Dados cacheados'
          });
        }

        const eventsCache = apiEndpoints.find(req => req.url.includes('/api/events'));
        if (eventsCache) {
          stats.push({
            name: 'Eventos',
            status: 'success',
            message: 'Dados cacheados'
          });
        }
      }

      // PWA instalado?
      const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches;
      stats.push({
        name: 'Instalação PWA',
        status: isPWAInstalled ? 'success' : 'warning',
        message: isPWAInstalled ? 'Instalado como aplicativo' : 'Pode instalar via Menu → Instalar'
      });

      setCacheStats(stats);

      // Calcular info geral
      const totalPages = pageCache ? (await (await caches.open(pageCache)).keys()).length : 0;
      const totalAPI = apiCache ? (await (await caches.open(apiCache)).keys()).length : 0;

      setCacheInfo({
        cacheName: pageCache || 'N/A',
        totalItems: totalPages + totalAPI,
        pageItems: totalPages,
        apiItems: totalAPI,
        lastUpdate: new Date().toLocaleString('pt-BR')
      });

      toast({
        title: "Verificação concluída",
        description: `${stats.filter(s => s.status === 'success').length}/${stats.length} verificações OK`,
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

  const clearAllCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      setCacheInfo(null);
      setCacheStats([]);
      
      toast({
        title: "Cache limpo",
        description: "Recarregue a página para criar novo cache",
      });
    } catch (error) {
      toast({
        title: "Erro ao limpar cache",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const downloadInstructions = () => {
    const instructions = `
# 7care - Modo Offline (PWA Puro)

## Como funciona:

O 7care usa Service Worker v27 que automaticamente cacheia:
- ✅ 97 arquivos da aplicação (páginas, JS, CSS)
- ✅ Respostas da API (usuários, tarefas, interessados, etc)

## Para ter dados offline:

1. Acesse https://7care.netlify.app COM INTERNET
2. Navegue pelas páginas que usa:
   - /users (usuários)
   - /tasks (tarefas)
   - /interested (interessados)
   - /dashboard (dashboard)
   - Outras páginas que precisar

3. O Service Worker salvará automaticamente os dados

4. Desconecte da internet

5. Navegue pelas mesmas páginas
   → Os dados aparecerão normalmente!

## Status atual do cache:

${cacheStats.map(s => `- ${s.name}: ${s.message}${s.count ? ` (${s.count} itens)` : ''}`).join('\n')}

## Verificação:

Para ver o cache:
1. Abra DevTools (F12)
2. Application → Cache Storage
3. Veja:
   - 7care-v27-precache-total (páginas)
   - 7care-api-v27 (dados)

## Instalar como PWA:

Desktop: Menu → Instalar 7care
Mobile: Compartilhar → Adicionar à Tela Inicial

Versão: Service Worker v27
Data: ${new Date().toLocaleDateString('pt-BR')}
`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modo-offline-7care.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = cacheStats.filter(s => s.status === 'success').length;
  const totalCount = cacheStats.length;
  const percentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Status de Conexão */}
      <Alert className={isOnline ? "border-green-500" : "border-orange-500"}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 text-green-600" />
              <AlertDescription className="flex-1">
                <strong>Sistema online</strong> - Dados sendo salvos automaticamente no cache
              </AlertDescription>
              <Badge className="bg-green-600">Online</Badge>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-orange-600" />
              <AlertDescription className="flex-1">
                <strong>Sistema offline</strong> - Usando dados do cache
              </AlertDescription>
              <Badge className="bg-orange-600">Offline</Badge>
            </>
          )}
        </div>
      </Alert>

      {/* Card Principal - Como Funciona */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Como Funciona o Modo Offline
          </CardTitle>
          <CardDescription>
            Service Worker v27 com cache automático de páginas e dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h4 className="font-semibold text-green-700 dark:text-green-400">Online</h4>
              </div>
              <p className="text-sm">
                Use o sistema normalmente. O Service Worker salva automaticamente páginas e dados da API em cache.
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-400">Offline</h4>
              </div>
              <p className="text-sm">
                Sem internet, o Service Worker serve páginas e dados do cache. Tudo continua funcionando!
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">Sincronização</h4>
              </div>
              <p className="text-sm">
                Ao voltar online, novos dados são baixados e o cache é atualizado automaticamente.
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>💡 Dica para cache completo:</strong> Navegue pelas páginas que você usa 
              (usuários, tarefas, interessados, etc) COM INTERNET primeiro. O Service Worker 
              cacheará automaticamente todos os dados. Depois pode usar offline com tudo disponível!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Informações do Cache */}
      {cacheInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Informações do Cache
            </CardTitle>
            <CardDescription>
              Status atual do cache offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Páginas em Cache</p>
                <p className="text-2xl font-bold">{cacheInfo.pageItems}</p>
                <p className="text-xs text-muted-foreground">arquivos</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Dados da API</p>
                <p className="text-2xl font-bold">{cacheInfo.apiItems}</p>
                <p className="text-xs text-muted-foreground">endpoints</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="text-sm font-medium">Total em Cache:</span>
              <Badge className="bg-blue-600">{cacheInfo.totalItems} itens</Badge>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Última atualização: {cacheInfo.lastUpdate}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verificação Detalhada */}
      {cacheStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status Detalhado
            </CardTitle>
            <CardDescription>
              {successCount} de {totalCount} verificações OK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={percentage} className="h-2" />
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cacheStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {stat.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {stat.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    {stat.status === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                    <div>
                      <p className="font-medium text-sm">{stat.name}</p>
                      <p className="text-xs text-muted-foreground">{stat.message}</p>
                    </div>
                  </div>
                  {stat.count && (
                    <Badge variant="outline">{stat.count}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>
            Ferramentas de gerenciamento do cache offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={checkCacheStatus} 
              disabled={isVerifying}
              variant="default"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </>
              )}
            </Button>
            <Button onClick={downloadInstructions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Guia
            </Button>
            <Button onClick={clearAllCache} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>

          <Alert className="border-blue-500">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Como preparar para offline:</strong>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Acesse o sistema COM INTERNET</li>
                <li>Navegue por: Dashboard, Usuários, Tarefas, Interessados</li>
                <li>Aguarde as páginas carregarem completamente</li>
                <li>Desconecte e use offline - dados estarão disponíveis!</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Guia Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Guia Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-2">
                ✅ O que é cacheado automaticamente:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Páginas:</strong> 97 arquivos (HTML, JS, CSS, imagens)</li>
                <li><strong>Dados:</strong> Respostas de todas as APIs que você acessar</li>
                <li><strong>Usuários:</strong> Lista completa ao abrir /users</li>
                <li><strong>Tarefas:</strong> Suas tarefas ao abrir /tasks</li>
                <li><strong>Interessados:</strong> Lista ao abrir /interested</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                📱 Como instalar como PWA:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Chrome/Edge:</strong> Menu → Instalar 7care</li>
                <li><strong>Safari iOS:</strong> Compartilhar → Adicionar à Tela Inicial</li>
                <li><strong>Chrome Android:</strong> Menu → Instalar app</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
              <p className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                🔍 Como verificar o cache:
              </p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Abra DevTools (F12)</li>
                <li>Vá em <strong>Application → Cache Storage</strong></li>
                <li>Veja <strong>7care-v27-precache-total</strong> (páginas)</li>
                <li>Veja <strong>7care-api-v27</strong> (dados da API)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
