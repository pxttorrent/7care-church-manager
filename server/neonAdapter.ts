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
  getAllRelationships(): Promise<any[]>;
  getRelationshipById(id: number): Promise<any | null>;
  createRelationship(data: any): Promise<any>;
  updateRelationship(id: number, updates: any): Promise<any | null>;
  deleteRelationship(id: number): Promise<boolean>;
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
      return result;
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
            sql`extra_data->>'visited' = 'true'`
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
          baixo: config.engajamento?.baixo || 5,
          medio: config.engajamento?.medio || 7,
          alto: config.engajamento?.alto || 10
        },
        classificacao: {
          frequente: config.classificacao?.frequente || 8,
          naoFrequente: config.classificacao?.naoFrequente || 5
        },
        dizimista: {
          naoDizimista: config.dizimista?.naoDizimista || 0,
          pontual: config.dizimista?.pontual || 6,
          sazonal: config.dizimista?.sazonal || 5,
          recorrente: config.dizimista?.recorrente || 10
        },
        ofertante: {
          naoOfertante: config.ofertante?.naoOfertante || 0,
          pontual: config.ofertante?.pontual || 6,
          sazonal: config.ofertante?.sazonal || 5,
          recorrente: config.ofertante?.recorrente || 8
        },
        tempoBatismo: {
          doisAnos: config.tempoBatismo?.doisAnos || 5,
          cincoAnos: config.tempoBatismo?.cincoAnos || 6,
          dezAnos: config.tempoBatismo?.dezAnos || 7,
          vinteAnos: config.tempoBatismo?.vinteAnos || 8,
          maisVinte: config.tempoBatismo?.maisVinte || 10
        },
        cargos: {
          umCargo: config.cargos?.umCargo || 6,
          doisCargos: config.cargos?.doisCargos || 8,
          tresOuMais: config.cargos?.tresOuMais || 10
        },
        nomeUnidade: {
          comUnidade: config.nomeUnidade?.comUnidade || 6,
          semUnidade: config.nomeUnidade?.semUnidade || 0
        },
        temLicao: {
          comLicao: config.temLicao?.comLicao || 8
        },
        pontuacaoDinamica: {
          multiplicador: config.pontuacaoDinamica?.multiplicador || 1
        },
        totalPresenca: {
          zeroATres: config.totalPresenca?.zeroATres || 5,
          quatroASete: config.totalPresenca?.quatroASete || 7,
          oitoATreze: config.totalPresenca?.oitoATreze || 10
        },
        presenca: {
          multiplicador: config.presenca?.multiplicador || 1
        },
        escolaSabatina: {
          comunhao: config.escolaSabatina?.comunhao || 6,
          missao: config.escolaSabatina?.missao || 8,
          estudoBiblico: config.escolaSabatina?.estudoBiblico || 10,
          batizouAlguem: config.escolaSabatina?.batizouAlguem || 10,
          discipuladoPosBatismo: config.escolaSabatina?.discipuladoPosBatismo || 6
        },
        batizouAlguem: {
          sim: config.batizouAlguem?.sim || 8,
          nao: config.batizouAlguem?.nao || 0
        },
        discipuladoPosBatismo: {
          multiplicador: config.discipuladoPosBatismo?.multiplicador || 1
        },
        cpfValido: {
          valido: config.cpfValido?.valido || 6,
          invalido: config.cpfValido?.invalido || 0
        },
        camposVaziosACMS: {
          completos: config.camposVaziosACMS?.completos || 6,
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
      basicPoints: 5,
      attendancePoints: 5,
      eventPoints: 5,
      donationPoints: 5,
      engajamento: {
        baixo: 5,
        medio: 7,
        alto: 10
      },
      classificacao: {
        frequente: 8,
        naoFrequente: 5
      },
      dizimista: {
        naoDizimista: 0,
        pontual: 6,
        sazonal: 5,
        recorrente: 10
      },
      ofertante: {
        naoOfertante: 0,
        pontual: 6,
        sazonal: 5,
        recorrente: 8
      },
      tempoBatismo: {
        doisAnos: 5,
        cincoAnos: 6,
        dezAnos: 7,
        vinteAnos: 8,
        maisVinte: 10
      },
      cargos: {
        umCargo: 6,
        doisCargos: 8,
        tresOuMais: 10
      },
      nomeUnidade: {
        comUnidade: 6,
        semUnidade: 0
      },
      temLicao: {
        comLicao: 8
      },
      pontuacaoDinamica: {
        multiplicador: 1
      },
      totalPresenca: {
        zeroATres: 5,
        quatroASete: 7,
        oitoATreze: 10
      },
      presenca: {
        multiplicador: 1
      },
      escolaSabatina: {
        comunhao: 6,
        missao: 8,
        estudoBiblico: 10,
        batizouAlguem: 10,
        discipuladoPosBatismo: 6
      },
      batizouAlguem: {
        sim: 8,
        nao: 0
      },
      discipuladoPosBatismo: {
        multiplicador: 1
      },
      cpfValido: {
        valido: 6,
        invalido: 0
      },
      camposVaziosACMS: {
        completos: 6,
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

  async resetPointsConfiguration(): Promise<void> {
    console.log('Configuração de pontos resetada');
  }

  async calculateAdvancedUserPoints(): Promise<any> {
    try {
      
      // Buscar todos os usuários
      const users = await db.select().from(schema.users);
      console.log(`📊 Total de usuários encontrados: ${users.length}`);
      
      let updatedCount = 0;
      
      for (const user of users) {
        
        // Pular Super Admin - não deve ter pontos
        if (user.email === 'admin@7care.com' || user.role === 'admin') {
          continue;
        }
        
        // Buscar dados detalhados do usuário
        const userData = await this.getUserDetailedData(user.id);
        if (!userData) {
          console.log(`⚠️ Dados não encontrados para ${user.name}`);
          continue;
        }
        
        // Calcular pontos usando a lógica existente
        const pointsConfig = await this.getPointsConfiguration();
        let totalPoints = 0;
        
        // Pontos básicos
        totalPoints += pointsConfig.basicPoints || 100;
        
        // Pontos de presença
        const attendancePoints = (userData.attendance || 0) * (pointsConfig.attendancePoints || 10);
        totalPoints += attendancePoints;
        
        // Pontos de engajamento
        const engajamento = userData.engajamento || 'baixo';
        totalPoints += pointsConfig.engajamento[engajamento] || 0;
        
        // Pontos de classificação
        const classificacao = userData.classificacao || 'naoFrequente';
        totalPoints += pointsConfig.classificacao[classificacao] || 0;
        
        // Pontos de dízimo
        const dizimistaType = userData.dizimistaType || 'naoDizimista';
        totalPoints += pointsConfig.dizimista[dizimistaType] || 0;
        
        // Pontos de oferta
        const ofertanteType = userData.ofertanteType || 'naoOfertante';
        totalPoints += pointsConfig.ofertante[ofertanteType] || 0;
        
        // Pontos de tempo de batismo
        const tempoBatismoAnos = userData.tempoBatismoAnos || 0;
        if (tempoBatismoAnos >= 20) {
          totalPoints += pointsConfig.tempoBatismo.maisVinte || 50;
        } else if (tempoBatismoAnos >= 10) {
          totalPoints += pointsConfig.tempoBatismo.vinteAnos || 40;
        } else if (tempoBatismoAnos >= 5) {
          totalPoints += pointsConfig.tempoBatismo.cincoAnos || 20;
        } else if (tempoBatismoAnos >= 2) {
          totalPoints += pointsConfig.tempoBatismo.doisAnos || 10;
        }
        
        // Pontos de unidade
        const nomeUnidade = userData.nomeUnidade || '';
        if (nomeUnidade && nomeUnidade !== '') {
          totalPoints += pointsConfig.nomeUnidade.comUnidade || 15;
        }
        
        // Pontos de batismo
        if (userData.batizouAlguem) {
          totalPoints += pointsConfig.batizouAlguem.sim || 100;
        }
        
        // Pontos de discipulado pós-batismo
        const discPosBatismal = userData.discPosBatismal || 0;
        totalPoints += discPosBatismal * (pointsConfig.discipuladoPosBatismo.multiplicador || 10);
        
        // Pontos de CPF válido
        if (userData.cpfValido) {
          totalPoints += pointsConfig.cpfValido.valido || 20;
        }
        
        // Pontos de campos completos
        if (!userData.camposVaziosACMS) {
          totalPoints += pointsConfig.camposVaziosACMS.completos || 25;
        }
        
        // Aplicar multiplicadores
        const multiplicadorDinamico = pointsConfig.pontuacaoDinamica?.multiplicador || 5;
        const multiplicadorPresenca = pointsConfig.presenca?.multiplicador || 2;
        
        totalPoints = totalPoints * multiplicadorDinamico;
        totalPoints += (userData.attendance || 0) * multiplicadorPresenca;
        
        // Verificar se os pontos mudaram
        const roundedTotalPoints = Math.round(totalPoints);
        if (user.points !== roundedTotalPoints) {
          
          // Atualizar pontos no banco
          await db
            .update(schema.users)
            .set({ 
              points: roundedTotalPoints,
              updatedAt: new Date().toISOString()
            })
            .where(eq(schema.users.id, user.id));
          
          updatedCount++;
        } else {
        }
      }
      
      console.log(`✅ Processamento concluído: ${updatedCount} usuários atualizados`);
      return { 
        success: true, 
        message: `Pontos calculados para ${users.length} usuários. ${updatedCount} atualizados.`,
        updatedCount,
        totalUsers: users.length
      };
      
    } catch (error) {
      console.error('❌ Erro ao calcular pontos:', error);
      return { success: false, message: 'Erro ao calcular pontos', error: error.message };
    }
  }

  // ========== MÉTODOS STUB (implementar conforme necessário) ==========
  async saveEventPermissions(permissions: any): Promise<void> {
    try {
      await this.saveSystemConfig('event-permissions', { permissions });
      console.log('Permissões de eventos salvas:', permissions);
    } catch (error) {
      console.error('Erro ao salvar permissões de eventos:', error);
      throw error;
    }
  }

  async getEventPermissions(): Promise<any> {
    try {
      // Buscar permissões do sistema
      const systemConfig = await this.getSystemConfig('event-permissions');
      if (systemConfig && systemConfig.value && systemConfig.value.permissions) {
        return systemConfig.value.permissions;
      }

      // Fallback para permissões padrão se não houver configuração
      return this.getDefaultEventPermissions();
    } catch (error) {
      console.error('Erro ao buscar permissões de eventos:', error);
      return this.getDefaultEventPermissions();
    }
  }

  private getDefaultEventPermissions(): any {
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
      const result = await db
        .select()
        .from(eventFilterPermissions)
        .limit(1);

      if (result.length > 0) {
        return result[0].permissions;
      }

      // Retornar permissões padrão se não houver configuração
      return this.getDefaultFilterPermissions();
    } catch (error) {
      console.error('Erro ao buscar permissões de filtros:', error);
      return this.getDefaultFilterPermissions();
    }
  }

  async saveEventFilterPermissions(permissions: any): Promise<void> {
    try {
      // Verificar se já existe uma configuração
      const existing = await db
        .select()
        .from(eventFilterPermissions)
        .limit(1);

      if (existing.length > 0) {
        // Atualizar configuração existente
        await db
          .update(eventFilterPermissions)
          .set({ 
            permissions: JSON.stringify(permissions),
            updatedAt: new Date()
          })
          .where(eq(eventFilterPermissions.id, existing[0].id));
      } else {
        // Criar nova configuração
        await db
          .insert(eventFilterPermissions)
          .values({
            permissions: JSON.stringify(permissions),
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
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

  async createEmotionalCheckIn(data: any): Promise<any> {
    try {
      console.log('🔍 createEmotionalCheckIn - Dados recebidos:', data);
      
      const checkIn = {
        userId: data.userId,
        mood: data.emotionalScore ? `Score: ${data.emotionalScore}` : data.mood || 'Não informado',
        notes: data.prayerRequest || data.notes || '',
        createdAt: new Date()
      };
      
      console.log('🔍 createEmotionalCheckIn - Dados para inserir:', checkIn);
      
      const result = await db.insert(schema.emotionalCheckins).values(checkIn).returning();
      console.log('🔍 createEmotionalCheckIn - Resultado:', result);
      
      return result[0];
    } catch (error) {
      console.error('Erro ao criar check-in emocional:', error);
      throw error;
    }
  }

  async getAllEmotionalCheckIns(): Promise<any[]> {
    const result = await db.select().from(schema.emotionalCheckins).orderBy(desc(schema.emotionalCheckins.createdAt));
    return result;
  }

  async getEmotionalCheckInById(id: number): Promise<any | null> {
    const result = await db.select().from(schema.emotionalCheckins).where(eq(schema.emotionalCheckins.id, id)).limit(1);
    return result[0] || null;
  }

  async updateEmotionalCheckIn(id: number, updates: any): Promise<any | null> {
    const result = await db
      .update(schema.emotionalCheckins)
      .set(updates)
      .where(eq(schema.emotionalCheckins.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteEmotionalCheckIn(id: number): Promise<boolean> {
    await db.delete(schema.emotionalCheckins).where(eq(schema.emotionalCheckins.id, id));
    return true;
  }

  // Implementar outros métodos conforme necessário...
  async getAllDiscipleshipRequests(): Promise<any[]> {
    const result = await db.select().from(schema.discipleshipRequests).orderBy(desc(schema.discipleshipRequests.createdAt));
    return result;
  }

  async getDiscipleshipRequestById(id: number): Promise<any | null> {
    const result = await db.select().from(schema.discipleshipRequests).where(eq(schema.discipleshipRequests.id, id)).limit(1);
    return result[0] || null;
  }

  async createDiscipleshipRequest(data: any): Promise<any> {
    const newRequest = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(schema.discipleshipRequests).values(newRequest).returning();
    return result[0];
  }

  async updateDiscipleshipRequest(id: number, updates: any): Promise<any | null> {
    updates.updatedAt = new Date();
    const result = await db
      .update(schema.discipleshipRequests)
      .set(updates)
      .where(eq(schema.discipleshipRequests.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteDiscipleshipRequest(id: number): Promise<boolean> {
    await db.delete(schema.discipleshipRequests).where(eq(schema.discipleshipRequests.id, id));
    return true;
  }

  // ========== RELACIONAMENTOS (MISSIONARY-INTERESTED) ==========
  async getAllRelationships(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.relationships).orderBy(asc(schema.relationships.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar relacionamentos:', error);
      return [];
    }
  }

  async getRelationshipById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.relationships).where(eq(schema.relationships.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar relacionamento:', error);
      return null;
    }
  }

  async createRelationship(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.relationships).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
      throw error;
    }
  }

  async updateRelationship(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.relationships)
        .set(updates)
        .where(eq(schema.relationships.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar relacionamento:', error);
      return null;
    }
  }

  async deleteRelationship(id: number): Promise<boolean> {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar relacionamento:', error);
      return false;
    }
  }

  async getRelationshipsByMissionary(missionaryId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.relationships)
        .where(eq(schema.relationships.missionaryId, missionaryId))
        .orderBy(asc(schema.relationships.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar relacionamentos por missionário:', error);
      return [];
    }
  }

  async getRelationshipsByInterested(interestedId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.relationships)
        .where(eq(schema.relationships.interestedId, interestedId))
        .orderBy(asc(schema.relationships.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar relacionamentos por interessado:', error);
      return [];
    }
  }

  async deleteRelationshipByInterested(interestedId: number): Promise<boolean> {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.interestedId, interestedId));
      return true;
    } catch (error) {
      console.error('Erro ao deletar relacionamentos por interessado:', error);
      return false;
    }
  }

  // ========== PERFIS MISSIONÁRIOS ==========
  async getAllMissionaryProfiles(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.missionaryProfiles).orderBy(asc(schema.missionaryProfiles.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar perfis missionários:', error);
      return [];
    }
  }

  async getMissionaryProfileById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.missionaryProfiles).where(eq(schema.missionaryProfiles.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar perfil missionário:', error);
      return null;
    }
  }

  async createMissionaryProfile(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.missionaryProfiles).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar perfil missionário:', error);
      throw error;
    }
  }

  async updateMissionaryProfile(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.missionaryProfiles)
        .set(updates)
        .where(eq(schema.missionaryProfiles.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar perfil missionário:', error);
      return null;
    }
  }

  async deleteMissionaryProfile(id: number): Promise<boolean> {
    try {
      await db.delete(schema.missionaryProfiles).where(eq(schema.missionaryProfiles.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar perfil missionário:', error);
      return false;
    }
  }
  // ========== REUNIÕES (MEETINGS) ==========
  async getAllMeetings(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.meetings).orderBy(asc(schema.meetings.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      return [];
    }
  }

  async getMeetingById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.meetings).where(eq(schema.meetings.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar reunião:', error);
      return null;
    }
  }

  async createMeeting(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.meetings).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      throw error;
    }
  }

  async updateMeeting(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.meetings)
        .set(updates)
        .where(eq(schema.meetings.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      return null;
    }
  }

  async deleteMeeting(id: number): Promise<boolean> {
    try {
      await db.delete(schema.meetings).where(eq(schema.meetings.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar reunião:', error);
      return false;
    }
  }

  async getMeetingsByUserId(userId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.meetings)
        .where(eq(schema.meetings.userId, userId))
        .orderBy(asc(schema.meetings.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar reuniões do usuário:', error);
      return [];
    }
  }

  async getMeetingsByStatus(status: string): Promise<any[]> {
    try {
      const result = await db.select().from(schema.meetings)
        .where(eq(schema.meetings.status, status))
        .orderBy(asc(schema.meetings.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar reuniões por status:', error);
      return [];
    }
  }
  // ========== MENSAGENS ==========
  async getAllMessages(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.messages).orderBy(asc(schema.messages.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  async getMessageById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.messages).where(eq(schema.messages.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar mensagem:', error);
      return null;
    }
  }

  async createMessage(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.messages).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      throw error;
    }
  }

  async updateMessage(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.messages)
        .set(updates)
        .where(eq(schema.messages.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      return null;
    }
  }

  async deleteMessage(id: number): Promise<boolean> {
    try {
      await db.delete(schema.messages).where(eq(schema.messages.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      return false;
    }
  }

  async getMessagesByConversationId(conversationId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.messages)
        .where(eq(schema.messages.conversationId, conversationId))
        .orderBy(asc(schema.messages.createdAt));
      return result;
    } catch (error) {
      console.error('Erro ao buscar mensagens da conversa:', error);
      return [];
    }
  }

  // ========== CONVERSAS ==========
  async getAllConversations(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.conversations).orderBy(asc(schema.conversations.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }
  }

  async getConversationById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      return null;
    }
  }

  async createConversation(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.conversations).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw error;
    }
  }

  async updateConversation(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.conversations)
        .set(updates)
        .where(eq(schema.conversations.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
      return null;
    }
  }

  async deleteConversation(id: number): Promise<boolean> {
    try {
      await db.delete(schema.conversations).where(eq(schema.conversations.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      return false;
    }
  }

  async getConversationsByUserId(userId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.conversations)
        .where(eq(schema.conversations.userId, userId))
        .orderBy(asc(schema.conversations.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar conversas do usuário:', error);
      return [];
    }
  }

  async getOrCreateDirectConversation(userAId: number, userBId: number): Promise<any> {
    try {
      // Primeiro, tentar encontrar conversa existente
      const existingConversation = await db.select().from(schema.conversations)
        .where(and(
          eq(schema.conversations.type, 'direct'),
          or(
            and(eq(schema.conversations.userAId, userAId), eq(schema.conversations.userBId, userBId)),
            and(eq(schema.conversations.userAId, userBId), eq(schema.conversations.userBId, userAId))
          )
        ))
        .limit(1);

      if (existingConversation[0]) {
        return existingConversation[0];
      }

      // Se não existir, criar nova conversa
      const newConversation = await db.insert(schema.conversations).values({
        type: 'direct',
        userAId: userAId,
        userBId: userBId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return newConversation[0];
    } catch (error) {
      console.error('Erro ao buscar/criar conversa direta:', error);
      throw error;
    }
  }
  // ========== NOTIFICAÇÕES ==========
  async getAllNotifications(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.notifications).orderBy(asc(schema.notifications.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  async getNotificationById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.notifications).where(eq(schema.notifications.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar notificação:', error);
      return null;
    }
  }

  async createNotification(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.notifications).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async updateNotification(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.notifications)
        .set(updates)
        .where(eq(schema.notifications.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      return null;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return false;
    }
  }

  async getNotificationsByUserId(userId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .orderBy(desc(schema.notifications.createdAt));
      return result;
    } catch (error) {
      console.error('Erro ao buscar notificações do usuário:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    try {
      await db.update(schema.notifications)
        .set({ read: true, readAt: new Date() })
        .where(eq(schema.notifications.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }
  // ========== CONQUISTAS (ACHIEVEMENTS) ==========
  async getAllAchievements(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.achievements).orderBy(asc(schema.achievements.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      return [];
    }
  }

  async getAchievementById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.achievements).where(eq(schema.achievements.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar conquista:', error);
      return null;
    }
  }

  async createAchievement(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.achievements).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar conquista:', error);
      throw error;
    }
  }

  async updateAchievement(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.achievements)
        .set(updates)
        .where(eq(schema.achievements.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar conquista:', error);
      return null;
    }
  }

  async deleteAchievement(id: number): Promise<boolean> {
    try {
      await db.delete(schema.achievements).where(eq(schema.achievements.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar conquista:', error);
      return false;
    }
  }

  // ========== ATIVIDADES DE PONTOS ==========
  async getAllPointActivities(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.pointActivities).orderBy(asc(schema.pointActivities.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar atividades de pontos:', error);
      return [];
    }
  }

  async getPointActivityById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.pointActivities).where(eq(schema.pointActivities.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar atividade de pontos:', error);
      return null;
    }
  }

  async createPointActivity(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.pointActivities).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar atividade de pontos:', error);
      throw error;
    }
  }

  async updatePointActivity(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.pointActivities)
        .set(updates)
        .where(eq(schema.pointActivities.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar atividade de pontos:', error);
      return null;
    }
  }

  async deletePointActivity(id: number): Promise<boolean> {
    try {
      await db.delete(schema.pointActivities).where(eq(schema.pointActivities.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar atividade de pontos:', error);
      return false;
    }
  }
  async getAllSystemConfig(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.systemConfig);
      return result;
    } catch (error) {
      console.error('Erro ao buscar configurações do sistema:', error);
      return [];
    }
  }
  async getSystemConfigById(id: number): Promise<any | null> { return null; }

  async getSystemConfig(key: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(schema.systemConfig)
        .where(eq(schema.systemConfig.key, key))
        .limit(1);

      if (result.length > 0) {
        return result[0];
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar configuração do sistema:', error);
      return null;
    }
  }

  async saveSystemConfig(key: string, value: any): Promise<void> {
    try {
      // Verificar se já existe uma configuração
      const existing = await db
        .select()
        .from(schema.systemConfig)
        .where(eq(schema.systemConfig.key, key))
        .limit(1);

      if (existing.length > 0) {
        // Atualizar configuração existente
        await db
          .update(schema.systemConfig)
          .set({ 
            value: JSON.stringify(value),
            updatedAt: new Date()
          })
          .where(eq(schema.systemConfig.key, key));
      } else {
        // Criar nova configuração
        await db
          .insert(schema.systemConfig)
          .values({
            key,
            value: JSON.stringify(value),
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração do sistema:', error);
      throw error;
    }
  }
  async createSystemConfig(data: any): Promise<any> { return {}; }
  async updateSystemConfig(id: number, updates: any): Promise<any | null> { return null; }
  async deleteSystemConfig(id: number): Promise<boolean> { return false; }
  async getAllSystemSettings(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.systemSettings);
      return result;
    } catch (error) {
      console.error('Erro ao buscar configurações do sistema:', error);
      return [];
    }
  }
  async getSystemSettingsById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.id, id)).limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar configuração do sistema:', error);
      return null;
    }
  }

  async createSystemSettings(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.systemSettings).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar configuração do sistema:', error);
      return {};
    }
  }

  async updateSystemSettings(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.systemSettings).set(updates).where(eq(schema.systemSettings.id, id)).returning();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao atualizar configuração do sistema:', error);
      return null;
    }
  }

  async deleteSystemSettings(id: number): Promise<boolean> {
    try {
      await db.delete(schema.systemSettings).where(eq(schema.systemSettings.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar configuração do sistema:', error);
      return false;
    }
  }
  async getAllEventParticipants(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.eventParticipants);
      return result;
    } catch (error) {
      console.error('Erro ao buscar participantes de eventos:', error);
      return [];
    }
  }
  async getEventParticipantById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.eventParticipants).where(eq(schema.eventParticipants.id, id)).limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar participante de evento:', error);
      return null;
    }
  }

  async createEventParticipant(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.eventParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar participante de evento:', error);
      return {};
    }
  }

  async updateEventParticipant(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.eventParticipants).set(updates).where(eq(schema.eventParticipants.id, id)).returning();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao atualizar participante de evento:', error);
      return null;
    }
  }

  async deleteEventParticipant(id: number): Promise<boolean> {
    try {
      await db.delete(schema.eventParticipants).where(eq(schema.eventParticipants.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar participante de evento:', error);
      return false;
    }
  }
  // ========== TIPOS DE REUNIÃO ==========
  async getAllMeetingTypes(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.meetingTypes).orderBy(asc(schema.meetingTypes.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar tipos de reunião:', error);
      return [];
    }
  }

  async getMeetingTypeById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.meetingTypes).where(eq(schema.meetingTypes.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar tipo de reunião:', error);
      return null;
    }
  }

  async createMeetingType(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.meetingTypes).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar tipo de reunião:', error);
      throw error;
    }
  }

  async updateMeetingType(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.meetingTypes)
        .set(updates)
        .where(eq(schema.meetingTypes.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar tipo de reunião:', error);
      return null;
    }
  }

  async deleteMeetingType(id: number): Promise<boolean> {
    try {
      await db.delete(schema.meetingTypes).where(eq(schema.meetingTypes.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar tipo de reunião:', error);
      return false;
    }
  }

  async getMeetingTypes(): Promise<any[]> {
    return this.getAllMeetingTypes();
  }
  // ========== CONQUISTAS DE USUÁRIOS ==========
  async getAllUserAchievements(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.userAchievements).orderBy(asc(schema.userAchievements.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar conquistas de usuários:', error);
      return [];
    }
  }

  async getUserAchievementById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.userAchievements).where(eq(schema.userAchievements.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar conquista de usuário:', error);
      return null;
    }
  }

  async createUserAchievement(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.userAchievements).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar conquista de usuário:', error);
      throw error;
    }
  }

  async updateUserAchievement(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.userAchievements)
        .set(updates)
        .where(eq(schema.userAchievements.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar conquista de usuário:', error);
      return null;
    }
  }

  async deleteUserAchievement(id: number): Promise<boolean> {
    try {
      await db.delete(schema.userAchievements).where(eq(schema.userAchievements.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar conquista de usuário:', error);
      return false;
    }
  }

  // ========== HISTÓRICO DE PONTOS ==========
  async getAllUserPointsHistory(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.userPointsHistory).orderBy(asc(schema.userPointsHistory.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      return [];
    }
  }

  async getUserPointsHistoryById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.userPointsHistory).where(eq(schema.userPointsHistory.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      return null;
    }
  }

  async createUserPointsHistory(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.userPointsHistory).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar histórico de pontos:', error);
      throw error;
    }
  }

  async updateUserPointsHistory(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.userPointsHistory)
        .set(updates)
        .where(eq(schema.userPointsHistory.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar histórico de pontos:', error);
      return null;
    }
  }

  async deleteUserPointsHistory(id: number): Promise<boolean> {
    try {
      await db.delete(schema.userPointsHistory).where(eq(schema.userPointsHistory.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar histórico de pontos:', error);
      return false;
    }
  }

  async getUserPointsHistoryByUserId(userId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.userPointsHistory)
        .where(eq(schema.userPointsHistory.userId, userId))
        .orderBy(desc(schema.userPointsHistory.createdAt));
      return result;
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos do usuário:', error);
      return [];
    }
  }
  // ========== ORAÇÕES ==========
  async getAllPrayers(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.prayers).orderBy(asc(schema.prayers.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar orações:', error);
      return [];
    }
  }

  async getPrayerById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.prayers).where(eq(schema.prayers.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar oração:', error);
      return null;
    }
  }

  async createPrayer(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.prayers).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar oração:', error);
      throw error;
    }
  }

  async updatePrayer(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.prayers)
        .set(updates)
        .where(eq(schema.prayers.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar oração:', error);
      return null;
    }
  }

  async deletePrayer(id: number): Promise<boolean> {
    try {
      await db.delete(schema.prayers).where(eq(schema.prayers.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar oração:', error);
      return false;
    }
  }

  async getPrayersByUserId(userId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.prayers)
        .where(eq(schema.prayers.userId, userId))
        .orderBy(desc(schema.prayers.createdAt));
      return result;
    } catch (error) {
      console.error('Erro ao buscar orações do usuário:', error);
      return [];
    }
  }

  // ========== INTERCESSORES ==========
  async getAllPrayerIntercessors(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.prayerIntercessors).orderBy(asc(schema.prayerIntercessors.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar intercessores:', error);
      return [];
    }
  }

  async getPrayerIntercessorById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar intercessor:', error);
      return null;
    }
  }

  async createPrayerIntercessor(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.prayerIntercessors).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar intercessor:', error);
      throw error;
    }
  }

  async updatePrayerIntercessor(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.prayerIntercessors)
        .set(updates)
        .where(eq(schema.prayerIntercessors.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar intercessor:', error);
      return null;
    }
  }

  async deletePrayerIntercessor(id: number): Promise<boolean> {
    try {
      await db.delete(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar intercessor:', error);
      return false;
    }
  }

  async getIntercessorsByPrayerId(prayerId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.prayerIntercessors)
        .where(eq(schema.prayerIntercessors.prayerId, prayerId))
        .orderBy(asc(schema.prayerIntercessors.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar intercessores da oração:', error);
      return [];
    }
  }

  async getPrayersByIntercessorId(intercessorId: number): Promise<any[]> {
    try {
      const result = await db.select().from(schema.prayerIntercessors)
        .where(eq(schema.prayerIntercessors.intercessorId, intercessorId))
        .orderBy(asc(schema.prayerIntercessors.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar orações do intercessor:', error);
      return [];
    }
  }
  // ========== CHAMADAS DE VÍDEO ==========
  async getAllVideoCallSessions(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.videoCallSessions).orderBy(asc(schema.videoCallSessions.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar sessões de chamada de vídeo:', error);
      return [];
    }
  }

  async getVideoCallSessionById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.videoCallSessions).where(eq(schema.videoCallSessions.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar sessão de chamada de vídeo:', error);
      return null;
    }
  }

  async createVideoCallSession(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.videoCallSessions).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar sessão de chamada de vídeo:', error);
      throw error;
    }
  }

  async updateVideoCallSession(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.videoCallSessions)
        .set(updates)
        .where(eq(schema.videoCallSessions.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar sessão de chamada de vídeo:', error);
      return null;
    }
  }

  async deleteVideoCallSession(id: number): Promise<boolean> {
    try {
      await db.delete(schema.videoCallSessions).where(eq(schema.videoCallSessions.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar sessão de chamada de vídeo:', error);
      return false;
    }
  }

  // ========== PARTICIPANTES DE CHAMADAS DE VÍDEO ==========
  async getAllVideoCallParticipants(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.videoCallParticipants).orderBy(asc(schema.videoCallParticipants.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar participantes de chamada de vídeo:', error);
      return [];
    }
  }

  async getVideoCallParticipantById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.videoCallParticipants).where(eq(schema.videoCallParticipants.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar participante de chamada de vídeo:', error);
      return null;
    }
  }

  async createVideoCallParticipant(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.videoCallParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar participante de chamada de vídeo:', error);
      throw error;
    }
  }

  async updateVideoCallParticipant(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.videoCallParticipants)
        .set(updates)
        .where(eq(schema.videoCallParticipants.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar participante de chamada de vídeo:', error);
      return null;
    }
  }

  async deleteVideoCallParticipant(id: number): Promise<boolean> {
    try {
      await db.delete(schema.videoCallParticipants).where(eq(schema.videoCallParticipants.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar participante de chamada de vídeo:', error);
      return false;
    }
  }

  // ========== PARTICIPANTES DE CONVERSAS ==========
  async getAllConversationParticipants(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.conversationParticipants).orderBy(asc(schema.conversationParticipants.id));
      return result;
    } catch (error) {
      console.error('Erro ao buscar participantes de conversa:', error);
      return [];
    }
  }

  async getConversationParticipantById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(schema.conversationParticipants).where(eq(schema.conversationParticipants.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar participante de conversa:', error);
      return null;
    }
  }

  async createConversationParticipant(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.conversationParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar participante de conversa:', error);
      throw error;
    }
  }

  async updateConversationParticipant(id: number, updates: any): Promise<any | null> {
    try {
      const result = await db.update(schema.conversationParticipants)
        .set(updates)
        .where(eq(schema.conversationParticipants.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar participante de conversa:', error);
      return null;
    }
  }

  async deleteConversationParticipant(id: number): Promise<boolean> {
    try {
      await db.delete(schema.conversationParticipants).where(eq(schema.conversationParticipants.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar participante de conversa:', error);
      return false;
    }
  }

  // Métodos adicionais necessários
  async getEmotionalCheckInsForAdmin(): Promise<any[]> {
    try {
      console.log('🔍 Buscando check-ins emocionais para admin...');
      const result = await db.select().from(schema.emotionalCheckins);
      console.log('🔍 Resultado:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar check-ins emocionais para admin:', error);
      return [];
    }
  }

  async getUsersWithMissionaryProfile(): Promise<any[]> {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.role, 'missionary'));
      return result;
    } catch (error) {
      console.error('Erro ao buscar usuários com perfil missionário:', error);
      return [];
    }
  }

  async getDefaultChurch(): Promise<any | null> {
    try {
      const result = await db.select().from(schema.churches).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar igreja padrão:', error);
      return null;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpeza de todos os dados...');
      
      // Importar sql diretamente para usar sql.unsafe()
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      
      // Limpar todas as tabelas na ordem correta (respeitando foreign keys)
      const queries = [
        'DELETE FROM messages',
        'DELETE FROM conversations', 
        'DELETE FROM emotional_checkins',
        'DELETE FROM discipleship_requests',
        'DELETE FROM relationships', // Adicionar relationships antes de users
        'DELETE FROM missionary_profiles',
        'DELETE FROM point_configs',
        'DELETE FROM events',
        'DELETE FROM churches',
        "DELETE FROM users WHERE email != 'admin@7care.com'" // Usuários por último
      ];
      
      for (const query of queries) {
        try {
          await sql`${sql.unsafe(query)}`;
          console.log(`✅ Executado: ${query}`);
        } catch (error) {
          console.log(`⚠️ Aviso ao executar ${query}:`, error.message);
          // Continuar mesmo se uma tabela não existir
        }
      }
      
      console.log('🎉 Limpeza de dados concluída com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE IGREJA =====
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

  async setDefaultChurch(churchId: number): Promise<boolean> {
    try {
      // Como não temos campo isDefault, vamos apenas verificar se a igreja existe
      const church = await db.select()
        .from(schema.churches)
        .where(eq(schema.churches.id, churchId))
        .limit(1);
      
      if (church.length === 0) {
        console.error('Igreja não encontrada:', churchId);
        return false;
      }
      
      // Por enquanto, apenas retornamos true pois não temos campo isDefault
      console.log('Igreja definida como padrão:', church[0].name);
      return true;
    } catch (error) {
      console.error('Erro ao definir igreja padrão:', error);
      return false;
    }
  }

  async getOrCreateChurch(churchName: string): Promise<any> {
    try {
      console.log(`🔍 Buscando igreja: "${churchName}"`);
      
      // Buscar igreja existente
      const existingChurch = await db.select()
        .from(schema.churches)
        .where(eq(schema.churches.name, churchName))
        .limit(1);
      
      if (existingChurch.length > 0) {
        console.log(`✅ Igreja encontrada: ${existingChurch[0].name} (ID: ${existingChurch[0].id})`);
        return existingChurch[0];
      }
      
      console.log(`➕ Criando nova igreja: "${churchName}"`);
      
      // Gerar código único para a igreja
      const baseCode = churchName.substring(0, 8).toUpperCase().replace(/\s+/g, '');
      let code = baseCode;
      let counter = 1;
      
      // Verificar se o código já existe
      while (true) {
        const existingCode = await db.select()
          .from(schema.churches)
          .where(eq(schema.churches.code, code))
          .limit(1);
        
        if (existingCode.length === 0) {
          break;
        }
        
        code = `${baseCode}${counter}`;
        counter++;
      }
      
      // Criar nova igreja
      const newChurch = await db.insert(schema.churches)
        .values({
          name: churchName,
          code: code,
          address: '',
          phone: '',
          email: '',
          pastor: ''
        })
        .returning();
      
      console.log(`✅ Igreja criada: ${newChurch[0].name} (ID: ${newChurch[0].id}, Code: ${newChurch[0].code})`);
      return newChurch[0];
    } catch (error) {
      console.error('❌ Erro ao buscar/criar igreja:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE USUÁRIO =====
  async approveUser(id: number): Promise<any | null> {
    try {
      const result = await db.update(schema.users)
        .set({ 
          role: 'member',
          approvedAt: new Date(),
          approved: true
        })
        .where(eq(schema.users.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      return null;
    }
  }

  async rejectUser(id: number): Promise<any | null> {
    try {
      const result = await db.update(schema.users)
        .set({ 
          role: 'rejected',
          rejectedAt: new Date(),
          approved: false
        })
        .where(eq(schema.users.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      return null;
    }
  }

  // ===== MÉTODOS DE PONTUAÇÃO =====
  async calculateBasicUserPoints(): Promise<any> {
    try {
      const users = await this.getAllUsers();
      let updatedCount = 0;
      
      for (const user of users) {
        if (user.email === 'admin@7care.com') continue; // Pular super admin
        
        const points = this.calculateUserPoints(user);
        if (points !== user.points) {
          await this.updateUser(user.id, { points });
          updatedCount++;
        }
      }
      
      return { success: true, updatedCount };
    } catch (error) {
      console.error('Erro ao calcular pontos básicos:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPointsConfiguration(): Promise<void> {
    try {
      // Deletar configurações existentes
      await db.delete(schema.pointConfigs);
      
      // Salvar configuração padrão
      const defaultConfig = this.getDefaultPointsConfiguration();
      await this.savePointsConfiguration(defaultConfig);
    } catch (error) {
      console.error('Erro ao resetar configuração de pontos:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE CHECK-INS EMOCIONAIS =====
  async getEmotionalCheckInsByUserId(userId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.emotionalCheckins)
        .where(eq(schema.emotionalCheckins.userId, userId))
        .orderBy(desc(schema.emotionalCheckins.createdAt));
    } catch (error) {
      console.error('Erro ao buscar check-ins emocionais do usuário:', error);
      return [];
    }
  }

  // ===== MÉTODOS DE ORAÇÃO =====
  async getPrayers(): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.prayers)
        .orderBy(desc(schema.prayers.createdAt));
    } catch (error) {
      console.error('Erro ao buscar orações:', error);
      return [];
    }
  }

  async markPrayerAsAnswered(prayerId: number, answeredBy: number): Promise<boolean> {
    try {
      await db.update(schema.prayers)
        .set({ 
          answered: true,
          answeredAt: new Date(),
          answeredBy
        })
        .where(eq(schema.prayers.id, prayerId));
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar oração como respondida:', error);
      return false;
    }
  }

  async getPrayerById(prayerId: number): Promise<any | null> {
    try {
      const result = await db.select()
        .from(schema.prayers)
        .where(eq(schema.prayers.id, prayerId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar oração:', error);
      return null;
    }
  }

  async deletePrayer(prayerId: number): Promise<boolean> {
    try {
      await db.delete(schema.prayers)
        .where(eq(schema.prayers.id, prayerId));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar oração:', error);
      return false;
    }
  }

  async addPrayerIntercessor(prayerId: number, intercessorId: number): Promise<boolean> {
    try {
      await db.insert(schema.prayerIntercessors)
        .values({
          prayerId,
          intercessorId,
          joinedAt: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar intercessor:', error);
      return false;
    }
  }

  async removePrayerIntercessor(prayerId: number, intercessorId: number): Promise<boolean> {
    try {
      await db.delete(schema.prayerIntercessors)
        .where(
          and(
            eq(schema.prayerIntercessors.prayerId, prayerId),
            eq(schema.prayerIntercessors.intercessorId, intercessorId)
          )
        );
      
      return true;
    } catch (error) {
      console.error('Erro ao remover intercessor:', error);
      return false;
    }
  }

  async getPrayerIntercessors(prayerId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.prayerIntercessors)
        .where(eq(schema.prayerIntercessors.prayerId, prayerId));
    } catch (error) {
      console.error('Erro ao buscar intercessores:', error);
      return [];
    }
  }

  async getPrayersUserIsPrayingFor(userId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.prayerIntercessors)
        .where(eq(schema.prayerIntercessors.intercessorId, userId));
    } catch (error) {
      console.error('Erro ao buscar orações que usuário está orando:', error);
      return [];
    }
  }

  // ===== MÉTODOS DE REUNIÕES =====
  async getMeetingsByUserId(userId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.meetings)
        .where(eq(schema.meetings.userId, userId))
        .orderBy(desc(schema.meetings.createdAt));
    } catch (error) {
      console.error('Erro ao buscar reuniões do usuário:', error);
      return [];
    }
  }

  async getMeetingsByStatus(status: string): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.meetings)
        .where(eq(schema.meetings.status, status))
        .orderBy(desc(schema.meetings.createdAt));
    } catch (error) {
      console.error('Erro ao buscar reuniões por status:', error);
      return [];
    }
  }

  async getAllMeetings(): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.meetings)
        .orderBy(desc(schema.meetings.createdAt));
    } catch (error) {
      console.error('Erro ao buscar todas as reuniões:', error);
      return [];
    }
  }

  async createMeeting(meetingData: any): Promise<any> {
    try {
      const result = await db.insert(schema.meetings)
        .values({
          ...meetingData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      throw error;
    }
  }

  async updateMeeting(id: number, updateData: any): Promise<any | null> {
    try {
      const result = await db.update(schema.meetings)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(schema.meetings.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      return null;
    }
  }

  // ===== MÉTODOS DE EVENTOS =====
  async clearAllEvents(): Promise<boolean> {
    try {
      await db.delete(schema.events);
      return true;
    } catch (error) {
      console.error('Erro ao limpar eventos:', error);
      return false;
    }
  }

  async createEvent(eventData: any): Promise<any> {
    try {
      console.log('🔍 createEvent recebeu:', eventData);
      
      // Garantir que as datas sejam strings ISO válidas
      let dateISO = eventData.date;
      
      // Se date não for string, converter
      if (typeof dateISO !== 'string') {
        if (dateISO instanceof Date) {
          dateISO = dateISO.toISOString();
        } else {
          dateISO = new Date(dateISO).toISOString();
        }
      }
      
      // Usar SQL direto em vez do Drizzle para evitar problema com end_date
      const result = await sql`
        INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
        VALUES (${eventData.title}, ${eventData.description || ''}, ${dateISO}, ${eventData.location || ''}, ${eventData.type}, ${eventData.capacity || 0}, ${eventData.isRecurring || false}, ${eventData.recurrencePattern || null}, ${eventData.createdBy || 72}, ${eventData.churchId || 24}, NOW(), NOW())
        RETURNING id, title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at
      `;
      
      console.log('🔍 Evento criado com SQL:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE RELACIONAMENTOS =====
  async getAllRelationships(): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.relationships)
        .orderBy(desc(schema.relationships.createdAt));
    } catch (error) {
      console.error('Erro ao buscar todos os relacionamentos:', error);
      return [];
    }
  }

  async getRelationshipsByMissionary(missionaryId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.relationships)
        .where(eq(schema.relationships.missionaryId, missionaryId))
        .orderBy(desc(schema.relationships.createdAt));
    } catch (error) {
      console.error('Erro ao buscar relacionamentos por missionário:', error);
      return [];
    }
  }

  async getRelationshipsByInterested(interestedId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.relationships)
        .where(eq(schema.relationships.interestedId, interestedId))
        .orderBy(desc(schema.relationships.createdAt));
    } catch (error) {
      console.error('Erro ao buscar relacionamentos por interessado:', error);
      return [];
    }
  }

  async createRelationship(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.relationships)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
      throw error;
    }
  }

  async getRelationshipById(relationshipId: number): Promise<any | null> {
    try {
      const result = await db.select()
        .from(schema.relationships)
        .where(eq(schema.relationships.id, relationshipId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar relacionamento:', error);
      return null;
    }
  }

  async deleteRelationship(relationshipId: number): Promise<boolean> {
    try {
      await db.delete(schema.relationships)
        .where(eq(schema.relationships.id, relationshipId));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar relacionamento:', error);
      return false;
    }
  }

  async deleteRelationshipByInterested(interestedId: number): Promise<boolean> {
    try {
      await db.delete(schema.relationships)
        .where(eq(schema.relationships.interestedId, interestedId));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar relacionamentos por interessado:', error);
      return false;
    }
  }

  // ===== MÉTODOS DE PERFIL MISSIONÁRIO =====
  async getMissionaryProfileByUserId(userId: number): Promise<any | null> {
    try {
      const result = await db.select()
        .from(schema.missionaryProfiles)
        .where(eq(schema.missionaryProfiles.userId, userId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar perfil missionário:', error);
      return null;
    }
  }

  async createMissionaryProfile(data: any): Promise<any> {
    try {
      const result = await db.insert(schema.missionaryProfiles)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Erro ao criar perfil missionário:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE CONVERSAS =====
  async getConversationsByUserId(userId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.conversations)
        .where(
          or(
            eq(schema.conversations.userAId, userId),
            eq(schema.conversations.userBId, userId)
          )
        )
        .orderBy(desc(schema.conversations.updatedAt));
    } catch (error) {
      console.error('Erro ao buscar conversas do usuário:', error);
      return [];
    }
  }

  async getOrCreateDirectConversation(userAId: number, userBId: number): Promise<any> {
    try {
      // Buscar conversa existente
      const existingConversation = await db.select()
        .from(schema.conversations)
        .where(
          and(
            or(
              and(
                eq(schema.conversations.userAId, userAId),
                eq(schema.conversations.userBId, userBId)
              ),
              and(
                eq(schema.conversations.userAId, userBId),
                eq(schema.conversations.userBId, userAId)
              )
            ),
            eq(schema.conversations.type, 'direct')
          )
        )
        .limit(1);
      
      if (existingConversation.length > 0) {
        return existingConversation[0];
      }
      
      // Criar nova conversa
      const result = await db.insert(schema.conversations)
        .values({
          userAId,
          userBId,
          type: 'direct',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar/criar conversa direta:', error);
      throw error;
    }
  }

  async getMessagesByConversationId(conversationId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, conversationId))
        .orderBy(asc(schema.messages.createdAt));
    } catch (error) {
      console.error('Erro ao buscar mensagens da conversa:', error);
      return [];
    }
  }

  // ===== MÉTODOS DE TIPOS DE REUNIÃO =====
  async getMeetingTypes(): Promise<any[]> {
    try {
      return await db.select()
        .from(schema.meetingTypes)
        .orderBy(asc(schema.meetingTypes.name));
    } catch (error) {
      console.error('Erro ao buscar tipos de reunião:', error);
      return [];
    }
  }

  // ===== MÉTODO AUXILIAR PARA CÁLCULO DE PONTOS =====
  private calculateUserPoints(user: any): number {
    // Implementação básica de cálculo de pontos
    let points = 0;
    
    // Pontos básicos
    if (user.attendance) points += user.attendance;
    if (user.isDonor) points += 5;
    if (user.isOffering) points += 3;
    if (user.hasLesson) points += 2;
    
    return Math.round(points);
  }

  // Sistema de Logo Persistente
  async saveSystemLogo(logoUrl: string, filename: string): Promise<boolean> {
    try {
      console.log('💾 Salvando logo no banco de dados:', { logoUrl, filename });
      
      // Verificar se já existe uma configuração de logo
      const existingConfig = await sql`
        SELECT id FROM system_config WHERE key = 'system_logo'
      `;
      
      if (existingConfig.length > 0) {
        // Atualizar configuração existente
        await sql`
          UPDATE system_config 
          SET value = ${JSON.stringify({ logoUrl, filename, updatedAt: new Date().toISOString() })},
              updated_at = NOW()
          WHERE key = 'system_logo'
        `;
        console.log('✅ Logo atualizada no banco de dados');
      } else {
        // Criar nova configuração
        await sql`
          INSERT INTO system_config (key, value, description)
          VALUES ('system_logo', ${JSON.stringify({ logoUrl, filename, createdAt: new Date().toISOString() })}, 'Logo do sistema')
        `;
        console.log('✅ Logo salva no banco de dados');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar logo no banco:', error);
      return false;
    }
  }

  async getSystemLogo(): Promise<{ logoUrl: string; filename: string } | null> {
    try {
      console.log('🔍 Buscando logo no banco de dados...');
      
      const result = await sql`
        SELECT value FROM system_config WHERE key = 'system_logo'
      `;
      
      if (result.length > 0) {
        const config = result[0].value as any;
        console.log('✅ Logo encontrada no banco:', config);
        return {
          logoUrl: config.logoUrl,
          filename: config.filename
        };
      }
      
      console.log('ℹ️ Nenhuma logo encontrada no banco de dados');
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar logo no banco:', error);
      return null;
    }
  }

  async clearSystemLogo(): Promise<boolean> {
    try {
      console.log('🗑️ Removendo logo do banco de dados...');
      
      await sql`
        DELETE FROM system_config WHERE key = 'system_logo'
      `;
      
      console.log('✅ Logo removida do banco de dados');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover logo do banco:', error);
      return false;
    }
  }
}
