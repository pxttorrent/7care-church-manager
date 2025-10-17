/**
 * Sistema de sincronização automática inteligente
 * Gerencia sincronização baseada em conectividade, bateria e uso
 */

export interface SyncConfig {
  enabled: boolean;
  interval: number; // em ms
  batteryThreshold: number; // 0-100
  wifiOnly: boolean;
  maxRetries: number;
  retryDelay: number; // em ms
  priorityEndpoints: string[]; // endpoints prioritários
  blacklistedEndpoints: string[]; // endpoints que não devem ser sincronizados
}

export interface SyncStats {
  lastSync: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  pendingOperations: number;
  batteryLevel: number;
  connectionType: string;
}

export interface SyncEvent {
  type: 'started' | 'completed' | 'failed' | 'paused' | 'resumed';
  timestamp: number;
  details?: any;
}

class OfflineSync {
  private static instance: OfflineSync;
  private config: SyncConfig;
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;
  private syncStats: SyncStats;
  private eventListeners: ((event: SyncEvent) => void)[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      interval: 30000, // 30 segundos
      batteryThreshold: 20, // 20%
      wifiOnly: false,
      maxRetries: 3,
      retryDelay: 5000, // 5 segundos
      priorityEndpoints: [
        '/api/users',
        '/api/tasks',
        '/api/calendar'
      ],
      blacklistedEndpoints: [
        '/api/analytics',
        '/api/logs'
      ]
    };

    this.syncStats = {
      lastSync: 0,
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      pendingOperations: 0,
      batteryLevel: 100,
      connectionType: 'unknown'
    };

    this.loadConfig();
    this.loadStats();
  }

  static getInstance(): OfflineSync {
    if (!OfflineSync.instance) {
      OfflineSync.instance = new OfflineSync();
    }
    return OfflineSync.instance;
  }

  /**
   * Inicializa o sistema de sincronização
   */
  async initialize(): Promise<void> {
    console.log('🔄 Inicializando sincronização automática...');
    
    // Configurar listeners de eventos
    this.setupEventListeners();
    
    // Verificar conectividade inicial
    await this.updateConnectionInfo();
    
    // Iniciar sincronização se condições forem atendidas
    if (this.shouldStartSync()) {
      await this.start();
    }
    
    console.log('✅ Sincronização automática inicializada');
  }

  /**
   * Inicia a sincronização automática
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Sincronização já está rodando');
      return;
    }

    if (!this.config.enabled) {
      console.log('⚠️ Sincronização desabilitada');
      return;
    }

    this.isRunning = true;
    this.emitEvent({ type: 'started', timestamp: Date.now() });
    
    console.log('🚀 Sincronização automática iniciada');

    // Sincronização imediata
    await this.performSync();

    // Configurar intervalo
    this.syncInterval = setInterval(async () => {
      if (this.shouldPerformSync()) {
        await this.performSync();
      }
    }, this.config.interval);
  }

  /**
   * Para a sincronização automática
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.emitEvent({ type: 'paused', timestamp: Date.now() });
    console.log('⏸️ Sincronização automática pausada');
  }

  /**
   * Executa uma sincronização manual
   */
  async syncNow(): Promise<{ success: boolean; operations: number; duration: number }> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Executando sincronização manual...');
      
      const result = await this.performSync();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Sincronização manual concluída em ${duration}ms`);
      
      return {
        success: true,
        operations: result.operations,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Erro na sincronização manual:', error);
      
      return {
        success: false,
        operations: 0,
        duration
      };
    }
  }

  /**
   * Executa a sincronização
   */
  private async performSync(): Promise<{ operations: number }> {
    const startTime = Date.now();
    
    try {
      // Atualizar informações de conectividade
      await this.updateConnectionInfo();
      
      // Verificar se deve sincronizar
      if (!this.shouldPerformSync()) {
        return { operations: 0 };
      }

      // Importar fila dinamicamente para evitar dependência circular
      const { offlineQueue } = await import('./offlineQueue');
      const { offlineDB } = await import('./offlineDatabase');

      // Sincronizar fila de operações
      const queueResult = await offlineQueue.processQueue();
      
      // Sincronizar cache de dados
      await this.syncCacheData();

      // Atualizar estatísticas
      const duration = Date.now() - startTime;
      this.updateStats(true, duration, queueResult.success);

      this.lastSyncTime = Date.now();
      this.emitEvent({ 
        type: 'completed', 
        timestamp: Date.now(),
        details: { 
          operations: queueResult.success,
          duration,
          queueStats: queueResult
        }
      });

      console.log(`✅ Sincronização concluída: ${queueResult.success} operações em ${duration}ms`);
      
      return { operations: queueResult.success };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateStats(false, duration, 0);
      
      this.emitEvent({ 
        type: 'failed', 
        timestamp: Date.now(),
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido', duration }
      });
      
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Sincroniza dados do cache
   */
  private async syncCacheData(): Promise<void> {
    try {
      const { offlineDB } = await import('./offlineDatabase');
      
      // Obter estatísticas do cache
      const cacheStats = await offlineDB.getCacheStats();
      
      // Se cache está muito grande, limpar dados antigos
      if (cacheStats.totalSize > 10 * 1024 * 1024) { // 10MB
        console.log('🧹 Limpando cache antigo...');
        await offlineDB.cleanupOldCache(7 * 24 * 60 * 60 * 1000); // 7 dias
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar cache:', error);
    }
  }

  /**
   * Verifica se deve iniciar a sincronização
   */
  private shouldStartSync(): boolean {
    return (
      this.config.enabled &&
      navigator.onLine &&
      this.syncStats.batteryLevel > this.config.batteryThreshold &&
      this.checkConnectionType()
    );
  }

  /**
   * Verifica se deve executar sincronização
   */
  private shouldPerformSync(): boolean {
    if (!navigator.onLine) return false;
    if (this.syncStats.batteryLevel <= this.config.batteryThreshold) return false;
    if (!this.checkConnectionType()) return false;
    
    // Evitar sincronização muito frequente
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    if (timeSinceLastSync < 5000) return false; // 5 segundos mínimo
    
    return true;
  }

  /**
   * Verifica tipo de conexão
   */
  private checkConnectionType(): boolean {
    if (!this.config.wifiOnly) return true;
    
    // Verificar se é WiFi (simplificado)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return connection.effectiveType === '4g' || connection.type === 'wifi';
    }
    
    // Se não conseguir detectar, assumir que é WiFi
    return true;
  }

  /**
   * Atualiza informações de conectividade
   */
  private async updateConnectionInfo(): Promise<void> {
    // Atualizar nível de bateria
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.syncStats.batteryLevel = Math.round(battery.level * 100);
      } catch (error) {
        // Fallback se não conseguir acessar bateria
        this.syncStats.batteryLevel = 100;
      }
    }

    // Atualizar tipo de conexão
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      this.syncStats.connectionType = connection.effectiveType || connection.type || 'unknown';
    } else {
      this.syncStats.connectionType = navigator.onLine ? 'online' : 'offline';
    }
  }

  /**
   * Atualiza estatísticas de sincronização
   */
  private updateStats(success: boolean, duration: number, operations: number): void {
    this.syncStats.totalSyncs++;
    
    if (success) {
      this.syncStats.successfulSyncs++;
    } else {
      this.syncStats.failedSyncs++;
    }

    // Calcular tempo médio de sincronização
    this.syncStats.averageSyncTime = 
      (this.syncStats.averageSyncTime * (this.syncStats.totalSyncs - 1) + duration) / 
      this.syncStats.totalSyncs;

    this.syncStats.lastSync = Date.now();
    this.saveStats();
  }

  /**
   * Configura listeners de eventos
   */
  private setupEventListeners(): void {
    // Detectar mudanças de conectividade
    window.addEventListener('online', () => {
      console.log('🌐 Conectividade restaurada');
      this.updateConnectionInfo();
      
      if (this.config.enabled && !this.isRunning) {
        this.start();
      }
    });

    window.addEventListener('offline', () => {
      console.log('📱 Conectividade perdida');
      this.updateConnectionInfo();
      
      if (this.isRunning) {
        this.stop();
      }
    });

    // Detectar visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Página oculta - pausar sincronização
        if (this.isRunning) {
          this.stop();
        }
      } else {
        // Página visível - retomar sincronização
        if (this.config.enabled && this.shouldStartSync()) {
          this.start();
        }
      }
    });
  }

  /**
   * Adiciona listener para eventos de sincronização
   */
  addEventListener(listener: (event: SyncEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove listener de eventos
   */
  removeEventListener(listener: (event: SyncEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Emite evento para listeners
   */
  private emitEvent(event: SyncEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ Erro no listener de sincronização:', error);
      }
    });
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    // Reiniciar sincronização se configuração mudou
    if (this.isRunning) {
      this.stop();
      if (this.config.enabled && this.shouldStartSync()) {
        this.start();
      }
    }
  }

  /**
   * Obtém estatísticas atuais
   */
  getStats(): SyncStats {
    return { ...this.syncStats };
  }

  /**
   * Verifica se está rodando
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Salva configuração no localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('offline-sync-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
    }
  }

  /**
   * Carrega configuração do localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('offline-sync-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configuração:', error);
    }
  }

  /**
   * Salva estatísticas no localStorage
   */
  private saveStats(): void {
    try {
      localStorage.setItem('offline-sync-stats', JSON.stringify(this.syncStats));
    } catch (error) {
      console.error('❌ Erro ao salvar estatísticas:', error);
    }
  }

  /**
   * Carrega estatísticas do localStorage
   */
  private loadStats(): void {
    try {
      const saved = localStorage.getItem('offline-sync-stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.syncStats = { ...this.syncStats, ...parsed };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  }
}

// Instância singleton
export const offlineSync = OfflineSync.getInstance();
