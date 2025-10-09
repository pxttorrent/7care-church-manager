/**
 * 🎉 MODAL DE BEM-VINDO AO PWA OFFLINE
 * 
 * Modal que aparece quando admin instala o PWA
 * Informa sobre funcionalidade offline automática (Service Worker v27)
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
import { CheckCircle, Wifi, WifiOff, HardDrive, Zap } from 'lucide-react';

interface OfflineInstallModalProps {
  isAdmin: boolean;
}

export function OfflineInstallModal({ isAdmin }: OfflineInstallModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'ready' | 'pending'>('checking');

  useEffect(() => {
    if (!isAdmin) return;

    // Verificar se já viu a mensagem de boas-vindas v27
    const hasSeenWelcome = localStorage.getItem('offline-v27-welcome-seen');
    
    // Verificar se PWA foi instalado
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');

    // Mostrar modal apenas na primeira vez após instalar PWA
    if (isPWAInstalled && !hasSeenWelcome) {
      setTimeout(async () => {
        // Verificar status do cache
        await checkCache();
        setShowModal(true);
      }, 2000);
    }
  }, [isAdmin]);

  const checkCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const v27Cache = cacheNames.find(name => name.includes('7care-v27'));
        
        if (v27Cache) {
          const cache = await caches.open(v27Cache);
          const keys = await cache.keys();
          
          // Se tem mais de 50 itens, considera pronto
          setCacheStatus(keys.length > 50 ? 'ready' : 'pending');
        } else {
          setCacheStatus('pending');
        }
      } catch (error) {
        setCacheStatus('pending');
      }
    }
  };

  const handleClose = () => {
    localStorage.setItem('offline-v27-welcome-seen', 'true');
    setShowModal(false);
  };

  const handleGoToSettings = () => {
    localStorage.setItem('offline-v27-welcome-seen', 'true');
    setShowModal(false);
    window.location.href = '/settings?tab=offline-mode';
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            🎉 PWA Instalado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-base">
            Bem-vindo ao 7care como aplicativo instalado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status do Cache */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            {cacheStatus === 'ready' ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    ✅ Modo Offline Ativo!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Todas as páginas já funcionam offline
                  </p>
                </div>
              </>
            ) : cacheStatus === 'pending' ? (
              <>
                <Zap className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-700 dark:text-orange-400">
                    ⏳ Configurando Offline...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aguarde o cache completar (5-10 seg)
                  </p>
                </div>
              </>
            ) : (
              <>
                <HardDrive className="h-8 w-8 text-blue-600 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-semibold">Verificando cache...</p>
                </div>
              </>
            )}
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <p className="font-semibold">✨ O que você pode fazer agora:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <WifiOff className="h-4 w-4 mt-0.5 text-blue-600" />
                <p><strong>Usar offline:</strong> Todas as 20+ páginas funcionam sem internet</p>
              </div>
              <div className="flex items-start gap-2">
                <Wifi className="h-4 w-4 mt-0.5 text-green-600" />
                <p><strong>Sincronização automática:</strong> Dados sincronizam quando voltar online</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                <p><strong>Service Worker v27:</strong> Cache automático de 98 assets</p>
              </div>
            </div>
          </div>

          {/* Informação Adicional */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-1">💡 Dica Pro:</p>
            <p>
              Vá em <strong>Configurações → Modo Offline</strong> para verificar o status 
              completo e ver detalhes do cache.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={handleGoToSettings} className="flex-1">
            Ver Configurações de Offline
          </Button>
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Entendi, Obrigado!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
