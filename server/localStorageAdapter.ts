import { User, Event, Church } from '../shared/schema';
import * as bcrypt from 'bcryptjs';

export class LocalStorageAdapter {
  private static instance: LocalStorageAdapter;
  private storage: Map<string, any> = new Map();

  private constructor() {
    this.initializeStorage();
  }

  public static getInstance(): LocalStorageAdapter {
    if (!LocalStorageAdapter.instance) {
      LocalStorageAdapter.instance = new LocalStorageAdapter();
    }
    return LocalStorageAdapter.instance;
  }

  private initializeStorage() {
    // Inicializar todas as tabelas
    const tables = [
      'users', 'events', 'churches', 'emotional_checkins', 'points',
      'meetings', 'messages', 'conversations', 'notifications', 'achievements',
      'point_activities', 'missionary_profiles', 'relationships', 'discipleship_requests',
      'prayers', 'prayer_intercessors', 'video_call_sessions', 'video_call_participants',
      'conversation_participants', 'event_participants', 'meeting_types',
      'user_achievements', 'user_points_history', 'system_settings', 'system_config'
    ];

    tables.forEach(table => {
      if (!this.storage.has(table)) {
        this.storage.set(table, []);
      }
    });

    if (!this.storage.has('nextId')) {
      this.storage.set('nextId', {
        users: 1, events: 1, churches: 1, emotional_checkins: 1, points: 1,
        meetings: 1, messages: 1, conversations: 1, notifications: 1, achievements: 1,
        point_activities: 1, missionary_profiles: 1, relationships: 1, discipleship_requests: 1,
        prayers: 1, prayer_intercessors: 1, video_call_sessions: 1, video_call_participants: 1,
        conversation_participants: 1, event_participants: 1, meeting_types: 1,
        user_achievements: 1, user_points_history: 1, system_settings: 1, system_config: 1
      });
    }
  }

  // Métodos para usuários
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const users = this.storage.get('users') || [];
    const nextId = this.storage.get('nextId');
    
    // Criptografar a senha se fornecida
    let hashedPassword = userData.password;
    if (userData.password && !userData.password.startsWith('$2')) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
    
    const newUser: User = {
      id: nextId.users++,
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.storage.set('users', users);
    this.storage.set('nextId', nextId);
    this.saveToLocalStorage();
    
    return newUser;
  }

  async getUserById(id: number): Promise<User | null> {
    const users = this.storage.get('users') || [];
    return users.find((user: User) => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.storage.get('users') || [];
    return users.find((user: User) => user.email === email) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.storage.get('users') || [];
  }

  async getVisitedUsers(): Promise<User[]> {
    const users = this.storage.get('users') || [];
    console.log(`🔍 Total de usuários no storage: ${users.length}`);
    
    const visitedUsers = [];
    
    for (const user of users) {
      // Verificar se o usuário tem role member ou missionary
      if (user.role !== 'member' && user.role !== 'missionary') {
        continue;
      }
      
      // Verificar se foi visitado
      try {
        if (user.extraData) {
          let extraData;
          if (typeof user.extraData === 'string') {
            extraData = JSON.parse(user.extraData);
          } else {
            extraData = user.extraData;
          }
          
          if (extraData.visited === true) {
            console.log(`✅ Usuário visitado encontrado: ${user.name} (ID: ${user.id}, Role: ${user.role})`);
            (visitedUsers as any[]).push(user);
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao processar extraData do usuário ${user.name}:`, error);
      }
    }
    
    console.log(`📊 Total de usuários visitados encontrados: ${visitedUsers.length}`);
    return visitedUsers;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const users = this.storage.get('users') || [];
    const userIndex = users.findIndex((user: User) => user.id === id);
    
    if (userIndex === -1) return null;
    
    // Criptografar a senha se fornecida
    let hashedPassword = updates.password;
    if (updates.password && !updates.password.startsWith('$2')) {
      hashedPassword = await bcrypt.hash(updates.password, 10);
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      password: hashedPassword || users[userIndex].password,
      updatedAt: new Date().toISOString()
    };
    
    this.storage.set('users', users);
    this.saveToLocalStorage();
    
    return users[userIndex];
  }

  async deleteUser(id: number): Promise<boolean> {
    const users = this.storage.get('users') || [];
    const userIndex = users.findIndex((user: User) => user.id === id);
    
    if (userIndex === -1) return false;
    
    const user = users[userIndex];
    
    // Proteção especial para super administrador
    if (user.email === 'admin@7care.com') {
      throw new Error("Não é possível excluir o Super Administrador do sistema");
    }
    
    // Proteção para outros administradores
    if (user.role === 'admin') {
      throw new Error("Não é possível excluir usuários administradores do sistema");
    }
    
    users.splice(userIndex, 1);
    this.storage.set('users', users);
    this.saveToLocalStorage();
    
    return true;
  }

  // Métodos para eventos
  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const events = this.storage.get('events') || [];
    const nextId = this.storage.get('nextId');
    const newEvent: Event = {
      id: nextId.events++,
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    this.storage.set('events', events);
    this.storage.set('nextId', nextId);
    this.saveToLocalStorage();
    
    return newEvent;
  }

  async getEventById(id: number): Promise<Event | null> {
    const events = this.storage.get('events') || [];
    return events.find((event: Event) => event.id === id) || null;
  }

  async getAllEvents(): Promise<Event[]> {
    return this.storage.get('events') || [];
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event | null> {
    const events = this.storage.get('events') || [];
    const eventIndex = events.findIndex((event: Event) => event.id === id);
    
    if (eventIndex === -1) return null;
    
    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.storage.set('events', events);
    this.saveToLocalStorage();
    
    return events[eventIndex];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const events = this.storage.get('events') || [];
    const eventIndex = events.findIndex((event: Event) => event.id === id);
    
    if (eventIndex === -1) return false;
    
    events.splice(eventIndex, 1);
    this.storage.set('events', events);
    this.saveToLocalStorage();
    
    return true;
  }

  // Métodos para aprovações removidos - não há tipo Approval no schema

  // Métodos públicos para acesso ao storage
  getStorageData(key: string): any {
    return this.storage.get(key);
  }

  setStorageData(key: string, value: any): void {
    this.storage.set(key, value);
  }

  clearStorage(): void {
    this.storage.clear();
    this.initializeStorage();
  }

  // Métodos para igrejas
  async createChurch(churchData: Omit<Church, 'id'>): Promise<Church> {
    const churches = this.storage.get('churches') || [];
    const nextId = this.storage.get('nextId');
    const newChurch: Church = {
      id: nextId.churches++,
      ...churchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    churches.push(newChurch);
    this.storage.set('churches', churches);
    this.storage.set('nextId', nextId);
    this.saveToLocalStorage();
    
    return newChurch;
  }

  async getChurchById(id: number): Promise<Church | null> {
    const churches = this.storage.get('churches') || [];
    return churches.find((church: Church) => church.id === id) || null;
  }

  async getAllChurches(): Promise<Church[]> {
    return this.storage.get('churches') || [];
  }

  async updateChurch(id: number, updates: Partial<Church>): Promise<Church | null> {
    const churches = this.storage.get('churches') || [];
    const churchIndex = churches.findIndex((church: Church) => church.id === id);
    
    if (churchIndex === -1) return null;
    
    churches[churchIndex] = {
      ...churches[churchIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.storage.set('churches', churches);
    this.saveToLocalStorage();
    
    return churches[churchIndex];
  }

  async deleteChurch(id: number): Promise<boolean> {
    const churches = this.storage.get('churches') || [];
    const churchIndex = churches.findIndex((church: Church) => church.id === id);
    
    if (churchIndex === -1) return false;
    
    churches.splice(churchIndex, 1);
    this.storage.set('churches', churches);
    this.saveToLocalStorage();
    
    return true;
  }

  // Métodos para visitas
  async createVisit(visitData: any): Promise<any> {
    const visits = this.storage.get('visits') || [];
    const nextId = this.storage.get('nextId');
    const newVisit = {
      id: nextId.visits++,
      ...visitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    visits.push(newVisit);
    this.storage.set('visits', visits);
    this.storage.set('nextId', nextId);
    this.saveToLocalStorage();
    
    return newVisit;
  }

  async getAllVisits(): Promise<any[]> {
    return this.storage.get('visits') || [];
  }

  // Métodos para check-ins emocionais
  async createEmotionalCheckIn(checkInData: any): Promise<any> {
    const checkIns = this.storage.get('emotional_checkins') || [];
    const nextId = this.storage.get('nextId');
    const newCheckIn = {
      id: nextId.emotional_checkins++,
      ...checkInData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    checkIns.push(newCheckIn);
    this.storage.set('emotional_checkins', checkIns);
    this.storage.set('nextId', nextId);
    this.saveToLocalStorage();
    
    return newCheckIn;
  }

  async getAllEmotionalCheckIns(): Promise<any[]> {
    return this.storage.get('emotional_checkins') || [];
  }

  // Métodos para pontos
  async createPoints(pointsData: any): Promise<any> {
    const points = this.storage.get('points') || [];
    const nextId = this.storage.get('nextId');
    const newPoints = {
      id: nextId.points++,
      ...pointsData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    points.push(newPoints);
    this.storage.set('points', points);
    this.storage.set('nextId', nextId);
    this.saveToLocalStorage();
    
    return newPoints;
  }

  async getAllPoints(): Promise<any[]> {
    return this.storage.get('points') || [];
  }

  // Métodos de utilidade
  private saveToLocalStorage() {
    // Salvar dados no localStorage do navegador (simulado)
    const data = Object.fromEntries(this.storage);
    // Em um ambiente real, isso seria salvo no localStorage do navegador
    // localStorage.setItem('church_plus_data', JSON.stringify(data));
    console.log('💾 Dados salvos no LocalStorage (simulado)');
  }

  private loadFromLocalStorage() {
    // Carregar dados do localStorage do navegador (simulado)
    // const data = localStorage.getItem('church_plus_data');
    // if (data) {
    //   const parsedData = JSON.parse(data);
    //   this.storage = new Map(Object.entries(parsedData));
    // }
    console.log('📂 Dados carregados do LocalStorage (simulado)');
  }

  // Método para carregar dados no LocalStorage
  async migrateFromSQLite(sqliteData: any) {
    console.log('🔄 Iniciando carregamento de dados no LocalStorage...');
    
    // Migrar todas as tabelas
    const tables = [
      'users', 'events', 'churches', 'emotional_checkins', 'points',
      'meetings', 'messages', 'conversations', 'notifications', 'achievements',
      'point_activities', 'missionary_profiles', 'relationships', 'discipleship_requests',
      'prayers', 'prayer_intercessors', 'video_call_sessions', 'video_call_participants',
      'conversation_participants', 'event_participants', 'meeting_types',
      'user_achievements', 'user_points_history', 'system_settings', 'system_config'
    ];

    tables.forEach(table => {
      if (sqliteData[table]) {
        this.storage.set(table, sqliteData[table]);
        console.log(`   ✅ ${table}: ${sqliteData[table].length} registros`);
      }
    });
    
    this.saveToLocalStorage();
    console.log('✅ Carregamento de dados no LocalStorage concluído!');
  }

  // Método para exportar dados para migração futura
  async exportData(): Promise<any> {
    return Object.fromEntries(this.storage);
  }

  // Método para limpar todos os dados
  async clearAllData(): Promise<void> {
    this.storage.clear();
    this.initializeStorage();
    this.saveToLocalStorage();
    console.log('🗑️ Todos os dados foram limpos do LocalStorage');
  }
}
