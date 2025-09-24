import { LocalStorageAdapter } from './localStorageAdapter';
import { 
  User, InsertUser, Relationship, InsertRelationship, Meeting, InsertMeeting, 
  Event, InsertEvent, Message, InsertMessage, Conversation, VideoCallSession,
  MeetingType, Notification, InsertNotification, Achievement, PointActivity,
  Church, InsertChurch, DiscipleshipRequest, InsertDiscipleshipRequest,
  MissionaryProfile
} from "../shared/schema";

export interface IStorage {
  // Users
  createUser(data: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | null>;
  updateUserProfilePhoto(id: number, profilePhoto: string | null): Promise<boolean>;
  updateUserChurch(id: number, church: string): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>;
  approveUser(id: number): Promise<User | null>;
  rejectUser(id: number): Promise<User | null>;
  bulkCreateUsers(users: InsertUser[]): Promise<User[]>;
  
  // Churches
  getOrCreateChurch(name: string): Promise<{ id: number; name: string }>;
  getAllChurches(): Promise<Church[]>;
  updateChurch?(id: number, data: Partial<InsertChurch>): Promise<Church | null>;
  getDefaultChurch(): Promise<{ id: number; name: string } | null>;
  setDefaultChurch(churchId: number): Promise<boolean>;

  // Relationships (Missionary-Interested)
  createRelationship(data: InsertRelationship): Promise<Relationship>;
  getAllRelationships(): Promise<Relationship[]>;
  getRelationshipById(id: number): Promise<Relationship | null>;
  getRelationshipsByMissionary(missionaryId: number): Promise<Relationship[]>;
  getRelationshipsByInterested(interestedId: number): Promise<Relationship[]>;
  updateRelationship(id: number, data: Partial<InsertRelationship>): Promise<Relationship | null>;
  deleteRelationship(id: number): Promise<boolean>;
  deleteRelationshipByInterested(interestedId: number): Promise<boolean>;

  // Discipleship Requests
  createDiscipleshipRequest(data: InsertDiscipleshipRequest): Promise<DiscipleshipRequest>;
  getAllDiscipleshipRequests(): Promise<DiscipleshipRequest[]>;
  getDiscipleshipRequestById(id: number): Promise<DiscipleshipRequest | null>;
  getDiscipleshipRequestsByMissionary(missionaryId: number): Promise<DiscipleshipRequest[]>;
  getDiscipleshipRequestsByInterested(interestedId: number): Promise<DiscipleshipRequest[]>;
  updateDiscipleshipRequest(id: number, data: Partial<InsertDiscipleshipRequest>): Promise<DiscipleshipRequest | null>;
  deleteDiscipleshipRequest(id: number): Promise<boolean>;

  // Meetings
  createMeeting(data: InsertMeeting): Promise<Meeting>;
  getAllMeetings(): Promise<Meeting[]>;
  getMeetingById(id: number): Promise<Meeting | null>;
  getMeetingsByUserId(userId: number): Promise<Meeting[]>;
  updateMeeting(id: number, data: Partial<InsertMeeting>): Promise<Meeting | null>;
  deleteMeeting(id: number): Promise<boolean>;

  // Events
  createEvent(data: InsertEvent): Promise<Event>;
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | null>;
  getEventsByUserId(userId: number): Promise<Event[]>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null>;
  deleteEvent(id: number): Promise<boolean>;

  // Messages
  createMessage(data: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | null>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  updateMessage(id: number, data: Partial<InsertMessage>): Promise<Message | null>;
  deleteMessage(id: number): Promise<boolean>;

  // Conversations
  createConversation(participants: number[]): Promise<Conversation>;
  getAllConversations(): Promise<Conversation[]>;
  getConversationById(id: number): Promise<Conversation | null>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation | null>;
  deleteConversation(id: number): Promise<boolean>;

  // Video Call Sessions
  createVideoCallSession(data: Partial<VideoCallSession>): Promise<VideoCallSession>;
  getAllVideoCallSessions(): Promise<VideoCallSession[]>;
  getVideoCallSessionById(id: number): Promise<VideoCallSession | null>;
  updateVideoCallSession(id: number, data: Partial<VideoCallSession>): Promise<VideoCallSession | null>;
  deleteVideoCallSession(id: number): Promise<boolean>;

  // Notifications
  createNotification(data: InsertNotification): Promise<Notification>;
  getAllNotifications(): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | null>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  updateNotification(id: number, data: Partial<InsertNotification>): Promise<Notification | null>;
  deleteNotification(id: number): Promise<boolean>;
  markNotificationAsRead(id: number): Promise<boolean>;

  // Achievements
  createAchievement(data: Partial<Achievement>): Promise<Achievement>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementById(id: number): Promise<Achievement | null>;
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
  updateAchievement(id: number, data: Partial<Achievement>): Promise<Achievement | null>;
  deleteAchievement(id: number): Promise<boolean>;

  // Point Activities
  createPointActivity(data: Partial<PointActivity>): Promise<PointActivity>;
  getAllPointActivities(): Promise<PointActivity[]>;
  getPointActivityById(id: number): Promise<PointActivity | null>;
  getPointActivitiesByUserId(userId: number): Promise<PointActivity[]>;
  updatePointActivity(id: number, data: Partial<PointActivity>): Promise<PointActivity | null>;
  deletePointActivity(id: number): Promise<boolean>;

  // Missionary Profiles
  createMissionaryProfile(data: Partial<MissionaryProfile>): Promise<MissionaryProfile>;
  getAllMissionaryProfiles(): Promise<MissionaryProfile[]>;
  getMissionaryProfileById(id: number): Promise<MissionaryProfile | null>;
  getMissionaryProfileByUserId(userId: number): Promise<MissionaryProfile | null>;
  updateMissionaryProfile(id: number, data: Partial<MissionaryProfile>): Promise<MissionaryProfile | null>;
  deleteMissionaryProfile(id: number): Promise<boolean>;

  // Utility methods
  getStats(): Promise<any>;
  cleanupOrphanedApprovals(): Promise<void>;
}

export class LocalStorageStorage implements IStorage {
  private localStorage: LocalStorageAdapter;

  constructor() {
    this.localStorage = LocalStorageAdapter.getInstance();
    console.log('✅ LocalStorage conectado e funcionando');
  }

  // Users
  async createUser(data: InsertUser): Promise<User> {
    return await this.localStorage.createUser(data as any);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.localStorage.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.localStorage.getUserByEmail(email);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.localStorage.getAllUsers();
    return users.find(user => user.email === username) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.localStorage.getAllUsers();
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
    return await this.localStorage.updateUser(id, data as any);
  }

  async updateUserProfilePhoto(id: number, profilePhoto: string | null): Promise<boolean> {
    const user = await this.localStorage.updateUser(id, { profilePhoto: profilePhoto || undefined });
    return user !== null;
  }

  async updateUserChurch(id: number, church: string): Promise<boolean> {
    const user = await this.localStorage.updateUser(id, { church });
    return user !== null;
  }

  async deleteUser(id: number): Promise<boolean> {
    return await this.localStorage.deleteUser(id);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const users = await this.localStorage.getAllUsers();
    return users.filter(user => user.role === role);
  }

  async approveUser(id: number): Promise<User | null> {
    return await this.localStorage.updateUser(id, { 
      isApproved: true, 
      status: 'approved' 
    });
  }

  async rejectUser(id: number): Promise<User | null> {
    return await this.localStorage.updateUser(id, { 
      isApproved: false, 
      status: 'rejected' 
    });
  }

  async bulkCreateUsers(users: InsertUser[]): Promise<User[]> {
    const createdUsers: User[] = [];
    for (const userData of users) {
      const user = await this.localStorage.createUser(userData as any);
      createdUsers.push(user);
    }
    return createdUsers;
  }

  // Churches
  async getOrCreateChurch(name: string): Promise<{ id: number; name: string }> {
    const churches = await this.localStorage.getAllChurches();
    let church = churches.find(c => c.name === name);
    
    if (!church) {
      church = await this.localStorage.createChurch({ 
        name,
        address: null,
        email: null,
        phone: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return { id: church.id, name: church.name };
  }

  async getAllChurches(): Promise<Church[]> {
    return await this.localStorage.getAllChurches();
  }

  async updateChurch(id: number, data: Partial<InsertChurch>): Promise<Church | null> {
    return await this.localStorage.updateChurch(id, data as any);
  }

  async getDefaultChurch(): Promise<{ id: number; name: string } | null> {
    const churches = await this.localStorage.getAllChurches();
    // Retorna a primeira igreja ativa como padrão
    const defaultChurch = churches.find(c => c.isActive);
    return defaultChurch ? { id: defaultChurch.id, name: defaultChurch.name } : null;
  }

  async setDefaultChurch(churchId: number): Promise<boolean> {
    // Simplesmente ativa a igreja selecionada
    const result = await this.localStorage.updateChurch(churchId, { isActive: true });
    return result !== null;
  }

  // Implementações simplificadas para outras funcionalidades
  // (Estas serão implementadas conforme necessário)

  async createRelationship(data: InsertRelationship): Promise<Relationship> {
    throw new Error('Not implemented yet');
  }

  async getAllRelationships(): Promise<Relationship[]> {
    throw new Error('Not implemented yet');
  }

  async getRelationshipById(id: number): Promise<Relationship | null> {
    throw new Error('Not implemented yet');
  }

  async getRelationshipsByMissionary(missionaryId: number): Promise<Relationship[]> {
    throw new Error('Not implemented yet');
  }

  async getRelationshipsByInterested(interestedId: number): Promise<Relationship[]> {
    throw new Error('Not implemented yet');
  }

  async updateRelationship(id: number, data: Partial<InsertRelationship>): Promise<Relationship | null> {
    throw new Error('Not implemented yet');
  }

  async deleteRelationship(id: number): Promise<boolean> {
    throw new Error('Not implemented yet');
  }

  async deleteRelationshipByInterested(interestedId: number): Promise<boolean> {
    throw new Error('Not implemented yet');
  }

  // Discipleship Requests
  async createDiscipleshipRequest(data: InsertDiscipleshipRequest): Promise<DiscipleshipRequest> {
    throw new Error('Not implemented yet');
  }

  async getAllDiscipleshipRequests(): Promise<DiscipleshipRequest[]> {
    throw new Error('Not implemented yet');
  }

  async getDiscipleshipRequestById(id: number): Promise<DiscipleshipRequest | null> {
    throw new Error('Not implemented yet');
  }

  async getDiscipleshipRequestsByMissionary(missionaryId: number): Promise<DiscipleshipRequest[]> {
    throw new Error('Not implemented yet');
  }

  async getDiscipleshipRequestsByInterested(interestedId: number): Promise<DiscipleshipRequest[]> {
    throw new Error('Not implemented yet');
  }

  async updateDiscipleshipRequest(id: number, data: Partial<InsertDiscipleshipRequest>): Promise<DiscipleshipRequest | null> {
    throw new Error('Not implemented yet');
  }

  async deleteDiscipleshipRequest(id: number): Promise<boolean> {
    throw new Error('Not implemented yet');
  }

  // Meetings
  async createMeeting(data: InsertMeeting): Promise<Meeting> {
    throw new Error('Not implemented yet');
  }

  async getAllMeetings(): Promise<Meeting[]> {
    throw new Error('Not implemented yet');
  }

  async getMeetingById(id: number): Promise<Meeting | null> {
    throw new Error('Not implemented yet');
  }

  async getMeetingsByUserId(userId: number): Promise<Meeting[]> {
    throw new Error('Not implemented yet');
  }

  async updateMeeting(id: number, data: Partial<InsertMeeting>): Promise<Meeting | null> {
    throw new Error('Not implemented yet');
  }

  async deleteMeeting(id: number): Promise<boolean> {
    throw new Error('Not implemented yet');
  }

  // Events
  async createEvent(data: InsertEvent): Promise<Event> {
    return await this.localStorage.createEvent(data as any);
  }

  async getAllEvents(): Promise<Event[]> {
    return await this.localStorage.getAllEvents();
  }

  async getEventById(id: number): Promise<Event | null> {
    return await this.localStorage.getEventById(id);
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    const events = await this.localStorage.getAllEvents();
    return events.filter(event => event.organizerId === userId);
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null> {
    return await this.localStorage.updateEvent(id, data as any);
  }

  async deleteEvent(id: number): Promise<boolean> {
    return await this.localStorage.deleteEvent(id);
  }

  // Implementações vazias para outras funcionalidades
  async createMessage(data: InsertMessage): Promise<Message> { throw new Error('Not implemented yet'); }
  async getAllMessages(): Promise<Message[]> { throw new Error('Not implemented yet'); }
  async getMessageById(id: number): Promise<Message | null> { throw new Error('Not implemented yet'); }
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> { throw new Error('Not implemented yet'); }
  async updateMessage(id: number, data: Partial<InsertMessage>): Promise<Message | null> { throw new Error('Not implemented yet'); }
  async deleteMessage(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  async createConversation(participants: number[]): Promise<Conversation> { throw new Error('Not implemented yet'); }
  async getAllConversations(): Promise<Conversation[]> { throw new Error('Not implemented yet'); }
  async getConversationById(id: number): Promise<Conversation | null> { throw new Error('Not implemented yet'); }
  // Método removido - duplicado abaixo
  async updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation | null> { throw new Error('Not implemented yet'); }
  async deleteConversation(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  async createVideoCallSession(data: Partial<VideoCallSession>): Promise<VideoCallSession> { throw new Error('Not implemented yet'); }
  async getAllVideoCallSessions(): Promise<VideoCallSession[]> { throw new Error('Not implemented yet'); }
  async getVideoCallSessionById(id: number): Promise<VideoCallSession | null> { throw new Error('Not implemented yet'); }
  async updateVideoCallSession(id: number, data: Partial<VideoCallSession>): Promise<VideoCallSession | null> { throw new Error('Not implemented yet'); }
  async deleteVideoCallSession(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  async createNotification(data: InsertNotification): Promise<Notification> { throw new Error('Not implemented yet'); }
  async getAllNotifications(): Promise<Notification[]> { throw new Error('Not implemented yet'); }
  async getNotificationById(id: number): Promise<Notification | null> { throw new Error('Not implemented yet'); }
  async getNotificationsByUserId(userId: number): Promise<Notification[]> { throw new Error('Not implemented yet'); }
  async updateNotification(id: number, data: Partial<InsertNotification>): Promise<Notification | null> { throw new Error('Not implemented yet'); }
  async deleteNotification(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }
  async markNotificationAsRead(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  async createAchievement(data: Partial<Achievement>): Promise<Achievement> { throw new Error('Not implemented yet'); }
  async getAllAchievements(): Promise<Achievement[]> { throw new Error('Not implemented yet'); }
  async getAchievementById(id: number): Promise<Achievement | null> { throw new Error('Not implemented yet'); }
  async getAchievementsByUserId(userId: number): Promise<Achievement[]> { throw new Error('Not implemented yet'); }
  async updateAchievement(id: number, data: Partial<Achievement>): Promise<Achievement | null> { throw new Error('Not implemented yet'); }
  async deleteAchievement(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  async createPointActivity(data: Partial<PointActivity>): Promise<PointActivity> { throw new Error('Not implemented yet'); }
  async getAllPointActivities(): Promise<PointActivity[]> { throw new Error('Not implemented yet'); }
  async getPointActivityById(id: number): Promise<PointActivity | null> { throw new Error('Not implemented yet'); }
  async getPointActivitiesByUserId(userId: number): Promise<PointActivity[]> { throw new Error('Not implemented yet'); }
  async updatePointActivity(id: number, data: Partial<PointActivity>): Promise<PointActivity | null> { throw new Error('Not implemented yet'); }
  async deletePointActivity(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  async createMissionaryProfile(data: Partial<MissionaryProfile>): Promise<MissionaryProfile> { throw new Error('Not implemented yet'); }
  async getAllMissionaryProfiles(): Promise<MissionaryProfile[]> { throw new Error('Not implemented yet'); }
  async getMissionaryProfileById(id: number): Promise<MissionaryProfile | null> { throw new Error('Not implemented yet'); }
  async getMissionaryProfileByUserId(userId: number): Promise<MissionaryProfile | null> { throw new Error('Not implemented yet'); }
  async updateMissionaryProfile(id: number, data: Partial<MissionaryProfile>): Promise<MissionaryProfile | null> { throw new Error('Not implemented yet'); }
  async deleteMissionaryProfile(id: number): Promise<boolean> { throw new Error('Not implemented yet'); }

  // Utility methods
  async getStats(): Promise<any> {
    const users = await this.localStorage.getAllUsers();
    const events = await this.localStorage.getAllEvents();
    
    return {
      totalUsers: users.length,
      totalEvents: events.length,
      // Adicionar mais estatísticas conforme necessário
    };
  }

  async cleanupOrphanedApprovals(): Promise<void> {
    // Implementar limpeza de aprovações órfãs se necessário
    console.log('🧹 Limpeza de aprovações órfãs executada (LocalStorage)');
  }

  // Métodos adicionais necessários para as rotas
  async getMeetingTypes(): Promise<any[]> {
    return []; // Implementação simplificada
  }

  async clearAllData(): Promise<void> {
    // Limpar todos os dados
    this.localStorage.clearStorage();
  }

  async calculateBasicUserPoints(): Promise<void> {
    // Implementação simplificada - apenas recalcula pontos básicos
    const users = await this.localStorage.getAllUsers();
    for (const user of users) {
      // Lógica básica de cálculo de pontos
      const basicPoints = 100; // Pontos base
      await this.localStorage.updateUser(user.id, { points: basicPoints });
    }
  }

  async calculateAdvancedUserPoints(): Promise<any> {
    // Implementação simplificada
    return { success: true, message: 'Pontos calculados' };
  }

  async getPointsConfiguration(): Promise<any> {
    return {
      basicPoints: 100,
      attendancePoints: 10,
      eventPoints: 20,
      donationPoints: 50,
      engajamento: {
        baixo: 10,
        medio: 25,
        alto: 50
      },
      classificacao: {
        frequente: 30,
        naoFrequente: 5
      },
      dizimista: {
        naoDizimista: 0,
        pontual: 20,
        sazonal: 15,
        recorrente: 40
      },
      ofertante: {
        naoOfertante: 0,
        pontual: 15,
        sazonal: 10,
        recorrente: 30
      },
      tempoBatismo: {
        doisAnos: 10,
        cincoAnos: 20,
        dezAnos: 30,
        vinteAnos: 40,
        maisVinte: 50
      },
      nomeUnidade: {
        comUnidade: 15,
        semUnidade: 0
      },
      pontuacaoDinamica: {
        multiplicador: 5
      },
      presenca: {
        multiplicador: 2
      },
      batizouAlguem: {
        sim: 100,
        nao: 0
      },
      discipuladoPosBatismo: {
        multiplicador: 10
      },
      cpfValido: {
        valido: 20,
        invalido: 0
      },
      camposVaziosACMS: {
        completos: 25,
        incompletos: 0
      }
    };
  }

  async savePointsConfiguration(config: any): Promise<void> {
    // Salvar configuração (implementação simplificada)
    console.log('Configuração de pontos salva:', config);
  }

  async resetPointsConfiguration(): Promise<void> {
    // Resetar configuração (implementação simplificada)
    console.log('Configuração de pontos resetada');
  }

  async getEventPermissions(): Promise<any> {
    // Retornar permissões padrão que permitem todos os eventos para todos os roles
    return {
      admin: {
        'igreja-local': true,
        'asr-geral': true,
        'asr-pastores': true,
        'asr-administrativo': true,
        'visitas': true,
        'reunioes': true,
        'pregacoes': true
      },
      member: {
        'igreja-local': true,
        'asr-geral': false,
        'asr-pastores': false,
        'asr-administrativo': false,
        'visitas': true,
        'reunioes': true,
        'pregacoes': true
      },
      missionary: {
        'igreja-local': true,
        'asr-geral': true,
        'asr-pastores': true,
        'asr-administrativo': true,
        'visitas': true,
        'reunioes': true,
        'pregacoes': true
      },
      interested: {
        'igreja-local': true,
        'asr-geral': false,
        'asr-pastores': false,
        'asr-administrativo': false,
        'visitas': false,
        'reunioes': false,
        'pregacoes': true
      }
    };
  }

  async getEventFilterPermissions(): Promise<any> {
    try {
      const stored = (this.localStorage as any).getItem('eventFilterPermissions');
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultFilterPermissions();
    } catch (error) {
      console.error('Erro ao buscar permissões de filtros:', error);
      return this.getDefaultFilterPermissions();
    }
  }

  async saveEventFilterPermissions(permissions: any): Promise<void> {
    try {
      (this.localStorage as any).setItem('eventFilterPermissions', JSON.stringify(permissions));
      console.log('Permissões de filtros salvas:', permissions);
    } catch (error) {
      console.error('Erro ao salvar permissões de filtros:', error);
      throw error;
    }
  }

  private getDefaultFilterPermissions(): any {
    return {
      admin: {
        'igreja-local': true,
        'asr-geral': true,
        'asr-pastores': true,
        'asr-administrativo': true,
        'visitas': true,
        'reunioes': true,
        'pregacoes': true,
        'aniversarios': true
      },
      member: {
        'igreja-local': true,
        'asr-geral': false,
        'asr-pastores': false,
        'asr-administrativo': false,
        'visitas': true,
        'reunioes': true,
        'pregacoes': true,
        'aniversarios': true
      },
      missionary: {
        'igreja-local': true,
        'asr-geral': true,
        'asr-pastores': true,
        'asr-administrativo': true,
        'visitas': true,
        'reunioes': true,
        'pregacoes': true,
        'aniversarios': true
      },
      interested: {
        'igreja-local': true,
        'asr-geral': false,
        'asr-pastores': false,
        'asr-administrativo': false,
        'visitas': false,
        'reunioes': false,
        'pregacoes': true,
        'aniversarios': false
      }
    };
  }

  async saveEventPermissions(permissions: any): Promise<void> {
    // Salvar permissões (implementação simplificada)
    console.log('Permissões de eventos salvas:', permissions);
  }

  async getUserDetailedData(userId: number): Promise<any> {
    const user = await this.localStorage.getUserById(userId);
    if (!user) return null;

    // Extrair dados do extraData se existir
    let extraData = {};
    if (user.extraData && typeof user.extraData === 'string') {
      try {
        extraData = JSON.parse(user.extraData);
      } catch (e) {
        console.error('Erro ao fazer parse do extraData:', e);
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      church: user.church,
      points: user.points || 0,
      attendance: user.attendance || 0,
      isDonor: user.isDonor || false,
      isOffering: user.isOffering || false,
      hasLesson: user.hasLesson || false,
      // Dados do extraData para cálculo de pontos
      ...extraData
    };
  }

  async createEmotionalCheckIn(data: any): Promise<any> {
    const checkIn = {
      id: Date.now(),
      userId: data.userId,
      emotion: data.emotion,
      note: data.note,
      createdAt: new Date().toISOString()
    };
    
    const checkIns = this.localStorage.getStorageData('emotional_checkins') || [];
    checkIns.push(checkIn);
    this.localStorage.setStorageData('emotional_checkins', checkIns);
    
    return checkIn;
  }

  async getEmotionalCheckInsForAdmin(): Promise<any[]> {
    return this.localStorage.getStorageData('emotional_checkins') || [];
  }

  async getEmotionalCheckInsByUserId(userId: number): Promise<any[]> {
    const checkIns = this.localStorage.getStorageData('emotional_checkins') || [];
    return checkIns.filter((checkIn: any) => checkIn.userId === userId);
  }

  async getPrayers(filters?: any): Promise<any[]> {
    return this.localStorage.getStorageData('prayers') || [];
  }

  async markPrayerAsAnswered(prayerId: number, answeredBy: number): Promise<any> {
    const prayers = this.localStorage.getStorageData('prayers') || [];
    const prayer = prayers.find((p: any) => p.id === prayerId);
    if (prayer) {
      prayer.answered = true;
      prayer.answeredBy = answeredBy;
      prayer.answeredAt = new Date().toISOString();
    }
    return prayer;
  }

  async getPrayerById(prayerId: number): Promise<any> {
    const prayers = this.localStorage.getStorageData('prayers') || [];
    return prayers.find((p: any) => p.id === prayerId) || null;
  }

  async deletePrayer(prayerId: number): Promise<any> {
    const prayers = this.localStorage.getStorageData('prayers') || [];
    const index = prayers.findIndex((p: any) => p.id === prayerId);
    if (index !== -1) {
      prayers.splice(index, 1);
      this.localStorage.setStorageData('prayers', prayers);
      return { success: true };
    }
    return { success: false };
  }

  async addPrayerIntercessor(prayerId: number, intercessorId: number): Promise<any> {
    // Implementação simplificada
    return { success: true };
  }

  async removePrayerIntercessor(prayerId: number, intercessorId: number): Promise<any> {
    // Implementação simplificada
    return { success: true };
  }

  async getPrayerIntercessors(prayerId: number): Promise<any[]> {
    return [];
  }

  async getPrayersUserIsPrayingFor(userId: number): Promise<any[]> {
    return [];
  }

  async getMeetingsByStatus(status: string): Promise<any[]> {
    return [];
  }

  async clearAllEvents(): Promise<boolean> {
    this.localStorage.setStorageData('events', []);
    return true;
  }

  async getConversationsByUserId(userId: number): Promise<any[]> {
    return [];
  }

  async getOrCreateDirectConversation(userAId: number, userBId: number): Promise<any> {
    return {
      id: Date.now(),
      type: 'direct',
      participants: [userAId, userBId],
      createdAt: new Date().toISOString()
    };
  }

  async getMessagesByConversation(conversationId: number, limit?: number): Promise<any[]> {
    return [];
  }

  async getUserPoints(userId: number): Promise<number> {
    const user = await this.localStorage.getUserById(userId);
    return user?.points || 0;
  }

  async getAllActiveMissionaryProfiles(): Promise<any[]> {
    return this.localStorage.getStorageData('missionary_profiles') || [];
  }

  async getUsersWithMissionaryProfile(): Promise<any[]> {
    const users = await this.localStorage.getAllUsers();
    const profiles = this.localStorage.getStorageData('missionary_profiles') || [];
    return users.filter(user => profiles.some((profile: any) => profile.userId === user.id));
  }

  async deactivateMissionaryProfile(userId: number): Promise<boolean> {
    const profiles = this.localStorage.getStorageData('missionary_profiles') || [];
    const profile = profiles.find((p: any) => p.userId === userId);
    if (profile) {
      profile.isActive = false;
      this.localStorage.setStorageData('missionary_profiles', profiles);
      return true;
    }
    return false;
  }

  async hasActiveMissionaryProfile(userId: number): Promise<boolean> {
    const profiles = this.localStorage.getStorageData('missionary_profiles') || [];
    return profiles.some((p: any) => p.userId === userId && p.isActive);
  }

  async getAllActivities(): Promise<any[]> {
    return this.localStorage.getStorageData('point_activities') || [];
  }
}
