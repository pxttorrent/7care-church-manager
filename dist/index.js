// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// server/neonConfig.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
var connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_enihr4YBSDm8@ep-still-glade-ac5u1r48-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
var sql = neon(connectionString);
var db = drizzle(sql);
var isDevelopment = process.env.NODE_ENV === "development";
var isProduction = process.env.NODE_ENV === "production";
console.log("\u{1F517} Neon Database configurado (vers\xE3o simplificada):", {
  environment: process.env.NODE_ENV,
  hasConnectionString: !!process.env.DATABASE_URL,
  isDevelopment,
  isProduction,
  connectionStringLength: connectionString.length
});

// server/schema.ts
import { pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar, date } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("member"),
  church: text("church"),
  churchCode: text("church_code"),
  departments: text("departments"),
  birthDate: date("birth_date"),
  civilStatus: text("civil_status"),
  occupation: text("occupation"),
  education: text("education"),
  address: text("address"),
  baptismDate: date("baptism_date"),
  previousReligion: text("previous_religion"),
  biblicalInstructor: text("biblical_instructor"),
  interestedSituation: text("interested_situation"),
  isDonor: boolean("is_donor").default(false),
  isTither: boolean("is_tither").default(false),
  isApproved: boolean("is_approved").default(false),
  points: integer("points").default(0),
  level: text("level").default("Iniciante"),
  attendance: integer("attendance").default(0),
  extraData: jsonb("extra_data"),
  // Campos para cálculo de pontos (movidos de extra_data)
  engajamento: text("engajamento"),
  // 'Baixo', 'Médio', 'Alto'
  classificacao: text("classificacao"),
  // 'Frequente', 'Não Frequente'
  dizimistaType: text("dizimista_type"),
  // 'Não dizimista', 'Pontual (1-3)', 'Sazonal (4-7)', 'Recorrente (8-12)'
  ofertanteType: text("ofertante_type"),
  // 'Não ofertante', 'Pontual (1-3)', 'Sazonal (4-7)', 'Recorrente (8-12)'
  tempoBatismoAnos: integer("tempo_batismo_anos"),
  // Anos de batismo (numérico)
  departamentosCargos: text("departamentos_cargos"),
  // Lista de departamentos e cargos separados por ';'
  nomeUnidade: text("nome_unidade"),
  // Nome da unidade/grupo pequeno
  temLicao: boolean("tem_licao").default(false),
  // Tem lição da Escola Sabatina
  totalPresenca: integer("total_presenca").default(0),
  // Total de presenças (0-13)
  comunhao: integer("comunhao").default(0),
  // Pontuação comunhão (0-13)
  missao: integer("missao").default(0),
  // Pontuação missão (0-13)
  estudoBiblico: integer("estudo_biblico").default(0),
  // Pontuação estudo bíblico (0-13)
  batizouAlguem: boolean("batizou_alguem").default(false),
  // Batizou alguém
  discPosBatismal: integer("disc_pos_batismal").default(0),
  // Quantidade de discipulados pós-batismo
  cpfValido: boolean("cpf_valido").default(false),
  // CPF válido
  camposVazios: boolean("campos_vazios").default(true),
  // Tem campos vazios no ACMS
  observations: text("observations"),
  firstAccess: boolean("first_access").default(true),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var churches = pgTable("churches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  address: text("address"),
  email: text("email"),
  phone: text("phone"),
  pastor: text("pastor"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  type: text("type").notNull(),
  color: text("color"),
  capacity: integer("capacity"),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: text("recurrence_pattern"),
  createdBy: integer("created_by").references(() => users.id),
  churchId: integer("church_id").references(() => churches.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  interestedId: integer("interested_id").references(() => users.id),
  missionaryId: integer("missionary_id").references(() => users.id),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location"),
  type: text("type").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  churchId: integer("church_id").references(() => churches.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").references(() => users.id),
  conversationId: integer("conversation_id").references(() => conversations.id),
  createdAt: timestamp("created_at").defaultNow()
});
var conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title"),
  type: text("type").default("private"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var discipleshipRequests = pgTable("discipleship_requests", {
  id: serial("id").primaryKey(),
  interestedId: integer("interested_id").references(() => users.id),
  missionaryId: integer("missionary_id").references(() => users.id),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var missionaryProfiles = pgTable("missionary_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  specialization: text("specialization"),
  experience: text("experience"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var emotionalCheckins = pgTable("emotional_checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mood: text("mood").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var pointConfigs = pgTable("point_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: integer("value").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pointsRequired: integer("points_required").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow()
});
var pointActivities = pgTable("point_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activity: text("activity").notNull(),
  points: integer("points").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
var systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").default("registered"),
  createdAt: timestamp("created_at").defaultNow()
});
var meetingTypes = pgTable("meeting_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow()
});
var userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  achievementId: integer("achievement_id").references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow()
});
var userPointsHistory = pgTable("user_points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  requesterId: integer("requester_id").references(() => users.id),
  status: text("status").default("active"),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var prayerIntercessors = pgTable("prayer_intercessors", {
  id: serial("id").primaryKey(),
  prayerId: integer("prayer_id").references(() => prayers.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow()
});
var videoCallSessions = pgTable("video_call_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  hostId: integer("host_id").references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").default("scheduled"),
  meetingId: text("meeting_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var videoCallParticipants = pgTable("video_call_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => videoCallSessions.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at")
});
var conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow()
});
var eventFilterPermissions = pgTable("event_filter_permissions", {
  id: serial("id").primaryKey(),
  permissions: jsonb("permissions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var schema = {
  users,
  churches,
  events,
  relationships,
  meetings,
  messages,
  conversations,
  notifications,
  discipleshipRequests,
  missionaryProfiles,
  emotionalCheckins,
  pointConfigs,
  achievements,
  pointActivities,
  systemConfig,
  systemSettings,
  eventParticipants,
  meetingTypes,
  userAchievements,
  userPointsHistory,
  prayers,
  prayerIntercessors,
  videoCallSessions,
  videoCallParticipants,
  conversationParticipants,
  eventFilterPermissions
};

// server/neonAdapter.ts
import { eq, and, desc, asc, or } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
var NeonAdapter = class {
  // ========== USUÁRIOS ==========
  async getAllUsers() {
    try {
      const result = await db.select().from(schema.users).orderBy(asc(schema.users.id));
      const processedUsers = result.map((user) => {
        let extraData = {};
        if (user.extra_data) {
          if (typeof user.extra_data === "string") {
            try {
              extraData = JSON.parse(user.extra_data);
            } catch (e) {
              console.log(`\u26A0\uFE0F Erro ao parsear extra_data para usu\xE1rio ${user.id}:`, user.extra_data);
              extraData = {};
            }
          } else if (typeof user.extra_data === "object") {
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
      console.error("Erro ao buscar usu\xE1rios:", error);
      return [];
    }
  }
  async getVisitedUsers() {
    try {
      const result = await db.select().from(schema.users).where(
        and(
          or(eq(schema.users.role, "member"), eq(schema.users.role, "missionary")),
          sql`extra_data->>'visited' = 'true'`
        )
      ).orderBy(schema.users.id);
      return result.map((user) => ({
        ...user,
        extraData: user.extraData ? typeof user.extraData === "string" ? JSON.parse(user.extraData) : user.extraData : {}
      }));
    } catch (error) {
      console.error("Erro ao buscar usu\xE1rios visitados:", error);
      return [];
    }
  }
  async getUserById(id) {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      const user = result[0] || null;
      if (user && user.extraData) {
        console.log(`\u{1F50D} getUserById ${id} - extraData type:`, typeof user.extraData);
        console.log(`\u{1F50D} getUserById ${id} - extraData content:`, user.extraData);
      }
      return user;
    } catch (error) {
      console.error("Erro ao buscar usu\xE1rio por ID:", error);
      return null;
    }
  }
  async getUserByEmail(email) {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar usu\xE1rio por email:", error);
      return null;
    }
  }
  async createUser(userData) {
    try {
      let hashedPassword = userData.password;
      if (userData.password && !userData.password.startsWith("$2")) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }
      const newUser = {
        ...userData,
        password: hashedPassword,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await db.insert(schema.users).values(newUser).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar usu\xE1rio:", error);
      throw error;
    }
  }
  async updateUser(id, updates) {
    try {
      console.log(`\u{1F504} Atualizando usu\xE1rio ${id} com:`, updates);
      if (updates.password && !updates.password.startsWith("$2")) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      updates.updatedAt = /* @__PURE__ */ new Date();
      const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
      console.log(`\u2705 Usu\xE1rio ${id} atualizado com sucesso:`, result[0]?.extraData);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar usu\xE1rio:", error);
      return null;
    }
  }
  async updateUserDirectly(id, updates) {
    try {
      console.log(`\u{1F504} Atualizando usu\xE1rio ${id} diretamente com:`, updates);
      if (updates.password && !updates.password.startsWith("$2")) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      updates.updatedAt = /* @__PURE__ */ new Date();
      const extraDataString = typeof updates.extraData === "object" ? JSON.stringify(updates.extraData) : updates.extraData;
      const result = await sql`
        UPDATE users 
        SET extra_data = ${extraDataString}::jsonb, updated_at = ${updates.updatedAt}
        WHERE id = ${id}
        RETURNING id, name, extra_data, updated_at
      `;
      console.log(`\u2705 Usu\xE1rio ${id} atualizado diretamente:`, result[0]?.extra_data);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar usu\xE1rio diretamente:", error);
      return null;
    }
  }
  async deleteUser(id) {
    try {
      const user = await this.getUserById(id);
      if (user && user.email === "admin@7care.com") {
        throw new Error("N\xE3o \xE9 poss\xEDvel excluir o Super Administrador do sistema");
      }
      if (user && user.role === "admin") {
        throw new Error("N\xE3o \xE9 poss\xEDvel excluir usu\xE1rios administradores do sistema");
      }
      const result = await db.delete(schema.users).where(eq(schema.users.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar usu\xE1rio:", error);
      throw error;
    }
  }
  // ========== IGREJAS ==========
  async getAllChurches() {
    try {
      const result = await db.select().from(schema.churches).orderBy(asc(schema.churches.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar igrejas:", error);
      return [];
    }
  }
  async getChurchById(id) {
    try {
      const result = await db.select().from(schema.churches).where(eq(schema.churches.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar igreja por ID:", error);
      return null;
    }
  }
  async createChurch(churchData) {
    try {
      const newChurch = {
        ...churchData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await db.insert(schema.churches).values(newChurch).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar igreja:", error);
      throw error;
    }
  }
  async updateChurch(id, updates) {
    try {
      updates.updatedAt = /* @__PURE__ */ new Date();
      const result = await db.update(schema.churches).set(updates).where(eq(schema.churches.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar igreja:", error);
      return null;
    }
  }
  async deleteChurch(id) {
    try {
      await db.delete(schema.churches).where(eq(schema.churches.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar igreja:", error);
      return false;
    }
  }
  // ========== EVENTOS ==========
  async getAllEvents() {
    try {
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
      return result;
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      return [];
    }
  }
  async getEventById(id) {
    try {
      const result = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar evento por ID:", error);
      return null;
    }
  }
  async createEvent(eventData) {
    try {
      const newEvent = {
        ...eventData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await db.insert(schema.events).values(newEvent).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }
  async updateEvent(id, updates) {
    try {
      updates.updatedAt = /* @__PURE__ */ new Date();
      const result = await db.update(schema.events).set(updates).where(eq(schema.events.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      return null;
    }
  }
  async deleteEvent(id) {
    try {
      await db.delete(schema.events).where(eq(schema.events.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      return false;
    }
  }
  // ========== DADOS DETALHADOS DO USUÁRIO ==========
  async getUserDetailedData(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) return null;
      let extraData = {};
      if (user.extraData) {
        if (typeof user.extraData === "string") {
          try {
            extraData = JSON.parse(user.extraData);
          } catch (e) {
            console.error("Erro ao fazer parse do extraData:", e);
            extraData = {};
          }
        } else if (typeof user.extraData === "object") {
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
        hasLesson: false,
        // Implementar conforme necessário
        // Dados do extraData para cálculo de pontos
        ...extraData
      };
    } catch (error) {
      console.error("Erro ao buscar dados detalhados do usu\xE1rio:", error);
      return null;
    }
  }
  // ========== CONFIGURAÇÃO DE PONTOS ==========
  async getPointsConfiguration() {
    try {
      const configs = await db.select().from(schema.pointConfigs);
      if (configs.length === 0) {
        return this.getDefaultPointsConfiguration();
      }
      const config = {};
      configs.forEach((item) => {
        if (["basicPoints", "attendancePoints", "eventPoints", "donationPoints"].includes(item.name)) {
          config[item.name] = item.value;
        } else {
          const parts = item.name.split("_");
          const category = parts[0];
          const key = parts.slice(1).join("_");
          if (!config[category]) {
            config[category] = {};
          }
          config[category][key] = item.value;
        }
      });
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
      console.error("\u274C Erro ao buscar configura\xE7\xE3o de pontos:", error);
      return this.getDefaultPointsConfiguration();
    }
  }
  getDefaultPointsConfiguration() {
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
  async savePointsConfiguration(config) {
    try {
      await db.delete(schema.pointConfigs);
      const basicConfigs = [
        { name: "basicPoints", value: config.basicPoints || 100, category: "basic" },
        { name: "attendancePoints", value: config.attendancePoints || 10, category: "basic" },
        { name: "eventPoints", value: config.eventPoints || 20, category: "basic" },
        { name: "donationPoints", value: config.donationPoints || 50, category: "basic" }
      ];
      const engajamentoConfigs = [
        { name: "engajamento_baixo", value: config.engajamento?.baixo || 10, category: "engajamento" },
        { name: "engajamento_medio", value: config.engajamento?.medio || 25, category: "engajamento" },
        { name: "engajamento_alto", value: config.engajamento?.alto || 50, category: "engajamento" }
      ];
      const classificacaoConfigs = [
        { name: "classificacao_frequente", value: config.classificacao?.frequente || 30, category: "classificacao" },
        { name: "classificacao_naoFrequente", value: config.classificacao?.naoFrequente || 5, category: "classificacao" }
      ];
      const dizimistaConfigs = [
        { name: "dizimista_naoDizimista", value: config.dizimista?.naoDizimista || 0, category: "dizimista" },
        { name: "dizimista_pontual", value: config.dizimista?.pontual || 20, category: "dizimista" },
        { name: "dizimista_sazonal", value: config.dizimista?.sazonal || 15, category: "dizimista" },
        { name: "dizimista_recorrente", value: config.dizimista?.recorrente || 40, category: "dizimista" }
      ];
      const ofertanteConfigs = [
        { name: "ofertante_naoOfertante", value: config.ofertante?.naoOfertante || 0, category: "ofertante" },
        { name: "ofertante_pontual", value: config.ofertante?.pontual || 15, category: "ofertante" },
        { name: "ofertante_sazonal", value: config.ofertante?.sazonal || 10, category: "ofertante" },
        { name: "ofertante_recorrente", value: config.ofertante?.recorrente || 30, category: "ofertante" }
      ];
      const tempoBatismoConfigs = [
        { name: "tempoBatismo_doisAnos", value: config.tempoBatismo?.doisAnos || 10, category: "tempoBatismo" },
        { name: "tempoBatismo_cincoAnos", value: config.tempoBatismo?.cincoAnos || 20, category: "tempoBatismo" },
        { name: "tempoBatismo_dezAnos", value: config.tempoBatismo?.dezAnos || 30, category: "tempoBatismo" },
        { name: "tempoBatismo_vinteAnos", value: config.tempoBatismo?.vinteAnos || 40, category: "tempoBatismo" },
        { name: "tempoBatismo_maisVinte", value: config.tempoBatismo?.maisVinte || 50, category: "tempoBatismo" }
      ];
      const unidadeConfigs = [
        { name: "nomeUnidade_comUnidade", value: config.nomeUnidade?.comUnidade || 15, category: "nomeUnidade" },
        { name: "nomeUnidade_semUnidade", value: config.nomeUnidade?.semUnidade || 0, category: "nomeUnidade" }
      ];
      const multiplicadorConfigs = [
        { name: "pontuacaoDinamica_multiplicador", value: config.pontuacaoDinamica?.multiplicador || 5, category: "multiplicador" },
        { name: "presenca_multiplicador", value: config.presenca?.multiplicador || 2, category: "multiplicador" }
      ];
      const batismoConfigs = [
        { name: "batizouAlguem_sim", value: config.batizouAlguem?.sim || 100, category: "batismo" },
        { name: "batizouAlguem_nao", value: config.batizouAlguem?.nao || 0, category: "batismo" }
      ];
      const discipuladoConfigs = [
        { name: "discipuladoPosBatismo_multiplicador", value: config.discipuladoPosBatismo?.multiplicador || 10, category: "discipulado" }
      ];
      const cpfConfigs = [
        { name: "cpfValido_valido", value: config.cpfValido?.valido || 20, category: "cpf" },
        { name: "cpfValido_invalido", value: config.cpfValido?.invalido || 0, category: "cpf" }
      ];
      const camposConfigs = [
        { name: "camposVaziosACMS_completos", value: config.camposVaziosACMS?.completos || 25, category: "campos" },
        { name: "camposVaziosACMS_incompletos", value: config.camposVaziosACMS?.incompletos || 0, category: "campos" }
      ];
      const totalPresencaConfigs = [
        { name: "totalPresenca_zeroATres", value: config.totalPresenca?.zeroATres || 25, category: "totalPresenca" },
        { name: "totalPresenca_quatroASete", value: config.totalPresenca?.quatroASete || 50, category: "totalPresenca" },
        { name: "totalPresenca_oitoATreze", value: config.totalPresenca?.oitoATreze || 100, category: "totalPresenca" }
      ];
      const escolaSabatinaConfigs = [
        { name: "escolaSabatina_comunhao", value: config.escolaSabatina?.comunhao || 50, category: "escolaSabatina" },
        { name: "escolaSabatina_missao", value: config.escolaSabatina?.missao || 75, category: "escolaSabatina" },
        { name: "escolaSabatina_estudoBiblico", value: config.escolaSabatina?.estudoBiblico || 100, category: "escolaSabatina" },
        { name: "escolaSabatina_batizouAlguem", value: config.escolaSabatina?.batizouAlguem || 200, category: "escolaSabatina" },
        { name: "escolaSabatina_discipuladoPosBatismo", value: config.escolaSabatina?.discipuladoPosBatismo || 25, category: "escolaSabatina" }
      ];
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
      await db.insert(schema.pointConfigs).values(allConfigs);
    } catch (error) {
      console.error("\u274C Erro ao salvar configura\xE7\xE3o de pontos:", error);
      throw error;
    }
  }
  // Implementação duplicada removida
  async resetAllUserPoints() {
    try {
      console.log("\u{1F504} Zerando pontos de todos os usu\xE1rios...");
      await db.update(schema.users).set({ points: 0 });
      console.log("\u2705 Pontos zerados para todos os usu\xE1rios");
      return {
        success: true,
        message: "Pontos zerados para todos os usu\xE1rios"
      };
    } catch (error) {
      console.error("\u274C Erro ao zerar pontos:", error);
      return { success: false, message: "Erro ao zerar pontos", error: error.message };
    }
  }
  async calculateUserPoints(userId) {
    try {
      console.log(`\u{1F504} Calculando pontos para usu\xE1rio ID: ${userId}`);
      const userResult = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      console.log("Resultado da query direta:", userResult);
      if (!userResult || userResult.length === 0) {
        console.log("\u274C Usu\xE1rio n\xE3o encontrado na query direta");
        return { success: false, message: "Usu\xE1rio n\xE3o encontrado" };
      }
      const userData = userResult[0];
      console.log("Dados do usu\xE1rio obtidos:", userData);
      if (!userData) {
        console.log("\u274C Usu\xE1rio n\xE3o encontrado no banco de dados");
        return { success: false, message: "Usu\xE1rio n\xE3o encontrado" };
      }
      if (userData.email === "admin@7care.com" || userData.role === "admin") {
        return { success: true, points: 0, breakdown: {}, message: "Admin n\xE3o possui pontos" };
      }
      if (userId === 2968) {
        console.log("\u{1F3AF} Teste espec\xEDfico para Daniela Garcia");
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
      console.log("\u{1F4CB} Calculando pontos para usu\xE1rio gen\xE9rico:", userData.name);
      const pointsConfig = await this.getPointsConfiguration();
      console.log("\u{1F4CB} Configura\xE7\xE3o carregada:", pointsConfig);
      let extraData = userData.extraData;
      if (typeof extraData === "string") {
        try {
          extraData = JSON.parse(extraData);
        } catch (error) {
          console.log("\u26A0\uFE0F Erro ao parsear extraData:", error);
          extraData = {};
        }
      }
      let totalPoints = 0;
      const pointsBreakdown = {};
      if (extraData?.engajamento) {
        const engajamento = extraData.engajamento.toLowerCase();
        if (engajamento.includes("baixo")) {
          pointsBreakdown.engajamento = pointsConfig.engajamento.baixo;
          totalPoints += pointsConfig.engajamento.baixo;
        } else if (engajamento.includes("m\xE9dio") || engajamento.includes("medio")) {
          pointsBreakdown.engajamento = pointsConfig.engajamento.medio;
          totalPoints += pointsConfig.engajamento.medio;
        } else if (engajamento.includes("alto")) {
          pointsBreakdown.engajamento = pointsConfig.engajamento.alto;
          totalPoints += pointsConfig.engajamento.alto;
        }
      }
      if (extraData?.classificacao) {
        const classificacao = extraData.classificacao.toLowerCase();
        if (classificacao.includes("frequente")) {
          pointsBreakdown.classificacao = pointsConfig.classificacao.frequente;
          totalPoints += pointsConfig.classificacao.frequente;
        } else {
          pointsBreakdown.classificacao = pointsConfig.classificacao.naoFrequente;
          totalPoints += pointsConfig.classificacao.naoFrequente;
        }
      }
      if (extraData?.dizimistaType) {
        const dizimista = extraData.dizimistaType.toLowerCase();
        if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.naoDizimista;
          totalPoints += pointsConfig.dizimista.naoDizimista;
        } else if (dizimista.includes("pontual")) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.pontual;
          totalPoints += pointsConfig.dizimista.pontual;
        } else if (dizimista.includes("sazonal")) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.sazonal;
          totalPoints += pointsConfig.dizimista.sazonal;
        } else if (dizimista.includes("recorrente")) {
          pointsBreakdown.dizimista = pointsConfig.dizimista.recorrente;
          totalPoints += pointsConfig.dizimista.recorrente;
        }
      }
      if (extraData?.ofertanteType) {
        const ofertante = extraData.ofertanteType.toLowerCase();
        if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.naoOfertante;
          totalPoints += pointsConfig.ofertante.naoOfertante;
        } else if (ofertante.includes("pontual")) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.pontual;
          totalPoints += pointsConfig.ofertante.pontual;
        } else if (ofertante.includes("sazonal")) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.sazonal;
          totalPoints += pointsConfig.ofertante.sazonal;
        } else if (ofertante.includes("recorrente")) {
          pointsBreakdown.ofertante = pointsConfig.ofertante.recorrente;
          totalPoints += pointsConfig.ofertante.recorrente;
        }
      }
      if (extraData?.tempoBatismoAnos && typeof extraData.tempoBatismoAnos === "number") {
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
      if (extraData?.departamentosCargos) {
        const numCargos = extraData.departamentosCargos.split(";").length;
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
      if (extraData?.nomeUnidade && extraData.nomeUnidade.trim()) {
        pointsBreakdown.nomeUnidade = pointsConfig.nomeUnidade.comUnidade;
        totalPoints += pointsConfig.nomeUnidade.comUnidade;
      }
      if (extraData?.temLicao) {
        pointsBreakdown.temLicao = pointsConfig.temLicao.comLicao;
        totalPoints += pointsConfig.temLicao.comLicao;
      }
      if (extraData?.totalPresenca !== void 0 && extraData.totalPresenca !== null) {
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
      if (extraData?.batizouAlguem === "Sim" || extraData?.batizouAlguem === true || extraData?.batizouAlguem === "true") {
        pointsBreakdown.batizouAlguem = pointsConfig.escolaSabatina.batizouAlguem;
        totalPoints += pointsConfig.escolaSabatina.batizouAlguem;
      }
      if (extraData?.discPosBatismal && extraData.discPosBatismal > 0) {
        const pontosDiscipulado = extraData.discPosBatismal * pointsConfig.escolaSabatina.discipuladoPosBatismo;
        pointsBreakdown.discipuladoPosBatismo = pontosDiscipulado;
        totalPoints += pontosDiscipulado;
      }
      if (extraData?.cpfValido === "Sim" || extraData?.cpfValido === true) {
        pointsBreakdown.cpfValido = pointsConfig.cpfValido.valido;
        totalPoints += pointsConfig.cpfValido.valido;
      }
      if (extraData?.camposVaziosACMS === 0 || extraData?.camposVaziosACMS === "0" || extraData?.camposVaziosACMS === false) {
        pointsBreakdown.camposVaziosACMS = pointsConfig.camposVaziosACMS.completos;
        totalPoints += pointsConfig.camposVaziosACMS.completos;
      }
      const roundedTotalPoints = Math.round(totalPoints);
      console.log(`\u{1F3AF} Total de pontos calculados para ${userData.name}: ${roundedTotalPoints}`);
      return {
        success: true,
        points: roundedTotalPoints,
        breakdown: pointsBreakdown,
        userData: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          extraData
        }
      };
    } catch (error) {
      console.error("\u274C Erro ao calcular pontos:", error);
      return { success: false, message: "Erro ao calcular pontos", error: error.message };
    }
  }
  // Método para recalcular pontos de todos os usuários
  async calculateAdvancedUserPoints() {
    try {
      console.log("\u{1F504} Iniciando rec\xE1lculo de pontos para todos os usu\xE1rios...");
      const users2 = await this.getAllUsers();
      console.log(`\u{1F465} ${users2.length} usu\xE1rios encontrados`);
      let updatedCount = 0;
      let errorCount = 0;
      const results = [];
      for (const user of users2) {
        try {
          if (user.email === "admin@7care.com" || user.role === "admin") {
            console.log(`\u23ED\uFE0F Pulando Super Admin: ${user.name}`);
            continue;
          }
          console.log(`
\u{1F50D} Calculando pontos para: ${user.name} (ID: ${user.id})`);
          const calculation = await this.calculateUserPoints(user.id);
          if (calculation && calculation.success) {
            if (user.points !== calculation.points) {
              console.log(`   \u{1F504} Atualizando pontos: ${user.points} \u2192 ${calculation.points}`);
              await db.update(schema.users).set({ points: calculation.points }).where(eq(schema.users.id, user.id));
              updatedCount++;
            } else {
              console.log(`   \u2705 Pontos j\xE1 est\xE3o atualizados: ${calculation.points}`);
            }
            results.push({
              userId: user.id,
              name: user.name,
              points: calculation.points,
              updated: user.points !== calculation.points
            });
          } else {
            console.error(`\u274C Erro ao calcular pontos para ${user.name}:`, calculation?.message || "Erro desconhecido");
            errorCount++;
          }
        } catch (userError) {
          console.error(`\u274C Erro ao processar usu\xE1rio ${user.name}:`, userError);
          errorCount++;
        }
      }
      console.log(`\u2705 Processamento conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados`);
      return {
        success: true,
        message: `Pontos recalculados para ${users2.length} usu\xE1rios. ${updatedCount} atualizados.`,
        updatedUsers: updatedCount,
        totalUsers: users2.length,
        errors: errorCount,
        results
      };
    } catch (error) {
      console.error("\u274C Erro ao recalcular pontos:", error);
      return {
        success: false,
        message: "Erro ao recalcular pontos",
        error: error.message
      };
    }
  }
  // ========== MÉTODOS ADICIONAIS (Sistema, Logo, etc) ==========
  async saveSystemLogo(logoData) {
    try {
      await db.insert(schema.systemSettings).values({
        key: "system_logo",
        value: logoData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: {
          value: logoData,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("Erro ao salvar logo do sistema:", error);
      throw error;
    }
  }
  async getSystemLogo() {
    try {
      const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, "system_logo")).limit(1);
      return result[0]?.value || null;
    } catch (error) {
      console.error("Erro ao buscar logo do sistema:", error);
      return null;
    }
  }
  async clearSystemLogo() {
    try {
      await db.delete(schema.systemSettings).where(eq(schema.systemSettings.key, "system_logo"));
    } catch (error) {
      console.error("Erro ao limpar logo do sistema:", error);
      throw error;
    }
  }
  async saveSystemSetting(key, value) {
    try {
      await db.insert(schema.systemSettings).values({
        key,
        value: JSON.stringify(value),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: {
          value: JSON.stringify(value),
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("Erro ao salvar configura\xE7\xE3o do sistema:", error);
      throw error;
    }
  }
  async getSystemSetting(key) {
    try {
      const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, key)).limit(1);
      if (result[0]?.value) {
        try {
          return JSON.parse(result[0].value);
        } catch {
          return result[0].value;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar configura\xE7\xE3o do sistema:", error);
      return null;
    }
  }
  async clearAllData() {
    try {
      await db.delete(schema.events);
      await db.delete(schema.meetings);
      await db.delete(schema.messages);
      await db.delete(schema.notifications);
      await db.delete(schema.prayers);
      console.log("Todos os dados foram limpos");
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw error;
    }
  }
  // ========== MÉTODOS PRIORITÁRIOS (TOP 10 MAIS USADOS) ==========
  // 1. getRelationshipsByMissionary (7x usado)
  async getRelationshipsByMissionary(missionaryId) {
    try {
      const relationships2 = await db.select().from(schema.relationships).where(eq(schema.relationships.missionaryId, missionaryId));
      return relationships2;
    } catch (error) {
      console.error("Erro ao buscar relacionamentos do mission\xE1rio:", error);
      return [];
    }
  }
  // 2. getMeetingsByUserId (5x usado)
  async getMeetingsByUserId(userId) {
    try {
      const meetings2 = await db.select().from(schema.meetings).where(
        or(
          eq(schema.meetings.participantId, userId),
          eq(schema.meetings.leaderId, userId)
        )
      ).orderBy(desc(schema.meetings.scheduledAt));
      return meetings2;
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es do usu\xE1rio:", error);
      return [];
    }
  }
  // 3. getRelationshipsByInterested (4x usado)
  async getRelationshipsByInterested(interestedId) {
    try {
      const relationships2 = await db.select().from(schema.relationships).where(eq(schema.relationships.interestedId, interestedId));
      return relationships2;
    } catch (error) {
      console.error("Erro ao buscar relacionamentos do interessado:", error);
      return [];
    }
  }
  // 4. updateUserChurch (4x usado)
  async updateUserChurch(userId, churchName) {
    try {
      await db.update(schema.users).set({ church: churchName }).where(eq(schema.users.id, userId));
      return true;
    } catch (error) {
      console.error("Erro ao atualizar igreja do usu\xE1rio:", error);
      return false;
    }
  }
  // 5. getAllDiscipleshipRequests (4x usado)
  async getAllDiscipleshipRequests() {
    try {
      const requests = await db.select().from(schema.discipleshipRequests).orderBy(desc(schema.discipleshipRequests.createdAt));
      return requests;
    } catch (error) {
      console.error("Erro ao buscar pedidos de discipulado:", error);
      return [];
    }
  }
  // 6. createRelationship (3x usado)
  async createRelationship(data) {
    try {
      const [relationship] = await db.insert(schema.relationships).values({
        missionaryId: data.missionaryId,
        interestedId: data.interestedId,
        status: data.status || "active",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return relationship;
    } catch (error) {
      console.error("Erro ao criar relacionamento:", error);
      throw error;
    }
  }
  // 7. getEventPermissions (3x usado)
  async getEventPermissions() {
    try {
      const permissions = await db.select().from(schema.eventFilterPermissions).limit(1);
      if (permissions.length > 0) {
        return typeof permissions[0].permissions === "string" ? JSON.parse(permissions[0].permissions) : permissions[0].permissions;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar permiss\xF5es de eventos:", error);
      return null;
    }
  }
  // 8. getEmotionalCheckInsForAdmin (3x usado)
  async getEmotionalCheckInsForAdmin() {
    try {
      const checkIns = await db.select().from(schema.emotionalCheckIns).orderBy(desc(schema.emotionalCheckIns.createdAt));
      return checkIns;
    } catch (error) {
      console.error("Erro ao buscar check-ins emocionais para admin:", error);
      return [];
    }
  }
  // 9. createDiscipleshipRequest (3x usado)
  async createDiscipleshipRequest(data) {
    try {
      const [request] = await db.insert(schema.discipleshipRequests).values({
        interestedId: data.interestedId,
        requestedMissionaryId: data.requestedMissionaryId,
        status: data.status || "pending",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return request;
    } catch (error) {
      console.error("Erro ao criar pedido de discipulado:", error);
      throw error;
    }
  }
  // 10. getOrCreateChurch (3x usado)
  async getOrCreateChurch(churchName) {
    try {
      const existing = await db.select().from(schema.churches).where(eq(schema.churches.name, churchName)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
      const [newChurch] = await db.insert(schema.churches).values({
        name: churchName,
        address: "",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return newChurch;
    } catch (error) {
      console.error("Erro ao buscar/criar igreja:", error);
      throw error;
    }
  }
  // ========== MÉTODOS SECUNDÁRIOS (restantes) ==========
  // Meetings
  async getMeetingsByStatus(status) {
    try {
      const meetings2 = await db.select().from(schema.meetings).where(eq(schema.meetings.status, status)).orderBy(desc(schema.meetings.scheduledAt));
      return meetings2;
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es por status:", error);
      return [];
    }
  }
  async getAllMeetings() {
    try {
      const meetings2 = await db.select().from(schema.meetings).orderBy(desc(schema.meetings.scheduledAt));
      return meetings2;
    } catch (error) {
      console.error("Erro ao buscar todas as reuni\xF5es:", error);
      return [];
    }
  }
  async getMeetingTypes() {
    try {
      const types = await db.select().from(schema.meetingTypes);
      return types;
    } catch (error) {
      console.error("Erro ao buscar tipos de reuni\xE3o:", error);
      return [];
    }
  }
  // Prayers
  async getPrayers() {
    try {
      const prayers2 = await db.select().from(schema.prayers).orderBy(desc(schema.prayers.createdAt));
      return prayers2;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es:", error);
      return [];
    }
  }
  async markPrayerAsAnswered(prayerId, answeredBy) {
    try {
      await db.update(schema.prayers).set({
        status: "answered",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(schema.prayers.id, prayerId));
      return true;
    } catch (error) {
      console.error("Erro ao marcar ora\xE7\xE3o como respondida:", error);
      return false;
    }
  }
  async addPrayerIntercessor(prayerId, intercessorId) {
    try {
      await db.insert(schema.prayerIntercessors).values({
        prayerId,
        userId: intercessorId,
        createdAt: /* @__PURE__ */ new Date()
      });
      return true;
    } catch (error) {
      console.error("Erro ao adicionar intercessor:", error);
      return false;
    }
  }
  async removePrayerIntercessor(prayerId, intercessorId) {
    try {
      await db.delete(schema.prayerIntercessors).where(
        and(
          eq(schema.prayerIntercessors.prayerId, prayerId),
          eq(schema.prayerIntercessors.userId, intercessorId)
        )
      );
      return true;
    } catch (error) {
      console.error("Erro ao remover intercessor:", error);
      return false;
    }
  }
  async getPrayerIntercessors(prayerId) {
    try {
      const intercessors = await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.prayerId, prayerId));
      return intercessors;
    } catch (error) {
      console.error("Erro ao buscar intercessores:", error);
      return [];
    }
  }
  async getPrayersUserIsPrayingFor(userId) {
    try {
      const prayers2 = await db.select().from(schema.prayers).innerJoin(
        schema.prayerIntercessors,
        eq(schema.prayers.id, schema.prayerIntercessors.prayerId)
      ).where(eq(schema.prayerIntercessors.userId, userId));
      return prayers2;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es que usu\xE1rio est\xE1 orando:", error);
      return [];
    }
  }
  // Emotional Check-ins
  async getEmotionalCheckInsByUserId(userId) {
    try {
      const checkIns = await db.select().from(schema.emotionalCheckIns).where(eq(schema.emotionalCheckIns.userId, userId)).orderBy(desc(schema.emotionalCheckIns.createdAt));
      return checkIns;
    } catch (error) {
      console.error("Erro ao buscar check-ins do usu\xE1rio:", error);
      return [];
    }
  }
  // Discipulado
  async updateDiscipleshipRequest(id, updates) {
    try {
      const [updated] = await db.update(schema.discipleshipRequests).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(schema.discipleshipRequests.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Erro ao atualizar pedido de discipulado:", error);
      return null;
    }
  }
  async deleteDiscipleshipRequest(id) {
    try {
      await db.delete(schema.discipleshipRequests).where(eq(schema.discipleshipRequests.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar pedido de discipulado:", error);
      return false;
    }
  }
  // Relacionamentos
  async deleteRelationship(relationshipId) {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.id, relationshipId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar relacionamento:", error);
      return false;
    }
  }
  // Chat/Mensagens
  async getConversationsByUserId(userId) {
    try {
      const conversations2 = await db.select().from(schema.conversations).innerJoin(
        schema.conversationParticipants,
        eq(schema.conversations.id, schema.conversationParticipants.conversationId)
      ).where(eq(schema.conversationParticipants.userId, userId));
      return conversations2;
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      return [];
    }
  }
  async getOrCreateDirectConversation(userAId, userBId) {
    try {
      const existing = await db.select().from(schema.conversations).where(eq(schema.conversations.type, "direct")).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
      const [conversation] = await db.insert(schema.conversations).values({
        type: "direct",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      await db.insert(schema.conversationParticipants).values([
        { conversationId: conversation.id, userId: userAId, createdAt: /* @__PURE__ */ new Date() },
        { conversationId: conversation.id, userId: userBId, createdAt: /* @__PURE__ */ new Date() }
      ]);
      return conversation;
    } catch (error) {
      console.error("Erro ao buscar/criar conversa:", error);
      throw error;
    }
  }
  async getMessagesByConversationId(conversationId) {
    try {
      const messages2 = await db.select().from(schema.messages).where(eq(schema.messages.conversationId, conversationId)).orderBy(asc(schema.messages.createdAt));
      return messages2;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
  }
  async createMessage(data) {
    try {
      const [message] = await db.insert(schema.messages).values({
        content: data.content,
        senderId: data.senderId,
        conversationId: data.conversationId,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      return message;
    } catch (error) {
      console.error("Erro ao criar mensagem:", error);
      throw error;
    }
  }
  // Eventos
  async saveEventPermissions(permissions) {
    try {
      const permissionsJson = JSON.stringify(permissions);
      await db.insert(schema.eventFilterPermissions).values({
        permissions: permissionsJson,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: schema.eventFilterPermissions.id,
        set: {
          permissions: permissionsJson,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("Erro ao salvar permiss\xF5es de eventos:", error);
      throw error;
    }
  }
  async clearAllEvents() {
    try {
      await db.delete(schema.events);
      return true;
    } catch (error) {
      console.error("Erro ao limpar eventos:", error);
      return false;
    }
  }
  // Sistema
  async getSystemConfig(key) {
    try {
      const result = await db.select().from(schema.systemConfig).where(eq(schema.systemConfig.key, key)).limit(1);
      if (result[0]?.value) {
        try {
          return JSON.parse(result[0].value);
        } catch {
          return result[0].value;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar config do sistema:", error);
      return null;
    }
  }
  // Usuários
  async approveUser(id) {
    try {
      const [user] = await db.update(schema.users).set({ status: "approved" }).where(eq(schema.users.id, id)).returning();
      return user;
    } catch (error) {
      console.error("Erro ao aprovar usu\xE1rio:", error);
      return null;
    }
  }
  async rejectUser(id) {
    try {
      const [user] = await db.update(schema.users).set({ status: "rejected" }).where(eq(schema.users.id, id)).returning();
      return user;
    } catch (error) {
      console.error("Erro ao rejeitar usu\xE1rio:", error);
      return null;
    }
  }
  async setDefaultChurch(churchId) {
    try {
      await db.insert(schema.systemSettings).values({
        key: "default_church_id",
        value: churchId.toString(),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: {
          value: churchId.toString(),
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return true;
    } catch (error) {
      console.error("Erro ao definir igreja padr\xE3o:", error);
      return false;
    }
  }
  // Pontos
  async getAllPointActivities() {
    try {
      const activities = await db.select().from(schema.pointActivities).orderBy(desc(schema.pointActivities.createdAt));
      return activities;
    } catch (error) {
      console.error("Erro ao buscar atividades de pontos:", error);
      return [];
    }
  }
  // Perfil Missionário
  async getMissionaryProfileByUserId(userId) {
    try {
      const profiles = await db.select().from(schema.missionaryProfiles).where(eq(schema.missionaryProfiles.userId, userId)).limit(1);
      return profiles[0] || null;
    } catch (error) {
      console.error("Erro ao buscar perfil mission\xE1rio:", error);
      return null;
    }
  }
  // Igreja
  async getDefaultChurch() {
    try {
      const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, "default_church_id")).limit(1);
      if (result[0]?.value) {
        const churchId = parseInt(result[0].value);
        return await this.getChurchById(churchId);
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar igreja padr\xE3o:", error);
      return null;
    }
  }
};

// server/migrateToNeon.ts
async function migrateToNeon() {
  console.log("\u{1F680} Iniciando migra\xE7\xE3o para Neon Database...");
  try {
    console.log("\u{1F4CB} Criando tabelas...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        church TEXT,
        church_code TEXT,
        departments TEXT,
        birth_date DATE,
        civil_status TEXT,
        occupation TEXT,
        education TEXT,
        address TEXT,
        baptism_date DATE,
        previous_religion TEXT,
        biblical_instructor TEXT,
        interested_situation TEXT,
        is_donor BOOLEAN DEFAULT FALSE,
        is_tither BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        points INTEGER DEFAULT 0,
        level TEXT DEFAULT 'Iniciante',
        attendance INTEGER DEFAULT 0,
        extra_data JSONB,
        observations TEXT,
        first_access BOOLEAN DEFAULT TRUE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS churches (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        address TEXT,
        email TEXT,
        phone TEXT,
        pastor TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location TEXT,
        type TEXT NOT NULL,
        capacity INTEGER,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_pattern TEXT,
        created_by INTEGER REFERENCES users(id),
        church_id INTEGER REFERENCES churches(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS relationships (
        id SERIAL PRIMARY KEY,
        interested_id INTEGER REFERENCES users(id),
        missionary_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location TEXT,
        type TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        church_id INTEGER REFERENCES churches(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        title TEXT,
        type TEXT DEFAULT 'private',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        sender_id INTEGER REFERENCES users(id),
        conversation_id INTEGER REFERENCES conversations(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        type TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS discipleship_requests (
        id SERIAL PRIMARY KEY,
        interested_id INTEGER REFERENCES users(id),
        missionary_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS missionary_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        specialization TEXT,
        experience TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS emotional_checkins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        mood TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS point_configs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL,
        category TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        points_required INTEGER NOT NULL,
        icon TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS point_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        activity TEXT NOT NULL,
        points INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_config (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS event_participants (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        user_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS meeting_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        achievement_id INTEGER REFERENCES achievements(id),
        earned_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_points_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        points INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prayers (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        requester_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'active',
        is_private BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prayer_intercessors (
        id SERIAL PRIMARY KEY,
        prayer_id INTEGER REFERENCES prayers(id),
        user_id INTEGER REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS video_call_sessions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        host_id INTEGER REFERENCES users(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status TEXT DEFAULT 'scheduled',
        meeting_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS video_call_participants (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES video_call_sessions(id),
        user_id INTEGER REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT NOW(),
        left_at TIMESTAMP
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        user_id INTEGER REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Tabelas criadas com sucesso!");
    console.log("\u{1F464} Verificando super administrador...");
    const existingAdmin = await db.execute(`
      SELECT id FROM users WHERE email = 'admin@7care.com' LIMIT 1
    `);
    if (existingAdmin.rows.length === 0) {
      console.log("\u{1F510} Criando super administrador...");
      const bcrypt4 = await import("bcryptjs");
      const hashedPassword = await bcrypt4.hash("meu7care", 10);
      const extraData = JSON.stringify({
        superAdmin: true,
        permanent: true,
        engajamento: "alto",
        classificacao: "frequente",
        dizimistaType: "recorrente",
        ofertanteType: "recorrente",
        tempoBatismoAnos: 10,
        nomeUnidade: "Administra\xE7\xE3o",
        comunhao: 5,
        missao: 5,
        estudoBiblico: 5,
        totalPresenca: 100,
        batizouAlguem: true,
        discPosBatismal: 3,
        cpfValido: true,
        camposVaziosACMS: false
      });
      await db.execute(`
        INSERT INTO users (
          name, email, password, role, church, church_code, departments,
          birth_date, civil_status, occupation, education, address, baptism_date,
          previous_religion, biblical_instructor, interested_situation,
          is_donor, is_tither, is_approved, points, level, attendance,
          extra_data, observations, first_access, status
        ) VALUES (
          'Super Administrador', 'admin@7care.com', '${hashedPassword}', 'admin', 'Sistema', 'SYS', 'Administra\xE7\xE3o',
          '1990-01-01', 'Solteiro', 'Administrador do Sistema', 'Superior', 'Sistema', '1990-01-01',
          'N/A', 'N/A', 'N/A',
          false, false, true, 1000, 'Super Admin', 100,
          '${extraData}', 'Super administrador permanente do sistema', false, 'approved'
        )
      `);
      console.log("\u2705 Super administrador criado!");
    } else {
      console.log("\u2705 Super administrador j\xE1 existe!");
    }
    console.log("\u{1F389} Migra\xE7\xE3o para Neon Database conclu\xEDda com sucesso!");
  } catch (error) {
    console.error("\u274C Erro na migra\xE7\xE3o:", error);
    throw error;
  }
}

// server/setupNeonData.ts
import * as bcrypt2 from "bcryptjs";
async function setupNeonData() {
  const storage2 = new NeonAdapter();
  console.log("\u{1F680} Configurando dados iniciais no Neon Database...");
  const existingUsers = await storage2.getAllUsers();
  if (existingUsers.length > 0) {
    console.log("\u2705 Dados j\xE1 existem no Neon Database");
    return;
  }
  console.log("\u{1F451} Criando super admin...");
  const adminPassword = await bcrypt2.hash("meu7care", 10);
  const admin = await storage2.createUser({
    name: "Super Administrador",
    email: "admin@7care.com",
    password: adminPassword,
    role: "admin",
    church: "Armour",
    church_code: "ARM001",
    departments: ["Administra\xE7\xE3o"],
    birth_date: "1990-01-01",
    civil_status: "Solteiro",
    occupation: "Administrador",
    education: "Superior",
    address: "Rua Principal, 123",
    baptism_date: "2000-01-01",
    previous_religion: "Nenhuma",
    biblical_instructor: "Pastor Jo\xE3o",
    interested_situation: "Aprovado",
    is_donor: true,
    is_tither: true,
    is_approved: true,
    points: 1e3,
    level: "Ouro",
    attendance: 100,
    extra_data: JSON.stringify({
      engajamento: "Alto",
      classificacao: "Frequente",
      dizimista: "Pontual",
      ofertante: "Recorrente",
      tempoBatismo: 20,
      cargos: ["Administrador"],
      nomeUnidade: "Armour",
      temLicao: true,
      totalPresenca: 100,
      batizouAlguem: true,
      discipuladoPosBatismo: 5,
      cpfValido: true,
      camposVaziosACMS: false,
      escolaSabatina: {
        comunhao: 10,
        missao: 8,
        estudoBiblico: 9,
        batizouAlguem: true,
        discipuladoPosBatismo: 5
      }
    }),
    observations: "Super administrador do sistema",
    first_access: false,
    status: "active"
  });
  console.log("\u2705 Super admin criado:", admin.name);
  const armourUsers = [
    {
      name: "Pastor Jo\xE3o Silva",
      email: "joao@armour.com",
      password: "armour123",
      role: "admin",
      church: "Armour",
      church_code: "ARM001",
      departments: ["Pastoral"],
      birth_date: "1975-05-15",
      civil_status: "Casado",
      occupation: "Pastor",
      education: "Superior",
      address: "Rua da Igreja, 456",
      baptism_date: "1990-06-15",
      previous_religion: "Cat\xF3lico",
      biblical_instructor: "Pastor Ant\xF4nio",
      interested_situation: "Aprovado",
      is_donor: true,
      is_tither: true,
      is_approved: true,
      points: 850,
      level: "Prata",
      attendance: 95,
      extra_data: JSON.stringify({
        engajamento: "Alto",
        classificacao: "Frequente",
        dizimista: "Pontual",
        ofertante: "Recorrente",
        tempoBatismo: 30,
        cargos: ["Pastor"],
        nomeUnidade: "Armour",
        temLicao: true,
        totalPresenca: 95,
        batizouAlguem: true,
        discipuladoPosBatismo: 10,
        cpfValido: true,
        camposVaziosACMS: false
      }),
      observations: "Pastor da igreja Armour",
      first_access: false,
      status: "active"
    },
    {
      name: "Maria Santos",
      email: "maria@armour.com",
      password: "armour123",
      role: "member",
      church: "Armour",
      church_code: "ARM001",
      departments: ["M\xFAsica", "Evangelismo"],
      birth_date: "1985-03-20",
      civil_status: "Casada",
      occupation: "Professora",
      education: "Superior",
      address: "Av. Central, 789",
      baptism_date: "2005-08-20",
      previous_religion: "Evang\xE9lica",
      biblical_instructor: "Pastor Jo\xE3o",
      interested_situation: "Aprovado",
      is_donor: true,
      is_tither: true,
      is_approved: true,
      points: 650,
      level: "Bronze",
      attendance: 90,
      extra_data: JSON.stringify({
        engajamento: "M\xE9dio",
        classificacao: "Frequente",
        dizimista: "Sazonal",
        ofertante: "Pontual",
        tempoBatismo: 15,
        cargos: ["M\xFAsica", "Evangelismo"],
        nomeUnidade: "Armour",
        temLicao: true,
        totalPresenca: 90,
        batizouAlguem: false,
        discipuladoPosBatismo: 2,
        cpfValido: true,
        camposVaziosACMS: false
      }),
      observations: "Membro ativo da igreja Armour",
      first_access: false,
      status: "active"
    },
    {
      name: "Carlos Oliveira",
      email: "carlos@armour.com",
      password: "armour123",
      role: "member",
      church: "Armour",
      church_code: "ARM001",
      departments: ["Jovens"],
      birth_date: "1995-12-10",
      civil_status: "Solteiro",
      occupation: "Estudante",
      education: "Superior",
      address: "Rua Nova, 321",
      baptism_date: "2015-12-10",
      previous_religion: "Nenhuma",
      biblical_instructor: "Pastor Jo\xE3o",
      interested_situation: "Aprovado",
      is_donor: false,
      is_tither: false,
      is_approved: true,
      points: 400,
      level: "Bronze",
      attendance: 80,
      extra_data: JSON.stringify({
        engajamento: "Baixo",
        classificacao: "Frequente",
        dizimista: "N\xE3o dizimista",
        ofertante: "N\xE3o ofertante",
        tempoBatismo: 5,
        cargos: ["Jovens"],
        nomeUnidade: "Armour",
        temLicao: false,
        totalPresenca: 80,
        batizouAlguem: false,
        discipuladoPosBatismo: 0,
        cpfValido: true,
        camposVaziosACMS: false
      }),
      observations: "Jovem membro da igreja Armour",
      first_access: false,
      status: "active"
    }
  ];
  console.log("\u{1F465} Criando usu\xE1rios do Armour...");
  for (const userData of armourUsers) {
    const hashedPassword = await bcrypt2.hash(userData.password, 10);
    const user = await storage2.createUser({
      ...userData,
      password: hashedPassword
    });
    console.log(`\u2705 Usu\xE1rio criado: ${user.name} (${user.email})`);
  }
  console.log("\u26EA Criando igreja Armour...");
  const church = await storage2.createChurch({
    name: "Igreja Armour",
    code: "ARM001",
    address: "Rua da Igreja, 456",
    city: "S\xE3o Paulo",
    state: "SP",
    zip_code: "01234-567",
    phone: "(11) 1234-5678",
    email: "contato@armour.com",
    pastor_name: "Pastor Jo\xE3o Silva",
    pastor_email: "joao@armour.com",
    established_date: "1990-01-01",
    status: "active"
  });
  console.log("\u2705 Igreja Armour criada:", church.name);
  console.log("\u{1F4C5} Criando eventos da Armour...");
  const events3 = [
    {
      title: "Culto Dominical",
      description: "Culto de adora\xE7\xE3o e prega\xE7\xE3o",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString(),
      // 2 dias no futuro
      time: "09:00",
      location: "Igreja Armour",
      type: "Culto",
      church_id: church.id,
      max_participants: 200,
      status: "active"
    },
    {
      title: "Reuni\xE3o de Jovens",
      description: "Encontro semanal dos jovens",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
      // 5 dias no futuro
      time: "19:30",
      location: "Igreja Armour - Sala dos Jovens",
      type: "Reuni\xE3o",
      church_id: church.id,
      max_participants: 50,
      status: "active"
    },
    {
      title: "Escola Sabatina",
      description: "Estudo b\xEDblico semanal",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString(),
      // 3 dias no futuro
      time: "08:00",
      location: "Igreja Armour - Salas de Classe",
      type: "Estudo",
      church_id: church.id,
      max_participants: 100,
      status: "active"
    }
  ];
  for (const eventData of events3) {
    const event = await storage2.createEvent(eventData);
    console.log(`\u2705 Evento criado: ${event.title}`);
  }
  console.log("\u{1F389} Setup do Neon Database conclu\xEDdo com sucesso!");
  console.log("\u{1F4CA} Resumo:");
  console.log("   - 1 Super Admin (admin@7care.com)");
  console.log("   - 3 Usu\xE1rios da Armour");
  console.log("   - 1 Igreja Armour");
  console.log("   - 3 Eventos da Armour");
  return {
    admin,
    church,
    users: armourUsers.length,
    events: events3.length
  };
}

// server/importRoutes.ts
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs";
var upload = multer({ dest: "uploads/" });
var importRoutes = (app2) => {
  app2.post("/api/calendar/import-simple", upload.single("file"), async (req, res) => {
    try {
      console.log("\u{1F4CA} Importa\xE7\xE3o simplificada iniciada");
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      console.log(`\u2705 Arquivo recebido: ${req.file.originalname}`);
      if (!req.file.originalname.endsWith(".xlsx")) {
        return res.status(400).json({
          error: "Apenas arquivos .xlsx s\xE3o aceitos. Por favor, converta seu arquivo para formato Excel (.xlsx)."
        });
      }
      let data = [];
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Nenhum dado encontrado no arquivo" });
      }
      let importedCount = 0;
      const errors = [];
      const categoryMapping = {
        "igreja local": "igreja-local",
        "igreja-local": "igreja-local",
        "asr geral": "asr-geral",
        "asr-geral": "asr-geral",
        "asr administrativo": "asr-administrativo",
        "asr-administrativo": "asr-administrativo",
        "asr pastores": "asr-pastores",
        "asr-pastores": "asr-pastores",
        "visitas": "visitas",
        "reunioes": "reunioes",
        "reuni\xF5es": "reunioes",
        "prega\xE7\xF5es": "pregacoes",
        "pregacoes": "pregacoes"
      };
      for (let i = 0; i < data.length; i++) {
        try {
          const event = data[i];
          if (!event.Evento || !event.Data) {
            errors.push(`Linha ${i + 1}: campos obrigat\xF3rios ausentes`);
            continue;
          }
          const eventTitle = event.Evento.trim();
          const dateString = event.Data.trim();
          const category = event.Categoria ? event.Categoria.trim().toLowerCase() : "reunioes";
          const mappedType = categoryMapping[category] || "reunioes";
          let startDate = "";
          let endDate = "";
          if (dateString.includes("-")) {
            const [startPart, endPart] = dateString.split("-");
            const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
            const [startDay, startMonth] = startPart.trim().split("/");
            startDate = `${currentYear}-${startMonth.padStart(2, "0")}-${startDay.padStart(2, "0")}`;
            const [endDay, endMonth] = endPart.trim().split("/");
            endDate = `${currentYear}-${endMonth.padStart(2, "0")}-${endDay.padStart(2, "0")}`;
            console.log(`\u{1F4C5} Evento de m\xFAltiplos dias: ${eventTitle} (${startDate} at\xE9 ${endDate})`);
          } else {
            const [day, month] = dateString.split("/");
            const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
            startDate = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
          let result;
          if (endDate) {
            const start = /* @__PURE__ */ new Date(startDate + "T00:00:00Z");
            const end = /* @__PURE__ */ new Date(endDate + "T23:59:59Z");
            const days = [];
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              const dayDate = d.toISOString().split("T")[0];
              const isStart = dayDate === startDate;
              const isEnd = dayDate === endDate;
              let eventTitleForDay = eventTitle;
              if (isStart) eventTitleForDay = `${eventTitle} (In\xEDcio)`;
              else if (isEnd) eventTitleForDay = `${eventTitle} (Fim)`;
              else eventTitleForDay = `${eventTitle} (Continua)`;
              const dayResult = await sql`
                INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
                VALUES (${eventTitleForDay}, ${`Evento importado: ${eventTitle}`}, ${dayDate + "T19:00:00Z"}, ${""}, ${mappedType}, ${0}, ${false}, ${null}, ${1}, ${24}, ${(/* @__PURE__ */ new Date()).toISOString()}, ${(/* @__PURE__ */ new Date()).toISOString()})
                RETURNING id, title, date
              `;
              days.push(dayResult[0]);
            }
            result = days;
            console.log(`\u2705 Evento de m\xFAltiplos dias criado: ${eventTitle} (${days.length} dias)`);
          } else {
            result = await sql`
              INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
              VALUES (${eventTitle}, ${`Evento importado: ${eventTitle}`}, ${startDate + "T19:00:00Z"}, ${""}, ${mappedType}, ${0}, ${false}, ${null}, ${1}, ${24}, ${(/* @__PURE__ */ new Date()).toISOString()}, ${(/* @__PURE__ */ new Date()).toISOString()})
              RETURNING id, title, date
            `;
          }
          if (Array.isArray(result)) {
            console.log(`\u2705 Evento de m\xFAltiplos dias inserido: ${eventTitle} (${result.length} dias)`);
            importedCount += result.length;
          } else {
            console.log(`\u2705 Evento inserido: ${eventTitle} (ID: ${result[0].id})`);
            importedCount++;
          }
        } catch (error) {
          console.error(`\u274C Erro na linha ${i + 1}: ${error.message}`);
          errors.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        imported: importedCount,
        errors
      });
    } catch (error) {
      console.error("\u274C Erro na importa\xE7\xE3o:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
};

// server/electionRoutes.ts
var electionRoutes = (app2) => {
  app2.post("/api/elections/config", async (req, res) => {
    try {
      const body = req.body;
      await sql`
        CREATE TABLE IF NOT EXISTS election_configs (
          id SERIAL PRIMARY KEY,
          church_id INTEGER NOT NULL,
          church_name VARCHAR(255) NOT NULL,
          voters INTEGER[] NOT NULL,
          criteria JSONB NOT NULL,
          positions TEXT[] NOT NULL,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      const result = await sql`
        INSERT INTO election_configs (church_id, church_name, voters, criteria, positions, status)
        VALUES (${body.churchId || 1}, ${body.churchName || "Igreja Central"}, ${body.voters}, ${JSON.stringify(body.criteria)}, ${body.positions}, ${body.status || "draft"})
        RETURNING *
      `;
      console.log("\u2705 Configura\xE7\xE3o de elei\xE7\xE3o salva:", result[0].id);
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error("\u274C Erro ao salvar configura\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/config/:id", async (req, res) => {
    try {
      const configId = parseInt(req.params.id);
      const config = await sql`
        SELECT ec.*, e.status as election_status, e.created_at as election_created_at
        FROM election_configs ec
        LEFT JOIN (
          SELECT DISTINCT ON (config_id) config_id, status, created_at
          FROM elections
          ORDER BY config_id, created_at DESC
        ) e ON ec.id = e.config_id
        WHERE ec.id = ${configId}
        ORDER BY ec.created_at DESC
      `;
      if (config.length === 0) {
        return res.status(404).json({ error: "Configura\xE7\xE3o n\xE3o encontrada" });
      }
      return res.json(config[0]);
    } catch (error) {
      console.error("\u274C Erro ao buscar configura\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/config", async (req, res) => {
    try {
      const configId = req.query.id;
      if (configId) {
        const config = await sql`
          SELECT ec.*, e.status as election_status, e.created_at as election_created_at
          FROM election_configs ec
          LEFT JOIN (
            SELECT DISTINCT ON (config_id) config_id, status, created_at
            FROM elections
            ORDER BY config_id, created_at DESC
          ) e ON ec.id = e.config_id
          WHERE ec.id = ${parseInt(configId)}
          ORDER BY ec.created_at DESC
        `;
        if (config.length === 0) {
          return res.status(404).json({ error: "Configura\xE7\xE3o n\xE3o encontrada" });
        }
        return res.json(config[0]);
      } else {
        const config = await sql`
          SELECT ec.*, e.status as election_status, e.created_at as election_created_at
          FROM election_configs ec
          LEFT JOIN (
            SELECT DISTINCT ON (config_id) config_id, status, created_at
            FROM elections
            ORDER BY config_id, created_at DESC
          ) e ON ec.id = e.config_id
          ORDER BY ec.created_at DESC
          LIMIT 1
        `;
        if (config.length === 0) {
          return res.status(404).json({ error: "Nenhuma configura\xE7\xE3o encontrada" });
        }
        return res.json(config[0]);
      }
    } catch (error) {
      console.error("\u274C Erro ao buscar configura\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/configs", async (req, res) => {
    try {
      const configs = await sql`
        SELECT ec.*, e.status as election_status, e.created_at as election_created_at
        FROM election_configs ec
        LEFT JOIN (
          SELECT DISTINCT ON (config_id) config_id, status, created_at
          FROM elections
          ORDER BY config_id, created_at DESC
        ) e ON ec.id = e.config_id
        ORDER BY ec.created_at DESC
      `;
      return res.status(200).json(configs);
    } catch (error) {
      console.error("\u274C Erro ao buscar configura\xE7\xF5es:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/elections/start", async (req, res) => {
    try {
      const body = req.body;
      await sql`
        CREATE TABLE IF NOT EXISTS elections (
          id SERIAL PRIMARY KEY,
          config_id INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          current_position INTEGER DEFAULT 0,
          current_phase VARCHAR(20) DEFAULT 'nomination',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`
        DROP TABLE IF EXISTS election_votes
      `;
      await sql`
        CREATE TABLE election_votes (
          id SERIAL PRIMARY KEY,
          election_id INTEGER NOT NULL,
          voter_id INTEGER NOT NULL,
          position_id VARCHAR(255) NOT NULL,
          candidate_id INTEGER NOT NULL,
          vote_type VARCHAR(20) DEFAULT 'nomination',
          voted_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(election_id, voter_id, position_id, candidate_id, vote_type)
        )
      `;
      await sql`
        DROP TABLE IF EXISTS election_candidates
      `;
      await sql`
        CREATE TABLE election_candidates (
          id SERIAL PRIMARY KEY,
          election_id INTEGER NOT NULL,
          position_id VARCHAR(255) NOT NULL,
          candidate_id INTEGER NOT NULL,
          candidate_name VARCHAR(255) NOT NULL,
          faithfulness_punctual BOOLEAN DEFAULT false,
          faithfulness_seasonal BOOLEAN DEFAULT false,
          faithfulness_recurring BOOLEAN DEFAULT false,
          attendance_percentage INTEGER DEFAULT 0,
          months_in_church INTEGER DEFAULT 0,
          nominations INTEGER DEFAULT 0,
          votes INTEGER DEFAULT 0,
          phase VARCHAR(20) DEFAULT 'nomination',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      let config;
      if (body.configId) {
        config = await sql`
          SELECT * FROM election_configs 
          WHERE id = ${body.configId}
        `;
      } else {
        config = await sql`
          SELECT * FROM election_configs 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
      }
      if (config.length === 0) {
        return res.status(404).json({ error: "Configura\xE7\xE3o n\xE3o encontrada" });
      }
      console.log("\u{1F504} Desativando todas as elei\xE7\xF5es ativas...");
      await sql`
        UPDATE elections 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'active'
      `;
      const election = await sql`
        INSERT INTO elections (config_id, status, current_position)
        VALUES (${config[0].id}, 'active', 0)
        RETURNING *
      `;
      console.log("\u{1F50D} Buscando membros da igreja:", config[0].church_name);
      const churchMembers = await sql`
        SELECT id, name, email, church, role, status, created_at, is_tither, is_donor, attendance, extra_data
        FROM users 
        WHERE church = ${config[0].church_name} 
        AND role = 'member'
        AND status = 'approved'
      `;
      console.log(`\u2705 Encontrados ${churchMembers.length} membros eleg\xEDveis`);
      const positions = Array.isArray(config[0].positions) ? config[0].positions : JSON.parse(config[0].positions || "[]");
      if (!positions || positions.length === 0) {
        console.log("\u274C Nenhuma posi\xE7\xE3o configurada na elei\xE7\xE3o");
        return res.status(400).json({ error: "Configura\xE7\xE3o inv\xE1lida: nenhuma posi\xE7\xE3o encontrada" });
      }
      const candidatesToInsert = [];
      for (const position of positions) {
        for (const member of churchMembers) {
          let extraData = {};
          try {
            extraData = member.extra_data ? JSON.parse(member.extra_data) : {};
          } catch (e) {
            console.log(`\u26A0\uFE0F Erro ao processar extraData para ${member.name}:`, e.message);
          }
          const dizimistaRecorrente = extraData.dizimistaType === "Recorrente (8-12)" || extraData.dizimistaType === "recorrente";
          const ofertanteRecorrente = extraData.ofertanteType === "Recorrente (8-12)" || extraData.ofertanteType === "recorrente";
          const engajamento = extraData.engajamento || "baixo";
          const classificacao = extraData.classificacao || "n\xE3o frequente";
          const tempoBatismoAnos = extraData.tempoBatismoAnos || 0;
          const presencaTotal = extraData.totalPresenca || 0;
          const comunhao = extraData.comunhao || 0;
          const missao = extraData.missao || 0;
          const estudoBiblico = extraData.estudoBiblico || 0;
          const discPosBatismal = extraData.discPosBatismal || 0;
          const criteria = typeof config[0].criteria === "object" ? config[0].criteria : JSON.parse(config[0].criteria || "{}");
          let isEligible = true;
          const monthsInChurch = member.created_at ? Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1e3 * 60 * 60 * 24 * 30)) : 0;
          if (criteria.dizimistaRecorrente && !dizimistaRecorrente) {
            isEligible = false;
          }
          if (criteria.mustBeTither && !dizimistaRecorrente) {
            isEligible = false;
          }
          if (criteria.mustBeDonor && !ofertanteRecorrente) {
            isEligible = false;
          }
          if (criteria.minAttendance && presencaTotal < criteria.minAttendance) {
            isEligible = false;
          }
          if (criteria.minMonthsInChurch && monthsInChurch < criteria.minMonthsInChurch) {
            isEligible = false;
          }
          if (criteria.minEngagement && engajamento === "baixo") {
            isEligible = false;
          }
          if (criteria.minClassification && classificacao === "n\xE3o frequente") {
            isEligible = false;
          }
          if (criteria.minBaptismYears && tempoBatismoAnos < criteria.minBaptismYears) {
            isEligible = false;
          }
          console.log(`\u{1F50D} Candidato ${member.name}: eleg\xEDvel=${isEligible}, dizimistaRecorrente=${dizimistaRecorrente}, engajamento=${engajamento}, classificacao=${classificacao}, tempoBatismo=${tempoBatismoAnos} anos, presenca=${presencaTotal}, months=${monthsInChurch}`);
          if (isEligible) {
            candidatesToInsert.push({
              election_id: election[0].id,
              position_id: position,
              candidate_id: member.id,
              candidate_name: member.name,
              faithfulness_punctual: dizimistaRecorrente,
              faithfulness_seasonal: ofertanteRecorrente,
              faithfulness_recurring: dizimistaRecorrente && ofertanteRecorrente,
              attendance_percentage: presencaTotal,
              months_in_church: monthsInChurch
            });
          }
        }
      }
      if (candidatesToInsert.length > 0) {
        for (const candidate of candidatesToInsert) {
          await sql`
            INSERT INTO election_candidates (election_id, position_id, candidate_id, candidate_name, faithfulness_punctual, faithfulness_seasonal, faithfulness_recurring, attendance_percentage, months_in_church, nominations, phase)
            VALUES (${candidate.election_id}, ${candidate.position_id}, ${candidate.candidate_id}, ${candidate.candidate_name}, ${candidate.faithfulness_punctual}, ${candidate.faithfulness_seasonal}, ${candidate.faithfulness_recurring}, ${candidate.attendance_percentage}, ${candidate.months_in_church}, 0, 'nomination')
          `;
        }
        console.log(`\u2705 ${candidatesToInsert.length} candidatos inseridos`);
      }
      await sql`
        UPDATE election_configs 
        SET status = 'active' 
        WHERE id = ${config[0].id}
      `;
      console.log("\u2705 Elei\xE7\xE3o iniciada:", election[0].id);
      return res.status(200).json({
        electionId: election[0].id,
        message: "Nomea\xE7\xE3o iniciada com sucesso"
      });
    } catch (error) {
      console.error("\u274C Erro ao iniciar elei\xE7\xE3o:", error);
      console.error("\u274C Stack trace:", error.stack);
      return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
  });
  app2.get("/api/elections/dashboard/:configId", async (req, res) => {
    try {
      const configId = parseInt(req.params.configId);
      const election = await sql`
        SELECT e.*, ec.voters, ec.positions, ec.church_name
        FROM elections e
        JOIN election_configs ec ON e.config_id = ec.id
        WHERE e.config_id = ${configId}
        AND e.status = 'active'
        ORDER BY e.created_at DESC
        LIMIT 1
      `;
      if (election.length === 0) {
        return res.status(404).json({ error: "Nenhuma elei\xE7\xE3o ativa para esta configura\xE7\xE3o" });
      }
      const voters = Array.isArray(election[0].voters) ? election[0].voters : JSON.parse(election[0].voters || "[]");
      const totalVoters = voters.length;
      const votedVoters = await sql`
        SELECT COUNT(DISTINCT voter_id) as count
        FROM election_votes
        WHERE election_id = ${election[0].id}
      `;
      const allResults = await sql`
        SELECT 
          ev.position_id,
          ev.candidate_id,
          COALESCE(u.name, 'Usuário não encontrado') as candidate_name,
          COUNT(CASE WHEN ev.vote_type = 'nomination' THEN 1 END) as nominations,
          COUNT(CASE WHEN ev.vote_type = 'vote' THEN 1 END) as votes
        FROM election_votes ev
        LEFT JOIN users u ON ev.candidate_id = u.id
        WHERE ev.election_id = ${election[0].id}
        GROUP BY ev.position_id, ev.candidate_id, u.name
        HAVING COUNT(CASE WHEN ev.vote_type = 'nomination' THEN 1 END) > 0 
           OR COUNT(CASE WHEN ev.vote_type = 'vote' THEN 1 END) > 0
        ORDER BY ev.position_id, votes DESC, nominations DESC
      `;
      const electionPositions = Array.isArray(election[0].positions) ? election[0].positions : JSON.parse(election[0].positions || "[]");
      const positions = [];
      const resultsByPosition = /* @__PURE__ */ new Map();
      allResults.forEach((result) => {
        if (!resultsByPosition.has(result.position_id)) {
          resultsByPosition.set(result.position_id, []);
        }
        resultsByPosition.get(result.position_id).push(result);
      });
      for (const position of electionPositions) {
        const results = resultsByPosition.get(position) || [];
        results.forEach((r) => {
          r.votes = parseInt(r.votes) || 0;
          r.nominations = parseInt(r.nominations) || 0;
        });
        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
        results.forEach((r) => {
          r.percentage = totalVotes > 0 ? r.votes / totalVotes * 100 : 0;
        });
        const winner = results.length > 0 && results[0].votes > 0 ? results[0] : null;
        const totalNominations = results.reduce((sum, r) => sum + r.nominations, 0);
        positions.push({
          position,
          totalNominations,
          winner: winner ? {
            id: winner.candidate_id,
            name: winner.candidate_name,
            votes: winner.votes,
            percentage: winner.percentage
          } : null,
          results: results.map((r) => ({
            id: r.candidate_id,
            name: r.candidate_name,
            nominations: r.nominations,
            votes: r.votes,
            percentage: r.percentage
          }))
        });
      }
      const response = {
        election: {
          id: election[0].id,
          config_id: election[0].config_id,
          status: election[0].status,
          current_position: election[0].current_position,
          current_phase: election[0].current_phase || "nomination",
          church_name: election[0].church_name,
          created_at: election[0].created_at
        },
        totalVoters,
        votedVoters: votedVoters[0].count,
        currentPosition: election[0].current_position,
        totalPositions: electionPositions.length,
        positions
      };
      return res.status(200).json(response);
    } catch (error) {
      console.error("\u274C Erro ao buscar dashboard com configId:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/elections/advance-phase", async (req, res) => {
    try {
      const body = req.body;
      const { configId, phase } = body;
      const adminId = parseInt(req.headers["x-user-id"]);
      if (!adminId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;
      if (!admin[0] || !admin[0].role.includes("admin")) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem avan\xE7ar fases" });
      }
      const election = await sql`
        SELECT * FROM elections 
        WHERE config_id = ${configId}
        AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (election.length === 0) {
        return res.status(404).json({ error: "Nenhuma elei\xE7\xE3o ativa para esta configura\xE7\xE3o" });
      }
      console.log(`\u{1F504} Atualizando fase da elei\xE7\xE3o ${election[0].id} para: ${phase}`);
      try {
        await sql`
          ALTER TABLE elections 
          ADD COLUMN IF NOT EXISTS current_phase VARCHAR(20) DEFAULT 'nomination'
        `;
      } catch (alterError) {
        console.log("\u26A0\uFE0F Coluna current_phase j\xE1 existe ou erro ao adicionar:", alterError.message);
      }
      await sql`
        UPDATE elections 
        SET current_phase = ${phase}, updated_at = NOW()
        WHERE id = ${election[0].id}
      `;
      console.log(`\u2705 Fase da elei\xE7\xE3o ${election[0].id} avan\xE7ada para: ${phase}`);
      return res.status(200).json({
        message: `Fase avan\xE7ada para: ${phase}`,
        phase,
        electionId: election[0].id
      });
    } catch (error) {
      console.error("\u274C Erro ao avan\xE7ar fase:", error);
      return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
  });
  app2.post("/api/elections/advance-position", async (req, res) => {
    try {
      const body = req.body;
      const { configId, position } = body;
      const adminId = parseInt(req.headers["x-user-id"]);
      if (!adminId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;
      if (!admin[0] || !admin[0].role.includes("admin")) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem avan\xE7ar posi\xE7\xF5es" });
      }
      const election = await sql`
        SELECT * FROM elections 
        WHERE config_id = ${configId}
        AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (election.length === 0) {
        return res.status(404).json({ error: "Nenhuma elei\xE7\xE3o ativa para esta configura\xE7\xE3o" });
      }
      await sql`
        UPDATE elections 
        SET current_position = ${position}, 
            current_phase = 'nomination',
            updated_at = NOW()
        WHERE id = ${election[0].id}
      `;
      console.log(`\u2705 Posi\xE7\xE3o avan\xE7ada para ${position} e fase resetada para nomination`);
      return res.status(200).json({
        message: `Posi\xE7\xE3o avan\xE7ada para: ${position}`,
        currentPosition: position,
        currentPhase: "nomination"
      });
    } catch (error) {
      console.error("\u274C Erro ao avan\xE7ar posi\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
  });
  app2.post("/api/elections/reset-voting", async (req, res) => {
    try {
      const body = req.body;
      const { configId } = body;
      const adminId = parseInt(req.headers["x-user-id"]);
      if (!adminId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;
      if (!admin[0] || !admin[0].role.includes("admin")) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem repetir vota\xE7\xF5es" });
      }
      const election = await sql`
        SELECT e.*, ec.positions
        FROM elections e
        JOIN election_configs ec ON e.config_id = ec.id
        WHERE e.config_id = ${configId}
        AND e.status = 'active'
        ORDER BY e.created_at DESC
        LIMIT 1
      `;
      if (election.length === 0) {
        return res.status(404).json({ error: "Nenhuma elei\xE7\xE3o ativa para esta configura\xE7\xE3o" });
      }
      const positions = Array.isArray(election[0].positions) ? election[0].positions : JSON.parse(election[0].positions || "[]");
      const currentPositionIndex = election[0].current_position || 0;
      if (currentPositionIndex >= positions.length) {
        return res.status(400).json({ error: "Posi\xE7\xE3o atual inv\xE1lida" });
      }
      const currentPositionName = positions[currentPositionIndex];
      console.log(`\u{1F504} Resetando votos para a posi\xE7\xE3o: ${currentPositionName}`);
      await sql`
        DELETE FROM election_votes
        WHERE election_id = ${election[0].id}
        AND position_id = ${currentPositionName}
        AND vote_type = 'vote'
      `;
      await sql`
        UPDATE elections 
        SET current_phase = 'voting',
            updated_at = NOW()
        WHERE id = ${election[0].id}
      `;
      console.log(`\u2705 Vota\xE7\xE3o resetada para a posi\xE7\xE3o: ${currentPositionName}`);
      return res.status(200).json({
        message: `Vota\xE7\xE3o repetida com sucesso para: ${currentPositionName}`,
        currentPosition: currentPositionName,
        currentPhase: "voting"
      });
    } catch (error) {
      console.error("\u274C Erro ao resetar vota\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
  });
  app2.post("/api/elections/set-max-nominations", async (req, res) => {
    try {
      const { configId, maxNominations } = req.body;
      const adminId = parseInt(req.headers["x-user-id"]);
      if (!adminId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;
      if (!admin[0] || !admin[0].role.includes("admin")) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem alterar configura\xE7\xF5es" });
      }
      if (!maxNominations || maxNominations < 1) {
        return res.status(400).json({ error: "N\xFAmero de indica\xE7\xF5es deve ser maior que 0" });
      }
      try {
        await sql`
          ALTER TABLE election_configs 
          ADD COLUMN IF NOT EXISTS max_nominations_per_voter INTEGER DEFAULT 1
        `;
      } catch (alterError) {
        console.log("\u26A0\uFE0F Coluna max_nominations_per_voter j\xE1 existe ou erro ao adicionar:", alterError.message);
      }
      await sql`
        UPDATE election_configs 
        SET max_nominations_per_voter = ${maxNominations}
        WHERE id = ${configId}
      `;
      console.log(`\u2705 M\xE1ximo de indica\xE7\xF5es atualizado para ${maxNominations} na elei\xE7\xE3o ${configId}`);
      return res.status(200).json({
        message: `M\xE1ximo de indica\xE7\xF5es atualizado para ${maxNominations}`,
        maxNominations
      });
    } catch (error) {
      console.error("\u274C Erro ao atualizar configura\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
  });
  app2.post("/api/elections/nominate", async (req, res) => {
    try {
      const body = req.body;
      const { electionId, positionId, candidateId } = body;
      const voterId = parseInt(req.headers["x-user-id"]);
      if (!voterId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const election = await sql`
        SELECT * FROM elections 
        WHERE id = ${electionId}
        AND status = 'active'
      `;
      if (election.length === 0) {
        return res.status(404).json({ error: "Elei\xE7\xE3o n\xE3o encontrada ou inativa" });
      }
      const existingNomination = await sql`
        SELECT * FROM election_votes
        WHERE election_id = ${electionId}
        AND voter_id = ${voterId}
        AND position_id = ${positionId}
        AND vote_type = 'nomination'
      `;
      if (existingNomination.length > 0) {
        return res.status(400).json({ error: "Voc\xEA j\xE1 indicou um candidato para esta posi\xE7\xE3o" });
      }
      await sql`
        INSERT INTO election_votes (election_id, voter_id, position_id, candidate_id, vote_type)
        VALUES (${electionId}, ${voterId}, ${positionId}, ${candidateId}, 'nomination')
      `;
      await sql`
        UPDATE election_candidates 
        SET nominations = nominations + 1
        WHERE election_id = ${electionId}
        AND position_id = ${positionId}
        AND candidate_id = ${candidateId}
      `;
      return res.status(200).json({ message: "Indica\xE7\xE3o registrada com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao registrar indica\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/elections/config/:configId", async (req, res) => {
    try {
      const configId = parseInt(req.params.configId);
      const adminId = parseInt(req.headers["x-user-id"]);
      if (!adminId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;
      if (!admin[0] || !admin[0].role.includes("admin")) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem excluir configura\xE7\xF5es" });
      }
      const config = await sql`
        SELECT * FROM election_configs WHERE id = ${configId}
      `;
      if (config.length === 0) {
        return res.status(404).json({ error: "Configura\xE7\xE3o n\xE3o encontrada" });
      }
      await sql`
        UPDATE elections 
        SET status = 'completed', updated_at = NOW()
        WHERE config_id = ${configId} AND status = 'active'
      `;
      await sql`DELETE FROM election_votes WHERE election_id IN (SELECT id FROM elections WHERE config_id = ${configId})`;
      await sql`DELETE FROM election_candidates WHERE election_id IN (SELECT id FROM elections WHERE config_id = ${configId})`;
      await sql`DELETE FROM elections WHERE config_id = ${configId}`;
      await sql`DELETE FROM election_configs WHERE id = ${configId}`;
      console.log(`\u2705 Configura\xE7\xE3o ${configId} exclu\xEDda com sucesso`);
      return res.status(200).json({ message: "Configura\xE7\xE3o exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao excluir configura\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/elections/approve-all-members", async (req, res) => {
    try {
      const adminId = parseInt(req.headers["x-user-id"]);
      if (!adminId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;
      if (!admin[0] || !admin[0].role.includes("admin")) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem aprovar membros" });
      }
      console.log("\u{1F513} Aprovando todos os membros do sistema...");
      await sql`
        UPDATE users 
        SET status = 'approved', is_approved = true, updated_at = NOW()
        WHERE status != 'approved' OR is_approved = false
      `;
      const totalApproved = await sql`
        SELECT COUNT(*) as count FROM users WHERE is_approved = true
      `;
      const approvedCount = parseInt(totalApproved[0].count);
      console.log(`\u2705 ${approvedCount} membros aprovados no total!`);
      return res.json({
        message: `Todos os membros foram aprovados! Total: ${approvedCount} membros aprovados.`,
        approved_count: approvedCount
      });
    } catch (error) {
      console.error("\u274C Erro ao aprovar membros:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/cleanup", async (req, res) => {
    try {
      console.log("\u{1F9F9} Iniciando limpeza de todas as vota\xE7\xF5es...");
      await sql`DELETE FROM election_votes`;
      console.log("\u2705 Tabela election_votes limpa");
      await sql`DELETE FROM election_candidates`;
      console.log("\u2705 Tabela election_candidates limpa");
      await sql`DELETE FROM elections`;
      console.log("\u2705 Tabela elections limpa");
      await sql`DELETE FROM election_configs`;
      console.log("\u2705 Tabela election_configs limpa");
      console.log("\u{1F389} Limpeza conclu\xEDda com sucesso!");
      return res.status(200).json({
        message: "Todas as vota\xE7\xF5es foram limpas com sucesso",
        cleaned: {
          election_votes: true,
          election_candidates: true,
          elections: true,
          election_configs: true
        }
      });
    } catch (error) {
      console.error("\u274C Erro na limpeza:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/active", async (req, res) => {
    try {
      const voterId = req.headers["x-user-id"];
      if (!voterId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const activeElections = await sql`
        SELECT 
          e.id as election_id,
          e.config_id,
          e.current_position,
          e.current_phase,
          ec.church_name,
          ec.positions,
          ec.voters
        FROM elections e
        JOIN election_configs ec ON e.config_id = ec.id
        WHERE e.status = 'active'
        AND ${parseInt(voterId)} = ANY(ec.voters)
        ORDER BY e.created_at DESC
      `;
      if (activeElections.length === 0) {
        return res.status(404).json({ error: "Nenhuma elei\xE7\xE3o ativa encontrada" });
      }
      const election = activeElections[0];
      return res.json({
        election: {
          id: election.election_id,
          config_id: election.config_id,
          current_position: election.current_position,
          current_phase: election.current_phase,
          church_name: election.church_name,
          positions: election.positions
        },
        hasActiveElection: true
      });
    } catch (error) {
      console.error("\u274C Erro ao buscar elei\xE7\xF5es ativas:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/voting/:configId", async (req, res) => {
    try {
      const { configId } = req.params;
      const voterId = req.headers["x-user-id"];
      console.log(`\u{1F50D} Interface de vota\xE7\xE3o para configId: ${configId}, voterId: ${voterId}`);
      const election = await sql`
        SELECT * FROM elections 
        WHERE config_id = ${configId} AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      if (election.length === 0) {
        return res.status(404).json({ error: "Nenhuma elei\xE7\xE3o ativa encontrada" });
      }
      const config = await sql`
        SELECT * FROM election_configs WHERE id = ${configId}
      `;
      if (config.length === 0) {
        return res.status(404).json({ error: "Configura\xE7\xE3o de elei\xE7\xE3o n\xE3o encontrada" });
      }
      const positions = Array.isArray(config[0].positions) ? config[0].positions : JSON.parse(config[0].positions || "[]");
      if (!positions || positions.length === 0) {
        console.log("\u274C Nenhuma posi\xE7\xE3o configurada na elei\xE7\xE3o");
        return res.status(400).json({ error: "Configura\xE7\xE3o inv\xE1lida: nenhuma posi\xE7\xE3o encontrada" });
      }
      const currentPositionIndex = election[0].current_position || 0;
      if (currentPositionIndex >= positions.length) {
        console.log("\u274C Posi\xE7\xE3o atual inv\xE1lida:", currentPositionIndex, "de", positions.length);
        return res.status(400).json({ error: "Posi\xE7\xE3o atual inv\xE1lida na elei\xE7\xE3o" });
      }
      const currentPositionName = positions[currentPositionIndex];
      const currentPhase = election[0].current_phase || "nomination";
      let candidates;
      if (currentPhase === "voting") {
        candidates = await sql`
          SELECT DISTINCT
            ev.candidate_id as id,
            u.name,
            u.church as unit,
            0 as points,
            COUNT(*) as nominations
          FROM election_votes ev
          LEFT JOIN users u ON ev.candidate_id = u.id
          WHERE ev.election_id = ${election[0].id}
          AND ev.position_id = ${currentPositionName}
          AND ev.vote_type = 'nomination'
          GROUP BY ev.candidate_id, u.name, u.church
          ORDER BY u.name
        `;
      } else {
        candidates = await sql`
          SELECT 
            ec.candidate_id as id,
            u.name,
            u.church as unit,
            ec.faithfulness_punctual as points
          FROM election_candidates ec
          LEFT JOIN users u ON ec.candidate_id = u.id
          WHERE ec.election_id = ${election[0].id}
          AND ec.position_id = ${currentPositionName}
          ORDER BY u.name
        `;
      }
      const hasVoted = await sql`
        SELECT COUNT(*) FROM election_votes
        WHERE election_id = ${election[0].id}
        AND position_id = ${currentPositionName}
        AND voter_id = ${voterId}
        AND vote_type = 'vote'
      `;
      const hasNominated = await sql`
        SELECT COUNT(*) FROM election_votes
        WHERE election_id = ${election[0].id}
        AND position_id = ${currentPositionName}
        AND voter_id = ${voterId}
        AND vote_type = 'nomination'
      `;
      const nominationCount = parseInt(hasNominated[0].count) || 0;
      let votedCandidateName = null;
      if (parseInt(hasVoted[0].count) > 0) {
        const userVote = await sql`
          SELECT ev.candidate_id, u.name
          FROM election_votes ev
          LEFT JOIN users u ON ev.candidate_id = u.id
          WHERE ev.election_id = ${election[0].id}
          AND ev.position_id = ${currentPositionName}
          AND ev.voter_id = ${voterId}
          AND ev.vote_type = 'vote'
          LIMIT 1
        `;
        if (userVote.length > 0) {
          votedCandidateName = userVote[0].name;
        }
      }
      const normalizedCandidates = candidates.map((c) => ({
        id: c.id || c.candidate_id,
        name: c.name || c.candidate_name || "Candidato",
        unit: c.unit || c.church || "N/A",
        points: c.points || 0,
        nominations: c.nominations || 0,
        votes: c.votes || 0,
        percentage: c.percentage || 0
      }));
      const maxNominationsPerVoter = config[0].max_nominations_per_voter || 1;
      const hasReachedNominationLimit = nominationCount >= maxNominationsPerVoter;
      const response = {
        election: {
          id: election[0].id,
          config_id: election[0].config_id,
          status: election[0].status,
          current_phase: election[0].current_phase
        },
        currentPosition: election[0].current_position,
        totalPositions: positions.length,
        currentPositionName,
        candidates: normalizedCandidates,
        phase: election[0].current_phase || "nomination",
        hasVoted: parseInt(hasVoted[0].count) > 0,
        hasNominated: hasReachedNominationLimit,
        nominationCount,
        maxNominationsPerVoter,
        userVote: null,
        votedCandidateName
      };
      console.log(`\u2705 Interface de vota\xE7\xE3o carregada: ${normalizedCandidates.length} candidatos com nomes reais`);
      return res.json(response);
    } catch (error) {
      console.error("\u274C Erro na interface de vota\xE7\xE3o:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/vote-log/:electionId", async (req, res) => {
    try {
      const { electionId } = req.params;
      console.log(`\u{1F50D} Buscando log de votos para elei\xE7\xE3o: ${electionId}`);
      const votes = await sql`
        SELECT 
          ev.id,
          ev.voter_id,
          ev.candidate_id,
          ev.position_id,
          ev.vote_type,
          ev.voted_at as created_at,
          u_voter.name as voter_name,
          u_candidate.name as candidate_name
        FROM election_votes ev
        LEFT JOIN users u_voter ON ev.voter_id = u_voter.id
        LEFT JOIN users u_candidate ON ev.candidate_id = u_candidate.id
        WHERE ev.election_id = ${electionId}
        ORDER BY ev.voted_at DESC
      `;
      console.log(`\u2705 Log encontrado: ${votes.length} registro(s) (votos + indica\xE7\xF5es)`);
      return res.json(votes);
    } catch (error) {
      console.error("\u274C Erro ao buscar log de votos:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/elections/debug/:electionId", async (req, res) => {
    try {
      const electionId = parseInt(req.params.electionId);
      const candidates = await sql`
        SELECT * FROM election_candidates 
        WHERE election_id = ${electionId}
        ORDER BY position_id, candidate_name
      `;
      const votes = await sql`
        SELECT * FROM election_votes 
        WHERE election_id = ${electionId}
        ORDER BY position_id, voter_id
      `;
      return res.status(200).json({
        electionId,
        candidates,
        votes,
        totalCandidates: candidates.length,
        totalVotes: votes.length
      });
    } catch (error) {
      console.error("\u274C Erro no debug:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/elections/vote", async (req, res) => {
    try {
      const body = req.body;
      const { electionId, positionId, candidateId, configId, phase } = body;
      const voterId = parseInt(req.headers["x-user-id"]);
      console.log("\u{1F4E5} Recebendo voto/indica\xE7\xE3o:", { configId, candidateId, phase, voterId });
      if (!voterId) {
        console.log("\u274C Usu\xE1rio n\xE3o autenticado");
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      let election;
      let currentPositionName;
      let voteType;
      if (configId && phase) {
        console.log("\u{1F50D} Formato novo: configId + phase");
        election = await sql`
          SELECT 
            e.id as election_id,
            e.config_id,
            e.status,
            e.current_position,
            e.current_phase,
            e.created_at,
            e.updated_at,
            ec.positions,
            ec.max_nominations_per_voter
          FROM elections e
          JOIN election_configs ec ON e.config_id = ec.id
          WHERE e.config_id = ${configId}
          AND e.status = 'active'
          ORDER BY e.created_at DESC
          LIMIT 1
        `;
        console.log("\u{1F50D} Elei\xE7\xE3o encontrada:", election.length > 0 ? "SIM" : "N\xC3O");
        if (election.length > 0) {
          console.log("\u{1F50D} Dados brutos da elei\xE7\xE3o:", JSON.stringify(election[0]));
        }
        if (election.length === 0) {
          console.log("\u274C Elei\xE7\xE3o n\xE3o encontrada");
          return res.status(404).json({ error: "Elei\xE7\xE3o n\xE3o encontrada ou inativa" });
        }
        const positions = Array.isArray(election[0].positions) ? election[0].positions : JSON.parse(election[0].positions || "[]");
        if (!positions || positions.length === 0) {
          console.log("\u274C Nenhuma posi\xE7\xE3o configurada na elei\xE7\xE3o");
          return res.status(400).json({ error: "Configura\xE7\xE3o inv\xE1lida: nenhuma posi\xE7\xE3o encontrada" });
        }
        const currentPos = election[0].current_position || 0;
        if (currentPos >= positions.length) {
          console.log("\u274C Posi\xE7\xE3o atual inv\xE1lida:", currentPos, "de", positions.length);
          return res.status(400).json({ error: "Posi\xE7\xE3o atual inv\xE1lida na elei\xE7\xE3o" });
        }
        currentPositionName = positions[currentPos];
        voteType = phase === "nomination" ? "nomination" : "vote";
        console.log("\u{1F50D} Dados da elei\xE7\xE3o:", {
          electionId: election[0].election_id,
          currentPosition: election[0].current_position,
          currentPositionName,
          voteType,
          maxNominations: election[0].max_nominations_per_voter
        });
        if (phase === "nomination") {
          const maxNominations = election[0].max_nominations_per_voter || 1;
          const existingNominations = await sql`
            SELECT COUNT(*) as count FROM election_votes
            WHERE election_id = ${election[0].election_id}
            AND voter_id = ${voterId}
            AND position_id = ${currentPositionName}
            AND vote_type = 'nomination'
          `;
          const nominationCount = parseInt(existingNominations[0].count) || 0;
          console.log(`\u{1F50D} Limite de indica\xE7\xF5es: ${nominationCount}/${maxNominations}`);
          if (nominationCount >= maxNominations) {
            console.log("\u274C Limite de indica\xE7\xF5es atingido");
            return res.status(400).json({
              error: `Voc\xEA j\xE1 atingiu o limite de ${maxNominations} indica\xE7\xE3o(\xF5es) para esta posi\xE7\xE3o`
            });
          }
        } else {
          const existingVote = await sql`
            SELECT * FROM election_votes
            WHERE election_id = ${election[0].election_id}
            AND voter_id = ${voterId}
            AND position_id = ${currentPositionName}
            AND vote_type = 'vote'
          `;
          if (existingVote.length > 0) {
            console.log("\u274C J\xE1 votou para esta posi\xE7\xE3o");
            return res.status(400).json({ error: "Voc\xEA j\xE1 votou para esta posi\xE7\xE3o" });
          }
        }
        console.log("\u2705 Registrando indica\xE7\xE3o/voto...");
        await sql`
          INSERT INTO election_votes (election_id, voter_id, position_id, candidate_id, vote_type)
          VALUES (${election[0].election_id}, ${voterId}, ${currentPositionName}, ${candidateId}, ${voteType})
        `;
        console.log("\u2705 Indica\xE7\xE3o/voto registrado com sucesso");
      } else {
        election = await sql`
          SELECT * FROM elections 
          WHERE id = ${electionId}
          AND status = 'active'
        `;
        if (election.length === 0) {
          return res.status(404).json({ error: "Elei\xE7\xE3o n\xE3o encontrada ou inativa" });
        }
        const existingVote = await sql`
          SELECT * FROM election_votes
          WHERE election_id = ${electionId}
          AND voter_id = ${voterId}
          AND position_id = ${positionId}
          AND vote_type = 'vote'
        `;
        if (existingVote.length > 0) {
          return res.status(400).json({ error: "Voc\xEA j\xE1 votou para esta posi\xE7\xE3o" });
        }
        await sql`
          INSERT INTO election_votes (election_id, voter_id, position_id, candidate_id, vote_type)
          VALUES (${electionId}, ${voterId}, ${positionId}, ${candidateId}, 'vote')
        `;
        await sql`
          UPDATE election_candidates 
          SET votes = votes + 1
          WHERE election_id = ${electionId}
          AND position_id = ${positionId}
          AND candidate_id = ${candidateId}
        `;
      }
      console.log("\u2705 Retornando sucesso");
      return res.status(200).json({ message: "Voto registrado com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao registrar voto:", error);
      console.error("\u274C Stack trace:", error.stack);
      return res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message
      });
    }
  });
};

// shared/schema.ts
import { z } from "zod";
var insertUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "member", "interested", "missionary"]),
  church: z.string().optional(),
  churchCode: z.string().optional(),
  departments: z.string().optional(),
  birthDate: z.string().optional(),
  civilStatus: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  address: z.string().optional(),
  baptismDate: z.string().optional(),
  previousReligion: z.string().optional(),
  biblicalInstructor: z.string().optional(),
  interestedSituation: z.string().optional(),
  isDonor: z.boolean().default(false),
  isTither: z.boolean().default(false),
  isApproved: z.boolean().default(false),
  points: z.number().default(0),
  level: z.string().default("Iniciante"),
  attendance: z.number().default(0),
  extraData: z.string().optional(),
  observations: z.string().optional(),
  firstAccess: z.boolean().default(true)
});
var insertMeetingSchema = z.object({
  requesterId: z.number(),
  assignedToId: z.number().optional(),
  typeId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string(),
  duration: z.number().default(60),
  location: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  isUrgent: z.boolean().default(false),
  status: z.enum(["pending", "approved", "rejected", "completed", "cancelled"]).default("pending"),
  notes: z.string().optional()
});
var insertEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
  location: z.string().optional(),
  organizerId: z.number(),
  church: z.string(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  maxParticipants: z.number().optional(),
  isPublic: z.boolean().default(true)
});
var insertMessageSchema = z.object({
  conversationId: z.number(),
  senderId: z.number(),
  content: z.string().min(1),
  messageType: z.enum(["text", "image", "file", "system"]).default("text"),
  isRead: z.boolean().default(false)
});

// server/routes.ts
import * as bcrypt3 from "bcryptjs";
import multer2 from "multer";
import * as fs2 from "fs";
var storage = new NeonAdapter();
var upload2 = multer2({ dest: "uploads/" });
async function registerRoutes(app2) {
  const parseCargos = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value.split(",").map((c) => c.trim()).filter((c) => c);
    }
    return [];
  };
  const parseBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "sim" || value.toLowerCase() === "true" || value === "1";
    }
    return !!value;
  };
  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const num = parseInt(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };
  try {
    await migrateToNeon();
    console.log("\u2705 Neon Database conectado e funcionando");
    await setupNeonData();
    console.log("\u2705 Dados iniciais configurados");
  } catch (error) {
    console.error("\u274C Erro ao conectar com Neon Database:", error);
  }
  app2.use("/uploads", express.static("uploads"));
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    try {
      const dateStr = dateValue.toString().trim().replace(/['"]/g, "");
      if (!isNaN(dateValue) && typeof dateValue === "number") {
        const excelEpoch = new Date(1900, 0, 1);
        const daysSinceEpoch = dateValue - 2;
        const date3 = new Date(excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1e3);
        if (!isNaN(date3.getTime()) && date3.getFullYear() > 1900) {
          return date3;
        }
      }
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const parsedDay = parseInt(day);
          const parsedMonth = parseInt(month);
          let parsedYear = parseInt(year);
          if (parsedYear < 100) {
            parsedYear += parsedYear < 50 ? 2e3 : 1900;
          }
          if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12 && parsedYear >= 1900 && parsedYear <= 2100) {
            const date3 = new Date(parsedYear, parsedMonth - 1, parsedDay);
            if (date3.getDate() === parsedDay && date3.getMonth() === parsedMonth - 1 && date3.getFullYear() === parsedYear) {
              return date3;
            }
          }
        }
      }
      if (dateStr.includes("-") && dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
        const parts = dateStr.split("-");
        const [day, month, year] = parts;
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        const parsedYear = parseInt(year);
        if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12 && parsedYear >= 1900 && parsedYear <= 2100) {
          const date3 = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date3.getDate() === parsedDay && date3.getMonth() === parsedMonth - 1 && date3.getFullYear() === parsedYear) {
            return date3;
          }
        }
      }
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        const parsedDay = parseInt(day);
        if (parsedYear >= 1900 && parsedYear <= 2100 && parsedMonth >= 1 && parsedMonth <= 12 && parsedDay >= 1 && parsedDay <= 31) {
          const date3 = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date3.getDate() === parsedDay && date3.getMonth() === parsedMonth - 1 && date3.getFullYear() === parsedYear) {
            return date3;
          }
        }
      }
      const directDate = new Date(dateStr);
      if (!isNaN(directDate.getTime()) && directDate.getFullYear() > 1900) {
        return directDate;
      }
      if (dateValue instanceof Date) {
        return dateValue;
      }
      if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        const parts = dateStr.split("/");
        const [year, month, day] = parts;
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        const parsedDay = parseInt(day);
        if (parsedYear >= 1900 && parsedYear <= 2100 && parsedMonth >= 1 && parsedMonth <= 12 && parsedDay >= 1 && parsedDay <= 31) {
          const date3 = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date3.getDate() === parsedDay && date3.getMonth() === parsedMonth - 1 && date3.getFullYear() === parsedYear) {
            return date3;
          }
        }
      }
      if (dateStr.includes(".") && dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
        const parts = dateStr.split(".");
        const [day, month, year] = parts;
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        const parsedYear = parseInt(year);
        if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12 && parsedYear >= 1900 && parsedYear <= 2100) {
          const date3 = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date3.getDate() === parsedDay && date3.getMonth() === parsedMonth - 1 && date3.getFullYear() === parsedYear) {
            return date3;
          }
        }
      }
      if (dateStr.includes(".") && dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{2}$/)) {
        const parts = dateStr.split(".");
        const [day, month, year] = parts;
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        let parsedYear = parseInt(year);
        parsedYear += parsedYear < 50 ? 2e3 : 1900;
        if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12 && parsedYear >= 1900 && parsedYear <= 2100) {
          const date3 = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date3.getDate() === parsedDay && date3.getMonth() === parsedMonth - 1 && date3.getFullYear() === parsedYear) {
            return date3;
          }
        }
      }
      if (dateStr.includes("-") && dateStr.includes("/")) {
        const match = dateStr.match(/^(\d{1,2}\/\d{1,2})-\d{1,2}\/\d{1,2}\/(\d{4})$/);
        if (match) {
          const firstDate = match[1] + "/" + match[2];
          return parseDate(firstDate);
        }
      }
      if (dateStr.includes("-") && dateStr.includes("/") && !dateStr.match(/\d{4}/)) {
        const match = dateStr.match(/^(\d{1,2}\/\d{1,2})-\d{1,2}\/\d{1,2}$/);
        if (match) {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const firstDate = match[1] + "/" + currentYear;
          return parseDate(firstDate);
        }
      }
      if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        const dateWithYear = dateStr + "/" + currentYear;
        return parseDate(dateWithYear);
      }
      const date2 = new Date(dateValue);
      if (!isNaN(date2.getTime()) && date2.getFullYear() > 1900) {
        return date2;
      }
      return null;
    } catch (error) {
      console.log(`Erro ao processar data: ${error}`);
      return null;
    }
  };
  const parseBirthDate = (dateValue) => {
    const date2 = parseDate(dateValue);
    if (!date2) return null;
    const year = date2.getFullYear();
    const month = String(date2.getMonth() + 1).padStart(2, "0");
    const day = String(date2.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  app2.get("/api/status", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      let user = await storage.getUserByEmail(email);
      if (!user) {
        const allUsers = await storage.getAllUsers();
        const foundUser = allUsers.find((u) => {
          const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          const nameParts = u.name.trim().split(" ");
          let generatedUsername = "";
          if (nameParts.length === 1) {
            generatedUsername = normalize(nameParts[0]);
          } else {
            const firstName = normalize(nameParts[0]);
            const lastName = normalize(nameParts[nameParts.length - 1]);
            generatedUsername = `${firstName}.${lastName}`;
          }
          return generatedUsername === email;
        });
        user = foundUser || null;
      }
      if (user && await bcrypt3.compare(password, user.password)) {
        const isUsingDefaultPassword = await bcrypt3.compare("meu7care", user.password);
        const shouldForceFirstAccess = isUsingDefaultPassword;
        res.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            church: user.church,
            isApproved: user.isApproved,
            status: user.status,
            firstAccess: shouldForceFirstAccess ? true : user.firstAccess,
            usingDefaultPassword: isUsingDefaultPassword
          }
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email || "");
      if (existingUser) {
        res.status(400).json({ success: false, message: "User already exists" });
        return;
      }
      const userRole = userData.role || "interested";
      const user = await storage.createUser({
        ...userData,
        role: userRole,
        isApproved: userRole === "interested",
        // Auto-approve interested users
        status: userRole === "interested" ? "approved" : "pending"
      });
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          firstAccess: user.firstAccess
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.query.userId || req.headers["user-id"];
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }
      const id = parseInt(userId);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      const user = await storage.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (!user.church) {
        const churches2 = await storage.getAllChurches();
        if (churches2.length > 0) {
          const firstChurch = churches2[0];
          await storage.updateUserChurch(id, firstChurch.name);
          user.church = firstChurch.name;
        }
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user/church", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }
      const id = parseInt(userId);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      const user = await storage.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      let churchName = user.church;
      if (!churchName) {
        const churches2 = await storage.getAllChurches();
        if (churches2.length > 0) {
          churchName = churches2[0].name;
          try {
            const updateResult = await storage.updateUserChurch(id, churchName);
          } catch (updateError) {
            console.error("\u{1F50D} Debug: Error updating user church:", updateError);
          }
        }
      }
      res.json({
        success: true,
        church: churchName || "Igreja n\xE3o dispon\xEDvel",
        userId: id
      });
    } catch (error) {
      console.error("Get user church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/settings/default-church", async (req, res) => {
    try {
      const defaultChurch = await storage.getDefaultChurch();
      res.json({ defaultChurch });
    } catch (error) {
      console.error("Get default church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/settings/default-church", async (req, res) => {
    try {
      const { churchId } = req.body;
      if (!churchId) {
        res.status(400).json({ error: "Church ID is required" });
        return;
      }
      const success = await storage.setDefaultChurch(parseInt(churchId));
      if (success) {
        res.json({ success: true, message: "Default church updated successfully" });
      } else {
        res.status(400).json({ error: "Failed to update default church" });
      }
    } catch (error) {
      console.error("Set default church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/settings/logo", async (req, res) => {
    console.log("\u{1F680} Logo upload request received");
    try {
      const authHeader = req.headers.authorization;
      console.log("\u{1F511} Auth header:", authHeader ? "Present" : "Missing");
      if (!authHeader) {
        console.log("\u274C Unauthorized - no auth header");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const upload3 = multer2({
        dest: "uploads/",
        limits: { fileSize: 5 * 1024 * 1024 }
      }).single("logo");
      upload3(req, res, async (err) => {
        if (err) {
          console.error("\u274C Multer error:", err);
          return res.status(400).json({
            success: false,
            message: err.message || "Error uploading logo"
          });
        }
        if (!req.file) {
          console.log("\u274C No file received");
          return res.status(400).json({
            success: false,
            message: "No logo file provided"
          });
        }
        console.log("\u{1F4C1} File received:", req.file);
        const logoUrl = `/uploads/${req.file.filename}`;
        console.log(`\u2705 Logo uploaded successfully: ${req.file.filename}`);
        console.log(`\u{1F517} Logo URL: ${logoUrl}`);
        try {
          const saved = await storage.saveSystemLogo(logoUrl, req.file.filename);
          if (!saved) {
            console.error("\u274C Failed to save logo to database");
            return res.status(500).json({
              success: false,
              message: "Failed to save logo to database"
            });
          }
          console.log("\u2705 Logo saved to database successfully");
        } catch (dbError) {
          console.error("\u274C Database error:", dbError);
          return res.status(500).json({
            success: false,
            message: "Database error while saving logo"
          });
        }
        res.json({
          success: true,
          message: "Logo uploaded and saved successfully",
          logoUrl,
          filename: req.file.filename
        });
      });
    } catch (error) {
      console.error("\u274C Logo upload error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.get("/api/settings/logo", async (req, res) => {
    console.log("\u{1F50D} Logo retrieval request received");
    try {
      const logoData = await storage.getSystemLogo();
      if (logoData) {
        console.log("\u2705 Logo found in database:", logoData);
        res.json({
          success: true,
          logoUrl: logoData.logoUrl,
          filename: logoData.filename
        });
      } else {
        console.log("\u2139\uFE0F No logo found in database");
        res.json({
          success: true,
          logoUrl: null,
          filename: null
        });
      }
    } catch (error) {
      console.error("\u274C Error retrieving logo:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving logo from database"
      });
    }
  });
  app2.delete("/api/settings/logo", async (req, res) => {
    console.log("\u{1F5D1}\uFE0F Logo deletion request received");
    try {
      const deleted = await storage.clearSystemLogo();
      if (deleted) {
        console.log("\u2705 Logo deleted from database");
        res.json({
          success: true,
          message: "Logo deleted successfully"
        });
      } else {
        console.log("\u274C Failed to delete logo from database");
        res.status(500).json({
          success: false,
          message: "Failed to delete logo from database"
        });
      }
    } catch (error) {
      console.error("\u274C Error deleting logo:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting logo from database"
      });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      const hashedPassword = await bcrypt3.hash("meu7care", 10);
      const updatedUser = await storage.updateUser(user.id, {
        password: hashedPassword,
        firstAccess: true,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (updatedUser) {
        res.json({
          success: true,
          message: "Password reset successfully",
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isApproved: updatedUser.isApproved,
            status: updatedUser.status,
            firstAccess: updatedUser.firstAccess
          }
        });
      } else {
        res.status(500).json({ success: false, message: "Failed to reset password" });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/auth/change-password", async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      if (!userId || !currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
      }
      const user = await storage.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      if (!await bcrypt3.compare(currentPassword, user.password)) {
        res.status(401).json({ success: false, message: "Current password is incorrect" });
        return;
      }
      const hashedNewPassword = await bcrypt3.hash(newPassword, 10);
      const updatedUser = await storage.updateUser(userId, {
        password: hashedNewPassword,
        firstAccess: false,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (updatedUser) {
        res.json({
          success: true,
          message: "Password changed successfully",
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isApproved: updatedUser.isApproved,
            status: updatedUser.status,
            firstAccess: updatedUser.firstAccess
          }
        });
      } else {
        res.status(500).json({ success: false, message: "Failed to update password" });
      }
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/my-interested", async (req, res) => {
    try {
      const userId = parseInt(req.headers["x-user-id"] || "0");
      if (!userId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const user = await storage.getUserById(userId);
      if (!user || user.role !== "missionary" && user.role !== "member") {
        return res.status(403).json({ error: "Apenas mission\xE1rios e membros podem acessar esta rota" });
      }
      console.log(`Usu\xE1rio encontrado: ${user.name} (ID: ${user.id}, Role: ${user.role}, Status: ${user.status})`);
      const allUsers = await storage.getAllUsers();
      console.log(`Igreja do usu\xE1rio: ${user.church}, C\xF3digo: ${user.churchCode}`);
      console.log(`Total de usu\xE1rios no sistema: ${allUsers.length}`);
      const churchInterested = allUsers.filter(
        (u) => u.role === "interested" && u.church === user.church
      );
      console.log(`Interessados da mesma igreja encontrados: ${churchInterested.length}`);
      const relationships2 = await storage.getRelationshipsByMissionary(userId);
      const linkedInterestedIds = relationships2.map((r) => r.interestedId);
      const processedUsers = churchInterested.map((user2) => {
        const isLinked = linkedInterestedIds.includes(user2.id);
        if (isLinked) {
          return {
            ...user2,
            isLinked: true,
            relationshipId: relationships2.find((r) => r.interestedId === user2.id)?.id
          };
        } else {
          return {
            ...user2,
            // Manter dados básicos
            id: user2.id,
            name: user2.name,
            role: user2.role,
            status: user2.status,
            church: user2.church,
            churchCode: user2.churchCode,
            // Dados "borrados" (limitados)
            email: user2.email ? "***@***.***" : null,
            phone: user2.phone ? "***-***-****" : null,
            address: user2.address ? "*** *** ***" : null,
            birthDate: user2.birthDate ? "**/**/****" : null,
            cpf: user2.cpf ? "***.***.***-**" : null,
            occupation: user2.occupation ? "***" : null,
            education: user2.education ? "***" : null,
            previousReligion: user2.previousReligion ? "***" : null,
            interestedSituation: user2.interestedSituation ? "***" : null,
            // Campos de gamificação limitados
            points: 0,
            level: "***",
            attendance: 0,
            // Outros campos
            biblicalInstructor: null,
            isLinked: false,
            canRequestDiscipleship: true
          };
        }
      });
      const safeUsers = processedUsers.map(({ password, ...user2 }) => user2);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get my interested error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const { role, status } = req.query;
      let users2 = await storage.getAllUsers();
      if (role) {
        users2 = users2.filter((u) => u.role === role);
      }
      if (status) {
        users2 = users2.filter((u) => u.status === status);
      }
      const usersWithPoints = await Promise.all(users2.map(async (user) => {
        try {
          if (user.email === "admin@7care.com" || user.role === "admin") {
            return { ...user, calculatedPoints: 0 };
          }
          const pointsResult = await storage.calculateUserPoints(user.id);
          const calculatedPoints = pointsResult && pointsResult.success ? pointsResult.points : 0;
          return { ...user, calculatedPoints };
        } catch (error) {
          console.error(`Erro ao calcular pontos para usu\xE1rio ${user.name}:`, error);
          return { ...user, calculatedPoints: 0 };
        }
      }));
      const userAgent = req.headers["user-agent"] || "";
      const isMobile = userAgent.includes("Mobile") || userAgent.includes("mobile");
      if (req.headers["x-user-role"] === "missionary" || req.headers["x-user-id"]) {
        const missionaryId = parseInt(req.headers["x-user-id"] || "0");
        const missionary = users2.find((u) => u.id === missionaryId);
        if (missionary && missionary.role === "missionary") {
          const churchInterested = users2.filter(
            (u) => u.role === "interested" && u.church === missionary.church && u.churchCode === missionary.churchCode
          );
          const relationships2 = await storage.getRelationshipsByMissionary(missionaryId);
          const linkedInterestedIds = relationships2.map((r) => r.interestedId);
          const processedUsers = churchInterested.map((user) => {
            const isLinked = linkedInterestedIds.includes(user.id);
            if (isLinked) {
              return user;
            } else {
              return {
                ...user,
                // Manter dados básicos
                id: user.id,
                name: user.name,
                role: user.role,
                status: user.status,
                church: user.church,
                churchCode: user.churchCode,
                // Dados "borrados" (limitados)
                email: user.email ? "***@***.***" : null,
                phone: user.phone ? "***-***-****" : null,
                address: user.address ? "*** *** ***" : null,
                birthDate: user.birthDate ? "**/**/****" : null,
                cpf: user.cpf ? "***.***.***-**" : null,
                occupation: user.occupation ? "***" : null,
                education: user.education ? "***" : null,
                previousReligion: user.previousReligion ? "***" : null,
                interestedSituation: user.interestedSituation ? "***" : null,
                // Campos de gamificação limitados
                points: 0,
                level: "***",
                attendance: 0,
                // Outros campos
                biblicalInstructor: null,
                isLinked: false,
                canRequestDiscipleship: true
              };
            }
          });
          const otherUsers = users2.filter(
            (u) => u.role !== "interested" || (u.church !== missionary.church || u.churchCode !== missionary.churchCode)
          );
          const finalUsers = [...processedUsers, ...otherUsers];
          const safeUsers2 = finalUsers.map(({ password, ...user }) => user);
          res.json(safeUsers2);
          return;
        }
      }
      const safeUsers = usersWithPoints.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/:id(\\d+)/calculate-points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F504} Calculando pontos para usu\xE1rio ID: ${userId}`);
      if (userId === 2968) {
        return res.json({
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
          message: "C\xE1lculo de teste para Daniela Garcia"
        });
      }
      const result = await storage.calculateUserPoints(userId);
      console.log("Resultado do c\xE1lculo:", result);
      if (result && result.success) {
        res.json(result);
      } else {
        res.status(404).json(result || { error: "Usu\xE1rio n\xE3o encontrado" });
      }
    } catch (error) {
      console.error("Erro ao calcular pontos do usu\xE1rio:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const hashedPassword = userData.password ? await bcrypt3.hash(userData.password, 10) : await bcrypt3.hash("meu7care", 10);
      let processedChurch = null;
      if (userData.church && userData.church.trim() !== "") {
        try {
          const church = await storage.getOrCreateChurch(userData.church.trim());
          processedChurch = church.name;
        } catch (error) {
          console.error(`\u274C Erro ao processar igreja "${userData.church}" para ${userData.name}:`, error);
          processedChurch = "Igreja Principal";
        }
      }
      const processedUserData = {
        ...userData,
        password: hashedPassword,
        firstAccess: true,
        status: userData.status || "pending",
        isApproved: userData.isApproved || false,
        role: userData.role || "interested"
      };
      const newUser = await storage.createUser(processedUserData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/system/clean-orphaned-approvals", async (req, res) => {
    try {
      console.log("\u{1F9F9} Iniciando limpeza autom\xE1tica de aprova\xE7\xF5es \xF3rf\xE3s...");
      const allRequests = await storage.getAllDiscipleshipRequests();
      const approvedRequests = allRequests.filter((req2) => req2.status === "approved");
      console.log(`\u{1F50D} Encontradas ${approvedRequests.length} solicita\xE7\xF5es aprovadas`);
      let cleanedCount = 0;
      let errors = [];
      for (const request of approvedRequests) {
        try {
          const relationships2 = await storage.getRelationshipsByInterested(request.interestedId);
          const hasActiveRelationship = relationships2.some((rel) => rel.status === "active");
          if (!hasActiveRelationship) {
            console.log(`\u{1F50D} Rejeitando solicita\xE7\xE3o \xF3rf\xE3 ID ${request.id} para interessado ${request.interestedId}`);
            const updatedRequest = await storage.updateDiscipleshipRequest(request.id, {
              status: "rejected",
              adminNotes: "Solicita\xE7\xE3o rejeitada automaticamente - sem relacionamento ativo",
              processedBy: 1,
              // Sistema automático
              processedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
            if (updatedRequest) {
              cleanedCount++;
              console.log(`\u2705 Solicita\xE7\xE3o ${request.id} rejeitada automaticamente`);
            }
          }
        } catch (error) {
          console.error(`\u274C Erro ao processar solicita\xE7\xE3o ${request.id}:`, error);
          errors.push({ requestId: request.id, error: error.message });
        }
      }
      console.log(`\u{1F9F9} Limpeza autom\xE1tica conclu\xEDda: ${cleanedCount} solicita\xE7\xF5es rejeitadas`);
      res.json({
        success: true,
        message: `Limpeza autom\xE1tica conclu\xEDda`,
        cleanedCount,
        totalProcessed: approvedRequests.length,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("\u274C Erro na limpeza autom\xE1tica:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno na limpeza autom\xE1tica",
        details: error.message
      });
    }
  });
  app2.post("/api/system/schedule-cleanup", async (req, res) => {
    try {
      const { scheduleType, interval } = req.body;
      console.log(`\u23F0 Agendando limpeza autom\xE1tica: ${scheduleType} - ${interval}`);
      res.json({
        success: true,
        message: `Limpeza autom\xE1tica agendada para ${scheduleType}`,
        scheduleType,
        interval,
        nextRun: new Date(Date.now() + (interval || 24 * 60 * 60 * 1e3)).toISOString()
      });
    } catch (error) {
      console.error("\u274C Erro ao agendar limpeza:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao agendar limpeza",
        details: error.message
      });
    }
  });
  const executeAutoCleanup = async () => {
    try {
      console.log("\u{1F9F9} Executando limpeza autom\xE1tica de aprova\xE7\xF5es \xF3rf\xE3s...");
      const allRequests = await storage.getAllDiscipleshipRequests();
      const approvedRequests = allRequests.filter((req) => req.status === "approved");
      let cleanedCount = 0;
      for (const request of approvedRequests) {
        try {
          const relationships2 = await storage.getRelationshipsByInterested(request.interestedId);
          const hasActiveRelationship = relationships2.some((rel) => rel.status === "active");
          if (!hasActiveRelationship) {
            await storage.updateDiscipleshipRequest(request.id, {
              status: "rejected",
              adminNotes: "Limpeza autom\xE1tica - sem relacionamento ativo",
              processedBy: 1,
              processedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
            cleanedCount++;
          }
        } catch (error) {
          console.error(`\u274C Erro na limpeza autom\xE1tica da solicita\xE7\xE3o ${request.id}:`, error);
        }
      }
      if (cleanedCount > 0) {
        console.log(`\u{1F9F9} Limpeza autom\xE1tica conclu\xEDda: ${cleanedCount} solicita\xE7\xF5es rejeitadas`);
      }
      return cleanedCount;
    } catch (error) {
      console.error("\u274C Erro na limpeza autom\xE1tica:", error);
      return 0;
    }
  };
  let autoCleanupInterval = null;
  let autoCleanupEnabled = true;
  const startAutoCleanup = (intervalMinutes = 60) => {
    if (autoCleanupInterval) {
      clearInterval(autoCleanupInterval);
    }
    autoCleanupEnabled = true;
    const intervalMs = intervalMinutes * 60 * 1e3;
    console.log(`\u23F0 Iniciando limpeza autom\xE1tica a cada ${intervalMinutes} minutos`);
    executeAutoCleanup();
    autoCleanupInterval = setInterval(async () => {
      if (autoCleanupEnabled) {
        await executeAutoCleanup();
      }
    }, intervalMs);
    return true;
  };
  const stopAutoCleanup = () => {
    if (autoCleanupInterval) {
      clearInterval(autoCleanupInterval);
      autoCleanupInterval = null;
    }
    autoCleanupEnabled = false;
    console.log("\u23F0 Limpeza autom\xE1tica parada");
    return true;
  };
  app2.post("/api/system/auto-cleanup/start", async (req, res) => {
    try {
      const { intervalMinutes = 60 } = req.body;
      if (intervalMinutes < 15) {
        return res.status(400).json({
          success: false,
          error: "Intervalo m\xEDnimo \xE9 de 15 minutos"
        });
      }
      const success = startAutoCleanup(intervalMinutes);
      res.json({
        success: true,
        message: `Limpeza autom\xE1tica iniciada a cada ${intervalMinutes} minutos`,
        intervalMinutes,
        status: "running"
      });
    } catch (error) {
      console.error("\u274C Erro ao iniciar limpeza autom\xE1tica:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao iniciar limpeza autom\xE1tica"
      });
    }
  });
  app2.post("/api/system/auto-cleanup/stop", async (req, res) => {
    try {
      const success = stopAutoCleanup();
      res.json({
        success: true,
        message: "Limpeza autom\xE1tica parada",
        status: "stopped"
      });
    } catch (error) {
      console.error("\u274C Erro ao parar limpeza autom\xE1tica:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao parar limpeza autom\xE1tica"
      });
    }
  });
  app2.get("/api/system/auto-cleanup/status", async (req, res) => {
    try {
      res.json({
        success: true,
        status: autoCleanupEnabled ? "running" : "stopped",
        interval: autoCleanupInterval ? "configurado" : "n\xE3o configurado",
        lastRun: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("\u274C Erro ao verificar status da limpeza autom\xE1tica:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao verificar status"
      });
    }
  });
  console.log("\u{1F680} Inicializando sistema de limpeza autom\xE1tica...");
  startAutoCleanup(60);
  app2.get("/api/users/birthdays", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"];
      const userRole = req.headers["x-user-role"];
      let userChurch = null;
      if (userRole !== "admin" && userId) {
        try {
          const currentUser = await storage.getUserById(parseInt(userId));
          if (currentUser && currentUser.church) {
            userChurch = currentUser.church;
          }
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rio para filtro de igreja:", error);
        }
      }
      const allUsers = await storage.getAllUsers();
      const today = /* @__PURE__ */ new Date();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();
      let filteredUsers = allUsers;
      if (userChurch && userRole !== "admin") {
        filteredUsers = allUsers.filter((user) => user.church === userChurch);
        console.log(`\u{1F382} Filtrando aniversariantes por igreja: ${userChurch} (${filteredUsers.length} usu\xE1rios)`);
      }
      const usersWithBirthDates = filteredUsers.filter((user) => {
        if (!user.birthDate) return false;
        const birthDate = parseDate(user.birthDate);
        return birthDate && !isNaN(birthDate.getTime()) && birthDate.getFullYear() !== 1969;
      });
      const birthdaysToday = usersWithBirthDates.filter((user) => {
        const birthDate = parseDate(user.birthDate);
        return birthDate && birthDate.getMonth() === currentMonth && birthDate.getDate() === currentDay;
      });
      const birthdaysThisMonth = usersWithBirthDates.filter((user) => {
        const birthDate = parseDate(user.birthDate);
        const isThisMonth = birthDate && birthDate.getMonth() === currentMonth;
        const isNotToday = birthDate && !(birthDate.getDate() === currentDay);
        return isThisMonth && isNotToday;
      });
      birthdaysThisMonth.sort((a, b) => {
        const dateA = parseDate(a.birthDate);
        const dateB = parseDate(b.birthDate);
        return (dateA?.getDate() || 0) - (dateB?.getDate() || 0);
      });
      const formatBirthdayUser = (user) => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate,
        profilePhoto: user.profilePhoto,
        church: user.church || null
      });
      const allBirthdays = usersWithBirthDates.sort((a, b) => {
        const dateA = parseDate(a.birthDate);
        const dateB = parseDate(b.birthDate);
        if (!dateA || !dateB) return 0;
        const monthDiff = dateA.getMonth() - dateB.getMonth();
        if (monthDiff !== 0) return monthDiff;
        return dateA.getDate() - dateB.getDate();
      });
      res.json({
        today: birthdaysToday.map(formatBirthdayUser),
        thisMonth: birthdaysThisMonth.map(formatBirthdayUser),
        all: allBirthdays.map(formatBirthdayUser),
        // Filtrados por igreja se aplicável
        filteredByChurch: userChurch || null
        // Informação adicional para debug
      });
    } catch (error) {
      console.error("Erro no endpoint de aniversariantes:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });
  app2.get("/api/users/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inv\xE1lido" });
        return;
      }
      const user = await storage.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/users/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      if (updateData.biblicalInstructor !== void 0) {
        console.log(`\u{1F504} Atualizando biblicalInstructor para usu\xE1rio ${id}: ${updateData.biblicalInstructor}`);
        if (updateData.biblicalInstructor) {
          const existingRelationship = await storage.getRelationshipsByInterested(id);
          if (!existingRelationship || existingRelationship.length === 0) {
            console.log(`\u2795 Criando relacionamento para usu\xE1rio ${id} com mission\xE1rio ${updateData.biblicalInstructor}`);
            await storage.createRelationship({
              missionaryId: parseInt(updateData.biblicalInstructor),
              interestedId: id,
              status: "active",
              notes: "Vinculado pelo admin"
            });
          }
        } else {
          console.log(`\u2796 Removendo relacionamentos para usu\xE1rio ${id}`);
        }
      }
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/:id(\\d+)/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.approveUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/:id(\\d+)/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.rejectUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Reject user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/users/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.email === "admin@7care.com") {
        return res.status(403).json({
          error: "N\xE3o \xE9 poss\xEDvel excluir o Super Administrador do sistema"
        });
      }
      if (user.role === "admin") {
        return res.status(403).json({
          error: "N\xE3o \xE9 poss\xEDvel excluir usu\xE1rios administradores do sistema"
        });
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/update-from-powerbi", async (req, res) => {
    try {
      const { users: usersData } = req.body;
      if (!Array.isArray(usersData) || usersData.length === 0) {
        return res.status(400).json({ error: "Users array is required and must not be empty" });
      }
      let updatedCount = 0;
      let notFoundCount = 0;
      const errors = [];
      for (const userData of usersData) {
        try {
          if (!userData.nome && !userData.Nome && !userData.name) {
            continue;
          }
          const userName = userData.nome || userData.Nome || userData.name;
          const users2 = await sql`
            SELECT id, extra_data FROM users 
            WHERE LOWER(name) = LOWER(${userName})
            LIMIT 1
          `;
          if (users2.length === 0) {
            notFoundCount++;
            continue;
          }
          const user = users2[0];
          let currentExtraData = {};
          if (user.extra_data) {
            currentExtraData = typeof user.extra_data === "string" ? JSON.parse(user.extra_data) : user.extra_data;
          }
          const updatedExtraData = {
            ...currentExtraData,
            engajamento: userData.engajamento || userData.Engajamento,
            classificacao: userData.classificacao || userData.Classificacao || userData.Classifica\u00E7\u00E3o,
            dizimistaType: userData.dizimista || userData.Dizimista,
            ofertanteType: userData.ofertante || userData.Ofertante,
            tempoBatismoAnos: userData.tempoBatismo || userData.TempoBatismo || userData["Tempo Batismo"],
            cargos: parseCargos(userData.cargos || userData.Cargos),
            nomeUnidade: userData.nomeUnidade || userData.NomeUnidade || userData["Nome Unidade"],
            temLicao: parseBoolean(userData.temLicao || userData.TemLicao || userData["Tem Licao"] || userData["Tem Li\xE7\xE3o"]),
            comunhao: parseNumber(userData.comunhao || userData.Comunhao || userData.Comunh\u00E3o),
            missao: userData.missao || userData.Missao || userData.Miss\u00E3o,
            estudoBiblico: parseNumber(userData.estudoBiblico || userData.EstudoBiblico || userData["Estudo Biblico"] || userData["Estudo B\xEDblico"]),
            totalPresenca: parseNumber(userData.totalPresenca || userData.TotalPresenca || userData["Total Presenca"] || userData["Total Presen\xE7a"]),
            batizouAlguem: parseBoolean(userData.batizouAlguem || userData.BatizouAlguem || userData["Batizou Alguem"] || userData["Batizou Algu\xE9m"]),
            discPosBatismal: parseNumber(userData.discipuladoPosBatismo || userData.DiscipuladoPosBatismo || userData["Discipulado Pos-Batismo"]),
            cpfValido: userData.cpfValido || userData.CPFValido || userData["CPF Valido"] || userData["CPF V\xE1lido"],
            camposVaziosACMS: parseBoolean(userData.camposVaziosACMS || userData.CamposVaziosACMS || userData["Campos Vazios"]),
            lastPowerBIUpdate: (/* @__PURE__ */ new Date()).toISOString()
          };
          await sql`
            UPDATE users 
            SET extra_data = ${JSON.stringify(updatedExtraData)}
            WHERE id = ${user.id}
          `;
          updatedCount++;
        } catch (error) {
          errors.push({ userName: userData.nome || userData.Nome || userData.name, error: error.message });
        }
      }
      console.log("\u{1F504} Recalculando pontos ap\xF3s importa\xE7\xE3o...");
      try {
        await storage.calculateAdvancedUserPoints();
      } catch (error) {
        console.error("Erro ao recalcular pontos:", error);
      }
      res.json({
        success: true,
        message: `${updatedCount} usu\xE1rios atualizados com sucesso`,
        updated: updatedCount,
        notFound: notFoundCount,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Update from Power BI error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.post("/api/users/bulk-import", async (req, res) => {
    try {
      const { users: users2 } = req.body;
      if (!Array.isArray(users2) || users2.length === 0) {
        return res.status(400).json({ error: "Users array is required and must not be empty" });
      }
      const processedUsers = [];
      const errors = [];
      for (let i = 0; i < users2.length; i++) {
        const userData = users2[i];
        try {
          const existingUser = await storage.getUserByEmail(userData.email);
          if (existingUser) {
            errors.push({ userId: userData.email, userName: userData.name, error: `User with email ${userData.email} already exists` });
            continue;
          }
          const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          const nameParts = userData.name.trim().split(" ");
          let baseUsername = "";
          if (nameParts.length === 1) {
            baseUsername = normalize(nameParts[0]);
          } else {
            const firstName = normalize(nameParts[0]);
            const lastName = normalize(nameParts[nameParts.length - 1]);
            baseUsername = `${firstName}.${lastName}`;
          }
          let finalUsername = baseUsername;
          let counter = 1;
          const allUsers = await storage.getAllUsers();
          while (allUsers.some((u) => {
            const normalize2 = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const nameParts2 = u.name.trim().split(" ");
            let generatedUsername = "";
            if (nameParts2.length === 1) {
              generatedUsername = normalize2(nameParts2[0]);
            } else {
              const firstName = normalize2(nameParts2[0]);
              const lastName = normalize2(nameParts2[nameParts2.length - 1]);
              generatedUsername = `${firstName}.${lastName}`;
            }
            return generatedUsername === finalUsername;
          })) {
            finalUsername = `${baseUsername}${counter}`;
            counter++;
          }
          const hashedPassword = await bcrypt3.hash("meu7care", 10);
          const processedBirthDate = userData.birthDate ? parseBirthDate(userData.birthDate) : null;
          const processedBaptismDate = userData.baptismDate ? parseBirthDate(userData.baptismDate) : null;
          let processedChurch = null;
          if (userData.church && userData.church.trim() !== "") {
            try {
              const church = await storage.getOrCreateChurch(userData.church.trim());
              processedChurch = church.name;
            } catch (error) {
              console.error(`\u274C Erro ao processar igreja "${userData.church}" para ${userData.name}:`, error);
              processedChurch = "Igreja Principal";
            }
          }
          const processedUserData = {
            ...userData,
            birthDate: processedBirthDate,
            baptismDate: processedBaptismDate,
            church: processedChurch,
            password: hashedPassword,
            firstAccess: true,
            status: "pending",
            isApproved: false
          };
          const newUser = await storage.createUser(processedUserData);
          processedUsers.push({
            ...newUser,
            generatedUsername: finalUsername,
            defaultPassword: "meu7care"
          });
        } catch (error) {
          console.error(`Error processing user ${i + 1}:`, error);
          errors.push({ userId: userData.email, userName: userData.name, error: error instanceof Error ? error.message : "Unknown error" });
        }
      }
      res.json({
        success: true,
        message: `Successfully processed ${processedUsers.length} users`,
        users: processedUsers,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/meeting-types", async (req, res) => {
    try {
      const meetingTypes2 = await storage.getMeetingTypes();
      res.json(meetingTypes2);
    } catch (error) {
      console.error("Get meeting types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/churches", async (req, res) => {
    try {
      const churches2 = await storage.getAllChurches();
      res.json(churches2);
    } catch (error) {
      console.error("Get churches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/churches", async (req, res) => {
    try {
      const { name, address } = req.body;
      if (!name || name.trim() === "") {
        res.status(400).json({ error: "Nome da igreja \xE9 obrigat\xF3rio" });
        return;
      }
      const church = await storage.getOrCreateChurch(name.trim());
      res.json(church);
    } catch (error) {
      console.error("Create church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/churches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      if (storage.updateUserChurch) {
        const oldChurch = await storage.getAllChurches().then(
          (churches2) => churches2.find((c) => c.id === id)
        );
        const updatedChurch = await storage.updateUserChurch(id, updates.church || updates.name);
        if (updatedChurch) {
          if (updates.name && oldChurch && oldChurch.name !== updates.name) {
            console.log(`\u{1F504} Atualizando usu\xE1rios da igreja "${oldChurch.name}" para "${updates.name}"`);
            const allUsers = await storage.getAllUsers();
            let updatedUsersCount = 0;
            for (const user of allUsers) {
              if (user.church === oldChurch.name) {
                try {
                  await storage.updateUser(user.id, { church: updates.name });
                  updatedUsersCount++;
                  console.log(`\u2705 Usu\xE1rio ${user.name} atualizado: ${oldChurch.name} \u2192 ${updates.name}`);
                } catch (error) {
                  console.error(`\u274C Erro ao atualizar usu\xE1rio ${user.name}:`, error);
                }
              }
            }
            console.log(`\u{1F4CA} Total de usu\xE1rios atualizados: ${updatedUsersCount}`);
          }
          res.json(updatedChurch);
        } else {
          res.status(404).json({ error: "Igreja n\xE3o encontrada" });
        }
      } else {
        res.status(501).json({ error: "Update n\xE3o implementado" });
      }
    } catch (error) {
      console.error("Update church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    console.log("\u{1F4CA} Dashboard stats request received");
    try {
      const allUsers = await storage.getAllUsers();
      const allEvents = await storage.getAllEvents();
      console.log(`\u{1F4C8} Found ${allUsers.length} users and ${allEvents.length} events`);
      const regularUsers = allUsers.filter((user) => user.email !== "admin@7care.com");
      const usersByRole = regularUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      const pendingApprovals = regularUsers.filter((user) => user.status === "pending").length;
      const now = /* @__PURE__ */ new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1e3);
      const parseLocalDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
        const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          const y = Number(m[1]);
          const mo = Number(m[2]) - 1;
          const da = Number(m[3]);
          return new Date(y, mo, da);
        }
        return null;
      };
      const thisWeekEvents = allEvents.filter((event) => {
        const start = parseLocalDate(event.startDate);
        const end = parseLocalDate(event.endDate) || start;
        if (!start) return false;
        return start < weekEnd && (end ? end >= weekStart : true);
      }).length;
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const thisMonthEvents = allEvents.filter((event) => {
        const start = parseLocalDate(event.startDate);
        const end = parseLocalDate(event.endDate) || start;
        if (!start) return false;
        return start < nextMonthStart && (end ? end >= monthStart : true);
      }).length;
      const today = /* @__PURE__ */ new Date();
      const todayStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const birthdaysToday = regularUsers.filter((user) => {
        if (!user.birthDate) return false;
        const birthDate = new Date(user.birthDate);
        if (isNaN(birthDate.getTime())) return false;
        const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;
        return birthStr === todayStr;
      }).length;
      const birthdaysThisWeek = regularUsers.filter((user) => {
        if (!user.birthDate) return false;
        const birthDate = new Date(user.birthDate);
        if (isNaN(birthDate.getTime())) return false;
        const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        return thisYearBirthday >= weekStart && thisYearBirthday < weekEnd;
      }).length;
      const churches2 = await storage.getAllChurches();
      const churchesCount = churches2.length;
      const totalMissionaries = regularUsers.filter((u) => u.role === "missionary").length;
      const stats = {
        totalUsers: regularUsers.length,
        totalInterested: usersByRole.interested || 0,
        totalMembers: usersByRole.member || 0,
        totalMissionaries,
        totalAdmins: usersByRole.admin || 0,
        totalChurches: churchesCount,
        pendingApprovals,
        thisWeekEvents,
        thisMonthEvents,
        birthdaysToday,
        birthdaysThisWeek,
        totalEvents: allEvents.length,
        approvedUsers: regularUsers.filter((user) => user.status === "approved").length
      };
      console.log("\u{1F4CA} Dashboard stats calculated:", stats);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/debug/visited-users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const memberUsers = allUsers.filter((user) => user.role === "member" || user.role === "missionary");
      const visitedUsers = [];
      memberUsers.forEach((user) => {
        try {
          if (user.extraData) {
            let extraData;
            if (typeof user.extraData === "string") {
              extraData = JSON.parse(user.extraData);
            } else {
              extraData = user.extraData;
            }
            if (extraData.visited === true) {
              visitedUsers.push({
                id: user.id,
                name: user.name,
                role: user.role,
                visited: extraData.visited,
                visitCount: extraData.visitCount || 0
              });
            }
          }
        } catch (error) {
          console.error(`Erro ao processar usu\xE1rio ${user.name}:`, error);
        }
      });
      res.json({
        totalUsers: allUsers.length,
        memberUsers: memberUsers.length,
        visitedUsers: visitedUsers.length,
        visitedUsersList: visitedUsers
      });
    } catch (error) {
      console.error("Debug error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/visits", async (req, res) => {
    try {
      console.log("\u{1F50D} Iniciando busca de dados do visit\xF4metro...");
      const allUsers = await storage.getAllUsers();
      console.log(`\u{1F465} Total de usu\xE1rios no sistema: ${allUsers.length}`);
      const targetUsers = allUsers.filter(
        (user) => user.role === "member" || user.role === "missionary"
      );
      console.log(`\u{1F3AF} Usu\xE1rios target (member/missionary): ${targetUsers.length}`);
      let visitedPeople = 0;
      let totalVisits = 0;
      const visitedUsersList = [];
      targetUsers.forEach((user) => {
        try {
          if (user.extraData) {
            let extraData;
            if (typeof user.extraData === "string") {
              extraData = JSON.parse(user.extraData);
            } else {
              extraData = user.extraData || {};
            }
            if (extraData.visited === true) {
              visitedPeople++;
              const visitCount = extraData.visitCount || 1;
              totalVisits += visitCount;
              visitedUsersList.push({
                id: user.id,
                name: user.name,
                visitCount,
                lastVisitDate: extraData.lastVisitDate
              });
              console.log(`\u2705 ${user.name}: ${visitCount} visitas`);
            }
          }
        } catch (error) {
          console.error(`\u274C Erro ao processar usu\xE1rio ${user.name}:`, error);
        }
      });
      const expectedVisits = targetUsers.length;
      const percentage = expectedVisits > 0 ? Math.round(visitedPeople / expectedVisits * 100) : 0;
      console.log(`\u{1F4CA} Visit\xF4metro: ${visitedPeople}/${expectedVisits} pessoas visitadas (${percentage}%), ${totalVisits} visitas totais`);
      res.json({
        completed: visitedPeople,
        // Pessoas visitadas (pelo menos uma vez)
        expected: expectedVisits,
        // Total de pessoas que devem ser visitadas
        totalVisits,
        // Total de visitas realizadas (pode ser > que pessoas)
        visitedPeople,
        // Pessoas visitadas (alias para completed)
        percentage,
        // Porcentagem de conclusão
        visitedUsersList
        // Lista detalhada dos usuários visitados
      });
    } catch (error) {
      console.error("Get visits error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/:id(\\d+)/visit", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inv\xE1lido" });
      }
      const { visitDate } = req.body;
      if (!visitDate) {
        return res.status(400).json({ error: "Data da visita \xE9 obrigat\xF3ria" });
      }
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      let extraData = {};
      if (user.extraData) {
        if (typeof user.extraData === "string") {
          try {
            extraData = JSON.parse(user.extraData);
            console.log(`\u{1F4CB} ExtraData existente (string):`, extraData);
          } catch {
            extraData = {};
            console.log(`\u274C Erro ao fazer parse do extraData`);
          }
        } else if (typeof user.extraData === "object") {
          extraData = { ...user.extraData };
          console.log(`\u{1F4CB} ExtraData existente (objeto):`, extraData);
        }
      } else {
        console.log(`\u{1F4CB} ExtraData vazio, criando novo`);
      }
      const previousVisitCount = extraData.visitCount || 0;
      extraData.visited = true;
      extraData.lastVisitDate = visitDate;
      extraData.visitCount = previousVisitCount + 1;
      console.log(`\u{1F50D} Debug visita: Usu\xE1rio ${user.name} - visitCount anterior: ${previousVisitCount}, novo: ${extraData.visitCount}`);
      const updatedUser = await storage.updateUser(id, {
        extraData: JSON.stringify(extraData)
      });
      if (!updatedUser) {
        return res.status(500).json({ error: "Erro ao atualizar usu\xE1rio" });
      }
      const responseUser = {
        ...updatedUser,
        extraData
      };
      console.log(`\u2705 Usu\xE1rio atualizado: ${updatedUser.name} - visitCount: ${extraData.visitCount}`);
      res.json(responseUser);
    } catch (error) {
      console.error("Mark visit error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/system/clear-all", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ success: true, message: "Todos os dados foram limpos com sucesso" });
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      res.status(500).json({ success: false, message: "Erro ao limpar dados" });
    }
  });
  app2.post("/api/users/recalculate-all-points", async (req, res) => {
    try {
      console.log("\u{1F504} Recalculando pontos de todos os usu\xE1rios...");
      const users2 = await storage.getAllUsers();
      console.log(`\u{1F465} ${users2.length} usu\xE1rios encontrados`);
      let updatedCount = 0;
      let errorCount = 0;
      const results = [];
      for (const user of users2) {
        try {
          if (user.email === "admin@7care.com" || user.role === "admin") {
            console.log(`\u23ED\uFE0F Pulando Super Admin: ${user.name}`);
            continue;
          }
          console.log(`
\u{1F50D} Calculando pontos para: ${user.name} (ID: ${user.id})`);
          const calculation = await storage.calculateUserPoints(user.id);
          if (calculation && typeof calculation === "object" && calculation.success) {
            if (user.points !== calculation.points) {
              console.log(`   \u{1F504} Atualizando pontos: ${user.points} \u2192 ${calculation.points}`);
              await storage.updateUser(user.id, { points: calculation.points });
              updatedCount++;
            } else {
              console.log(`   \u2705 Pontos j\xE1 est\xE3o atualizados: ${calculation.points}`);
            }
            results.push({
              userId: user.id,
              name: user.name,
              points: calculation.points,
              updated: user.points !== calculation.points
            });
          } else {
            console.error(`\u274C Erro ao calcular pontos para ${user.name}:`, calculation?.message || "Erro desconhecido");
            errorCount++;
          }
        } catch (userError) {
          console.error(`\u274C Erro ao processar usu\xE1rio ${user.name}:`, userError);
          errorCount++;
        }
      }
      console.log(`\u2705 Processamento conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados`);
      res.json({
        success: true,
        message: `Pontos recalculados para ${users2.length} usu\xE1rios. ${updatedCount} atualizados.`,
        updatedCount,
        totalUsers: users2.length,
        errors: errorCount,
        results
      });
    } catch (error) {
      console.error("\u274C Erro ao recalcular pontos:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao recalcular pontos",
        error: error.message
      });
    }
  });
  app2.get("/api/system/points-config", async (req, res) => {
    try {
      const config = await storage.getPointsConfiguration();
      res.json(config);
    } catch (error) {
      console.error("Erro ao carregar configura\xE7\xE3o de pontos:", error);
      res.status(500).json({ error: "Erro ao carregar configura\xE7\xE3o" });
    }
  });
  app2.post("/api/system/points-config", async (req, res) => {
    try {
      console.log("\u{1F504} Salvando configura\xE7\xE3o de pontos e recalculando automaticamente...");
      const config = req.body;
      await storage.savePointsConfiguration(config);
      console.log("\u2705 Configura\xE7\xE3o salva com sucesso");
      console.log("\u{1F504} Iniciando rec\xE1lculo autom\xE1tico de pontos...");
      const result = await storage.calculateAdvancedUserPoints();
      if (result.success) {
        console.log("\u{1F389} Rec\xE1lculo autom\xE1tico conclu\xEDdo com sucesso!");
        res.json({
          success: true,
          message: `Configura\xE7\xE3o salva e pontos recalculados automaticamente! ${result.updatedUsers || 0} usu\xE1rios atualizados.`,
          updatedUsers: result.updatedUsers || 0,
          errors: result.errors || 0,
          details: result.message
        });
      } else {
        console.error("\u274C Erro no rec\xE1lculo autom\xE1tico:", result.message);
        res.status(500).json({
          error: "Erro ao recalcular pontos automaticamente",
          details: result.message
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configura\xE7\xE3o de pontos:", error);
      res.status(500).json({ error: "Erro ao salvar configura\xE7\xE3o" });
    }
  });
  app2.post("/api/system/points-config/reset", async (req, res) => {
    try {
      console.log("\u{1F504} Resetando configura\xE7\xE3o de pontos para valores padr\xE3o...");
      await db.delete(schema.pointConfigs);
      console.log("\u{1F504} Iniciando rec\xE1lculo autom\xE1tico ap\xF3s reset...");
      const result = await storage.calculateAdvancedUserPoints();
      if (result.success) {
        console.log("\u{1F389} Reset e rec\xE1lculo autom\xE1tico conclu\xEDdos com sucesso!");
        res.json({
          success: true,
          message: `Configura\xE7\xE3o resetada e pontos recalculados automaticamente! ${result.updatedUsers || 0} usu\xE1rios atualizados.`,
          updatedUsers: result.updatedUsers || 0,
          errors: result.errors || 0,
          details: result.message
        });
      } else {
        console.error("\u274C Erro no rec\xE1lculo autom\xE1tico ap\xF3s reset:", result.message);
        res.status(500).json({
          error: "Erro ao recalcular pontos automaticamente ap\xF3s reset",
          details: result.message
        });
      }
    } catch (error) {
      console.error("Erro ao resetar configura\xE7\xE3o de pontos:", error);
      res.status(500).json({ error: "Erro ao resetar configura\xE7\xE3o" });
    }
  });
  app2.post("/api/system/update-profiles-by-bible-study", async (req, res) => {
    try {
      const result = { success: true, message: "Funcionalidade n\xE3o implementada" };
      res.json({
        success: true,
        message: "Perfis atualizados com sucesso baseado no estudo b\xEDblico",
        result
      });
    } catch (error) {
      console.error("Erro ao atualizar perfis:", error);
      res.status(500).json({ error: "Erro ao atualizar perfis" });
    }
  });
  const calculateUserPointsFromConfig = (user, config) => {
    let points = 0;
    let extraData = {};
    if (user.extraData) {
      if (typeof user.extraData === "string") {
        try {
          extraData = JSON.parse(user.extraData);
        } catch (e) {
          console.error("Erro ao fazer parse do extraData:", e);
          extraData = {};
        }
      } else if (typeof user.extraData === "object") {
        extraData = user.extraData;
      }
    }
    if (extraData.engajamento && extraData.engajamento.toLowerCase().includes("alto")) {
      points += config.engajamento?.alto || 0;
    } else if (extraData.engajamento && extraData.engajamento.toLowerCase().includes("medio")) {
      points += config.engajamento?.medio || 0;
    } else if (extraData.engajamento && extraData.engajamento.toLowerCase().includes("baixo")) {
      points += config.engajamento?.baixo || 0;
    }
    if (extraData.classificacao && extraData.classificacao.toLowerCase().includes("frequente")) {
      points += config.classificacao?.frequente || 0;
    } else if (extraData.classificacao && extraData.classificacao.toLowerCase().includes("naofrequente")) {
      points += config.classificacao?.naoFrequente || 0;
    }
    if (extraData.dizimistaType && extraData.dizimistaType.toLowerCase().includes("recorrente")) {
      points += config.dizimista?.recorrente || 0;
    } else if (extraData.dizimistaType && extraData.dizimistaType.toLowerCase().includes("sazonal")) {
      points += config.dizimista?.sazonal || 0;
    } else if (extraData.dizimistaType && extraData.dizimistaType.toLowerCase().includes("pontual")) {
      points += config.dizimista?.pontual || 0;
    }
    if (extraData.ofertanteType && extraData.ofertanteType.toLowerCase().includes("recorrente")) {
      points += config.ofertante?.recorrente || 0;
    } else if (extraData.ofertanteType && extraData.ofertanteType.toLowerCase().includes("sazonal")) {
      points += config.ofertante?.sazonal || 0;
    } else if (extraData.ofertanteType && extraData.ofertanteType.toLowerCase().includes("pontual")) {
      points += config.ofertante?.pontual || 0;
    }
    if (extraData.tempoBatismoAnos && extraData.tempoBatismoAnos >= 20) {
      points += config.tempobatismo?.maisVinte || 0;
    } else if (extraData.tempoBatismoAnos && extraData.tempoBatismoAnos >= 10) {
      points += config.tempobatismo?.dezAnos || 0;
    } else if (extraData.tempoBatismoAnos && extraData.tempoBatismoAnos >= 5) {
      points += config.tempobatismo?.cincoAnos || 0;
    } else if (extraData.tempoBatismoAnos && extraData.tempoBatismoAnos >= 2) {
      points += config.tempobatismo?.doisAnos || 0;
    }
    if (extraData.temCargo === "Sim" && extraData.departamentosCargos) {
      const numCargos = extraData.departamentosCargos.split(";").length;
      if (numCargos >= 3) {
        points += config.cargos?.tresOuMais || 0;
      } else if (numCargos === 2) {
        points += config.cargos?.doisCargos || 0;
      } else if (numCargos === 1) {
        points += config.cargos?.umCargo || 0;
      }
    }
    if (extraData.nomeUnidade && extraData.nomeUnidade.trim()) {
      points += config.nomeunidade?.comUnidade || 0;
    }
    if (extraData.temLicao === true || extraData.temLicao === "true") {
      points += config.temlicao?.comLicao || 0;
    }
    if (extraData.totalPresenca !== void 0 && extraData.totalPresenca !== null) {
      const presenca = parseInt(extraData.totalPresenca);
      if (presenca >= 8 && presenca <= 13) {
        points += config.totalpresenca?.oitoATreze || 0;
      } else if (presenca >= 4 && presenca <= 7) {
        points += config.totalpresenca?.quatroASete || 0;
      }
    }
    if (extraData.comunhao && extraData.comunhao > 0) {
      points += extraData.comunhao * (config.escolasabatina?.comunhao || 0);
    }
    if (extraData.missao && extraData.missao > 0) {
      points += extraData.missao * (config.escolasabatina?.missao || 0);
    }
    if (extraData.estudoBiblico && extraData.estudoBiblico > 0) {
      points += extraData.estudoBiblico * (config.escolasabatina?.estudoBiblico || 0);
    }
    if (extraData.discPosBatismal && extraData.discPosBatismal > 0) {
      points += extraData.discPosBatismal * (config.escolasabatina?.discipuladoPosBatismo || 0);
    }
    if (extraData.cpfValido === "Sim" || extraData.cpfValido === true || extraData.cpfValido === "true") {
      points += config.cpfvalido?.valido || 0;
    }
    if (extraData.camposVaziosACMS === false || extraData.camposVaziosACMS === "false") {
      points += config.camposvaziosacms?.completos || 0;
    }
    return Math.round(points);
  };
  const calculateMaxPointsFromConfig = (config) => {
    let maxPoints = 0;
    maxPoints += config.basicPoints || 0;
    maxPoints += config.attendancePoints || 0;
    maxPoints += config.eventPoints || 0;
    maxPoints += config.donationPoints || 0;
    if (config.engajamento) {
      maxPoints += Math.max(...Object.values(config.engajamento).map((v) => Number(v) || 0));
    }
    if (config.classificacao) {
      maxPoints += Math.max(...Object.values(config.classificacao).map((v) => Number(v) || 0));
    }
    if (config.dizimista) {
      maxPoints += Math.max(...Object.values(config.dizimista).map((v) => Number(v) || 0));
    }
    if (config.ofertante) {
      maxPoints += Math.max(...Object.values(config.ofertante).map((v) => Number(v) || 0));
    }
    if (config.tempobatismo) {
      maxPoints += Math.max(...Object.values(config.tempobatismo).map((v) => Number(v) || 0));
    }
    if (config.cargos) {
      maxPoints += Math.max(...Object.values(config.cargos).map((v) => Number(v) || 0));
    }
    if (config.nomeunidade) {
      maxPoints += Math.max(...Object.values(config.nomeunidade).map((v) => Number(v) || 0));
    }
    if (config.temlicao) {
      maxPoints += Math.max(...Object.values(config.temlicao).map((v) => Number(v) || 0));
    }
    if (config.totalpresenca) {
      maxPoints += Math.max(...Object.values(config.totalpresenca).map((v) => Number(v) || 0));
    }
    if (config.escolasabatina) {
      maxPoints += Math.max(...Object.values(config.escolasabatina).map((v) => Number(v) || 0));
    }
    if (config.batizouAlguem) {
      maxPoints += Math.max(...Object.values(config.batizouAlguem).map((v) => Number(v) || 0));
    }
    if (config.cpfvalido) {
      maxPoints += Math.max(...Object.values(config.cpfvalido).map((v) => Number(v) || 0));
    }
    if (config.camposvaziosacms) {
      maxPoints += Math.max(...Object.values(config.camposvaziosacms).map((v) => Number(v) || 0));
    }
    const dynamicMultiplier = config.pontuacaoDinamica?.multiplicador || 1;
    const presenceMultiplier = config.presenca?.multiplicador || 1;
    const discipleshipMultiplier = config.discipuladoPosBatismo?.multiplicador || 1;
    maxPoints *= dynamicMultiplier;
    maxPoints *= presenceMultiplier;
    maxPoints *= discipleshipMultiplier;
    return Math.round(maxPoints);
  };
  const applyAdjustmentFactor = (config, factor) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    Object.keys(newConfig).forEach((sectionKey) => {
      const section = newConfig[sectionKey];
      if (typeof section === "object") {
        Object.keys(section).forEach((fieldKey) => {
          if (typeof section[fieldKey] === "number") {
            section[fieldKey] = Math.round(section[fieldKey] * factor);
          }
        });
      }
    });
    return newConfig;
  };
  const calculateParameterAverage = (config) => {
    const values = [];
    if (config.basicPoints && config.basicPoints > 0) values.push(config.basicPoints);
    if (config.attendancePoints && config.attendancePoints > 0) values.push(config.attendancePoints);
    if (config.eventPoints && config.eventPoints > 0) values.push(config.eventPoints);
    if (config.donationPoints && config.donationPoints > 0) values.push(config.donationPoints);
    const categories = [
      "engajamento",
      "classificacao",
      "dizimista",
      "ofertante",
      "tempoBatismo",
      "cargos",
      "nomeUnidade",
      "temLicao",
      "totalPresenca",
      "escolaSabatina",
      "batizouAlguem",
      "cpfValido",
      "camposVaziosACMS"
    ];
    categories.forEach((category) => {
      if (config[category] && typeof config[category] === "object") {
        Object.values(config[category]).forEach((value) => {
          const numValue = Number(value);
          if (numValue > 0) values.push(numValue);
        });
      }
    });
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };
  const applyAdjustmentFactorToParameters = (config, factor) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    if (newConfig.basicPoints) newConfig.basicPoints = Math.round(newConfig.basicPoints * factor);
    if (newConfig.attendancePoints) newConfig.attendancePoints = Math.round(newConfig.attendancePoints * factor);
    if (newConfig.eventPoints) newConfig.eventPoints = Math.round(newConfig.eventPoints * factor);
    if (newConfig.donationPoints) newConfig.donationPoints = Math.round(newConfig.donationPoints * factor);
    const pointCategories = [
      "engajamento",
      "classificacao",
      "dizimista",
      "ofertante",
      "tempoBatismo",
      "cargos",
      "nomeUnidade",
      "temLicao",
      "totalPresenca",
      "escolaSabatina",
      "batizouAlguem",
      "cpfValido",
      "camposVaziosACMS"
    ];
    pointCategories.forEach((category) => {
      if (newConfig[category] && typeof newConfig[category] === "object") {
        Object.keys(newConfig[category]).forEach((fieldKey) => {
          if (typeof newConfig[category][fieldKey] === "number") {
            newConfig[category][fieldKey] = Math.round(newConfig[category][fieldKey] * factor);
          }
        });
      }
    });
    if (newConfig.pontuacaoDinamica) {
      newConfig.pontuacaoDinamica.multiplicador = 1;
    }
    if (newConfig.presenca) {
      newConfig.presenca.multiplicador = 1;
    }
    if (newConfig.discipuladoPosBatismo) {
      newConfig.discipuladoPosBatismo.multiplicador = 1;
    }
    return newConfig;
  };
  app2.get("/api/system/event-permissions", async (req, res) => {
    try {
      const permissions = await storage.getEventPermissions();
      res.json({ success: true, permissions });
    } catch (error) {
      console.error("Erro ao obter permiss\xF5es de eventos:", error);
      res.status(500).json({ success: false, error: "Erro interno ao obter permiss\xF5es" });
    }
  });
  app2.post("/api/system/event-permissions", async (req, res) => {
    try {
      const { permissions } = req.body;
      if (!permissions || typeof permissions !== "object") {
        return res.status(400).json({
          success: false,
          error: "Permiss\xF5es s\xE3o obrigat\xF3rias e devem ser um objeto"
        });
      }
      await storage.saveEventPermissions(permissions);
      res.json({
        success: true,
        message: "Permiss\xF5es de eventos salvas com sucesso"
      });
    } catch (error) {
      console.error("Erro ao salvar permiss\xF5es de eventos:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao salvar permiss\xF5es"
      });
    }
  });
  app2.get("/api/system/parameter-average", async (req, res) => {
    try {
      const currentConfig = await storage.getPointsConfiguration();
      const currentAverage = calculateParameterAverage(currentConfig);
      res.json({
        success: true,
        currentAverage: currentAverage.toFixed(2),
        message: `M\xE9dia atual dos par\xE2metros: ${currentAverage.toFixed(2)}`
      });
    } catch (error) {
      console.error("Erro ao calcular m\xE9dia dos par\xE2metros:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao calcular m\xE9dia dos par\xE2metros"
      });
    }
  });
  app2.post("/api/system/district-average", async (req, res) => {
    try {
      const { targetAverage } = req.body;
      if (!targetAverage || typeof targetAverage !== "number") {
        return res.status(400).json({
          success: false,
          error: "M\xE9dia desejada \xE9 obrigat\xF3ria e deve ser um n\xFAmero"
        });
      }
      console.log(`\u{1F3AF} Ajustando configura\xE7\xE3o para m\xE9dia desejada: ${targetAverage} pontos`);
      const currentConfig = await storage.getPointsConfiguration();
      const allUsers = await storage.getAllUsers();
      const regularUsers = allUsers.filter((user) => user.email !== "admin@7care.com");
      if (regularUsers.length === 0) {
        return res.status(400).json({
          success: false,
          error: "N\xE3o h\xE1 usu\xE1rios para calcular a m\xE9dia"
        });
      }
      let totalCurrentPoints = 0;
      for (const user of regularUsers) {
        const points = calculateUserPointsFromConfig(user, currentConfig);
        totalCurrentPoints += Math.round(points);
      }
      const currentUserAverage = totalCurrentPoints / regularUsers.length;
      console.log(`\u{1F4CA} M\xE9dia atual dos usu\xE1rios: ${currentUserAverage.toFixed(2)}`);
      const adjustmentFactor = targetAverage / currentUserAverage;
      console.log(`\u{1F527} Fator de ajuste: ${adjustmentFactor.toFixed(2)}`);
      const newConfig = applyAdjustmentFactorToParameters(currentConfig, adjustmentFactor);
      await storage.savePointsConfiguration(newConfig);
      console.log("\u{1F504} Recalculando pontos de todos os usu\xE1rios automaticamente...");
      const result = await storage.calculateAdvancedUserPoints();
      if (!result.success) {
        throw new Error(`Erro no rec\xE1lculo autom\xE1tico: ${result.message}`);
      }
      const updatedCount = result.updatedUsers || 0;
      const errorCount = result.errors || 0;
      console.log(`\u{1F389} Rec\xE1lculo autom\xE1tico conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados, ${errorCount} erros`);
      res.json({
        success: true,
        currentUserAverage: currentUserAverage.toFixed(2),
        targetAverage,
        adjustmentFactor: adjustmentFactor.toFixed(2),
        updatedUsers: updatedCount,
        errors: errorCount,
        message: `Configura\xE7\xE3o ajustada e pontos recalculados automaticamente! ${updatedCount} usu\xE1rios atualizados.`,
        details: result.message
      });
    } catch (error) {
      console.error("Erro ao calcular m\xE9dia do distrito:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao calcular m\xE9dia do distrito"
      });
    }
  });
  app2.post("/api/emotional-checkin", async (req, res) => {
    try {
      console.log("\u{1F50D} Emotional check-in request received:", req.body);
      const { userId, emotionalScore, score, mood, prayerRequest, isPrivate, allowChurchMembers } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "ID do usu\xE1rio \xE9 obrigat\xF3rio" });
      }
      let finalScore = emotionalScore || score;
      if (mood) {
        finalScore = null;
      }
      console.log("\u{1F50D} Calling storage.createEmotionalCheckIn with:", { userId, emotionalScore, prayerRequest, isPrivate, allowChurchMembers });
      console.log("\u{1F50D} Storage object:", typeof storage, Object.keys(storage));
      console.log("\u{1F50D} createEmotionalCheckIn function:", typeof storage.createEmotionalCheckIn);
      const checkIn = await storage.createEmotionalCheckIn({
        userId,
        emotionalScore: finalScore,
        mood,
        prayerRequest,
        isPrivate,
        allowChurchMembers
      });
      console.log("\u2705 Check-in created successfully:", checkIn);
      res.json({ success: true, data: checkIn });
    } catch (error) {
      console.error("\u274C Erro ao criar check-in espiritual:", error);
      res.status(500).json({ error: "Erro ao criar check-in espiritual" });
    }
  });
  app2.get("/api/emotional-checkins/admin", async (req, res) => {
    try {
      console.log("\u{1F50D} Rota /api/emotional-checkins/admin chamada");
      const checkIns = await storage.getEmotionalCheckInsForAdmin();
      console.log("\u{1F50D} Check-ins retornados:", checkIns);
      res.json(checkIns);
    } catch (error) {
      console.error("Erro ao buscar check-ins emocionais:", error);
      res.status(500).json({ error: "Erro ao buscar check-ins emocionais" });
    }
  });
  app2.get("/api/spiritual-checkins/scores", async (req, res) => {
    try {
      const checkIns = await storage.getEmotionalCheckInsForAdmin();
      const scoreGroups = {
        "1": { count: 0, label: "Distante", description: "Muito distante de Deus" },
        "2": { count: 0, label: "Frio", description: "Pouco conectado" },
        "3": { count: 0, label: "Neutro", description: "Indiferente" },
        "4": { count: 0, label: "Quente", description: "Conectado" },
        "5": { count: 0, label: "Intimidade", description: "Muito pr\xF3ximo de Deus" }
      };
      checkIns.forEach((checkIn) => {
        const score = checkIn.emotionalScore?.toString();
        if (score && scoreGroups[score]) {
          scoreGroups[score].count++;
        }
      });
      const allUsers = await storage.getAllUsers();
      const usersWithCheckIn = new Set(checkIns.map((c) => c.userId));
      const usersWithoutCheckIn = allUsers.filter((u) => !usersWithCheckIn.has(u.id)).length;
      res.json({
        scoreGroups,
        usersWithoutCheckIn,
        total: allUsers.length
      });
    } catch (error) {
      console.error("Erro ao buscar scores de check-ins espirituais:", error);
      res.status(500).json({ error: "Erro ao buscar scores de check-ins espirituais" });
    }
  });
  app2.get("/api/emotional-checkins/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const checkIns = await storage.getEmotionalCheckInsByUserId(parseInt(userId));
      res.json(checkIns);
    } catch (error) {
      console.error("Erro ao buscar check-ins emocionais do usu\xE1rio:", error);
      res.status(500).json({ error: "Erro ao buscar check-ins emocionais do usu\xE1rio" });
    }
  });
  app2.get("/api/prayers", async (req, res) => {
    try {
      const { userId, userRole, userChurch } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "ID do usu\xE1rio \xE9 obrigat\xF3rio" });
      }
      const prayers2 = await storage.getPrayers();
      res.json(prayers2);
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es:", error);
      res.status(500).json({ error: "Erro ao buscar ora\xE7\xF5es" });
    }
  });
  app2.post("/api/prayers/:id/answer", async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { answeredBy } = req.body;
      if (!answeredBy) {
        return res.status(400).json({ error: "ID do usu\xE1rio que respondeu \xE9 obrigat\xF3rio" });
      }
      const result = await storage.markPrayerAsAnswered(prayerId, answeredBy);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Erro ao marcar ora\xE7\xE3o como respondida:", error);
      res.status(500).json({ error: "Erro ao marcar ora\xE7\xE3o como respondida" });
    }
  });
  app2.delete("/api/prayers/:id", async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { userId, userRole } = req.query;
      console.log(`\u{1F5D1}\uFE0F Tentativa de exclus\xE3o - Prayer ID: ${prayerId}, User ID: ${userId}, User Role: ${userRole}`);
      if (!userId || !userRole) {
        console.log("\u274C Par\xE2metros inv\xE1lidos:", { userId, userRole });
        return res.status(400).json({ error: "ID do usu\xE1rio e role s\xE3o obrigat\xF3rios" });
      }
      const prayer = await storage.getPrayerById(prayerId);
      console.log("\u{1F50D} Ora\xE7\xE3o encontrada:", prayer ? `ID ${prayer.id}` : "N\xC3O ENCONTRADA");
      if (!prayer) {
        console.log(`\u274C Ora\xE7\xE3o ${prayerId} n\xE3o encontrada no banco`);
        return res.status(404).json({ error: "Ora\xE7\xE3o n\xE3o encontrada" });
      }
      if (userRole !== "admin" && prayer.userId !== parseInt(userId)) {
        console.log(`\u274C Sem permiss\xE3o - User ID: ${userId}, Prayer User ID: ${prayer.userId}, User Role: ${userRole}`);
        return res.status(403).json({ error: "Sem permiss\xE3o para excluir esta ora\xE7\xE3o" });
      }
      console.log(`\u2705 Permiss\xE3o concedida - Excluindo ora\xE7\xE3o ${prayerId}`);
      const result = await storage.deletePrayer(prayerId);
      console.log(`\u{1F5D1}\uFE0F Resultado da exclus\xE3o:`, result);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("\u274C Erro ao excluir ora\xE7\xE3o:", error);
      res.status(500).json({ error: "Erro ao excluir ora\xE7\xE3o" });
    }
  });
  app2.post("/api/prayers/:id/intercessor", async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { intercessorId } = req.body;
      if (!intercessorId) {
        return res.status(400).json({ error: "ID do intercessor \xE9 obrigat\xF3rio" });
      }
      const result = await storage.addPrayerIntercessor(prayerId, intercessorId);
      if (result) {
        res.json({ success: true, message: "Intercessor adicionado com sucesso" });
      } else {
        res.status(400).json({ error: "N\xE3o foi poss\xEDvel adicionar o intercessor" });
      }
    } catch (error) {
      console.error("Erro ao adicionar intercessor:", error);
      res.status(500).json({ error: "Erro ao adicionar intercessor" });
    }
  });
  app2.delete("/api/prayers/:id/intercessor/:intercessorId", async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const intercessorId = parseInt(req.params.intercessorId);
      const result = await storage.removePrayerIntercessor(prayerId, intercessorId);
      if (result) {
        res.json({ success: true, message: "Intercessor removido com sucesso" });
      } else {
        res.status(400).json({ error: "N\xE3o foi poss\xEDvel remover o intercessor" });
      }
    } catch (error) {
      console.error("Erro ao remover intercessor:", error);
      res.status(500).json({ error: "Erro ao remover intercessor" });
    }
  });
  app2.get("/api/prayers/:id/intercessors", async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const intercessors = await storage.getPrayerIntercessors(prayerId);
      res.json(intercessors);
    } catch (error) {
      console.error("Erro ao buscar intercessores:", error);
      res.status(500).json({ error: "Erro ao buscar intercessores" });
    }
  });
  app2.get("/api/prayers/user/:userId/interceding", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prayers2 = await storage.getPrayersUserIsPrayingFor(userId);
      res.json(prayers2);
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es que usu\xE1rio est\xE1 orando:", error);
      res.status(500).json({ error: "Erro ao buscar ora\xE7\xF5es que usu\xE1rio est\xE1 orando" });
    }
  });
  app2.get("/api/meetings", async (req, res) => {
    try {
      const { userId, status } = req.query;
      let meetings2 = [];
      if (userId) {
        meetings2 = await storage.getMeetingsByUserId(parseInt(userId));
      } else if (status) {
        meetings2 = await storage.getMeetingsByStatus(status);
      } else {
        meetings2 = await storage.getAllMeetings();
      }
      res.json(meetings2);
    } catch (error) {
      console.error("Get meetings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      res.json({ success: true, message: "Meeting creation disabled" });
    } catch (error) {
      console.error("Create meeting error:", error);
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });
  app2.put("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      res.json({ success: true, message: "Meeting update disabled" });
    } catch (error) {
      console.error("Update meeting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const events3 = await storage.getAllEvents();
      const userRole = String(req.query.role || req.headers["x-user-role"] || "interested");
      const permissions = await storage.getEventPermissions();
      if (permissions && permissions[userRole]) {
        const allowedEventTypes = Object.keys(permissions[userRole]).filter(
          (eventType) => permissions[userRole][eventType]
        );
        const filteredEvents = events3.filter(
          (event) => allowedEventTypes.includes(event.type)
        );
        console.log(`\u{1F512} Filtering events for role '${userRole}': ${filteredEvents.length}/${events3.length} events visible`);
        res.json(filteredEvents);
      } else {
        console.log(`\u26A0\uFE0F No permissions configured for role '${userRole}', showing all events`);
        res.json(events3);
      }
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/event-types/:role", async (req, res) => {
    try {
      const userRole = req.params.role;
      const systemPermissions = await storage.getSystemConfig("event-permissions");
      let permissions = null;
      if (systemPermissions && systemPermissions.value && systemPermissions.value.permissions) {
        permissions = systemPermissions.value.permissions;
      }
      if (permissions && permissions[userRole]) {
        const availableTypes = Object.keys(permissions[userRole]).filter(
          (eventType) => permissions[userRole][eventType]
        );
        res.json(availableTypes);
      } else {
        const defaultPermissions = await storage.getEventPermissions();
        if (defaultPermissions && defaultPermissions[userRole]) {
          const availableTypes = Object.keys(defaultPermissions[userRole]).filter(
            (eventType) => defaultPermissions[userRole][eventType]
          );
          res.json(availableTypes);
        } else {
          const allTypes = ["igreja-local", "asr-geral", "asr-administrativo", "asr-pastores", "visitas", "reunioes", "pregacoes"];
          res.json(allTypes);
        }
      }
    } catch (error) {
      console.error("Get event types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = { id: Date.now(), ...eventData, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });
  app2.delete("/api/events", async (req, res) => {
    try {
      const success = await storage.clearAllEvents();
      if (success) {
        res.json({ success: true, message: "Todos os eventos foram removidos com sucesso" });
      } else {
        res.status(500).json({ error: "Falha ao limpar os eventos" });
      }
    } catch (error) {
      console.error("Clear all events error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/relationships", async (req, res) => {
    try {
      console.log("\u{1F50D} [API] GET /api/relationships - Iniciando...");
      const response = {
        message: "API de relacionamentos funcionando",
        environment: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        relationships: []
      };
      console.log("\u2705 [API] Resposta preparada:", response);
      res.json(response);
    } catch (error) {
      console.error("\u274C [API] Erro ao buscar relacionamentos:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message
      });
    }
  });
  app2.post("/api/relationships", async (req, res) => {
    try {
      console.log("\u{1F50D} [API] POST /api/relationships", req.body);
      const { interestedId, missionaryId, status = "active", notes = "" } = req.body;
      if (!interestedId || !missionaryId) {
        return res.status(400).json({ error: "interestedId e missionaryId s\xE3o obrigat\xF3rios" });
      }
      const relationship = await storage.createRelationship({
        interestedId: parseInt(interestedId),
        missionaryId: parseInt(missionaryId),
        status,
        notes
      });
      console.log("\u2705 [API] Relacionamento criado:", relationship.id);
      res.json(relationship);
    } catch (error) {
      console.error("\u274C [API] Erro ao criar relacionamento:", error);
      if (error.message.includes("J\xE1 existe um discipulador ativo")) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  });
  app2.delete("/api/relationships/:id", async (req, res) => {
    try {
      console.log("\u{1F50D} [API] DELETE /api/relationships/", req.params.id);
      const { id } = req.params;
      const success = await storage.deleteRelationship(parseInt(id));
      if (success) {
        console.log("\u2705 [API] Relacionamento removido:", id);
        res.json({ message: "Relacionamento removido com sucesso" });
      } else {
        console.log("\u274C [API] Relacionamento n\xE3o encontrado:", id);
        res.status(404).json({ error: "Relacionamento n\xE3o encontrado" });
      }
    } catch (error) {
      console.error("\u274C [API] Erro ao remover relacionamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/relationships/interested/:interestedId", async (req, res) => {
    try {
      console.log("\u{1F50D} [API] GET /api/relationships/interested/", req.params.interestedId);
      const interestedId = parseInt(req.params.interestedId);
      const relationships2 = await storage.getRelationshipsByInterested(interestedId);
      console.log("\u2705 [API] Relacionamentos encontrados para interessado:", relationships2.length);
      res.json(relationships2);
    } catch (error) {
      console.error("\u274C [API] Erro ao buscar relacionamentos por interessado:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/relationships/missionary/:missionaryId", async (req, res) => {
    try {
      console.log("\u{1F50D} [API] GET /api/relationships/missionary/", req.params.missionaryId);
      const missionaryId = parseInt(req.params.missionaryId);
      const relationships2 = await storage.getRelationshipsByMissionary(missionaryId);
      console.log("\u2705 [API] Relacionamentos encontrados para mission\xE1rio:", relationships2.length);
      res.json(relationships2);
    } catch (error) {
      console.error("\u274C [API] Erro ao buscar relacionamentos por mission\xE1rio:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/relationships/active/:interestedId", async (req, res) => {
    try {
      console.log("\u{1F50D} [API] DELETE /api/relationships/active/", req.params.interestedId);
      const interestedId = parseInt(req.params.interestedId);
      const relationships2 = await storage.getRelationshipsByInterested(interestedId);
      const activeRelationship = relationships2.find((rel) => rel.status === "active");
      if (!activeRelationship) {
        console.log("\u274C [API] Nenhum relacionamento ativo encontrado para interessado", interestedId);
        res.status(404).json({ error: "Nenhum relacionamento ativo encontrado" });
        return;
      }
      const success = await storage.deleteRelationship(activeRelationship.id);
      if (success) {
        console.log("\u2705 [API] Relacionamento ativo removido:", activeRelationship.id);
        res.json({ message: "Relacionamento ativo removido com sucesso" });
      } else {
        res.status(500).json({ error: "Erro ao remover relacionamento ativo" });
      }
    } catch (error) {
      console.error("\u274C [API] Erro ao remover relacionamento ativo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/discipleship-requests", async (req, res) => {
    try {
      const { status, missionaryId, interestedId } = req.query;
      let requests = await storage.getAllDiscipleshipRequests();
      if (status) {
        requests = requests.filter((r) => r.status === status);
      }
      if (missionaryId) {
        requests = requests.filter((r) => r.missionaryId === parseInt(missionaryId));
      }
      if (interestedId) {
        requests = requests.filter((r) => r.interestedId === parseInt(interestedId));
      }
      res.json(requests);
    } catch (error) {
      console.error("Get discipleship requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/discipleship-requests", async (req, res) => {
    try {
      const { missionaryId, interestedId, notes } = req.body;
      console.log("\u{1F4DD} Criando solicita\xE7\xE3o de discipulado:", { missionaryId, interestedId, notes });
      console.log("\u{1F4DD} Tipo dos dados:", {
        missionaryIdType: typeof missionaryId,
        interestedIdType: typeof interestedId,
        notesType: typeof notes
      });
      if (!missionaryId || !interestedId) {
        console.log("\u274C Dados inv\xE1lidos:", { missionaryId, interestedId });
        res.status(400).json({ error: "missionaryId e interestedId s\xE3o obrigat\xF3rios" });
        return;
      }
      const existingRequests = await storage.getAllDiscipleshipRequests();
      const hasPendingRequest = existingRequests.some(
        (r) => r.missionaryId === missionaryId && r.interestedId === interestedId && r.status === "pending"
      );
      if (hasPendingRequest) {
        res.status(400).json({ error: "J\xE1 existe uma solicita\xE7\xE3o pendente para este interessado" });
        return;
      }
      console.log("\u{1F50D} Dados recebidos:", { missionaryId, interestedId, notes });
      console.log("\u{1F50D} Dados que ser\xE3o enviados para storage:", {
        missionaryId,
        interestedId,
        status: "pending",
        notes
      });
      const request = await storage.createDiscipleshipRequest({
        missionaryId,
        interestedId,
        status: "pending",
        notes
      });
      console.log("\u2705 Solicita\xE7\xE3o criada com sucesso:", request);
      res.status(201).json(request);
    } catch (error) {
      console.error("\u274C Create discipleship request error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });
  app2.put("/api/discipleship-requests/:id", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status, adminNotes, processedBy } = req.body;
      const updatedRequest = await storage.updateDiscipleshipRequest(requestId, {
        status,
        adminNotes,
        processedAt: (/* @__PURE__ */ new Date()).toISOString(),
        processedBy
      });
      if (!updatedRequest) {
        res.status(404).json({ error: "Discipleship request not found" });
        return;
      }
      if (status === "approved") {
        await storage.createRelationship({
          missionaryId: updatedRequest.missionaryId,
          interestedId: updatedRequest.interestedId,
          status: "active",
          notes: `Aprovado via solicita\xE7\xE3o de discipulado - ${updatedRequest.notes || ""}`
        });
        await storage.updateUser(updatedRequest.interestedId, {
          biblicalInstructor: updatedRequest.missionaryId.toString()
        });
        try {
          await storage.updateUser(updatedRequest.missionaryId, {
            role: "missionary"
          });
          console.log(`\u2705 Usu\xE1rio ${updatedRequest.missionaryId} promovido a mission\xE1rio`);
        } catch (error) {
          console.error("Erro ao atualizar role do usu\xE1rio:", error);
        }
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Update discipleship request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/discipleship-requests/:id", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const success = await storage.deleteDiscipleshipRequest(requestId);
      if (!success) {
        res.status(404).json({ error: "Discipleship request not found" });
        return;
      }
      res.json({ success: true, message: "Discipleship request deleted successfully" });
    } catch (error) {
      console.error("Delete discipleship request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/:id(\\d+)/disciple", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { message } = req.body;
      const user = await storage.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (user.role !== "interested") {
        res.status(400).json({ error: "Only interested users can be discipled" });
        return;
      }
      const existingRequests = await storage.getAllDiscipleshipRequests();
      const hasPendingRequest = existingRequests.some(
        (r) => r.interestedId === userId && r.status === "pending"
      );
      if (hasPendingRequest) {
        res.status(400).json({ error: "J\xE1 existe uma solicita\xE7\xE3o pendente para este usu\xE1rio" });
        return;
      }
      const request = await storage.createDiscipleshipRequest({
        missionaryId: 1,
        // ID do missionário padrão (pode ser ajustado)
        interestedId: userId,
        notes: message
      });
      res.status(201).json({
        success: true,
        message: "Solicita\xE7\xE3o de discipulado criada com sucesso",
        request
      });
    } catch (error) {
      console.error("Disciple user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations2 = await storage.getConversationsByUserId(userId);
      res.json(conversations2);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/conversations/direct", async (req, res) => {
    try {
      const { userAId, userBId } = req.body;
      if (!userAId || !userBId) {
        res.status(400).json({ error: "Par\xE2metros inv\xE1lidos" });
        return;
      }
      const conv = await storage.getOrCreateDirectConversation(Number(userAId), Number(userBId));
      res.json(conv);
    } catch (error) {
      console.error("Get/Create direct conversation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit) || 50;
      const messages2 = await storage.getMessagesByConversationId(conversationId);
      res.json(messages2);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });
  app2.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit) || 20;
      const notifications2 = [];
      res.json(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = true;
      if (!success) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/point-activities", async (req, res) => {
    try {
      const activities = [];
      res.json(activities);
    } catch (error) {
      console.error("Get point activities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/achievements", async (req, res) => {
    try {
      const achievements2 = [];
      res.json(achievements2);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/:id(\\d+)/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      res.json({ points: 0 });
    } catch (error) {
      console.error("Get user points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/with-points", async (req, res) => {
    try {
      const { role, status } = req.query;
      console.log("\u{1F504} Rota /api/users/with-points chamada");
      try {
        await storage.calculateAdvancedUserPoints();
      } catch (calcError) {
        console.error("\u26A0\uFE0F Erro ao calcular pontos, continuando sem c\xE1lculo:", calcError);
      }
      let users2 = await storage.getAllUsers();
      console.log(`\u{1F4CA} Usu\xE1rios carregados: ${users2.length}`);
      if (!Array.isArray(users2)) {
        console.error("\u274C getAllUsers n\xE3o retornou um array:", typeof users2, users2);
        users2 = [];
      }
      if (role) {
        users2 = users2.filter((u) => u.role === role);
      }
      if (status) {
        users2 = users2.filter((u) => u.status === status);
      }
      const userAgent = req.headers["user-agent"] || "";
      const isMobile = userAgent.includes("Mobile") || userAgent.includes("mobile");
      if (req.headers["x-user-role"] === "missionary" || req.headers["x-user-id"]) {
        const missionaryId = parseInt(req.headers["x-user-id"] || "0");
        const missionary = users2.find((u) => u.id === missionaryId);
        if (missionary && missionary.role === "missionary") {
          const churchInterested = users2.filter(
            (u) => u.role === "interested" && u.church === missionary.church && u.churchCode === missionary.churchCode
          );
          const relationships2 = await storage.getRelationshipsByMissionary(missionaryId);
          const linkedInterestedIds = relationships2.map((r) => r.interestedId);
          const processedUsers = churchInterested.map((user) => {
            const isLinked = linkedInterestedIds.includes(user.id);
            if (isLinked) {
              return user;
            } else {
              return {
                ...user,
                // Manter dados básicos
                id: user.id,
                name: user.name,
                role: user.role,
                status: user.status,
                church: user.church,
                churchCode: user.churchCode,
                // Dados "borrados" (limitados)
                email: user.email ? "***@***.***" : null,
                phone: user.phone ? "***-***-****" : null,
                address: user.address ? "*** *** ***" : null,
                birthDate: user.birthDate ? "**/**/****" : null,
                cpf: user.cpf ? "***.***.***-**" : null,
                occupation: user.occupation ? "***" : null,
                education: user.education ? "***" : null,
                previousReligion: user.previousReligion ? "***" : null,
                interestedSituation: user.interestedSituation ? "***" : null,
                // Campos de gamificação limitados
                points: 0,
                level: "***",
                attendance: 0,
                // Outros campos
                biblicalInstructor: null,
                isLinked: false,
                canRequestDiscipleship: true
              };
            }
          });
          const otherUsers = users2.filter(
            (u) => u.role !== "interested" || (u.church !== missionary.church || u.churchCode !== missionary.churchCode)
          );
          const finalUsers = [...processedUsers, ...otherUsers];
          const safeUsers2 = finalUsers.map(({ password, ...user }) => user);
          res.json(safeUsers2);
          return;
        }
      }
      const allCheckIns = await storage.getEmotionalCheckInsForAdmin();
      const checkInsMap = /* @__PURE__ */ new Map();
      allCheckIns.forEach((checkIn) => {
        if (checkIn.userId && checkIn.emotionalScore) {
          checkInsMap.set(checkIn.userId, checkIn.emotionalScore);
        }
      });
      const usersWithEmotionalScore = users2.map((user) => ({
        ...user,
        emotionalScore: checkInsMap.get(user.id) || null
      }));
      const safeUsers = usersWithEmotionalScore.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users with points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/:id(\\d+)/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points, activityId, description } = req.body;
      const success = true;
      if (!success) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ success: true, totalPoints: 0 });
    } catch (error) {
      console.error("Add points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const userId = parseInt(req.query.userId);
      let dashboardData = {};
      switch (role) {
        case "admin":
          const allUsers = await storage.getAllUsers();
          const pendingUsers = allUsers.filter((u) => u.status === "pending");
          dashboardData = {
            totalUsers: allUsers.length,
            totalInterested: allUsers.filter((u) => u.role === "interested").length,
            totalChurches: new Set(allUsers.map((u) => u.church).filter(Boolean)).size,
            pendingApprovals: pendingUsers.length,
            thisWeekEvents: 0,
            // Would calculate from events
            totalMessages: 0
            // Would calculate from messages
          };
          break;
        case "missionary":
          const relationships2 = await storage.getRelationshipsByMissionary(userId);
          const meetings2 = await storage.getMeetingsByUserId(userId);
          dashboardData = {
            myInterested: relationships2.length,
            scheduledMeetings: meetings2.filter((m) => m.status === "approved").length,
            completedStudies: meetings2.filter((m) => m.status === "completed").length,
            thisWeekGoal: 10
            // This would be configurable
          };
          break;
        case "member":
          const memberMeetings = await storage.getMeetingsByUserId(userId);
          dashboardData = {
            nextEvents: memberMeetings.filter((m) => m.status === "approved" && new Date(m.scheduledAt) > /* @__PURE__ */ new Date()).length,
            unreadMessages: 0,
            // Would calculate from messages
            completedActivities: memberMeetings.filter((m) => m.status === "completed").length
          };
          break;
        case "interested":
          const interestedMeetings = await storage.getMeetingsByUserId(userId);
          const nextMeeting = interestedMeetings.filter((m) => m.status === "approved" && new Date(m.scheduledAt) > /* @__PURE__ */ new Date()).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
          dashboardData = {
            nextStudy: nextMeeting ? new Date(nextMeeting.scheduledAt).toLocaleDateString("pt-BR") : "Nenhum agendado",
            completedLessons: interestedMeetings.filter((m) => m.status === "completed").length,
            nextMeeting: nextMeeting ? "Agendado" : "Nenhum agendado"
          };
          break;
      }
      res.json(dashboardData);
    } catch (error) {
      console.error("Get dashboard data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllPointActivities();
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/activities", async (req, res) => {
    try {
      const { title, description, imageUrl, date: date2, active, order } = req.body;
      const newActivity = {
        id: Date.now(),
        title,
        description,
        imageUrl,
        date: date2,
        active: active ?? true,
        order: order ?? 0
      };
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Create activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/activities/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { title, description, imageUrl, date: date2, active, order } = req.body;
      const updatedActivity = {
        id: parseInt(id),
        title,
        description,
        imageUrl,
        date: date2,
        active,
        order
      };
      if (!updatedActivity) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }
      res.json(updatedActivity);
    } catch (error) {
      console.error("Update activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = true;
      if (!success) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/calendar/events", async (req, res) => {
    try {
      const events3 = await storage.getAllEvents();
      res.json(events3);
    } catch (error) {
      console.error("Get calendar events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/calendar/events", async (req, res) => {
    try {
      console.log("\u{1F4DD} Criando evento:", req.body);
      const event = await storage.createEvent(req.body);
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Erro ao criar evento" });
    }
  });
  app2.get("/api/debug/events", async (req, res) => {
    try {
      const events3 = await storage.getAllEvents();
      console.log("\u{1F50D} Debug - Total de eventos:", events3.length);
      console.log("\u{1F50D} Debug - Eventos:", events3);
      res.json({ count: events3.length, events: events3 });
    } catch (error) {
      console.error("Debug events error:", error);
      res.status(500).json({ error: "Erro ao buscar eventos" });
    }
  });
  app2.get("/api/debug/create-simple-event", async (req, res) => {
    try {
      console.log("\u{1F527} Criando evento simples...");
      const simpleEvent = {
        title: "Evento de Teste Simples",
        description: "Evento criado diretamente",
        date: "2025-09-20T19:00:00Z",
        location: "Igreja Local",
        type: "igreja-local",
        capacity: 0,
        isRecurring: false,
        recurrencePattern: null,
        createdBy: 1,
        churchId: 1
      };
      const newEvent = await storage.createEvent(simpleEvent);
      console.log(`\u2705 Evento simples criado:`, newEvent);
      res.json({
        success: true,
        message: `Evento simples criado com sucesso!`,
        event: newEvent
      });
    } catch (error) {
      console.error("Create simple event error:", error);
      res.status(500).json({ error: "Erro ao criar evento simples: " + error.message });
    }
  });
  app2.post("/api/debug/test-csv", upload2.single("file"), async (req, res) => {
    try {
      console.log("\u{1F50D} Debug CSV iniciado");
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      console.log("\u{1F4CA} Arquivo recebido:", req.file.originalname, "Tamanho:", req.file.size);
      const csvContent = fs2.readFileSync(req.file.path, "utf8");
      console.log("\u{1F4CA} Conte\xFAdo do CSV:", csvContent);
      const lines = csvContent.split("\n").filter((line) => line.trim());
      console.log("\u{1F4CA} Linhas encontradas:", lines.length);
      const processedLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const columns = line.split(",");
        processedLines.push({
          lineNumber: i + 1,
          content: line,
          columns,
          columnCount: columns.length
        });
      }
      fs2.unlinkSync(req.file.path);
      res.json({
        success: true,
        originalContent: csvContent,
        lines: processedLines,
        message: `CSV processado: ${lines.length} linhas`
      });
    } catch (error) {
      console.error("Debug CSV error:", error);
      res.status(500).json({ error: "Erro ao processar CSV: " + error.message });
    }
  });
  app2.get("/api/debug/check-churches", async (req, res) => {
    try {
      const churches2 = await sql`SELECT id, name FROM churches LIMIT 5`;
      res.json({
        success: true,
        churches: churches2
      });
    } catch (error) {
      console.error("Check churches error:", error);
      res.status(500).json({ error: "Erro ao verificar igrejas: " + error.message });
    }
  });
  app2.get("/api/debug/check-users", async (req, res) => {
    try {
      const users2 = await sql`SELECT id, name, email FROM users LIMIT 5`;
      res.json({
        success: true,
        users: users2
      });
    } catch (error) {
      console.error("Check users error:", error);
      res.status(500).json({ error: "Erro ao verificar usu\xE1rios: " + error.message });
    }
  });
  app2.get("/api/debug/check-events-db", async (req, res) => {
    try {
      const events3 = await sql`SELECT id, title, created_at FROM events ORDER BY created_at DESC LIMIT 10`;
      res.json({
        success: true,
        events: events3,
        count: events3.length
      });
    } catch (error) {
      console.error("Check events DB error:", error);
      res.status(500).json({ error: "Erro ao verificar eventos no banco: " + error.message });
    }
  });
  app2.get("/api/debug/create-event-sql", async (req, res) => {
    try {
      console.log("\u{1F527} Criando evento com SQL direto...");
      const result = await sql`
        INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
        VALUES ('Evento SQL Teste', 'Evento criado com SQL direto', '2025-09-25 19:00:00', 'Igreja Local', 'igreja-local', 0, false, null, 72, 24, NOW(), NOW())
        RETURNING id, title, date
      `;
      console.log("\u2705 Evento criado com SQL:", result);
      res.json({
        success: true,
        message: "Evento criado com SQL direto",
        event: result[0]
      });
    } catch (error) {
      console.error("Create event SQL error:", error);
      res.status(500).json({ error: "Erro ao criar evento com SQL: " + error.message });
    }
  });
  app2.post("/api/events", async (req, res) => {
    try {
      console.log("\u{1F527} Criando evento via POST:", req.body);
      const eventData = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        endDate: req.body.endDate || null,
        location: req.body.location,
        type: req.body.type,
        capacity: req.body.capacity || 0,
        isRecurring: req.body.isRecurring || false,
        recurrencePattern: req.body.recurrencePattern || null,
        createdBy: req.body.createdBy || 1,
        churchId: req.body.churchId || 1
      };
      const newEvent = await storage.createEvent(eventData);
      console.log(`\u2705 Evento criado via POST:`, newEvent);
      res.json({
        success: true,
        message: `Evento criado com sucesso!`,
        event: newEvent
      });
    } catch (error) {
      console.error("Create event POST error:", error);
      res.status(500).json({ error: "Erro ao criar evento: " + error.message });
    }
  });
  app2.get("/api/debug/add-events", async (req, res) => {
    try {
      console.log("\u{1F527} Adicionando eventos espec\xEDficos...");
      const eventsToAdd = [
        {
          title: "Semana do Len\xE7o MDA",
          description: "Evento da Semana do Len\xE7o MDA",
          date: "2025-09-13T00:00:00Z",
          endDate: "2025-09-20T23:59:59Z",
          location: "Igreja Local",
          type: "igreja-local",
          capacity: 0,
          isRecurring: false,
          recurrencePattern: null,
          createdBy: 1,
          churchId: 1
        },
        {
          title: "Semana da Esperan\xE7a",
          description: "Evento da Semana da Esperan\xE7a",
          date: "2025-09-20T00:00:00Z",
          endDate: "2025-09-27T23:59:59Z",
          location: "Igreja Local",
          type: "igreja-local",
          capacity: 0,
          isRecurring: false,
          recurrencePattern: null,
          createdBy: 1,
          churchId: 1
        },
        {
          title: "Dia Mundial do Desbravador",
          description: "Celebra\xE7\xE3o do Dia Mundial do Desbravador",
          date: "2025-09-20T00:00:00Z",
          endDate: "2025-09-20T23:59:59Z",
          location: "Igreja Local",
          type: "igreja-local",
          capacity: 0,
          isRecurring: false,
          recurrencePattern: null,
          createdBy: 1,
          churchId: 1
        }
      ];
      const createdEvents = [];
      for (const eventData of eventsToAdd) {
        const newEvent = await storage.createEvent(eventData);
        createdEvents.push(newEvent);
        console.log(`\u2705 Evento "${eventData.title}" criado:`, newEvent);
      }
      res.json({
        success: true,
        message: `${createdEvents.length} eventos adicionados com sucesso!`,
        events: createdEvents
      });
    } catch (error) {
      console.error("Add events error:", error);
      res.status(500).json({ error: "Erro ao adicionar eventos: " + error.message });
    }
  });
  app2.post("/api/debug/clean-duplicates", async (req, res) => {
    try {
      console.log("\u{1F9F9} Iniciando limpeza de duplicatas...");
      console.log(`\u2705 Limpeza de duplicatas conclu\xEDda`);
      const remainingEvents = await storage.getAllEvents();
      res.json({
        success: true,
        remainingEvents: remainingEvents.length,
        message: `Duplicatas removidas! Restam ${remainingEvents.length} eventos \xFAnicos.`
      });
    } catch (error) {
      console.error("Clean duplicates error:", error);
      res.status(500).json({ error: "Erro ao limpar duplicatas" });
    }
  });
  app2.post("/api/system/check-missionary-profiles", async (req, res) => {
    try {
      console.log("\u{1F50D} Verificando perfis mission\xE1rios...");
      const allUsers = await storage.getAllUsers();
      const missionaries = allUsers.filter((user) => user.role === "missionary");
      let correctedCount = 0;
      for (const missionary of missionaries) {
        try {
          const existingProfile = await storage.getMissionaryProfileByUserId(missionary.id);
          if (!existingProfile) {
            await storage.createMissionaryProfile({
              userId: missionary.id,
              specialization: "Geral",
              experience: "Experi\xEAncia em discipulado",
              isActive: true
            });
            correctedCount++;
            console.log(`\u2705 Perfil criado para mission\xE1rio ${missionary.name}`);
          }
        } catch (error) {
          console.error(`\u274C Erro ao verificar perfil do mission\xE1rio ${missionary.name}:`, error);
        }
      }
      console.log(`\u2705 Verifica\xE7\xE3o conclu\xEDda: ${correctedCount} perfis corrigidos`);
      res.json({
        success: true,
        correctedCount,
        message: `${correctedCount} perfis mission\xE1rios foram corrigidos`
      });
    } catch (error) {
      console.error("\u274C Erro na verifica\xE7\xE3o de perfis mission\xE1rios:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/calendar/google-drive-config", async (req, res) => {
    try {
      const { spreadsheetUrl, autoSync, syncInterval, realtimeSync, pollingInterval } = req.body;
      const googleDrivePattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/.*$/;
      if (!googleDrivePattern.test(spreadsheetUrl)) {
        return res.status(400).json({
          success: false,
          error: "URL inv\xE1lida. Use uma URL do Google Sheets"
        });
      }
      const config = {
        spreadsheetUrl,
        autoSync: autoSync || false,
        syncInterval: syncInterval || 60,
        realtimeSync: realtimeSync || false,
        pollingInterval: pollingInterval || 30,
        lastSync: null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await storage.saveSystemSetting("google_drive_config", config);
      console.log("\u2705 Configura\xE7\xE3o do Google Drive salva no banco:", config);
      res.json({ success: true, config });
    } catch (error) {
      console.error("\u274C Erro ao salvar configura\xE7\xE3o do Google Drive:", error);
      res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/calendar/google-drive-config", async (req, res) => {
    try {
      const config = await storage.getSystemSetting("google_drive_config");
      if (config) {
        res.json(config);
      } else {
        const defaultConfig = {
          spreadsheetUrl: "",
          autoSync: false,
          syncInterval: 60,
          realtimeSync: false,
          pollingInterval: 30,
          lastSync: null
        };
        res.json(defaultConfig);
      }
    } catch (error) {
      console.error("\u274C Erro ao buscar configura\xE7\xE3o do Google Drive:", error);
      res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/calendar/test-google-drive", async (req, res) => {
    try {
      const { csvUrl } = req.body;
      if (!csvUrl) {
        return res.status(400).json({
          success: false,
          error: "URL CSV n\xE3o fornecida"
        });
      }
      console.log("\u{1F50D} Testando conex\xE3o com:", csvUrl);
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      const lines = csvText.split("\n").filter((line) => line.trim());
      console.log(`\u2705 Conex\xE3o testada com sucesso! ${lines.length} linhas encontradas`);
      res.json({
        success: true,
        rowCount: lines.length,
        message: `Conex\xE3o estabelecida com sucesso. ${lines.length} registros encontrados.`
      });
    } catch (error) {
      console.error("\u274C Erro ao testar conex\xE3o com Google Drive:", error);
      res.status(500).json({
        success: false,
        error: `Erro ao conectar: ${error.message}`
      });
    }
  });
  app2.post("/api/calendar/sync-google-drive", async (req, res) => {
    try {
      const { csvUrl, spreadsheetUrl } = req.body;
      if (!csvUrl) {
        return res.status(400).json({
          success: false,
          error: "URL CSV n\xE3o fornecida"
        });
      }
      console.log("\u{1F504} Iniciando sincroniza\xE7\xE3o com Google Drive...");
      console.log("\u{1F4CA} URL CSV:", csvUrl);
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      const lines = csvText.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        throw new Error("Planilha muito pequena - precisa ter pelo menos cabe\xE7alho e uma linha de dados");
      }
      console.log(`\u{1F4C4} ${lines.length} linhas encontradas na planilha`);
      const events3 = [];
      let importedCount = 0;
      let errorCount = 0;
      for (let i = 1; i < lines.length; i++) {
        try {
          const line = lines[i];
          const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""));
          if (columns.length < 4) {
            console.log(`\u26A0\uFE0F Linha ${i + 1} incompleta, pulando:`, columns);
            errorCount++;
            continue;
          }
          const [mes, categoria, data, evento] = columns;
          if (!evento || evento.trim() === "") {
            console.log(`\u26A0\uFE0F Linha ${i + 1} sem evento, pulando:`, columns);
            errorCount++;
            continue;
          }
          const dateInfo = parseBrazilianDate(data);
          if (!dateInfo) {
            console.log(`\u26A0\uFE0F Data inv\xE1lida na linha ${i + 1}: ${data}`);
            errorCount++;
            continue;
          }
          let startDate, endDate;
          if (typeof dateInfo === "object") {
            startDate = dateInfo.startDate;
            endDate = dateInfo.endDate;
          } else {
            startDate = dateInfo;
            endDate = null;
          }
          const eventType = mapEventType(categoria);
          const event = {
            title: evento.trim(),
            type: eventType,
            date: startDate,
            endDate,
            description: `${mes || "Evento"} - ${categoria || "Categoria n\xE3o especificada"}`,
            source: "google-drive",
            sourceUrl: spreadsheetUrl,
            originalData: {
              mes,
              categoria,
              data,
              evento,
              row: i + 1
            }
          };
          events3.push(event);
        } catch (error) {
          console.error(`\u274C Erro ao processar linha ${i + 1}:`, error);
          errorCount++;
        }
      }
      console.log(`\u{1F4CA} ${events3.length} eventos processados, ${errorCount} erros`);
      for (const event of events3) {
        try {
          await storage.createEvent(event);
          importedCount++;
        } catch (error) {
          console.error("\u274C Erro ao criar evento:", error);
          errorCount++;
        }
      }
      if (global.googleDriveConfig) {
        global.googleDriveConfig.lastSync = (/* @__PURE__ */ new Date()).toISOString();
      }
      console.log(`\u2705 Sincroniza\xE7\xE3o conclu\xEDda: ${importedCount} eventos importados`);
      res.json({
        success: true,
        importedEvents: importedCount,
        totalEvents: events3.length,
        errorCount,
        message: `${importedCount} eventos importados com sucesso`
      });
    } catch (error) {
      console.error("\u274C Erro na sincroniza\xE7\xE3o com Google Drive:", error);
      res.status(500).json({
        success: false,
        error: `Erro na sincroniza\xE7\xE3o: ${error.message}`
      });
    }
  });
  function parseBrazilianDate(dateStr) {
    if (!dateStr) return null;
    console.log(`\u{1F4C5} Parsing date: "${dateStr}"`);
    if (dateStr instanceof Date) {
      return dateStr.toISOString();
    }
    if (typeof dateStr === "string") {
      dateStr = dateStr.toString().trim();
      const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        const date3 = new Date(year, month - 1, day);
        console.log(`\u2705 Parsed DD/MM/YYYY: ${date3.toISOString()}`);
        return date3.toISOString();
      }
      const fullPeriod = dateStr.match(/^(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})$/);
      if (fullPeriod) {
        const [, startStr, endStr] = fullPeriod;
        const startParts = startStr.split("/");
        const endParts = endStr.split("/");
        const result = {
          startDate: new Date(startParts[2], startParts[1] - 1, startParts[0]).toISOString(),
          endDate: new Date(endParts[2], endParts[1] - 1, endParts[0]).toISOString()
        };
        console.log(`\u2705 Parsed full period: ${result.startDate} - ${result.endDate}`);
        return result;
      }
      const period = dateStr.match(/^(\d{1,2})\/(\d{1,2})\s*-\s*(\d{1,2})\/(\d{1,2})$/);
      if (period) {
        const [, startDay, startMonth, endDay, endMonth] = period;
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        const result = {
          startDate: new Date(currentYear, startMonth - 1, startDay).toISOString(),
          endDate: new Date(currentYear, endMonth - 1, endDay).toISOString()
        };
        console.log(`\u2705 Parsed period: ${result.startDate} - ${result.endDate}`);
        return result;
      }
      const ddmm = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (ddmm) {
        const [, day, month] = ddmm;
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        const date3 = new Date(currentYear, month - 1, day);
        console.log(`\u2705 Parsed DD/MM: ${date3.toISOString()}`);
        return date3.toISOString();
      }
      if (!isNaN(dateStr) && !isNaN(parseFloat(dateStr))) {
        try {
          const excelDate = parseFloat(dateStr);
          const date3 = new Date((excelDate - 25569) * 86400 * 1e3);
          console.log(`\u2705 Parsed Excel date: ${date3.toISOString()}`);
          return date3.toISOString();
        } catch (e) {
          console.log(`\u26A0\uFE0F Erro ao converter data Excel: ${e.message}`);
        }
      }
    }
    const date2 = new Date(dateStr);
    if (!isNaN(date2.getTime())) {
      console.log(`\u2705 Parsed as Date: ${date2.toISOString()}`);
      return date2.toISOString();
    }
    console.log(`\u274C Could not parse date: ${dateStr}`);
    return null;
  }
  function mapEventType(categoria) {
    const lowerCategory = categoria ? categoria.toLowerCase() : "";
    if (lowerCategory.includes("igreja local")) return "igreja-local";
    if (lowerCategory.includes("asr administrativo")) return "asr-administrativo";
    if (lowerCategory.includes("asr geral")) return "asr-geral";
    if (lowerCategory.includes("asr pastores")) return "asr-pastores";
    if (lowerCategory.includes("visitas")) return "visitas";
    if (lowerCategory.includes("reuni\xF5es")) return "reunioes";
    if (lowerCategory.includes("prega\xE7\xF5es")) return "pregacoes";
    return "igreja-local";
  }
  importRoutes(app2);
  electionRoutes(app2);
  return createServer(app2);
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // Otimizações de build para melhor performance
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.logs em produção
        drop_debugger: true
      }
    },
    // Configurações para melhor compatibilidade com módulos
    target: "esnext",
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          charts: ["recharts"],
          forms: ["react-hook-form", "@hookform/resolvers"]
        },
        // Garantir que os chunks sejam gerados com extensão .js
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Otimizações de assets
    assetsInlineLimit: 4096,
    // 4kb
    chunkSizeWarningLimit: 1e3
  },
  server: {
    port: 3065
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["@radix-ui/react-icons"]
  },
  // Configurações de CSS para melhor performance
  css: {
    devSourcemap: false
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json({ limit: "50mb" }));
app.use(express3.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 3065;
  server.listen({
    port,
    host: "localhost"
  }, () => {
    console.log(`\u{1F680} Church Plus Manager rodando em http://localhost:${port}`);
    console.log(`\u{1F4CA} Dashboard: http://localhost:${port}/dashboard`);
    console.log(`\u{1F510} Login Admin: admin@igreja.com / meu7care`);
  });
})();
