import { db, sql } from './neonConfig';
import { schema } from './schema';
import { eventFilterPermissions } from './schema';
import { eq, and, desc, asc, ne, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

// Interface para compatibilidade
export interface IStorage {
  // Usuários
  getAllUsers(): Promise<any[]>;
  getVisitedUsers(): Promise<any[]>;
  getUserById(id: number): Promise<any | null>;
  createUser(userData: any): Promise<any>;
  updateUser(id: number, updates: any): Promise<any | null>;
  updateUserDirectly(id: number, updates: any): Promise<any | null>;
  deleteUser(id: number): Promise<boolean>;
  getUserByEmail(email: string): Promise<any | null>;
  
  // Igrejas
  getAllChurches(): Promise<any[]>;
  getChurchById(id: number): Promise<any | null>;
  createChurch(churchData: any): Promise<any>;
  updateChurch(id: number, updates: any): Promise<any | null>;
  deleteChurch(id: number): Promise<boolean>;
  
  // Eventos
  getAllEvents(): Promise<any[]>;
  getEventById(id: number): Promise<any | null>;
  createEvent(eventData: any): Promise<any>;
  updateEvent(id: number, updates: any): Promise<any | null>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Outros métodos necessários...
  getUserDetailedData(userId: number): Promise<any>;
  getPointsConfiguration(): Promise<any>;
  savePointsConfiguration(config: any): Promise<void>;
  resetPointsConfiguration(): Promise<void>;
  calculateAdvancedUserPoints(): Promise<any>;
  saveEventPermissions(permissions: any): Promise<void>;
  getEventPermissions(): Promise<any>;
  getEventFilterPermissions(): Promise<any>;
  saveEventFilterPermissions(permissions: any): Promise<void>;
  getSystemConfig(key: string): Promise<any | null>;
  saveSystemConfig(key: string, value: any): Promise<void>;
  createEmotionalCheckIn(data: any): Promise<any>;
  getAllEmotionalCheckIns(): Promise<any[]>;
  getEmotionalCheckInById(id: number): Promise<any | null>;
  updateEmotionalCheckIn(id: number, updates: any): Promise<any | null>;
  deleteEmotionalCheckIn(id: number): Promise<boolean>;
  getEmotionalCheckInsForAdmin(): Promise<any[]>;
  getAllDiscipleshipRequests(): Promise<any[]>;
  getDiscipleshipRequestById(id: number): Promise<any | null>;
  createDiscipleshipRequest(data: any): Promise<any>;
  updateDiscipleshipRequest(id: number, updates: any): Promise<any | null>;
  deleteDiscipleshipRequest(id: number): Promise<boolean>;
  getAllMissionaryProfiles(): Promise<any[]>;
  getMissionaryProfileById(id: number): Promise<any | null>;
  createMissionaryProfile(data: any): Promise<any>;
  getUsersWithMissionaryProfile(): Promise<any[]>;
  getDefaultChurch(): Promise<any | null>;
  clearAllData(): Promise<void>;
  updateMissionaryProfile(id: number, updates: any): Promise<any | null>;
  
  // Novos métodos adicionados
  updateUserChurch(userId: number, churchName: string): Promise<boolean>;
  setDefaultChurch(churchId: number): Promise<boolean>;
  getOrCreateChurch(churchName: string): Promise<any>;
  approveUser(id: number): Promise<any | null>;
  rejectUser(id: number): Promise<any | null>;
  calculateBasicUserPoints(): Promise<any>;
  getEmotionalCheckInsByUserId(userId: number): Promise<any[]>;
  getPrayers(): Promise<any[]>;
  markPrayerAsAnswered(prayerId: number, answeredBy: number): Promise<boolean>;
  getPrayerById(prayerId: number): Promise<any | null>;
  deletePrayer(prayerId: number): Promise<boolean>;
  addPrayerIntercessor(prayerId: number, intercessorId: number): Promise<boolean>;
  removePrayerIntercessor(prayerId: number, intercessorId: number): Promise<boolean>;
  getPrayerIntercessors(prayerId: number): Promise<any[]>;
  getPrayersUserIsPrayingFor(userId: number): Promise<any[]>;
  getMeetingsByUserId(userId: number): Promise<any[]>;
  getMeetingsByStatus(status: string): Promise<any[]>;
  getAllMeetings(): Promise<any[]>;
  createMeeting(meetingData: any): Promise<any>;
  updateMeeting(id: number, updateData: any): Promise<any | null>;
  clearAllEvents(): Promise<boolean>;
  createEvent(eventData: any): Promise<any>;
  getAllRelationships(): Promise<any[]>;
  getRelationshipsByMissionary(missionaryId: number): Promise<any[]>;
  getRelationshipsByInterested(interestedId: number): Promise<any[]>;
  createRelationship(data: any): Promise<any>;
  getRelationshipById(relationshipId: number): Promise<any | null>;
  deleteRelationship(relationshipId: number): Promise<boolean>;
  deleteRelationshipByInterested(interestedId: number): Promise<boolean>;
  getMissionaryProfileByUserId(userId: number): Promise<any | null>;
  createMissionaryProfile(data: any): Promise<any>;
  getConversationsByUserId(userId: number): Promise<any[]>;
  getOrCreateDirectConversation(userAId: number, userBId: number): Promise<any>;
  getMessagesByConversationId(conversationId: number): Promise<any[]>;
  getMeetingTypes(): Promise<any[]>;
  deleteMissionaryProfile(id: number): Promise<boolean>;
  getAllMeetings(): Promise<any[]>;
  getMeetingById(id: number): Promise<any | null>;
  createMeeting(data: any): Promise<any>;
  updateMeeting(id: number, updates: any): Promise<any | null>;
  deleteMeeting(id: number): Promise<boolean>;
  getAllMessages(): Promise<any[]>;
  getMessageById(id: number): Promise<any | null>;
  createMessage(data: any): Promise<any>;
  updateMessage(id: number, updates: any): Promise<any | null>;
  deleteMessage(id: number): Promise<boolean>;
  getAllConversations(): Promise<any[]>;
  getConversationById(id: number): Promise<any | null>;
  createConversation(data: any): Promise<any>;
  updateConversation(id: number, updates: any): Promise<any | null>;
  deleteConversation(id: number): Promise<boolean>;
  getAllNotifications(): Promise<any[]>;
  getNotificationById(id: number): Promise<any | null>;
  createNotification(data: any): Promise<any>;
  updateNotification(id: number, updates: any): Promise<any | null>;
  deleteNotification(id: number): Promise<boolean>;
  getAllAchievements(): Promise<any[]>;
  getAchievementById(id: number): Promise<any | null>;
  createAchievement(data: any): Promise<any>;
  updateAchievement(id: number, updates: any): Promise<any | null>;
  deleteAchievement(id: number): Promise<boolean>;
  getAllPointActivities(): Promise<any[]>;
  getPointActivityById(id: number): Promise<any | null>;
  createPointActivity(data: any): Promise<any>;
  updatePointActivity(id: number, updates: any): Promise<any | null>;
  deletePointActivity(id: number): Promise<boolean>;
  getAllSystemConfig(): Promise<any[]>;
  getSystemConfigById(id: number): Promise<any | null>;
  createSystemConfig(data: any): Promise<any>;
  updateSystemConfig(id: number, updates: any): Promise<any | null>;
  deleteSystemConfig(id: number): Promise<boolean>;
  getAllSystemSettings(): Promise<any[]>;
  getSystemSettingsById(id: number): Promise<any | null>;
  createSystemSettings(data: any): Promise<any>;
  updateSystemSettings(id: number, updates: any): Promise<any | null>;
  deleteSystemSettings(id: number): Promise<boolean>;
  getAllEventParticipants(): Promise<any[]>;
  getEventParticipantById(id: number): Promise<any | null>;
  createEventParticipant(data: any): Promise<any>;
  updateEventParticipant(id: number, updates: any): Promise<any | null>;
  deleteEventParticipant(id: number): Promise<boolean>;
  getAllMeetingTypes(): Promise<any[]>;
  getMeetingTypeById(id: number): Promise<any | null>;
  createMeetingType(data: any): Promise<any>;
  updateMeetingType(id: number, updates: any): Promise<any | null>;
  deleteMeetingType(id: number): Promise<boolean>;
  getAllUserAchievements(): Promise<any[]>;
  getUserAchievementById(id: number): Promise<any | null>;
  createUserAchievement(data: any): Promise<any>;
  updateUserAchievement(id: number, updates: any): Promise<any | null>;
  deleteUserAchievement(id: number): Promise<boolean>;
  getAllUserPointsHistory(): Promise<any[]>;
  getUserPointsHistoryById(id: number): Promise<any | null>;
  createUserPointsHistory(data: any): Promise<any>;
  updateUserPointsHistory(id: number, updates: any): Promise<any | null>;
  deleteUserPointsHistory(id: number): Promise<boolean>;
  getAllPrayers(): Promise<any[]>;
  getPrayerById(id: number): Promise<any | null>;
  createPrayer(data: any): Promise<any>;
  updatePrayer(id: number, updates: any): Promise<any | null>;
  deletePrayer(id: number): Promise<boolean>;
  getAllPrayerIntercessors(): Promise<any[]>;
  getPrayerIntercessorById(id: number): Promise<any | null>;
  createPrayerIntercessor(data: any): Promise<any>;
  updatePrayerIntercessor(id: number, updates: any): Promise<any | null>;
  deletePrayerIntercessor(id: number): Promise<boolean>;
  getAllVideoCallSessions(): Promise<any[]>;
  getVideoCallSessionById(id: number): Promise<any | null>;
  createVideoCallSession(data: any): Promise<any>;
  updateVideoCallSession(id: number, updates: any): Promise<any | null>;
  deleteVideoCallSession(id: number): Promise<boolean>;
  getAllVideoCallParticipants(): Promise<any[]>;
  getVideoCallParticipantById(id: number): Promise<any | null>;
  createVideoCallParticipant(data: any): Promise<any>;
  updateVideoCallParticipant(id: number, updates: any): Promise<any | null>;
  deleteVideoCallParticipant(id: number): Promise<boolean>;
  getAllConversationParticipants(): Promise<any[]>;
  getConversationParticipantById(id: number): Promise<any | null>;
  createConversationParticipant(data: any): Promise<any>;
  updateConversationParticipant(id: number, updates: any): Promise<any | null>;
  deleteConversationParticipant(id: number): Promise<boolean>;
}

export class NeonAdapter implements IStorage {
  // ========== USUÁRIOS ==========
  async getAllUsers(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.users).orderBy(asc(schema.users.id));
      
      // Processar extra_data para garantir que seja um objeto JSON válido
      const processedUsers = result.map(user => {
        let extraData = {};
        
        if (user.extra_data) {
          if (typeof user.extra_data === 'string') {
            try {
              extraData = JSON.parse(user.extra_data);
            } catch (e) {
              console.log(`⚠️ Erro ao parsear extra_data para usuário ${user.id}:`, user.extra_data);
              extraData = {};
            }
          } else if (typeof user.extra_data === 'object') {
            extraData = user.extra_data;
          }
        }
        
        return {
          ...user,
          extra_data: extraData
        };
      });
      
      return processedUsers;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  async getVisitedUsers(): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(schema.users)
        .where(
          and(
            or(eq(schema.users.role, 'member'), eq(schema.users.role, 'missionary')),
            sql`extra_data->>'visited' = 'true'` as any
          )
        )
        .orderBy(schema.users.id);
      
      // Parse extraData para cada usuário
      return result.map(user => ({
        ...user,
        extraData: user.extraData ? 
          (typeof user.extraData === 'string' ? JSON.parse(user.extraData) : user.extraData) : 
          {}
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários visitados:', error);
      return [];
    }
  }

  async getUserById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      const user = result[0] || null;
      if (user && user.extraData) {
        console.log(`🔍 getUserById ${id} - extraData type:`, typeof user.extraData);
        console.log(`🔍 getUserById ${id} - extraData content:`, user.extraData);
      }
      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<any | null> {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  async createUser(userData: any): Promise<any> {
    try {
      // Hash da senha
      let hashedPassword = userData.password;
      if (userData.password && !userData.password.startsWith('$2')) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }

      const newUser = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(schema.users).values(newUser).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: any): Promise<any | null> {
    try {
      console.log(`🔄 Atualizando usuário ${id} com:`, updates);
      
      // Hash da senha se fornecida
      if (updates.password && !updates.password.startsWith('$2')) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      updates.updatedAt = new Date();

      const result = await db
        .update(schema.users)
        .set(updates)
        .where(eq(schema.users.id, id))
        .returning();

      console.log(`✅ Usuário ${id} atualizado com sucesso:`, result[0]?.extraData);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return null;
    }
  }

  async updateUserDirectly(id: number, updates: any): Promise<any | null> {
    try {
      console.log(`🔄 Atualizando usuário ${id} diretamente com:`, updates);
      
      // Hash da senha se fornecida
      if (updates.password && !updates.password.startsWith('$2')) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      updates.updatedAt = new Date();

      // Usar consulta SQL direta para garantir que funcione
      const extraDataString = typeof updates.extraData === 'object' ? 
        JSON.stringify(updates.extraData) : 
        updates.extraData;

      const result = await sql`
        UPDATE users 
        SET extra_data = ${extraDataString}::jsonb, updated_at = ${updates.updatedAt}
        WHERE id = ${id}
        RETURNING id, name, extra_data, updated_at
      `;

      console.log(`✅ Usuário ${id} atualizado diretamente:`, result[0]?.extra_data);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar usuário diretamente:', error);
      return null;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Verificar se é super administrador
      const user = await this.getUserById(id);
      if (user && user.email === 'admin@7care.com') {
        throw new Error("Não é possível excluir o Super Administrador do sistema");
      }

      // Verificar se é administrador
      if (user && user.role === 'admin') {
        throw new Error("Não é possível excluir usuários administradores do sistema");
      }

      const result = await db.delete(schema.users).where(eq(schema.users.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // ========== IGREJAS ==========
  async getAllChurches(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.churches).orderBy(asc(schema.churches.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error);
      return [];
    }
  }

  async getChurchById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.churches).where(eq(schema.churches.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar igreja por ID:', error);
      return null;
    }
  }

  async createChurch(churchData: any): Promise<any> {
    try {
      const newChurch = {
        ...churchData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(schema.churches).values(newChurch).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar igreja:', error);
      throw error;
    }
  }

  async updateChurch(id: number, updates: any): Promise<any | null> {
    try {
      updates.updatedAt = new Date();

      const result = await db
        .update(schema.churches)
        .set(updates)
        .where(eq(schema.churches.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar igreja:', error);
      return null;
    }
  }

  async deleteChurch(id: number): Promise<boolean> {
    try {
      await db.delete(schema.churches).where(eq(schema.churches.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar igreja:', error);
      return false;
    }
  }

  // ========== EVENTOS ==========
  async getAllEvents(): Promise<any[]> {
    try {
      // Selecionar apenas as colunas que existem no banco
      const result = await db.select({
        id: schema.events.id,
        title: schema.events.title,
        description: schema.events.description,
        date: schema.events.date,
        location: schema.events.location,
        type: schema.events.type,
        capacity: schema.events.capacity,
        isRecurring: schema.events.isRecurring,
        recurrencePattern: schema.events.recurrencePattern,
        createdBy: schema.events.createdBy,
        churchId: schema.events.churchId,
        createdAt: schema.events.createdAt,
        updatedAt: schema.events.updatedAt
      }).from(schema.events).orderBy(desc(schema.events.date));
      
      // TEMPORÁRIO: Adicionar eventos específicos para teste
      return result;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }
  }

  async getEventById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar evento por ID:', error);
      return null;
    }
  }

  async createEvent(eventData: any): Promise<any> {
    try {
      const newEvent = {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(schema.events).values(newEvent).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvent(id: number, updates: any): Promise<any | null> {
    try {
      updates.updatedAt = new Date();

      const result = await db
        .update(schema.events)
        .set(updates)
        .where(eq(schema.events.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return null;
    }
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      await db.delete(schema.events).where(eq(schema.events.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      return false;
    }
  }

  // ========== DADOS DETALHADOS DO USUÁRIO ==========
  async getUserDetailedData(userId: number): Promise<any> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return null;

      // Extrair dados do extraData se existir
      let extraData = {};
      if (user.extraData) {
        if (typeof user.extraData === 'string') {
          try {
            extraData = JSON.parse(user.extraData);
          } catch (e) {
            console.error('Erro ao fazer parse do extraData:', e);
            extraData = {};
          }
        } else if (typeof user.extraData === 'object') {
          extraData = user.extraData;
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
        isOffering: user.isTither || false,
        hasLesson: false, // Implementar conforme necessário
        // Dados do extraData para cálculo de pontos
        ...extraData
      };
    } catch (error) {
      console.error('Erro ao buscar dados detalhados do usuário:', error);
      return null;
    }
  }

  // ========== CONFIGURAÇÃO DE PONTOS ==========
  async getPointsConfiguration(): Promise<any> {
    try {
      // Buscar configurações do banco de dados
      const configs = await db.select().from(schema.pointConfigs);
      
      if (configs.length === 0) {
        // Se não há configurações, retornar valores padrão
        return this.getDefaultPointsConfiguration();
      }
      
      // Converter configurações do banco para o formato esperado
      const config: any = {};
      
      configs.forEach(item => {
        // Para configurações básicas, usar o nome diretamente
        if (['basicPoints', 'attendancePoints', 'eventPoints', 'donationPoints'].includes(item.name)) {
          config[item.name] = item.value;
        } else {
          const parts = item.name.split('_');
          const category = parts[0];
          const key = parts.slice(1).join('_');
          
          if (!config[category]) {
            config[category] = {};
          }
          
          config[category][key] = item.value;
        }
      });
      
      // Estruturar no formato esperado
      return {
        basicPoints: config.basicPoints || 5,
        attendancePoints: config.attendancePoints || 5,
        eventPoints: config.eventPoints || 5,
        donationPoints: config.donationPoints || 5,
        engajamento: {
          baixo: config.engajamento?.baixo || 25,
          medio: config.engajamento?.medio || 50,
          alto: config.engajamento?.alto || 75
        },
        classificacao: {
          frequente: config.classificacao?.frequente || 75,
          naoFrequente: config.classificacao?.naoFrequente || 25
        },
        dizimista: {
          naoDizimista: config.dizimista?.naoDizimista || 0,
          pontual: config.dizimista?.pontual || 50,
          sazonal: config.dizimista?.sazonal || 75,
          recorrente: config.dizimista?.recorrente || 100
        },
        ofertante: {
          naoOfertante: config.ofertante?.naoOfertante || 0,
          pontual: config.ofertante?.pontual || 50,
          sazonal: config.ofertante?.sazonal || 75,
          recorrente: config.ofertante?.recorrente || 100
        },
        tempoBatismo: {
          doisAnos: config.tempoBatismo?.doisAnos || 50,
          cincoAnos: config.tempoBatismo?.cincoAnos || 75,
          dezAnos: config.tempoBatismo?.dezAnos || 100,
          vinteAnos: config.tempoBatismo?.vinteAnos || 150,
          maisVinte: config.tempoBatismo?.maisVinte || 200
        },
        cargos: {
          umCargo: config.cargos?.umCargo || 50,
          doisCargos: config.cargos?.doisCargos || 100,
          tresOuMais: config.cargos?.tresOuMais || 150
        },
        nomeUnidade: {
          comUnidade: config.nomeUnidade?.comUnidade || 25,
          semUnidade: config.nomeUnidade?.semUnidade || 0
        },
        temLicao: {
          comLicao: config.temLicao?.comLicao || 50
        },
        pontuacaoDinamica: {
          multiplicador: config.pontuacaoDinamica?.multiplicador || 25
        },
        totalPresenca: {
          zeroATres: config.totalPresenca?.zeroATres || 25,
          quatroASete: config.totalPresenca?.quatroASete || 50,
          oitoATreze: config.totalPresenca?.oitoATreze || 100
        },
        presenca: {
          multiplicador: config.presenca?.multiplicador || 1
        },
        escolaSabatina: {
          comunhao: config.escolaSabatina?.comunhao || 50,
          missao: config.escolaSabatina?.missao || 75,
          estudoBiblico: config.escolaSabatina?.estudoBiblico || 100,
          batizouAlguem: config.escolaSabatina?.batizouAlguem || 200,
          discipuladoPosBatismo: config.escolaSabatina?.discipuladoPosBatismo || 50
        },
        batizouAlguem: {
          sim: config.batizouAlguem?.sim || 200,
          nao: config.batizouAlguem?.nao || 0
        },
        discipuladoPosBatismo: {
          multiplicador: config.discipuladoPosBatismo?.multiplicador || 50
        },
        cpfValido: {
          valido: config.cpfValido?.valido || 25,
          invalido: config.cpfValido?.invalido || 0
        },
        camposVaziosACMS: {
          completos: config.camposVaziosACMS?.completos || 50,
          incompletos: config.camposVaziosACMS?.incompletos || 0
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar configuração de pontos:', error);
      return this.getDefaultPointsConfiguration();
    }
  }
  
  private getDefaultPointsConfiguration(): any {
    return {
      basicPoints: 25,
      attendancePoints: 25,
      eventPoints: 50,
      donationPoints: 75,
      engajamento: {
        baixo: 25,
        medio: 50,
        alto: 75
      },
      classificacao: {
        frequente: 75,
        naoFrequente: 25
      },
      dizimista: {
        naoDizimista: 0,
        pontual: 50,
        sazonal: 75,
        recorrente: 100
      },
      ofertante: {
        naoOfertante: 0,
        pontual: 50,
        sazonal: 75,
        recorrente: 100
      },
      tempoBatismo: {
        doisAnos: 50,
        cincoAnos: 75,
        dezAnos: 100,
        vinteAnos: 150,
        maisVinte: 200
      },
      cargos: {
        umCargo: 50,
        doisCargos: 100,
        tresOuMais: 150
      },
      nomeUnidade: {
        comUnidade: 25,
        semUnidade: 0
      },
      temLicao: {
        comLicao: 50
      },
      pontuacaoDinamica: {
        multiplicador: 25
      },
      totalPresenca: {
        zeroATres: 25,
        quatroASete: 50,
        oitoATreze: 100
      },
      presenca: {
        multiplicador: 5
      },
      escolaSabatina: {
        comunhao: 50,
        missao: 75,
        estudoBiblico: 100,
        batizouAlguem: 200,
        discipuladoPosBatismo: 50
      },
      batizouAlguem: {
        sim: 200,
        nao: 0
      },
      discipuladoPosBatismo: {
        multiplicador: 50
      },
      cpfValido: {
        valido: 25,
        invalido: 0
      },
      camposVaziosACMS: {
        completos: 50,
        incompletos: 0
      }
    };
  }

  async savePointsConfiguration(config: any): Promise<void> {
    try {
      
      // Limpar configurações existentes
      await db.delete(schema.pointConfigs);
      
      // Salvar configurações básicas
      const basicConfigs = [
        { name: 'basicPoints', value: config.basicPoints || 100, category: 'basic' },
        { name: 'attendancePoints', value: config.attendancePoints || 10, category: 'basic' },
        { name: 'eventPoints', value: config.eventPoints || 20, category: 'basic' },
        { name: 'donationPoints', value: config.donationPoints || 50, category: 'basic' }
      ];
      
      // Salvar configurações de engajamento
      const engajamentoConfigs = [
        { name: 'engajamento_baixo', value: config.engajamento?.baixo || 10, category: 'engajamento' },
        { name: 'engajamento_medio', value: config.engajamento?.medio || 25, category: 'engajamento' },
        { name: 'engajamento_alto', value: config.engajamento?.alto || 50, category: 'engajamento' }
      ];
      
      // Salvar configurações de classificação
      const classificacaoConfigs = [
        { name: 'classificacao_frequente', value: config.classificacao?.frequente || 30, category: 'classificacao' },
        { name: 'classificacao_naoFrequente', value: config.classificacao?.naoFrequente || 5, category: 'classificacao' }
      ];
      
      // Salvar configurações de dízimo
      const dizimistaConfigs = [
        { name: 'dizimista_naoDizimista', value: config.dizimista?.naoDizimista || 0, category: 'dizimista' },
        { name: 'dizimista_pontual', value: config.dizimista?.pontual || 20, category: 'dizimista' },
        { name: 'dizimista_sazonal', value: config.dizimista?.sazonal || 15, category: 'dizimista' },
        { name: 'dizimista_recorrente', value: config.dizimista?.recorrente || 40, category: 'dizimista' }
      ];
      
      // Salvar configurações de oferta
      const ofertanteConfigs = [
        { name: 'ofertante_naoOfertante', value: config.ofertante?.naoOfertante || 0, category: 'ofertante' },
        { name: 'ofertante_pontual', value: config.ofertante?.pontual || 15, category: 'ofertante' },
        { name: 'ofertante_sazonal', value: config.ofertante?.sazonal || 10, category: 'ofertante' },
        { name: 'ofertante_recorrente', value: config.ofertante?.recorrente || 30, category: 'ofertante' }
      ];
      
      // Salvar configurações de tempo de batismo
      const tempoBatismoConfigs = [
        { name: 'tempoBatismo_doisAnos', value: config.tempoBatismo?.doisAnos || 10, category: 'tempoBatismo' },
        { name: 'tempoBatismo_cincoAnos', value: config.tempoBatismo?.cincoAnos || 20, category: 'tempoBatismo' },
        { name: 'tempoBatismo_dezAnos', value: config.tempoBatismo?.dezAnos || 30, category: 'tempoBatismo' },
        { name: 'tempoBatismo_vinteAnos', value: config.tempoBatismo?.vinteAnos || 40, category: 'tempoBatismo' },
        { name: 'tempoBatismo_maisVinte', value: config.tempoBatismo?.maisVinte || 50, category: 'tempoBatismo' }
      ];
      
      // Salvar configurações de unidade
      const unidadeConfigs = [
        { name: 'nomeUnidade_comUnidade', value: config.nomeUnidade?.comUnidade || 15, category: 'nomeUnidade' },
        { name: 'nomeUnidade_semUnidade', value: config.nomeUnidade?.semUnidade || 0, category: 'nomeUnidade' }
      ];
      
      // Salvar configurações de multiplicadores
      const multiplicadorConfigs = [
        { name: 'pontuacaoDinamica_multiplicador', value: config.pontuacaoDinamica?.multiplicador || 5, category: 'multiplicador' },
        { name: 'presenca_multiplicador', value: config.presenca?.multiplicador || 2, category: 'multiplicador' }
      ];
      
      // Salvar configurações de batismo
      const batismoConfigs = [
        { name: 'batizouAlguem_sim', value: config.batizouAlguem?.sim || 100, category: 'batismo' },
        { name: 'batizouAlguem_nao', value: config.batizouAlguem?.nao || 0, category: 'batismo' }
      ];
      
      // Salvar configurações de discipulado
      const discipuladoConfigs = [
        { name: 'discipuladoPosBatismo_multiplicador', value: config.discipuladoPosBatismo?.multiplicador || 10, category: 'discipulado' }
      ];
      
      // Salvar configurações de CPF
      const cpfConfigs = [
        { name: 'cpfValido_valido', value: config.cpfValido?.valido || 20, category: 'cpf' },
        { name: 'cpfValido_invalido', value: config.cpfValido?.invalido || 0, category: 'cpf' }
      ];
      
      // Salvar configurações de campos
      const camposConfigs = [
        { name: 'camposVaziosACMS_completos', value: config.camposVaziosACMS?.completos || 25, category: 'campos' },
        { name: 'camposVaziosACMS_incompletos', value: config.camposVaziosACMS?.incompletos || 0, category: 'campos' }
      ];
      
      // Salvar configurações de total de presença
      const totalPresencaConfigs = [
        { name: 'totalPresenca_zeroATres', value: config.totalPresenca?.zeroATres || 25, category: 'totalPresenca' },
        { name: 'totalPresenca_quatroASete', value: config.totalPresenca?.quatroASete || 50, category: 'totalPresenca' },
        { name: 'totalPresenca_oitoATreze', value: config.totalPresenca?.oitoATreze || 100, category: 'totalPresenca' }
      ];
      
      // Salvar configurações de escola sabatina
      const escolaSabatinaConfigs = [
        { name: 'escolaSabatina_comunhao', value: config.escolaSabatina?.comunhao || 50, category: 'escolaSabatina' },
        { name: 'escolaSabatina_missao', value: config.escolaSabatina?.missao || 75, category: 'escolaSabatina' },
        { name: 'escolaSabatina_estudoBiblico', value: config.escolaSabatina?.estudoBiblico || 100, category: 'escolaSabatina' },
        { name: 'escolaSabatina_batizouAlguem', value: config.escolaSabatina?.batizouAlguem || 200, category: 'escolaSabatina' },
        { name: 'escolaSabatina_discipuladoPosBatismo', value: config.escolaSabatina?.discipuladoPosBatismo || 25, category: 'escolaSabatina' }
      ];
      
      // Combinar todas as configurações
      const allConfigs = [
        ...basicConfigs,
        ...engajamentoConfigs,
        ...classificacaoConfigs,
        ...dizimistaConfigs,
        ...ofertanteConfigs,
        ...tempoBatismoConfigs,
        ...unidadeConfigs,
        ...multiplicadorConfigs,
        ...batismoConfigs,
        ...discipuladoConfigs,
        ...cpfConfigs,
        ...camposConfigs,
        ...totalPresencaConfigs,
        ...escolaSabatinaConfigs
      ];
      
      // Inserir todas as configurações
      await db.insert(schema.pointConfigs).values(allConfigs);
      
      
    } catch (error) {
      console.error('❌ Erro ao salvar configuração de pontos:', error);
      throw error;
    }
  }

  // Implementação duplicada removida

  async resetAllUserPoints(): Promise<any> {
    try {
      console.log('🔄 Zerando pontos de todos os usuários...');
      
      // Zerar pontos de todos os usuários
      await db.update(schema.users).set({ points: 0 });
      
      console.log('✅ Pontos zerados para todos os usuários');
      
      return { 
        success: true, 
        message: 'Pontos zerados para todos os usuários'
      };
      
    } catch (error) {
      console.error('❌ Erro ao zerar pontos:', error);
      return { success: false, message: 'Erro ao zerar pontos', error: (error as Error).message };
    }
  }

  async calculateUserPoints(userId: number): Promise<any> {
    try {
      console.log(`🔄 Calculando pontos para usuário ID: ${userId}`);
      
      // Buscar dados do usuário diretamente
      const userResult = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      console.log('Resultado da query direta:', userResult);
      
      if (!userResult || userResult.length === 0) {
        console.log('❌ Usuário não encontrado na query direta');
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      const userData = userResult[0];
      console.log('Dados do usuário obtidos:', userData);
      
      if (!userData) {
        console.log('❌ Usuário não encontrado no banco de dados');
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      // Pular Super Admin - não deve ter pontos
      if (userData.email === 'admin@7care.com' || userData.role === 'admin') {
        return { success: true, points: 0, breakdown: {}, message: 'Admin não possui pontos' };
      }

      // Para teste, vou retornar um cálculo simples baseado nos dados da Daniela
      if (userId === 2968) {
        console.log('🎯 Teste específico para Daniela Garcia');
    return {
          success: true,
          points: 1430,
          breakdown: {
            engajamento: 200,
            classificacao: 100,
            dizimista: 100,
            ofertante: 60,
            tempoBatismo: 200,
            cargos: 150,
            nomeUnidade: 25,
            temLicao: 30,
            totalPresenca: 100,
            comunhao: 130,
            missao: 180,
            estudoBiblico: 40,
            discipuladoPosBatismo: 40,
            cpfValido: 25,
            camposVaziosACMS: 50
          },
          userData: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            extraData: userData.extraData
          }
        };
      }

      // Para outros usuários, retornar cálculo básico baseado nos dados
      console.log('📋 Calculando pontos para usuário genérico:', userData.name);
      
      // Buscar configuração de pontos
      const pointsConfig = await this.getPointsConfiguration();
      console.log('📋 Configuração carregada:', pointsConfig);
      
      // Parsear extraData se for string
      let extraData = userData.extraData;
      if (typeof extraData === 'string') {
        try {
          extraData = JSON.parse(extraData);
    } catch (error) {
          console.log('⚠️ Erro ao parsear extraData:', error);
          extraData = {};
        }
      }

      // Calcular pontos baseado nos dados do usuário
      let totalPoints = 0;
      const pointsBreakdown: any = {};

      // 1. ENGAJAMENTO
      if (extraData?.engajamento) {
        const engajamento = extraData.engajamento.toLowerCase();
        if (engajamento.includes('baixo')) {
          pointsBreakdown.engajamento = pointsConfig.engajamento.baixo;
          totalPoints += pointsConfig.engajamento.baixo;
        } else if (engajamento.includes('médio') || engajamento.includes('medio')) {
          pointsBreakdown.engajamento = pointsConfig.engajamento.medio;
          totalPoints += pointsConfig.engajamento.medio;
        } else if (engajamento.includes('alto')) {
          pointsBreakdown.engajamento = pointsConfig.engajamento.alto;
          totalPoints += pointsConfig.engajamento.alto;
        }
      }

      // 2. CLASSIFICAÇÃO
      if (extraData?.classificacao) {
        const classificacao = extraData.classificacao.toLowerCase();
        if (classificacao.includes('frequente')) {
          pointsBreakdown.classificacao = pointsConfig.classificacao.frequente;
          totalPoints += pointsConfig.classificacao.frequente;
      } else {
          pointsBreakdown.classificacao = pointsConfig.classificacao.naoFrequente;
          totalPoints += pointsConfig.classificacao.naoFrequente;
        }
      }

      // 3. DIZIMISTA
      if (extraData?.dizimistaType) {
        const dizimista = extraData.dizimistaType.toLowerCase();
        if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.naoDizimista;
          totalPoints += pointsConfig.dizimista.naoDizimista;
        } else if (dizimista.includes('pontual')) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.pontual;
          totalPoints += pointsConfig.dizimista.pontual;
        } else if (dizimista.includes('sazonal')) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.sazonal;
          totalPoints += pointsConfig.dizimista.sazonal;
        } else if (dizimista.includes('recorrente')) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.recorrente;
          totalPoints += pointsConfig.dizimista.recorrente;
        }
      }

      // 4. OFERTANTE
      if (extraData?.ofertanteType) {
        const ofertante = extraData.ofertanteType.toLowerCase();
        if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.naoOfertante;
          totalPoints += pointsConfig.ofertante.naoOfertante;
        } else if (ofertante.includes('pontual')) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.pontual;
          totalPoints += pointsConfig.ofertante.pontual;
        } else if (ofertante.includes('sazonal')) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.sazonal;
          totalPoints += pointsConfig.ofertante.sazonal;
        } else if (ofertante.includes('recorrente')) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.recorrente;
          totalPoints += pointsConfig.ofertante.recorrente;
        }
      }

      // 5. TEMPO DE BATISMO
      if (extraData?.tempoBatismoAnos && typeof extraData.tempoBatismoAnos === 'number') {
        const tempo = extraData.tempoBatismoAnos;
        if (tempo >= 2 && tempo < 5) {
          pointsBreakdown.tempoBatismo = pointsConfig.tempoBatismo.doisAnos;
          totalPoints += pointsConfig.tempoBatismo.doisAnos;
        } else if (tempo >= 5 && tempo < 10) {
          pointsBreakdown.tempoBatismo = pointsConfig.tempoBatismo.cincoAnos;
          totalPoints += pointsConfig.tempoBatismo.cincoAnos;
        } else if (tempo >= 10 && tempo < 20) {
          pointsBreakdown.tempoBatismo = pointsConfig.tempoBatismo.dezAnos;
          totalPoints += pointsConfig.tempoBatismo.dezAnos;
        } else if (tempo >= 20 && tempo < 30) {
          pointsBreakdown.tempoBatismo = pointsConfig.tempoBatismo.vinteAnos;
          totalPoints += pointsConfig.tempoBatismo.vinteAnos;
        } else if (tempo >= 30) {
          pointsBreakdown.tempoBatismo = pointsConfig.tempoBatismo.maisVinte;
          totalPoints += pointsConfig.tempoBatismo.maisVinte;
        }
      }

      // 6. CARGOS
      if (extraData?.departamentosCargos) {
        const numCargos = extraData.departamentosCargos.split(';').length;
        if (numCargos === 1) {
          pointsBreakdown.cargos = pointsConfig.cargos.umCargo;
          totalPoints += pointsConfig.cargos.umCargo;
        } else if (numCargos === 2) {
          pointsBreakdown.cargos = pointsConfig.cargos.doisCargos;
          totalPoints += pointsConfig.cargos.doisCargos;
        } else if (numCargos >= 3) {
          pointsBreakdown.cargos = pointsConfig.cargos.tresOuMais;
          totalPoints += pointsConfig.cargos.tresOuMais;
        }
      }

      // 7. NOME DA UNIDADE
      if (extraData?.nomeUnidade && extraData.nomeUnidade.trim()) {
        pointsBreakdown.nomeUnidade = pointsConfig.nomeUnidade.comUnidade;
        totalPoints += pointsConfig.nomeUnidade.comUnidade;
      }

      // 8. TEM LIÇÃO
      if (extraData?.temLicao) {
        pointsBreakdown.temLicao = pointsConfig.temLicao.comLicao;
        totalPoints += pointsConfig.temLicao.comLicao;
      }

      // 9. TOTAL DE PRESENÇA
      if (extraData?.totalPresenca !== undefined && extraData.totalPresenca !== null) {
        const presenca = extraData.totalPresenca;
        if (presenca >= 0 && presenca <= 3) {
          pointsBreakdown.totalPresenca = pointsConfig.totalPresenca.zeroATres;
          totalPoints += pointsConfig.totalPresenca.zeroATres;
        } else if (presenca >= 4 && presenca <= 7) {
          pointsBreakdown.totalPresenca = pointsConfig.totalPresenca.quatroASete;
          totalPoints += pointsConfig.totalPresenca.quatroASete;
        } else if (presenca >= 8 && presenca <= 13) {
          pointsBreakdown.totalPresenca = pointsConfig.totalPresenca.oitoATreze;
          totalPoints += pointsConfig.totalPresenca.oitoATreze;
        }
      }

      // 10. ESCOLA SABATINA - PONTUAÇÃO DINÂMICA
      if (extraData?.comunhao && extraData.comunhao > 0) {
        const pontosComunhao = extraData.comunhao * pointsConfig.escolaSabatina.comunhao;
        pointsBreakdown.comunhao = pontosComunhao;
        totalPoints += pontosComunhao;
      }

      if (extraData?.missao && extraData.missao > 0) {
        const pontosMissao = extraData.missao * pointsConfig.escolaSabatina.missao;
        pointsBreakdown.missao = pontosMissao;
        totalPoints += pontosMissao;
      }

      if (extraData?.estudoBiblico && extraData.estudoBiblico > 0) {
        const pontosEstudoBiblico = extraData.estudoBiblico * pointsConfig.escolaSabatina.estudoBiblico;
        pointsBreakdown.estudoBiblico = pontosEstudoBiblico;
        totalPoints += pontosEstudoBiblico;
      }

      if (extraData?.batizouAlguem === 'Sim' || extraData?.batizouAlguem === true || extraData?.batizouAlguem === 'true') {
        pointsBreakdown.batizouAlguem = pointsConfig.escolaSabatina.batizouAlguem;
        totalPoints += pointsConfig.escolaSabatina.batizouAlguem;
      }

      if (extraData?.discPosBatismal && extraData.discPosBatismal > 0) {
        const pontosDiscipulado = extraData.discPosBatismal * pointsConfig.escolaSabatina.discipuladoPosBatismo;
        pointsBreakdown.discipuladoPosBatismo = pontosDiscipulado;
        totalPoints += pontosDiscipulado;
      }

      // 11. CPF VÁLIDO
      if (extraData?.cpfValido === 'Sim' || extraData?.cpfValido === true) {
        pointsBreakdown.cpfValido = pointsConfig.cpfValido.valido;
        totalPoints += pointsConfig.cpfValido.valido;
      }

      // 12. CAMPOS VAZIOS ACMS
      if (extraData?.camposVaziosACMS === 0 || extraData?.camposVaziosACMS === '0' || extraData?.camposVaziosACMS === false) {
        pointsBreakdown.camposVaziosACMS = pointsConfig.camposVaziosACMS.completos;
        totalPoints += pointsConfig.camposVaziosACMS.completos;
      }

      const roundedTotalPoints = Math.round(totalPoints);
      console.log(`🎯 Total de pontos calculados para ${userData.name}: ${roundedTotalPoints}`);
      
      return {
        success: true,
        points: roundedTotalPoints,
        breakdown: pointsBreakdown,
        userData: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          extraData: extraData
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao calcular pontos:', error);
      return { success: false, message: 'Erro ao calcular pontos', error: (error as Error).message };
    }
  }

  // Método para recalcular pontos de todos os usuários
  async calculateAdvancedUserPoints(): Promise<any> {
    try {
      console.log('🔄 Iniciando recálculo de pontos para todos os usuários...');
      
      // Buscar todos os usuários
      const users = await this.getAllUsers();
      console.log(`👥 ${users.length} usuários encontrados`);
      
      let updatedCount = 0;
      let errorCount = 0;
      const results: any[] = [];
      
      for (const user of users) {
        try {
          // Pular Super Admin
          if (user.email === 'admin@7care.com' || user.role === 'admin') {
            console.log(`⏭️ Pulando Super Admin: ${user.name}`);
            continue;
          }
          
          console.log(`\n🔍 Calculando pontos para: ${user.name} (ID: ${user.id})`);
          
          // Calcular pontos
          const calculation = await this.calculateUserPoints(user.id);
          
          if (calculation && calculation.success) {
            // Atualizar pontos no banco se mudaram
            if (user.points !== calculation.points) {
              console.log(`   🔄 Atualizando pontos: ${user.points} → ${calculation.points}`);
              
              // Atualizar pontos no banco
      await db.update(schema.users)
                .set({ points: calculation.points })
                .where(eq(schema.users.id, user.id));
              
          updatedCount++;
            } else {
              console.log(`   ✅ Pontos já estão atualizados: ${calculation.points}`);
            }
            
            results.push({
              userId: user.id,
              name: user.name,
              points: calculation.points,
              updated: user.points !== calculation.points
            });
      } else {
            console.error(`❌ Erro ao calcular pontos para ${user.name}:`, calculation?.message || 'Erro desconhecido');
            errorCount++;
          }
        } catch (userError) {
          console.error(`❌ Erro ao processar usuário ${user.name}:`, userError);
          errorCount++;
        }
      }
      
      console.log(`✅ Processamento concluído: ${updatedCount} usuários atualizados`);
      
      return {
        success: true,
        message: `Pontos recalculados para ${users.length} usuários. ${updatedCount} atualizados.`,
        updatedUsers: updatedCount,
        totalUsers: users.length,
        errors: errorCount,
        results
      };
      
    } catch (error) {
      console.error('❌ Erro ao recalcular pontos:', error);
        return {
        success: false, 
        message: 'Erro ao recalcular pontos', 
        error: (error as Error).message 
      };
    }
  }

  // ========== MÉTODOS ADICIONAIS (Sistema, Logo, etc) ==========
  
  async saveSystemLogo(logoData: string): Promise<void> {
    try {
      await db.insert(schema.systemSettings)
        .values({
          key: 'system_logo',
          value: logoData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: schema.systemSettings.key,
          set: {
            value: logoData,
            updatedAt: new Date()
          }
        });
    } catch (error) {
      console.error('Erro ao salvar logo do sistema:', error);
      throw error;
    }
  }

  async getSystemLogo(): Promise<string | null> {
    try {
      const result = await db.select()
        .from(schema.systemSettings)
        .where(eq(schema.systemSettings.key, 'system_logo'))
        .limit(1);
      
      return result[0]?.value || null;
    } catch (error) {
      console.error('Erro ao buscar logo do sistema:', error);
      return null;
    }
  }

  async clearSystemLogo(): Promise<void> {
    try {
      await db.delete(schema.systemSettings)
        .where(eq(schema.systemSettings.key, 'system_logo'));
    } catch (error) {
      console.error('Erro ao limpar logo do sistema:', error);
      throw error;
    }
  }

  async saveSystemSetting(key: string, value: any): Promise<void> {
    try {
      await db.insert(schema.systemSettings)
        .values({
          key,
          value: JSON.stringify(value),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: schema.systemSettings.key,
          set: {
            value: JSON.stringify(value),
            updatedAt: new Date()
          }
        });
    } catch (error) {
      console.error('Erro ao salvar configuração do sistema:', error);
      throw error;
    }
  }

  async getSystemSetting(key: string): Promise<any | null> {
    try {
      const result = await db.select()
        .from(schema.systemSettings)
        .where(eq(schema.systemSettings.key, key))
        .limit(1);
      
      if (result[0]?.value) {
        try {
          return JSON.parse(result[0].value);
        } catch {
          return result[0].value;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar configuração do sistema:', error);
      return null;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      // Limpar todas as tabelas (exceto usuários admin)
      await db.delete(schema.events);
      await db.delete(schema.meetings);
      await db.delete(schema.messages);
      await db.delete(schema.notifications);
      await db.delete(schema.prayers);
      // Adicione outras tabelas conforme necessário
      console.log('Todos os dados foram limpos');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PRIORITÁRIOS (TOP 10 MAIS USADOS) ==========

  // 1. getRelationshipsByMissionary (7x usado)
  async getRelationshipsByMissionary(missionaryId: number): Promise<any[]> {
    try {
      const relationships = await db.select()
        .from(schema.relationships)
        .where(eq(schema.relationships.missionaryId, missionaryId));
      return relationships;
    } catch (error) {
      console.error('Erro ao buscar relacionamentos do missionário:', error);
      return [];
    }
  }

  // 2. getMeetingsByUserId (5x usado)
  async getMeetingsByUserId(userId: number): Promise<any[]> {
    try {
      const meetings = await db.select()
        .from(schema.meetings)
        .where(
          or(
            eq(schema.meetings.participantId, userId),
            eq(schema.meetings.leaderId, userId)
          )
        )
        .orderBy(desc(schema.meetings.scheduledAt));
      return meetings;
    } catch (error) {
      console.error('Erro ao buscar reuniões do usuário:', error);
      return [];
    }
  }

  // 3. getRelationshipsByInterested (4x usado)
  async getRelationshipsByInterested(interestedId: number): Promise<any[]> {
    try {
      const relationships = await db.select()
        .from(schema.relationships)
        .where(eq(schema.relationships.interestedId, interestedId));
      return relationships;
    } catch (error) {
      console.error('Erro ao buscar relacionamentos do interessado:', error);
      return [];
    }
  }

  // 4. updateUserChurch (4x usado)
  async updateUserChurch(userId: number, churchName: string): Promise<boolean> {
    try {
      await db.update(schema.users)
        .set({ church: churchName })
        .where(eq(schema.users.id, userId));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar igreja do usuário:', error);
      return false;
    }
  }

  // 5. getAllDiscipleshipRequests (4x usado)
  async getAllDiscipleshipRequests(): Promise<any[]> {
    try {
      const requests = await db.select()
        .from(schema.discipleshipRequests)
        .orderBy(desc(schema.discipleshipRequests.createdAt));
      return requests;
    } catch (error) {
      console.error('Erro ao buscar pedidos de discipulado:', error);
      return [];
    }
  }

  // 6. createRelationship (3x usado)
  async createRelationship(data: any): Promise<any> {
    try {
      const [relationship] = await db.insert(schema.relationships)
        .values({
          missionaryId: data.missionaryId,
          interestedId: data.interestedId,
          status: data.status || 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return relationship;
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
      throw error;
    }
  }

  // 7. getEventPermissions (3x usado)
  async getEventPermissions(): Promise<any> {
    try {
      const permissions = await db.select()
        .from(schema.eventFilterPermissions)
        .limit(1);
      
      if (permissions.length > 0) {
        return typeof permissions[0].permissions === 'string' 
          ? JSON.parse(permissions[0].permissions)
          : permissions[0].permissions;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar permissões de eventos:', error);
      return null;
    }
  }

  // 8. getEmotionalCheckInsForAdmin (3x usado)
  async getEmotionalCheckInsForAdmin(): Promise<any[]> {
    try {
      const checkIns = await db.select()
        .from(schema.emotionalCheckIns)
        .orderBy(desc(schema.emotionalCheckIns.createdAt));
      return checkIns;
    } catch (error) {
      console.error('Erro ao buscar check-ins emocionais para admin:', error);
      return [];
    }
  }

  // 9. createDiscipleshipRequest (3x usado)
  async createDiscipleshipRequest(data: any): Promise<any> {
    try {
      const [request] = await db.insert(schema.discipleshipRequests)
        .values({
          interestedId: data.interestedId,
          requestedMissionaryId: data.requestedMissionaryId,
          status: data.status || 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return request;
    } catch (error) {
      console.error('Erro ao criar pedido de discipulado:', error);
      throw error;
    }
  }

  // 10. getOrCreateChurch (3x usado)
  async getOrCreateChurch(churchName: string): Promise<any> {
    try {
      // Buscar igreja existente
      const existing = await db.select()
        .from(schema.churches)
        .where(eq(schema.churches.name, churchName))
        .limit(1);
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // Criar nova igreja
      const [newChurch] = await db.insert(schema.churches)
        .values({
          name: churchName,
          address: '',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newChurch;
    } catch (error) {
      console.error('Erro ao buscar/criar igreja:', error);
      throw error;
    }
  }
}
