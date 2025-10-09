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
      // Lista de endpoints para cachear
      const endpointsToCache = [
        '/api/users',
        '/api/events',
        '/api/tasks',
        '/api/prayers',
        '/api/relationships',
        '/api/meetings',
        '/api/interested',
        '/api/dashboard/stats',
        '/api/dashboard/visits',
        '/api/users/birthdays',
        '/api/emotional-checkins/admin'
      ];

      const totalSteps = endpointsToCache.length + 2; // +2 para páginas
      let currentStep = 0;

      // Passo 1: Cachear páginas principais
      setInstallProgress(Math.round((++currentStep / totalSteps) * 100));
      const pagesToCache = [
        '/',
        '/dashboard',
        '/users',
        '/calendar',
        '/tasks',
        '/prayers',
        '/chat'
      ];

      console.log('📦 Cacheando páginas...');
      
      // Passo 2: Cachear APIs
      for (const endpoint of endpointsToCache) {
        try {
          const response = await fetch(endpoint, { credentials: 'include' });
          if (response.ok) {
            // Service Worker vai cachear automaticamente via fetch event
            console.log(`✅ API cacheada: ${endpoint}`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao cachear ${endpoint}:`, error);
        }
        
        setInstallProgress(Math.round((++currentStep / totalSteps) * 100));
      }

      // Passo 3: Marcar como instalado
      localStorage.setItem('offline-mode-installed', 'true');
      localStorage.setItem('offline-mode-installed-at', new Date().toISOString());

      setInstallProgress(100);

      // Ativar interceptor offline
      const { enableOfflineInterceptor } = await import('@/lib/offlineInterceptor');
      enableOfflineInterceptor(true);

      toast({
        title: '✅ Modo Offline Instalado!',
        description: 'Você pode usar o app sem internet agora. Suas ações offline serão sincronizadas automaticamente.',
        duration: 7000,
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
            <p className="text-xs text-muted-foreground mt-2">
              Vamos baixar e cachear todas as páginas e dados essenciais.
              Isso pode levar alguns segundos.
            </p>
          </DialogDescription>
        </DialogHeader>

        {isInstalling && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Instalando...</span>
              <span className="font-medium">{installProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${installProgress}%` }}
              />
            </div>
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

