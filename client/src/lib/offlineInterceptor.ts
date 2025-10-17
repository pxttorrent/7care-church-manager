/**
 * Interceptador Global de Fetch para Sistema Offline
 * Intercepta TODAS as chamadas de API e as integra ao sistema offline
 */

import { offlineDB } from './offlineDatabase';
import { offlineQueue, QueueOperation } from './offlineQueue';

// Configuração do interceptador
interface OfflineInterceptorConfig {
  enabled: boolean;
  cacheEnabled: boolean;
  queueEnabled: boolean;
  cacheableMethods: string[];
  queueableMethods: string[];
  excludedEndpoints: string[];
  cacheDuration: number; // em ms
}

const defaultConfig: OfflineInterceptorConfig = {
  enabled: true,
  cacheEnabled: true,
  queueEnabled: true,
  cacheableMethods: ['GET'],
  queueableMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  excludedEndpoints: [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/register',
    '/api/test-offline'
  ],
  cacheDuration: 5 * 60 * 1000, // 5 minutos
};

class OfflineInterceptor {
  private config: OfflineInterceptorConfig = defaultConfig;
  private originalFetch: typeof fetch;
  private isInitialized = false;

  constructor() {
    this.originalFetch = window.fetch;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await offlineDB.initialize();
      await offlineQueue.initialize();
      
      // Substituir fetch global
      window.fetch = this.interceptedFetch.bind(this);
      
      this.isInitialized = true;
      console.log('✅ Interceptador Offline inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar interceptador offline:', error);
    }
  }

  updateConfig(newConfig: Partial<OfflineInterceptorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuração do interceptador atualizada:', this.config);
  }

  private async interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Se interceptador desabilitado, usar fetch original
    if (!this.config.enabled) {
      return this.originalFetch(input, init);
    }

    const url = this.normalizeUrl(input);
    const method = init?.method || 'GET';

    // Verificar se endpoint deve ser excluído
    if (this.shouldExcludeEndpoint(url)) {
      return this.originalFetch(input, init);
    }

    console.log(`🌐 Interceptador: ${method} ${url}`);

    // Para requisições GET, tentar cache primeiro
    if (this.config.cacheEnabled && this.config.cacheableMethods.includes(method)) {
      try {
        const cachedData = await this.getFromCache(url);
        if (cachedData && !this.isCacheExpired(cachedData)) {
          console.log(`📦 Cache hit: ${url}`);
          return this.createResponse(cachedData.data, cachedData.headers);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao verificar cache para ${url}:`, error);
      }
    }

    try {
      // Fazer requisição original
      const response = await this.originalFetch(input, init);
      
      // Se sucesso, processar cache e fila
      if (response.ok) {
        await this.handleSuccessfulResponse(url, method, response, init);
      } else {
        // Se falha, tentar cache como fallback
        if (this.config.cacheEnabled && this.config.cacheableMethods.includes(method)) {
          const cachedData = await this.getFromCache(url);
          if (cachedData) {
            console.log(`🔄 Fallback para cache: ${url}`);
            return this.createResponse(cachedData.data, cachedData.headers);
          }
        }
      }

      return response;
    } catch (error) {
      console.error(`❌ Erro na requisição ${url}:`, error);
      
      // Se erro de rede, tentar cache como fallback
      if (this.config.cacheEnabled && this.config.cacheableMethods.includes(method)) {
        const cachedData = await this.getFromCache(url);
        if (cachedData) {
          console.log(`🔄 Fallback para cache (offline): ${url}`);
          return this.createResponse(cachedData.data, cachedData.headers);
        }
      }

      // Se não há cache, adicionar à fila se for operação modificadora
      if (this.config.queueEnabled && this.config.queueableMethods.includes(method)) {
        await this.addToQueue(url, method, init);
      }

      throw error;
    }
  }

  private normalizeUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') {
      return input;
    }
    if (input instanceof URL) {
      return input.toString();
    }
    if (input instanceof Request) {
      return input.url;
    }
    return String(input);
  }

  private shouldExcludeEndpoint(url: string): boolean {
    // Verificar esquemas não suportados
    if (url.startsWith('chrome-extension:') ||
        url.startsWith('chrome:') ||
        url.startsWith('moz-extension:') ||
        url.startsWith('edge-extension:') ||
        url.startsWith('safari-extension:') ||
        url.startsWith('data:') ||
        url.startsWith('blob:') ||
        !url.startsWith('http')) {
      return true;
    }

    // Verificar endpoints excluídos
    return this.config.excludedEndpoints.some(endpoint => url.includes(endpoint));
  }

  private async getFromCache(url: string): Promise<any> {
    try {
      return await offlineDB.getCachedData(url);
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar cache para ${url}:`, error);
      return null;
    }
  }

  private async saveToCache(url: string, data: any, headers: Record<string, string>): Promise<void> {
    try {
      const cacheData = {
        data,
        headers,
        timestamp: Date.now(),
        url
      };
      await offlineDB.cacheData(url, cacheData);
      console.log(`💾 Dados salvos no cache: ${url}`);
    } catch (error) {
      console.warn(`⚠️ Erro ao salvar cache para ${url}:`, error);
    }
  }

  private async addToQueue(url: string, method: string, init?: RequestInit): Promise<void> {
    try {
      const operation: Omit<QueueOperation, 'id' | 'timestamp' | 'status' | 'retryCount'> = {
        type: this.getOperationType(method),
        endpoint: url,
        method: method as any,
        data: init?.body ? JSON.parse(init.body as string) : undefined,
        priority: this.getPriority(url, method),
        maxRetries: 3,
        metadata: {
          description: `Operação ${method} para ${url}`,
          category: this.getCategory(url),
          headers: init?.headers ? Object.fromEntries(new Headers(init.headers)) : undefined
        }
      };

      await offlineQueue.addOperation(operation);
      console.log(`📝 Operação adicionada à fila: ${method} ${url}`);
    } catch (error) {
      console.warn(`⚠️ Erro ao adicionar à fila ${url}:`, error);
    }
  }

  private async handleSuccessfulResponse(
    url: string,
    method: string,
    response: Response,
    init?: RequestInit
  ): Promise<void> {
    // Salvar no cache se for GET
    if (this.config.cacheEnabled && this.config.cacheableMethods.includes(method)) {
      try {
        const responseClone = response.clone();
        const data = await responseClone.json();
        const headers: Record<string, string> = {};
        
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        await this.saveToCache(url, data, headers);
      } catch (error) {
        console.warn(`⚠️ Erro ao processar resposta para cache ${url}:`, error);
      }
    }
  }

  private getOperationType(method: string): 'CREATE' | 'UPDATE' | 'DELETE' {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UPDATE';
    }
  }

  private getPriority(url: string, method: string): 'high' | 'normal' | 'low' {
    // Prioridade alta para operações críticas
    if (url.includes('/api/users') || url.includes('/api/auth')) {
      return 'high';
    }
    
    // Prioridade normal para operações comuns
    if (url.includes('/api/tasks') || url.includes('/api/events')) {
      return 'normal';
    }
    
    // Prioridade baixa para operações de sistema
    return 'low';
  }

  private getCategory(url: string): string {
    if (url.includes('/api/users')) return 'users';
    if (url.includes('/api/events')) return 'events';
    if (url.includes('/api/tasks')) return 'tasks';
    if (url.includes('/api/auth')) return 'auth';
    if (url.includes('/api/dashboard')) return 'dashboard';
    if (url.includes('/api/system')) return 'system';
    return 'general';
  }

  private isCacheExpired(cachedData: any): boolean {
    const age = Date.now() - cachedData.timestamp;
    return age > this.config.cacheDuration;
  }

  private createResponse(data: any, headers: Record<string, string>): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  // Método para limpar cache de endpoints específicos
  async clearCacheForEndpoint(endpoint: string): Promise<void> {
    try {
      await offlineDB.removeCachedData(endpoint);
      console.log(`🗑️ Cache limpo para endpoint: ${endpoint}`);
    } catch (error) {
      console.warn(`⚠️ Erro ao limpar cache para ${endpoint}:`, error);
    }
  }

  // Método para limpar todo o cache
  async clearAllCache(): Promise<void> {
    try {
      await offlineDB.clearOldCache();
      console.log(`🗑️ Todo o cache foi limpo`);
    } catch (error) {
      console.warn(`⚠️ Erro ao limpar todo o cache:`, error);
    }
  }

  // Método para obter estatísticas do interceptador
  async getStats(): Promise<{
    cacheStats: any;
    queueStats: any;
    config: OfflineInterceptorConfig;
  }> {
    try {
      const cacheStats = await offlineDB.getCacheStats();
      const queueStats = await offlineQueue.getQueueStats();
      
      return {
        cacheStats,
        queueStats,
        config: this.config
      };
    } catch (error) {
      console.warn(`⚠️ Erro ao obter estatísticas:`, error);
      return {
        cacheStats: null,
        queueStats: null,
        config: this.config
      };
    }
  }

  // Método para desabilitar o interceptador
  disable(): void {
    this.config.enabled = false;
    console.log('🔴 Interceptador Offline desabilitado');
  }

  // Método para reabilitar o interceptador
  enable(): void {
    this.config.enabled = true;
    console.log('🟢 Interceptador Offline habilitado');
  }

  // Método para restaurar fetch original
  restore(): void {
    window.fetch = this.originalFetch;
    this.isInitialized = false;
    console.log('🔄 Fetch original restaurado');
  }
}

// Instância singleton
export const offlineInterceptor = new OfflineInterceptor();
