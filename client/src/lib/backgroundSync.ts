/**
 * Serviço para registrar Background Sync
 * Permite sincronização mesmo quando o app está fechado
 */

export interface BackgroundSyncOptions {
  tag: string;
  minInterval?: number; // em segundos
  maxRetries?: number;
  data?: any;
}

export interface SyncRegistration {
  tag: string;
  timestamp: number;
  status: 'registered' | 'pending' | 'completed' | 'failed';
  retryCount: number;
}

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private registrations: Map<string, SyncRegistration> = new Map();
  private messageListener: ((event: MessageEvent) => void) | null = null;

  private constructor() {
    this.setupMessageListener();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  /**
   * Registra um Background Sync
   */
  async registerBackgroundSync(options: BackgroundSyncOptions): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('⚠️ Background Sync não é suportado neste navegador');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.sync) {
        console.warn('⚠️ Background Sync não está disponível');
        return false;
      }

      // Verificar se já existe um registro recente
      const existingRegistration = this.registrations.get(options.tag);
      if (existingRegistration) {
        const timeSinceLastSync = Date.now() - existingRegistration.timestamp;
        const minIntervalMs = (options.minInterval || 60) * 1000;
        
        if (timeSinceLastSync < minIntervalMs) {
          console.log(`⏰ Background Sync ${options.tag} ainda em cooldown`);
          return false;
        }
      }

      // Registrar o Background Sync
      await registration.sync.register(options.tag);
      
      // Armazenar informações do registro
      this.registrations.set(options.tag, {
        tag: options.tag,
        timestamp: Date.now(),
        status: 'registered',
        retryCount: 0
      });

      console.log(`✅ Background Sync registrado: ${options.tag}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar Background Sync:', error);
      return false;
    }
  }

  /**
   * Registra sincronização geral
   */
  async registerGeneralSync(): Promise<boolean> {
    return this.registerBackgroundSync({
      tag: 'background-sync',
      minInterval: 300, // 5 minutos
      maxRetries: 3
    });
  }

  /**
   * Registra sincronização específica por tipo
   */
  async registerTypeSync(type: 'users' | 'tasks' | 'calendar'): Promise<boolean> {
    return this.registerBackgroundSync({
      tag: `sync-${type}`,
      minInterval: 120, // 2 minutos
      maxRetries: 3,
      data: { type }
    });
  }

  /**
   * Força sincronização imediata
   */
  async forceSync(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.sync) {
        return false;
      }

      // Registrar múltiplos syncs para garantir que execute
      await Promise.all([
        registration.sync.register('background-sync'),
        registration.sync.register('sync-users'),
        registration.sync.register('sync-tasks'),
        registration.sync.register('sync-calendar')
      ]);

      console.log('🚀 Background Sync forçado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao forçar Background Sync:', error);
      return false;
    }
  }

  /**
   * Verifica se Background Sync é suportado
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
    );
  }

  /**
   * Obtém status dos registros
   */
  getRegistrationStatus(): SyncRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Limpa registros antigos
   */
  cleanupOldRegistrations(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [tag, registration] of this.registrations.entries()) {
      if (registration.timestamp < oneHourAgo) {
        this.registrations.delete(tag);
      }
    }
  }

  /**
   * Configura listener para mensagens do Service Worker
   */
  private setupMessageListener(): void {
    if (this.messageListener) {
      return;
    }

    this.messageListener = (event: MessageEvent) => {
      const data = event.data;
      
      if (!data || typeof data !== 'object') {
        return;
      }

      switch (data.type) {
        case 'sync-completed':
          this.handleSyncCompleted(data);
          break;
        case 'sync-error':
          this.handleSyncError(data);
          break;
        default:
          // Ignorar outros tipos de mensagem
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', this.messageListener);
  }

  /**
   * Trata sincronização concluída
   */
  private handleSyncCompleted(data: any): void {
    console.log('✅ Background Sync concluído:', data);
    
    // Atualizar status dos registros
    for (const [tag, registration] of this.registrations.entries()) {
      registration.status = 'completed';
    }

    // Notificar componentes sobre a sincronização
    this.notifySyncCompleted(data);
  }

  /**
   * Trata erro na sincronização
   */
  private handleSyncError(data: any): void {
    console.error('❌ Background Sync falhou:', data.error);
    
    // Atualizar status dos registros
    for (const [tag, registration] of this.registrations.entries()) {
      registration.status = 'failed';
      registration.retryCount++;
    }

    // Notificar componentes sobre o erro
    this.notifySyncError(data);
  }

  /**
   * Notifica componentes sobre sincronização concluída
   */
  private notifySyncCompleted(data: any): void {
    // Disparar evento customizado
    const event = new CustomEvent('background-sync-completed', {
      detail: {
        success: data.success,
        errors: data.errors,
        total: data.total,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Notifica componentes sobre erro na sincronização
   */
  private notifySyncError(data: any): void {
    // Disparar evento customizado
    const event = new CustomEvent('background-sync-error', {
      detail: {
        error: data.error,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Remove listener de mensagens
   */
  destroy(): void {
    if (this.messageListener) {
      navigator.serviceWorker.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
  }
}

// Instância singleton
export const backgroundSyncService = BackgroundSyncService.getInstance();
