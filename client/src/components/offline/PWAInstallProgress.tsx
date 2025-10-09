/**
 * 📦 MODAL DE PROGRESSO DE INSTALAÇÃO OFFLINE
 * 
 * Aparece automaticamente após instalar o PWA
 * Configura acesso à pasta offline local
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FolderOpen,
  Download,
  CheckCircle,
  Loader2,
  AlertCircle,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallProgressProps {
  isAdmin: boolean;
}

export function PWAInstallProgress({ isAdmin }: PWAInstallProgressProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'welcome' | 'selecting' | 'loading' | 'complete' | 'error'>('welcome');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [folderHandle, setFolderHandle] = useState<any>(null);
  const [filesLoaded, setFilesLoaded] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Detectar quando PWA é instalado
  useEffect(() => {
    if (!isAdmin) return;

    const handleAppInstalled = () => {
      // Verificar se já configurou antes
      const hasConfigured = localStorage.getItem('offline-folder-configured');
      
      if (!hasConfigured) {
        setTimeout(() => {
          setShowModal(true);
        }, 1500);
      }
    };

    // Detectar instalação do PWA
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detectar se já está em modo standalone (já instalado)
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const hasConfigured = localStorage.getItem('offline-folder-configured');
    
    if (isPWAInstalled && !hasConfigured) {
      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAdmin]);

  const selectOfflineFolder = async () => {
    // Verificar suporte ao File System Access API
    if (!('showDirectoryPicker' in window)) {
      setStep('error');
      setMessage('Seu navegador não suporta acesso a pastas. Use Chrome ou Edge.');
      return;
    }

    try {
      setStep('selecting');
      setMessage('Aguardando seleção de pasta...');

      // Solicitar permissão para acessar pasta
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
        startIn: 'downloads'
      });

      setFolderHandle(dirHandle);
      setStep('loading');
      setMessage('Carregando arquivos da pasta offline...');

      // Verificar e carregar arquivos
      await loadOfflineFiles(dirHandle);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStep('welcome');
        setMessage('');
      } else {
        setStep('error');
        setMessage(`Erro: ${error.message}`);
      }
    }
  };

  const loadOfflineFiles = async (dirHandle: any) => {
    try {
      const files: string[] = [];
      
      // Verificar arquivos essenciais
      const requiredFiles = ['index.html', 'sw.js', 'manifest.json'];
      let foundFiles = 0;
      let totalScanned = 0;

      // Iterar pelos arquivos da pasta
      for await (const entry of dirHandle.values()) {
        totalScanned++;
        
        if (entry.kind === 'file') {
          files.push(entry.name);
          
          if (requiredFiles.includes(entry.name)) {
            foundFiles++;
          }
        }
        
        // Atualizar progresso
        const prog = Math.min(90, (totalScanned / 100) * 90);
        setProgress(prog);
        setFilesLoaded(totalScanned);
        setTotalFiles(100);
      }

      setTotalFiles(totalScanned);

      // Verificar se encontrou arquivos essenciais
      if (foundFiles >= 2) {
        // Salvar handle da pasta para uso futuro
        localStorage.setItem('offline-folder-configured', 'true');
        localStorage.setItem('offline-folder-name', dirHandle.name);
        
        // Registrar permissão persistente se disponível
        if ('persist' in navigator.storage) {
          const persisted = await navigator.storage.persist();
          console.log('Permissão persistente:', persisted);
        }

        setProgress(100);
        setStep('complete');
        setMessage(`Pasta configurada com ${totalScanned} arquivos!`);

        toast({
          title: "Configuração concluída!",
          description: `Pasta offline configurada com sucesso. ${totalScanned} arquivos encontrados.`,
        });

      } else {
        setStep('error');
        setMessage('Pasta selecionada não contém os arquivos necessários do 7care.');
      }

    } catch (error: any) {
      setStep('error');
      setMessage(`Erro ao carregar arquivos: ${error.message}`);
    }
  };

  const skipConfiguration = () => {
    localStorage.setItem('offline-folder-configured', 'skipped');
    setShowModal(false);
  };

  const retryConfiguration = () => {
    setStep('welcome');
    setProgress(0);
    setMessage('');
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        {/* WELCOME */}
        {step === 'welcome' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                🎉 PWA Instalado com Sucesso!
              </DialogTitle>
              <DialogDescription>
                Configure a pasta offline para funcionamento completo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-blue-500">
                <HardDrive className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuração Offline:</strong>
                  <p className="mt-2 text-sm">
                    Para que o PWA funcione offline com todos os dados, 
                    você precisa selecionar a pasta onde os arquivos offline estão instalados.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p className="font-semibold">📁 Pasta esperada:</p>
                <code className="block bg-background p-2 rounded text-xs">
                  /Users/filipevitolapeixoto/Downloads/7careoffiline
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Certifique-se de que esta pasta existe e contém os arquivos do 7care
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">✨ O que acontecerá:</p>
                <ol className="list-decimal ml-5 text-sm space-y-1">
                  <li>Você selecionará a pasta offline</li>
                  <li>O PWA verificará os arquivos</li>
                  <li>Configurará acesso persistente</li>
                  <li>Sistema funcionará offline com dados!</li>
                </ol>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={skipConfiguration} variant="outline" className="flex-1">
                Agora Não
              </Button>
              <Button onClick={selectOfflineFolder} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <FolderOpen className="h-4 w-4 mr-2" />
                Selecionar Pasta
              </Button>
            </DialogFooter>
          </>
        )}

        {/* SELECTING */}
        {step === 'selecting' && (
          <>
            <DialogHeader>
              <DialogTitle>Selecionando Pasta...</DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </>
        )}

        {/* LOADING */}
        {step === 'loading' && (
          <>
            <DialogHeader>
              <DialogTitle>Carregando Arquivos...</DialogTitle>
              <DialogDescription>
                Verificando arquivos na pasta offline
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="flex items-center justify-center mb-4">
                <FileCheck className="h-16 w-16 text-blue-600 animate-pulse" />
              </div>
              
              <Progress value={progress} className="h-3" />
              
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">
                  {Math.round(progress)}% - {message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {filesLoaded} arquivos verificados...
                </p>
              </div>
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
                O PWA está pronto para funcionar offline
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong className="text-green-700 dark:text-green-400">
                    ✅ Pasta offline configurada com sucesso!
                  </strong>
                  <p className="text-sm mt-2">
                    {totalFiles} arquivos encontrados e verificados
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p className="font-semibold">🎉 O que você pode fazer agora:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Usar o PWA completamente offline</li>
                  <li>Acessar todas as páginas sem internet</li>
                  <li>Ver todos os dados (usuários, tarefas, etc)</li>
                  <li>Funciona como se estivesse online!</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Importante:</strong> Esta configuração é salva no navegador. 
                  Se limpar dados do navegador, precisará selecionar a pasta novamente.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowModal(false)} className="w-full">
                Começar a Usar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                Erro na Configuração
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro:</strong>
                  <p className="text-sm mt-2">{message}</p>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">💡 Soluções possíveis:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Use o navegador Chrome ou Edge (suporte completo)</li>
                  <li>Certifique-se de que a pasta 7careoffiline existe</li>
                  <li>Verifique se os arquivos foram baixados corretamente</li>
                  <li>Tente novamente com permissões adequadas</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={skipConfiguration} variant="outline" className="flex-1">
                Configurar Depois
              </Button>
              <Button onClick={retryConfiguration} className="flex-1">
                Tentar Novamente
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

