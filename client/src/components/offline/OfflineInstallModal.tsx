/**
 * 🔄 MODAL DE INSTALAÇÃO DO MODO OFFLINE
 * 
 * Modal que aparece quando admin instala o PWA
 * Oferece instalação completa do modo offline
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
import { Cloud, Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineInstallModalProps {
  isAdmin: boolean;
}

export function OfflineInstallModal({ isAdmin }: OfflineInstallModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installMessage, setInstallMessage] = useState('Preparando download...');
  const { toast } = useToast();

  // Verificar se deve mostrar o modal
  useEffect(() => {
    if (!isAdmin) return;

    // Verificar se já instalou o modo offline
    const offlineInstalled = localStorage.getItem('offline-mode-installed');
    
    // Verificar se PWA foi instalado (appinstalled event ou standalone mode)
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');

    // Mostrar modal se PWA foi instalado mas modo offline não foi configurado
    if (isPWAInstalled && !offlineInstalled) {
      // Delay de 2 segundos para não aparecer muito rápido
      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    }
  }, [isAdmin]);

  // Função para instalar modo offline
  const installOfflineMode = async () => {
    setIsInstalling(true);
    setInstallProgress(0);

    try {
      // Importar função de download
      const { downloadAllData } = await import('@/lib/offlineStorage');

      // Download completo de dados com callback de progresso
      await downloadAllData((progress, message) => {
        setInstallProgress(progress);
        setInstallMessage(message);
        console.log(`📥 ${message} (${progress}%)`);
      });

      // Passo 3: Marcar como instalado
      localStorage.setItem('offline-mode-installed', 'true');
      localStorage.setItem('offline-mode-installed-at', new Date().toISOString());

      setInstallProgress(100);

      // Ativar interceptor offline
      const { enableOfflineInterceptor } = await import('@/lib/offlineInterceptor');
      enableOfflineInterceptor(true);

      // Obter tamanho dos dados
      const { getStorageSize } = await import('@/lib/offlineStorage');
      const storageSize = await getStorageSize();
      const sizeMB = (storageSize / 1024 / 1024).toFixed(1);

      toast({
        title: '✅ Dados Baixados com Sucesso!',
        description: `${sizeMB} MB armazenados no dispositivo. Você pode usar o app offline agora!`,
        duration: 8000,
      });

      setTimeout(() => {
        setShowModal(false);
        
        // Recarregar página para aplicar interceptor
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 1500);

    } catch (error) {
      console.error('Erro ao instalar modo offline:', error);
      toast({
        title: '❌ Erro na instalação',
        description: 'Não foi possível instalar o modo offline. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsInstalling(false);
    }
  };

  // Função para pular instalação
  const skipInstallation = () => {
    // Marcar como "pulado" para não mostrar novamente
    localStorage.setItem('offline-mode-skipped', 'true');
    setShowModal(false);
    
    toast({
      title: 'Instalação pulada',
      description: 'Você pode instalar o modo offline depois nas configurações.',
    });
  };

  if (!isAdmin || !showModal) return null;

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Instalar Modo Offline
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Como <strong>Administrador</strong>, você pode habilitar o modo offline completo!
            </p>
            <p className="text-sm">
              Isso permitirá que você:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>✅ Acesse o app sem internet</li>
              <li>✅ Consulte usuários, eventos e dados</li>
              <li>✅ Crie e edite registros offline</li>
              <li>✅ Sincronize automaticamente ao voltar online</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-xs font-medium text-blue-900 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download de Dados
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Todos os dados serão <strong>baixados e armazenados</strong> permanentemente no seu dispositivo para acesso offline completo.
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              O download inclui: usuários, eventos, tarefas, orações, reuniões, interessados e estatísticas.
              Tempo estimado: 10-30 segundos.
            </p>
          </DialogDescription>
        </DialogHeader>

        {isInstalling && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">{installMessage}</span>
              <span className="font-bold text-blue-900">{installProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${installProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Baixando dados para armazenamento permanente no dispositivo...
            </p>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={skipInstallation}
            disabled={isInstalling}
          >
            Agora Não
          </Button>
          <Button
            onClick={installOfflineMode}
            disabled={isInstalling}
            className="gap-2"
          >
            {isInstalling ? (
              <>
                <Download className="w-4 h-4 animate-pulse" />
                Instalando...
              </>
            ) : installProgress === 100 ? (
              <>
                <Check className="w-4 h-4" />
                Concluído!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Instalar Modo Offline
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

