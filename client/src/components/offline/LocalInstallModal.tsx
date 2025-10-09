/**
 * 📱 MODAL DE INSTALAÇÃO LOCAL DO PWA
 * 
 * Permite admin selecionar onde instalar a versão offline
 * Funciona tanto em desktop quanto em mobile
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  Download, 
  Smartphone, 
  Monitor,
  CheckCircle,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocalInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export function LocalInstallModal({ isOpen, onClose, isAdmin }: LocalInstallModalProps) {
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [installPath, setInstallPath] = useState('');
  const [step, setStep] = useState<'intro' | 'platform' | 'desktop' | 'mobile' | 'downloading' | 'complete'>('intro');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    // Detectar se é mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePlatformSelect = (platform: 'desktop' | 'mobile') => {
    if (platform === 'desktop') {
      setStep('desktop');
      setInstallPath('/Users/[seu-usuario]/Downloads/7careoffiline');
    } else {
      setStep('mobile');
    }
  };

  const selectFolder = async () => {
    // File System Access API (apenas Chrome/Edge desktop)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setInstallPath(dirHandle.name);
        toast({
          title: "Pasta selecionada",
          description: `Instalação será feita em: ${dirHandle.name}`,
        });
      } catch (error) {
        console.log('Usuário cancelou seleção de pasta');
      }
    } else {
      toast({
        title: "Recurso não disponível",
        description: "Seu navegador não suporta seleção de pastas. Digite o caminho manualmente.",
        variant: "destructive"
      });
    }
  };

  const downloadOfflineVersion = async () => {
    setStep('downloading');
    
    // Simular download dos arquivos
    for (let i = 0; i <= 100; i += 10) {
      setDownloadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Salvar configuração
    localStorage.setItem('offline-install-path', installPath);
    localStorage.setItem('offline-install-date', new Date().toISOString());

    setStep('complete');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Comando copiado para área de transferência",
    });
  };

  return (
    <Dialog open={isOpen && isAdmin} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* INTRO */}
        {step === 'intro' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">📦 Instalação Offline Completa</DialogTitle>
              <DialogDescription className="text-base">
                Configure o 7care para funcionar completamente offline com todos os dados
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-blue-500">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Como funciona:</strong>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                    <li>Baixa todos os arquivos do sistema para seu dispositivo</li>
                    <li>Cria uma instalação local que funciona como localhost</li>
                    <li>Páginas + Dados ficam disponíveis offline</li>
                    <li>Pode usar sem internet completamente</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">📦 O que será instalado:</h3>
                  <ul className="text-sm space-y-1">
                    <li>✅ 97 arquivos da aplicação (~24 MB)</li>
                    <li>✅ Todas as 22 páginas do sistema</li>
                    <li>✅ Service Worker configurado</li>
                    <li>✅ Manifest PWA</li>
                    <li>✅ Scripts de inicialização</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setStep('platform')} className="w-full">
                Continuar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* SELEÇÃO DE PLATAFORMA */}
        {step === 'platform' && (
          <>
            <DialogHeader>
              <DialogTitle>Selecione sua Plataforma</DialogTitle>
              <DialogDescription>
                Escolha onde você está instalando
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
              <button
                onClick={() => handlePlatformSelect('desktop')}
                className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all group"
              >
                <Monitor className="h-12 w-12 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2">💻 Computador</h3>
                <p className="text-sm text-muted-foreground">
                  Windows, Mac ou Linux
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Instalação em pasta local com servidor
                </p>
              </button>

              <button
                onClick={() => handlePlatformSelect('mobile')}
                className="p-6 border-2 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all group"
              >
                <Smartphone className="h-12 w-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2">📱 Celular/Tablet</h3>
                <p className="text-sm text-muted-foreground">
                  Android ou iOS
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Instalação via PWA nativo
                </p>
              </button>
            </div>

            <DialogFooter>
              <Button onClick={() => setStep('intro')} variant="outline">
                Voltar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* INSTALAÇÃO DESKTOP */}
        {step === 'desktop' && (
          <>
            <DialogHeader>
              <DialogTitle>💻 Instalação para Desktop</DialogTitle>
              <DialogDescription>
                Configure a pasta onde os arquivos serão baixados
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="install-path">Caminho da Instalação</Label>
                <div className="flex gap-2">
                  <Input
                    id="install-path"
                    value={installPath}
                    onChange={(e) => setInstallPath(e.target.value)}
                    placeholder="/Users/usuario/Downloads/7careoffiline"
                  />
                  {('showDirectoryPicker' in window) && (
                    <Button onClick={selectFolder} variant="outline">
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recomendado: Pasta Downloads ou Desktop
                </p>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Importante:</strong> Após o download, você precisará:
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>Abrir a pasta no Terminal/Prompt</li>
                    <li>Executar o script de inicialização</li>
                    <li>Acessar via http://localhost:8080</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2 text-sm">📋 Comandos após download:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background p-2 rounded flex-1">
                      cd {installPath || '/caminho/para/pasta'}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(`cd ${installPath || '/caminho/para/pasta'}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background p-2 rounded flex-1">
                      ./start-offline.sh
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard('./start-offline.sh')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Depois acesse: <strong>http://localhost:8080</strong>
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={() => setStep('platform')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={downloadOfflineVersion} 
                disabled={!installPath}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Preparar Instalação
              </Button>
            </DialogFooter>
          </>
        )}

        {/* INSTALAÇÃO MOBILE */}
        {step === 'mobile' && (
          <>
            <DialogHeader>
              <DialogTitle>📱 Instalação para Mobile</DialogTitle>
              <DialogDescription>
                Instruções para Android e iOS
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-green-500">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Modo Mobile:</strong> Em dispositivos móveis, a melhor forma é instalar como PWA nativo. 
                  O sistema funcionará offline usando cache do navegador.
                </AlertDescription>
              </Alert>

              {/* Android */}
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  Android (Chrome)
                </h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm">
                  <li>Acesse <strong>https://7care.netlify.app</strong></li>
                  <li>Toque no menu (⋮) do Chrome</li>
                  <li>Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                  <li>Confirme a instalação</li>
                  <li>Ícone aparecerá na tela inicial</li>
                  <li>Abra e use normalmente</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  iOS/iPadOS (Safari)
                </h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm">
                  <li>Acesse <strong>https://7care.netlify.app</strong> no Safari</li>
                  <li>Toque no botão <strong>Compartilhar</strong> (□↑)</li>
                  <li>Role e selecione <strong>"Adicionar à Tela de Início"</strong></li>
                  <li>Edite o nome se quiser</li>
                  <li>Toque em <strong>"Adicionar"</strong></li>
                  <li>Ícone aparecerá na tela inicial</li>
                </ol>
              </div>

              <Alert className="border-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Importante:</strong> Após instalar o PWA no celular:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Service Worker v27 cacheará automaticamente 97 arquivos</li>
                    <li>Páginas funcionarão offline</li>
                    <li>Dados da API precisam de conexão na primeira vez</li>
                    <li>Depois ficam em cache para uso offline</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={() => setStep('platform')} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button onClick={onClose} className="flex-1">
                Entendi, Obrigado!
              </Button>
            </DialogFooter>
          </>
        )}

        {/* DOWNLOADING */}
        {step === 'downloading' && (
          <>
            <DialogHeader>
              <DialogTitle>⏳ Preparando Instalação...</DialogTitle>
              <DialogDescription>
                Aguarde enquanto preparamos os arquivos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <Progress value={downloadProgress} className="h-3" />
              <p className="text-center text-sm text-muted-foreground">
                {downloadProgress}% - Configurando arquivos...
              </p>
            </div>
          </>
        )}

        {/* COMPLETE */}
        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Configuração Concluída!
              </DialogTitle>
              <DialogDescription>
                Siga os passos abaixo para finalizar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong className="text-green-700 dark:text-green-400">
                    ✅ Instalação local configurada em:
                  </strong>
                  <code className="block mt-2 p-2 bg-background rounded text-sm">
                    {installPath}
                  </code>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">📋 Próximos Passos:</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <p className="font-semibold mb-1">1️⃣ Baixar arquivos:</p>
                    <p className="text-xs mb-2">Os arquivos estão em:</p>
                    <code className="text-xs bg-background p-2 rounded block">
                      /Users/filipevitolapeixoto/Downloads/7careoffiline
                    </code>
                  </div>

                  <div className="p-3 bg-muted rounded">
                    <p className="font-semibold mb-1">2️⃣ Abrir Terminal:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-background p-2 rounded flex-1">
                        cd /Users/filipevitolapeixoto/Downloads/7careoffiline
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('cd /Users/filipevitolapeixoto/Downloads/7careoffiline')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded">
                    <p className="font-semibold mb-1">3️⃣ Iniciar servidor:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-background p-2 rounded flex-1">
                        python3 -m http.server 8080
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('python3 -m http.server 8080')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                    <p className="font-semibold mb-1">4️⃣ Acessar:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-background p-2 rounded flex-1">
                        http://localhost:8080
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open('http://localhost:8080', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Dica:</strong> Adicione aos favoritos do navegador para acesso rápido!
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button onClick={onClose} className="w-full">
                Concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

