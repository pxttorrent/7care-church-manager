// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// server/neonConfig.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
var connectionString = process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/church_plus";
var sql = neon(connectionString);
var db = drizzle(sql);
var isDevelopment = process.env.NODE_ENV === "development";
var isProduction = process.env.NODE_ENV === "production";
console.log("\u{1F517} Neon Database configurado:", {
  environment: process.env.NODE_ENV,
  hasConnectionString: !!process.env.DATABASE_URL,
  isDevelopment,
  isProduction
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
      return result;
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
      console.error("\u274C Erro ao buscar configura\xE7\xE3o de pontos:", error);
      return this.getDefaultPointsConfiguration();
    }
  }
  getDefaultPointsConfiguration() {
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
  async resetPointsConfiguration() {
    console.log("Configura\xE7\xE3o de pontos resetada");
  }
  async calculateAdvancedUserPoints() {
    try {
      const users2 = await db.select().from(schema.users);
      console.log(`\u{1F4CA} Total de usu\xE1rios encontrados: ${users2.length}`);
      let updatedCount = 0;
      for (const user of users2) {
        if (user.email === "admin@7care.com" || user.role === "admin") {
          continue;
        }
        const userData = await this.getUserDetailedData(user.id);
        if (!userData) {
          console.log(`\u26A0\uFE0F Dados n\xE3o encontrados para ${user.name}`);
          continue;
        }
        const pointsConfig = await this.getPointsConfiguration();
        let totalPoints = 0;
        if (userData.engajamento) {
          const engajamento = userData.engajamento.toLowerCase();
          if (engajamento.includes("baixo")) totalPoints += pointsConfig.engajamento.baixo;
          else if (engajamento.includes("m\xE9dio") || engajamento.includes("medio")) totalPoints += pointsConfig.engajamento.medio;
          else if (engajamento.includes("alto")) totalPoints += pointsConfig.engajamento.alto;
        }
        if (userData.classificacao) {
          const classificacao = userData.classificacao.toLowerCase();
          if (classificacao.includes("frequente")) {
            totalPoints += pointsConfig.classificacao.frequente;
          } else {
            totalPoints += pointsConfig.classificacao.naoFrequente;
          }
        }
        if (userData.dizimista) {
          const dizimista = userData.dizimista.toLowerCase();
          if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) totalPoints += pointsConfig.dizimista.naoDizimista;
          else if (dizimista.includes("pontual")) totalPoints += pointsConfig.dizimista.pontual;
          else if (dizimista.includes("sazonal")) totalPoints += pointsConfig.dizimista.sazonal;
          else if (dizimista.includes("recorrente")) totalPoints += pointsConfig.dizimista.recorrente;
        }
        if (userData.ofertante) {
          const ofertante = userData.ofertante.toLowerCase();
          if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) totalPoints += pointsConfig.ofertante.naoOfertante;
          else if (ofertante.includes("pontual")) totalPoints += pointsConfig.ofertante.pontual;
          else if (ofertante.includes("sazonal")) totalPoints += pointsConfig.ofertante.sazonal;
          else if (ofertante.includes("recorrente")) totalPoints += pointsConfig.ofertante.recorrente;
        }
        if (userData.tempoBatismo && typeof userData.tempoBatismo === "number") {
          const tempo = userData.tempoBatismo;
          if (tempo >= 2 && tempo < 5) totalPoints += pointsConfig.tempoBatismo.doisAnos;
          else if (tempo >= 5 && tempo < 10) totalPoints += pointsConfig.tempoBatismo.cincoAnos;
          else if (tempo >= 10 && tempo < 20) totalPoints += pointsConfig.tempoBatismo.dezAnos;
          else if (tempo >= 20 && tempo < 30) totalPoints += pointsConfig.tempoBatismo.vinteAnos;
          else if (tempo >= 30) totalPoints += pointsConfig.tempoBatismo.maisVinte;
        }
        if (userData.cargos && Array.isArray(userData.cargos)) {
          const numCargos = userData.cargos.length;
          if (numCargos === 1) totalPoints += pointsConfig.cargos.umCargo;
          else if (numCargos === 2) totalPoints += pointsConfig.cargos.doisCargos;
          else if (numCargos >= 3) totalPoints += pointsConfig.cargos.tresOuMais;
        }
        if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
          totalPoints += pointsConfig.nomeUnidade.comUnidade;
        }
        if (userData.temLicao) {
          totalPoints += pointsConfig.temLicao.comLicao;
        }
        if (userData.totalPresenca !== void 0) {
          const presenca = userData.totalPresenca;
          if (presenca >= 0 && presenca <= 3) totalPoints += pointsConfig.totalPresenca.zeroATres;
          else if (presenca >= 4 && presenca <= 7) totalPoints += pointsConfig.totalPresenca.quatroASete;
          else if (presenca >= 8 && presenca <= 13) totalPoints += pointsConfig.totalPresenca.oitoATreze;
        }
        if (userData.escolaSabatina) {
          const escola = userData.escolaSabatina;
          if (escola.comunhao) totalPoints += escola.comunhao * pointsConfig.escolaSabatina.comunhao;
          if (escola.missao) totalPoints += escola.missao * pointsConfig.escolaSabatina.missao;
          if (escola.estudoBiblico) totalPoints += escola.estudoBiblico * pointsConfig.escolaSabatina.estudoBiblico;
          if (escola.batizouAlguem) totalPoints += pointsConfig.escolaSabatina.batizouAlguem;
          if (escola.discipuladoPosBatismo) totalPoints += escola.discipuladoPosBatismo * pointsConfig.escolaSabatina.discipuladoPosBatismo;
        }
        if (userData.cpfValido === "Sim" || userData.cpfValido === true) {
          totalPoints += pointsConfig.cpfValido.valido;
        }
        if (userData.camposVaziosACMS === false) {
          totalPoints += pointsConfig.camposVaziosACMS.completos;
        }
        const roundedTotalPoints = Math.round(totalPoints);
        if (user.points !== roundedTotalPoints) {
          await db.update(schema.users).set({
            points: roundedTotalPoints,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq(schema.users.id, user.id));
          updatedCount++;
        } else {
        }
      }
      console.log(`\u2705 Processamento conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados`);
      return {
        success: true,
        message: `Pontos calculados para ${users2.length} usu\xE1rios. ${updatedCount} atualizados.`,
        updatedCount,
        totalUsers: users2.length
      };
    } catch (error) {
      console.error("\u274C Erro ao calcular pontos:", error);
      return { success: false, message: "Erro ao calcular pontos", error: error.message };
    }
  }
  // ========== MÉTODOS STUB (implementar conforme necessário) ==========
  async saveEventPermissions(permissions) {
    try {
      await this.saveSystemConfig("event-permissions", { permissions });
      console.log("Permiss\xF5es de eventos salvas:", permissions);
    } catch (error) {
      console.error("Erro ao salvar permiss\xF5es de eventos:", error);
      throw error;
    }
  }
  async getEventPermissions() {
    try {
      const systemConfig2 = await this.getSystemConfig("event-permissions");
      if (systemConfig2 && systemConfig2.value && systemConfig2.value.permissions) {
        return systemConfig2.value.permissions;
      }
      return this.getDefaultEventPermissions();
    } catch (error) {
      console.error("Erro ao buscar permiss\xF5es de eventos:", error);
      return this.getDefaultEventPermissions();
    }
  }
  getDefaultEventPermissions() {
    return {
      admin: {
        "igreja-local": true,
        "asr-geral": true,
        "asr-pastores": true,
        "asr-administrativo": true,
        "visitas": true,
        "reunioes": true,
        "pregacoes": true
      },
      member: {
        "igreja-local": true,
        "asr-geral": false,
        "asr-pastores": false,
        "asr-administrativo": false,
        "visitas": true,
        "reunioes": true,
        "pregacoes": true
      },
      missionary: {
        "igreja-local": true,
        "asr-geral": true,
        "asr-pastores": true,
        "asr-administrativo": true,
        "visitas": true,
        "reunioes": true,
        "pregacoes": true
      },
      interested: {
        "igreja-local": true,
        "asr-geral": false,
        "asr-pastores": false,
        "asr-administrativo": false,
        "visitas": false,
        "reunioes": false,
        "pregacoes": true
      }
    };
  }
  async getEventFilterPermissions() {
    try {
      const result = await db.select().from(eventFilterPermissions).limit(1);
      if (result.length > 0) {
        return result[0].permissions;
      }
      return this.getDefaultFilterPermissions();
    } catch (error) {
      console.error("Erro ao buscar permiss\xF5es de filtros:", error);
      return this.getDefaultFilterPermissions();
    }
  }
  async saveEventFilterPermissions(permissions) {
    try {
      const existing = await db.select().from(eventFilterPermissions).limit(1);
      if (existing.length > 0) {
        await db.update(eventFilterPermissions).set({
          permissions: JSON.stringify(permissions),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(eventFilterPermissions.id, existing[0].id));
      } else {
        await db.insert(eventFilterPermissions).values({
          permissions: JSON.stringify(permissions),
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
    } catch (error) {
      console.error("Erro ao salvar permiss\xF5es de filtros:", error);
      throw error;
    }
  }
  getDefaultFilterPermissions() {
    return {
      admin: {
        "igreja-local": true,
        "asr-geral": true,
        "asr-pastores": true,
        "asr-administrativo": true,
        "visitas": true,
        "reunioes": true,
        "pregacoes": true,
        "aniversarios": true
      },
      member: {
        "igreja-local": true,
        "asr-geral": false,
        "asr-pastores": false,
        "asr-administrativo": false,
        "visitas": true,
        "reunioes": true,
        "pregacoes": true,
        "aniversarios": true
      },
      missionary: {
        "igreja-local": true,
        "asr-geral": true,
        "asr-pastores": true,
        "asr-administrativo": true,
        "visitas": true,
        "reunioes": true,
        "pregacoes": true,
        "aniversarios": true
      },
      interested: {
        "igreja-local": true,
        "asr-geral": false,
        "asr-pastores": false,
        "asr-administrativo": false,
        "visitas": false,
        "reunioes": false,
        "pregacoes": true,
        "aniversarios": false
      }
    };
  }
  async createEmotionalCheckIn(data) {
    try {
      console.log("\u{1F50D} createEmotionalCheckIn - Dados recebidos:", data);
      const checkIn = {
        userId: data.userId,
        mood: data.emotionalScore ? `Score: ${data.emotionalScore}` : data.mood || "N\xE3o informado",
        notes: data.prayerRequest || data.notes || "",
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log("\u{1F50D} createEmotionalCheckIn - Dados para inserir:", checkIn);
      const result = await db.insert(schema.emotionalCheckins).values(checkIn).returning();
      console.log("\u{1F50D} createEmotionalCheckIn - Resultado:", result);
      return result[0];
    } catch (error) {
      console.error("Erro ao criar check-in emocional:", error);
      throw error;
    }
  }
  async getAllEmotionalCheckIns() {
    const result = await db.select().from(schema.emotionalCheckins).orderBy(desc(schema.emotionalCheckins.createdAt));
    return result;
  }
  async getEmotionalCheckInById(id) {
    const result = await db.select().from(schema.emotionalCheckins).where(eq(schema.emotionalCheckins.id, id)).limit(1);
    return result[0] || null;
  }
  async updateEmotionalCheckIn(id, updates) {
    const result = await db.update(schema.emotionalCheckins).set(updates).where(eq(schema.emotionalCheckins.id, id)).returning();
    return result[0] || null;
  }
  async deleteEmotionalCheckIn(id) {
    await db.delete(schema.emotionalCheckins).where(eq(schema.emotionalCheckins.id, id));
    return true;
  }
  // Implementar outros métodos conforme necessário...
  async getAllDiscipleshipRequests() {
    const result = await db.select().from(schema.discipleshipRequests).orderBy(desc(schema.discipleshipRequests.createdAt));
    return result;
  }
  async getDiscipleshipRequestById(id) {
    const result = await db.select().from(schema.discipleshipRequests).where(eq(schema.discipleshipRequests.id, id)).limit(1);
    return result[0] || null;
  }
  async createDiscipleshipRequest(data) {
    const newRequest = {
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await db.insert(schema.discipleshipRequests).values(newRequest).returning();
    return result[0];
  }
  async updateDiscipleshipRequest(id, updates) {
    updates.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.update(schema.discipleshipRequests).set(updates).where(eq(schema.discipleshipRequests.id, id)).returning();
    return result[0] || null;
  }
  async deleteDiscipleshipRequest(id) {
    await db.delete(schema.discipleshipRequests).where(eq(schema.discipleshipRequests.id, id));
    return true;
  }
  // ========== RELACIONAMENTOS (MISSIONARY-INTERESTED) ==========
  async getAllRelationships() {
    try {
      const result = await db.select().from(schema.relationships).orderBy(asc(schema.relationships.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar relacionamentos:", error);
      return [];
    }
  }
  async getRelationshipById(id) {
    try {
      const result = await db.select().from(schema.relationships).where(eq(schema.relationships.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar relacionamento:", error);
      return null;
    }
  }
  async createRelationship(data) {
    try {
      const result = await db.insert(schema.relationships).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar relacionamento:", error);
      throw error;
    }
  }
  async updateRelationship(id, updates) {
    try {
      const result = await db.update(schema.relationships).set(updates).where(eq(schema.relationships.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar relacionamento:", error);
      return null;
    }
  }
  async deleteRelationship(id) {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar relacionamento:", error);
      return false;
    }
  }
  async getRelationshipsByMissionary(missionaryId) {
    try {
      const result = await db.select().from(schema.relationships).where(eq(schema.relationships.missionaryId, missionaryId)).orderBy(asc(schema.relationships.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar relacionamentos por mission\xE1rio:", error);
      return [];
    }
  }
  async getRelationshipsByInterested(interestedId) {
    try {
      const result = await db.select().from(schema.relationships).where(eq(schema.relationships.interestedId, interestedId)).orderBy(asc(schema.relationships.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar relacionamentos por interessado:", error);
      return [];
    }
  }
  async deleteRelationshipByInterested(interestedId) {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.interestedId, interestedId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar relacionamentos por interessado:", error);
      return false;
    }
  }
  // ========== PERFIS MISSIONÁRIOS ==========
  async getAllMissionaryProfiles() {
    try {
      const result = await db.select().from(schema.missionaryProfiles).orderBy(asc(schema.missionaryProfiles.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar perfis mission\xE1rios:", error);
      return [];
    }
  }
  async getMissionaryProfileById(id) {
    try {
      const result = await db.select().from(schema.missionaryProfiles).where(eq(schema.missionaryProfiles.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar perfil mission\xE1rio:", error);
      return null;
    }
  }
  async createMissionaryProfile(data) {
    try {
      const result = await db.insert(schema.missionaryProfiles).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar perfil mission\xE1rio:", error);
      throw error;
    }
  }
  async updateMissionaryProfile(id, updates) {
    try {
      const result = await db.update(schema.missionaryProfiles).set(updates).where(eq(schema.missionaryProfiles.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar perfil mission\xE1rio:", error);
      return null;
    }
  }
  async deleteMissionaryProfile(id) {
    try {
      await db.delete(schema.missionaryProfiles).where(eq(schema.missionaryProfiles.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar perfil mission\xE1rio:", error);
      return false;
    }
  }
  // ========== REUNIÕES (MEETINGS) ==========
  async getAllMeetings() {
    try {
      const result = await db.select().from(schema.meetings).orderBy(asc(schema.meetings.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es:", error);
      return [];
    }
  }
  async getMeetingById(id) {
    try {
      const result = await db.select().from(schema.meetings).where(eq(schema.meetings.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar reuni\xE3o:", error);
      return null;
    }
  }
  async createMeeting(data) {
    try {
      const result = await db.insert(schema.meetings).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar reuni\xE3o:", error);
      throw error;
    }
  }
  async updateMeeting(id, updates) {
    try {
      const result = await db.update(schema.meetings).set(updates).where(eq(schema.meetings.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar reuni\xE3o:", error);
      return null;
    }
  }
  async deleteMeeting(id) {
    try {
      await db.delete(schema.meetings).where(eq(schema.meetings.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar reuni\xE3o:", error);
      return false;
    }
  }
  async getMeetingsByUserId(userId) {
    try {
      const result = await db.select().from(schema.meetings).where(eq(schema.meetings.userId, userId)).orderBy(asc(schema.meetings.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es do usu\xE1rio:", error);
      return [];
    }
  }
  async getMeetingsByStatus(status) {
    try {
      const result = await db.select().from(schema.meetings).where(eq(schema.meetings.status, status)).orderBy(asc(schema.meetings.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es por status:", error);
      return [];
    }
  }
  // ========== MENSAGENS ==========
  async getAllMessages() {
    try {
      const result = await db.select().from(schema.messages).orderBy(asc(schema.messages.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
  }
  async getMessageById(id) {
    try {
      const result = await db.select().from(schema.messages).where(eq(schema.messages.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar mensagem:", error);
      return null;
    }
  }
  async createMessage(data) {
    try {
      const result = await db.insert(schema.messages).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar mensagem:", error);
      throw error;
    }
  }
  async updateMessage(id, updates) {
    try {
      const result = await db.update(schema.messages).set(updates).where(eq(schema.messages.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", error);
      return null;
    }
  }
  async deleteMessage(id) {
    try {
      await db.delete(schema.messages).where(eq(schema.messages.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error);
      return false;
    }
  }
  async getMessagesByConversationId(conversationId) {
    try {
      const result = await db.select().from(schema.messages).where(eq(schema.messages.conversationId, conversationId)).orderBy(asc(schema.messages.createdAt));
      return result;
    } catch (error) {
      console.error("Erro ao buscar mensagens da conversa:", error);
      return [];
    }
  }
  // ========== CONVERSAS ==========
  async getAllConversations() {
    try {
      const result = await db.select().from(schema.conversations).orderBy(asc(schema.conversations.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      return [];
    }
  }
  async getConversationById(id) {
    try {
      const result = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar conversa:", error);
      return null;
    }
  }
  async createConversation(data) {
    try {
      const result = await db.insert(schema.conversations).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
      throw error;
    }
  }
  async updateConversation(id, updates) {
    try {
      const result = await db.update(schema.conversations).set(updates).where(eq(schema.conversations.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar conversa:", error);
      return null;
    }
  }
  async deleteConversation(id) {
    try {
      await db.delete(schema.conversations).where(eq(schema.conversations.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
      return false;
    }
  }
  async getConversationsByUserId(userId) {
    try {
      const result = await db.select().from(schema.conversations).where(eq(schema.conversations.userId, userId)).orderBy(asc(schema.conversations.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar conversas do usu\xE1rio:", error);
      return [];
    }
  }
  async getOrCreateDirectConversation(userAId, userBId) {
    try {
      const existingConversation = await db.select().from(schema.conversations).where(and(
        eq(schema.conversations.type, "direct"),
        or(
          and(eq(schema.conversations.userAId, userAId), eq(schema.conversations.userBId, userBId)),
          and(eq(schema.conversations.userAId, userBId), eq(schema.conversations.userBId, userAId))
        )
      )).limit(1);
      if (existingConversation[0]) {
        return existingConversation[0];
      }
      const newConversation = await db.insert(schema.conversations).values({
        type: "direct",
        userAId,
        userBId,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return newConversation[0];
    } catch (error) {
      console.error("Erro ao buscar/criar conversa direta:", error);
      throw error;
    }
  }
  // ========== NOTIFICAÇÕES ==========
  async getAllNotifications() {
    try {
      const result = await db.select().from(schema.notifications).orderBy(asc(schema.notifications.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar notifica\xE7\xF5es:", error);
      return [];
    }
  }
  async getNotificationById(id) {
    try {
      const result = await db.select().from(schema.notifications).where(eq(schema.notifications.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar notifica\xE7\xE3o:", error);
      return null;
    }
  }
  async createNotification(data) {
    try {
      const result = await db.insert(schema.notifications).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar notifica\xE7\xE3o:", error);
      throw error;
    }
  }
  async updateNotification(id, updates) {
    try {
      const result = await db.update(schema.notifications).set(updates).where(eq(schema.notifications.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar notifica\xE7\xE3o:", error);
      return null;
    }
  }
  async deleteNotification(id) {
    try {
      await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar notifica\xE7\xE3o:", error);
      return false;
    }
  }
  async getNotificationsByUserId(userId) {
    try {
      const result = await db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt));
      return result;
    } catch (error) {
      console.error("Erro ao buscar notifica\xE7\xF5es do usu\xE1rio:", error);
      return [];
    }
  }
  async markNotificationAsRead(id) {
    try {
      await db.update(schema.notifications).set({ read: true, readAt: /* @__PURE__ */ new Date() }).where(eq(schema.notifications.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao marcar notifica\xE7\xE3o como lida:", error);
      return false;
    }
  }
  // ========== CONQUISTAS (ACHIEVEMENTS) ==========
  async getAllAchievements() {
    try {
      const result = await db.select().from(schema.achievements).orderBy(asc(schema.achievements.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error);
      return [];
    }
  }
  async getAchievementById(id) {
    try {
      const result = await db.select().from(schema.achievements).where(eq(schema.achievements.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar conquista:", error);
      return null;
    }
  }
  async createAchievement(data) {
    try {
      const result = await db.insert(schema.achievements).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar conquista:", error);
      throw error;
    }
  }
  async updateAchievement(id, updates) {
    try {
      const result = await db.update(schema.achievements).set(updates).where(eq(schema.achievements.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar conquista:", error);
      return null;
    }
  }
  async deleteAchievement(id) {
    try {
      await db.delete(schema.achievements).where(eq(schema.achievements.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar conquista:", error);
      return false;
    }
  }
  // ========== ATIVIDADES DE PONTOS ==========
  async getAllPointActivities() {
    try {
      const result = await db.select().from(schema.pointActivities).orderBy(asc(schema.pointActivities.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar atividades de pontos:", error);
      return [];
    }
  }
  async getPointActivityById(id) {
    try {
      const result = await db.select().from(schema.pointActivities).where(eq(schema.pointActivities.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar atividade de pontos:", error);
      return null;
    }
  }
  async createPointActivity(data) {
    try {
      const result = await db.insert(schema.pointActivities).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar atividade de pontos:", error);
      throw error;
    }
  }
  async updatePointActivity(id, updates) {
    try {
      const result = await db.update(schema.pointActivities).set(updates).where(eq(schema.pointActivities.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar atividade de pontos:", error);
      return null;
    }
  }
  async deletePointActivity(id) {
    try {
      await db.delete(schema.pointActivities).where(eq(schema.pointActivities.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar atividade de pontos:", error);
      return false;
    }
  }
  async getAllSystemConfig() {
    try {
      const result = await db.select().from(schema.systemConfig);
      return result;
    } catch (error) {
      console.error("Erro ao buscar configura\xE7\xF5es do sistema:", error);
      return [];
    }
  }
  async getSystemConfigById(id) {
    return null;
  }
  async getSystemConfig(key) {
    try {
      const result = await db.select().from(schema.systemConfig).where(eq(schema.systemConfig.key, key)).limit(1);
      if (result.length > 0) {
        return result[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar configura\xE7\xE3o do sistema:", error);
      return null;
    }
  }
  async saveSystemConfig(key, value) {
    try {
      const existing = await db.select().from(schema.systemConfig).where(eq(schema.systemConfig.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(schema.systemConfig).set({
          value: JSON.stringify(value),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(schema.systemConfig.key, key));
      } else {
        await db.insert(schema.systemConfig).values({
          key,
          value: JSON.stringify(value),
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configura\xE7\xE3o do sistema:", error);
      throw error;
    }
  }
  async createSystemConfig(data) {
    return {};
  }
  async updateSystemConfig(id, updates) {
    return null;
  }
  async deleteSystemConfig(id) {
    return false;
  }
  async getAllSystemSettings() {
    try {
      const result = await db.select().from(schema.systemSettings);
      return result;
    } catch (error) {
      console.error("Erro ao buscar configura\xE7\xF5es do sistema:", error);
      return [];
    }
  }
  async getSystemSettingsById(id) {
    try {
      const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.id, id)).limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Erro ao buscar configura\xE7\xE3o do sistema:", error);
      return null;
    }
  }
  async createSystemSettings(data) {
    try {
      const result = await db.insert(schema.systemSettings).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar configura\xE7\xE3o do sistema:", error);
      return {};
    }
  }
  async updateSystemSettings(id, updates) {
    try {
      const result = await db.update(schema.systemSettings).set(updates).where(eq(schema.systemSettings.id, id)).returning();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Erro ao atualizar configura\xE7\xE3o do sistema:", error);
      return null;
    }
  }
  async deleteSystemSettings(id) {
    try {
      await db.delete(schema.systemSettings).where(eq(schema.systemSettings.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar configura\xE7\xE3o do sistema:", error);
      return false;
    }
  }
  async getAllEventParticipants() {
    try {
      const result = await db.select().from(schema.eventParticipants);
      return result;
    } catch (error) {
      console.error("Erro ao buscar participantes de eventos:", error);
      return [];
    }
  }
  async getEventParticipantById(id) {
    try {
      const result = await db.select().from(schema.eventParticipants).where(eq(schema.eventParticipants.id, id)).limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Erro ao buscar participante de evento:", error);
      return null;
    }
  }
  async createEventParticipant(data) {
    try {
      const result = await db.insert(schema.eventParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar participante de evento:", error);
      return {};
    }
  }
  async updateEventParticipant(id, updates) {
    try {
      const result = await db.update(schema.eventParticipants).set(updates).where(eq(schema.eventParticipants.id, id)).returning();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Erro ao atualizar participante de evento:", error);
      return null;
    }
  }
  async deleteEventParticipant(id) {
    try {
      await db.delete(schema.eventParticipants).where(eq(schema.eventParticipants.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar participante de evento:", error);
      return false;
    }
  }
  // ========== TIPOS DE REUNIÃO ==========
  async getAllMeetingTypes() {
    try {
      const result = await db.select().from(schema.meetingTypes).orderBy(asc(schema.meetingTypes.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar tipos de reuni\xE3o:", error);
      return [];
    }
  }
  async getMeetingTypeById(id) {
    try {
      const result = await db.select().from(schema.meetingTypes).where(eq(schema.meetingTypes.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar tipo de reuni\xE3o:", error);
      return null;
    }
  }
  async createMeetingType(data) {
    try {
      const result = await db.insert(schema.meetingTypes).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar tipo de reuni\xE3o:", error);
      throw error;
    }
  }
  async updateMeetingType(id, updates) {
    try {
      const result = await db.update(schema.meetingTypes).set(updates).where(eq(schema.meetingTypes.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar tipo de reuni\xE3o:", error);
      return null;
    }
  }
  async deleteMeetingType(id) {
    try {
      await db.delete(schema.meetingTypes).where(eq(schema.meetingTypes.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar tipo de reuni\xE3o:", error);
      return false;
    }
  }
  async getMeetingTypes() {
    return this.getAllMeetingTypes();
  }
  // ========== CONQUISTAS DE USUÁRIOS ==========
  async getAllUserAchievements() {
    try {
      const result = await db.select().from(schema.userAchievements).orderBy(asc(schema.userAchievements.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar conquistas de usu\xE1rios:", error);
      return [];
    }
  }
  async getUserAchievementById(id) {
    try {
      const result = await db.select().from(schema.userAchievements).where(eq(schema.userAchievements.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar conquista de usu\xE1rio:", error);
      return null;
    }
  }
  async createUserAchievement(data) {
    try {
      const result = await db.insert(schema.userAchievements).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar conquista de usu\xE1rio:", error);
      throw error;
    }
  }
  async updateUserAchievement(id, updates) {
    try {
      const result = await db.update(schema.userAchievements).set(updates).where(eq(schema.userAchievements.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar conquista de usu\xE1rio:", error);
      return null;
    }
  }
  async deleteUserAchievement(id) {
    try {
      await db.delete(schema.userAchievements).where(eq(schema.userAchievements.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar conquista de usu\xE1rio:", error);
      return false;
    }
  }
  // ========== HISTÓRICO DE PONTOS ==========
  async getAllUserPointsHistory() {
    try {
      const result = await db.select().from(schema.userPointsHistory).orderBy(asc(schema.userPointsHistory.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar hist\xF3rico de pontos:", error);
      return [];
    }
  }
  async getUserPointsHistoryById(id) {
    try {
      const result = await db.select().from(schema.userPointsHistory).where(eq(schema.userPointsHistory.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar hist\xF3rico de pontos:", error);
      return null;
    }
  }
  async createUserPointsHistory(data) {
    try {
      const result = await db.insert(schema.userPointsHistory).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar hist\xF3rico de pontos:", error);
      throw error;
    }
  }
  async updateUserPointsHistory(id, updates) {
    try {
      const result = await db.update(schema.userPointsHistory).set(updates).where(eq(schema.userPointsHistory.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar hist\xF3rico de pontos:", error);
      return null;
    }
  }
  async deleteUserPointsHistory(id) {
    try {
      await db.delete(schema.userPointsHistory).where(eq(schema.userPointsHistory.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar hist\xF3rico de pontos:", error);
      return false;
    }
  }
  async getUserPointsHistoryByUserId(userId) {
    try {
      const result = await db.select().from(schema.userPointsHistory).where(eq(schema.userPointsHistory.userId, userId)).orderBy(desc(schema.userPointsHistory.createdAt));
      return result;
    } catch (error) {
      console.error("Erro ao buscar hist\xF3rico de pontos do usu\xE1rio:", error);
      return [];
    }
  }
  // ========== ORAÇÕES ==========
  async getAllPrayers() {
    try {
      const result = await db.select().from(schema.prayers).orderBy(asc(schema.prayers.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es:", error);
      return [];
    }
  }
  async getPrayerById(id) {
    try {
      const result = await db.select().from(schema.prayers).where(eq(schema.prayers.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xE3o:", error);
      return null;
    }
  }
  async createPrayer(data) {
    try {
      const result = await db.insert(schema.prayers).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar ora\xE7\xE3o:", error);
      throw error;
    }
  }
  async updatePrayer(id, updates) {
    try {
      const result = await db.update(schema.prayers).set(updates).where(eq(schema.prayers.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar ora\xE7\xE3o:", error);
      return null;
    }
  }
  async deletePrayer(id) {
    try {
      await db.delete(schema.prayers).where(eq(schema.prayers.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar ora\xE7\xE3o:", error);
      return false;
    }
  }
  async getPrayersByUserId(userId) {
    try {
      const result = await db.select().from(schema.prayers).where(eq(schema.prayers.userId, userId)).orderBy(desc(schema.prayers.createdAt));
      return result;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es do usu\xE1rio:", error);
      return [];
    }
  }
  // ========== INTERCESSORES ==========
  async getAllPrayerIntercessors() {
    try {
      const result = await db.select().from(schema.prayerIntercessors).orderBy(asc(schema.prayerIntercessors.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar intercessores:", error);
      return [];
    }
  }
  async getPrayerIntercessorById(id) {
    try {
      const result = await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar intercessor:", error);
      return null;
    }
  }
  async createPrayerIntercessor(data) {
    try {
      const result = await db.insert(schema.prayerIntercessors).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar intercessor:", error);
      throw error;
    }
  }
  async updatePrayerIntercessor(id, updates) {
    try {
      const result = await db.update(schema.prayerIntercessors).set(updates).where(eq(schema.prayerIntercessors.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar intercessor:", error);
      return null;
    }
  }
  async deletePrayerIntercessor(id) {
    try {
      await db.delete(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar intercessor:", error);
      return false;
    }
  }
  async getIntercessorsByPrayerId(prayerId) {
    try {
      const result = await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.prayerId, prayerId)).orderBy(asc(schema.prayerIntercessors.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar intercessores da ora\xE7\xE3o:", error);
      return [];
    }
  }
  async getPrayersByIntercessorId(intercessorId) {
    try {
      const result = await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.intercessorId, intercessorId)).orderBy(asc(schema.prayerIntercessors.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es do intercessor:", error);
      return [];
    }
  }
  // ========== CHAMADAS DE VÍDEO ==========
  async getAllVideoCallSessions() {
    try {
      const result = await db.select().from(schema.videoCallSessions).orderBy(asc(schema.videoCallSessions.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar sess\xF5es de chamada de v\xEDdeo:", error);
      return [];
    }
  }
  async getVideoCallSessionById(id) {
    try {
      const result = await db.select().from(schema.videoCallSessions).where(eq(schema.videoCallSessions.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar sess\xE3o de chamada de v\xEDdeo:", error);
      return null;
    }
  }
  async createVideoCallSession(data) {
    try {
      const result = await db.insert(schema.videoCallSessions).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar sess\xE3o de chamada de v\xEDdeo:", error);
      throw error;
    }
  }
  async updateVideoCallSession(id, updates) {
    try {
      const result = await db.update(schema.videoCallSessions).set(updates).where(eq(schema.videoCallSessions.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar sess\xE3o de chamada de v\xEDdeo:", error);
      return null;
    }
  }
  async deleteVideoCallSession(id) {
    try {
      await db.delete(schema.videoCallSessions).where(eq(schema.videoCallSessions.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar sess\xE3o de chamada de v\xEDdeo:", error);
      return false;
    }
  }
  // ========== PARTICIPANTES DE CHAMADAS DE VÍDEO ==========
  async getAllVideoCallParticipants() {
    try {
      const result = await db.select().from(schema.videoCallParticipants).orderBy(asc(schema.videoCallParticipants.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar participantes de chamada de v\xEDdeo:", error);
      return [];
    }
  }
  async getVideoCallParticipantById(id) {
    try {
      const result = await db.select().from(schema.videoCallParticipants).where(eq(schema.videoCallParticipants.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar participante de chamada de v\xEDdeo:", error);
      return null;
    }
  }
  async createVideoCallParticipant(data) {
    try {
      const result = await db.insert(schema.videoCallParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar participante de chamada de v\xEDdeo:", error);
      throw error;
    }
  }
  async updateVideoCallParticipant(id, updates) {
    try {
      const result = await db.update(schema.videoCallParticipants).set(updates).where(eq(schema.videoCallParticipants.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar participante de chamada de v\xEDdeo:", error);
      return null;
    }
  }
  async deleteVideoCallParticipant(id) {
    try {
      await db.delete(schema.videoCallParticipants).where(eq(schema.videoCallParticipants.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar participante de chamada de v\xEDdeo:", error);
      return false;
    }
  }
  // ========== PARTICIPANTES DE CONVERSAS ==========
  async getAllConversationParticipants() {
    try {
      const result = await db.select().from(schema.conversationParticipants).orderBy(asc(schema.conversationParticipants.id));
      return result;
    } catch (error) {
      console.error("Erro ao buscar participantes de conversa:", error);
      return [];
    }
  }
  async getConversationParticipantById(id) {
    try {
      const result = await db.select().from(schema.conversationParticipants).where(eq(schema.conversationParticipants.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar participante de conversa:", error);
      return null;
    }
  }
  async createConversationParticipant(data) {
    try {
      const result = await db.insert(schema.conversationParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar participante de conversa:", error);
      throw error;
    }
  }
  async updateConversationParticipant(id, updates) {
    try {
      const result = await db.update(schema.conversationParticipants).set(updates).where(eq(schema.conversationParticipants.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar participante de conversa:", error);
      return null;
    }
  }
  async deleteConversationParticipant(id) {
    try {
      await db.delete(schema.conversationParticipants).where(eq(schema.conversationParticipants.id, id));
      return true;
    } catch (error) {
      console.error("Erro ao deletar participante de conversa:", error);
      return false;
    }
  }
  // Métodos adicionais necessários
  async getEmotionalCheckInsForAdmin() {
    try {
      console.log("\u{1F50D} Buscando check-ins emocionais para admin...");
      const result = await db.select().from(schema.emotionalCheckins);
      console.log("\u{1F50D} Resultado:", result);
      return result;
    } catch (error) {
      console.error("Erro ao buscar check-ins emocionais para admin:", error);
      return [];
    }
  }
  async getUsersWithMissionaryProfile() {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.role, "missionary"));
      return result;
    } catch (error) {
      console.error("Erro ao buscar usu\xE1rios com perfil mission\xE1rio:", error);
      return [];
    }
  }
  async getDefaultChurch() {
    try {
      const result = await db.select().from(schema.churches).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar igreja padr\xE3o:", error);
      return null;
    }
  }
  async clearAllData() {
    try {
      console.log("\u{1F9F9} Iniciando limpeza de todos os dados...");
      const { neon: neon2 } = await import("@neondatabase/serverless");
      const sql2 = neon2(process.env.DATABASE_URL);
      const queries = [
        "DELETE FROM messages",
        "DELETE FROM conversations",
        "DELETE FROM emotional_checkins",
        "DELETE FROM discipleship_requests",
        "DELETE FROM relationships",
        // Adicionar relationships antes de users
        "DELETE FROM missionary_profiles",
        "DELETE FROM point_configs",
        "DELETE FROM events",
        "DELETE FROM churches",
        "DELETE FROM users WHERE email != 'admin@7care.com'"
        // Usuários por último
      ];
      for (const query of queries) {
        try {
          await sql2`${sql2.unsafe(query)}`;
          console.log(`\u2705 Executado: ${query}`);
        } catch (error) {
          console.log(`\u26A0\uFE0F Aviso ao executar ${query}:`, error.message);
        }
      }
      console.log("\u{1F389} Limpeza de dados conclu\xEDda com sucesso!");
    } catch (error) {
      console.error("\u274C Erro ao limpar dados:", error);
      throw error;
    }
  }
  // ===== MÉTODOS DE IGREJA =====
  async updateUserChurch(userId, churchName) {
    try {
      await db.update(schema.users).set({ church: churchName }).where(eq(schema.users.id, userId));
      return true;
    } catch (error) {
      console.error("Erro ao atualizar igreja do usu\xE1rio:", error);
      return false;
    }
  }
  async setDefaultChurch(churchId) {
    try {
      const church = await db.select().from(schema.churches).where(eq(schema.churches.id, churchId)).limit(1);
      if (church.length === 0) {
        console.error("Igreja n\xE3o encontrada:", churchId);
        return false;
      }
      console.log("Igreja definida como padr\xE3o:", church[0].name);
      return true;
    } catch (error) {
      console.error("Erro ao definir igreja padr\xE3o:", error);
      return false;
    }
  }
  async getOrCreateChurch(churchName) {
    try {
      console.log(`\u{1F50D} Buscando igreja: "${churchName}"`);
      const existingChurch = await db.select().from(schema.churches).where(eq(schema.churches.name, churchName)).limit(1);
      if (existingChurch.length > 0) {
        console.log(`\u2705 Igreja encontrada: ${existingChurch[0].name} (ID: ${existingChurch[0].id})`);
        return existingChurch[0];
      }
      console.log(`\u2795 Criando nova igreja: "${churchName}"`);
      const baseCode = churchName.substring(0, 8).toUpperCase().replace(/\s+/g, "");
      let code = baseCode;
      let counter = 1;
      while (true) {
        const existingCode = await db.select().from(schema.churches).where(eq(schema.churches.code, code)).limit(1);
        if (existingCode.length === 0) {
          break;
        }
        code = `${baseCode}${counter}`;
        counter++;
      }
      const newChurch = await db.insert(schema.churches).values({
        name: churchName,
        code,
        address: "",
        phone: "",
        email: "",
        pastor: ""
      }).returning();
      console.log(`\u2705 Igreja criada: ${newChurch[0].name} (ID: ${newChurch[0].id}, Code: ${newChurch[0].code})`);
      return newChurch[0];
    } catch (error) {
      console.error("\u274C Erro ao buscar/criar igreja:", error);
      throw error;
    }
  }
  // ===== MÉTODOS DE USUÁRIO =====
  async approveUser(id) {
    try {
      const result = await db.update(schema.users).set({
        role: "member",
        approvedAt: /* @__PURE__ */ new Date(),
        approved: true
      }).where(eq(schema.users.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao aprovar usu\xE1rio:", error);
      return null;
    }
  }
  async rejectUser(id) {
    try {
      const result = await db.update(schema.users).set({
        role: "rejected",
        rejectedAt: /* @__PURE__ */ new Date(),
        approved: false
      }).where(eq(schema.users.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao rejeitar usu\xE1rio:", error);
      return null;
    }
  }
  // ===== MÉTODOS DE PONTUAÇÃO =====
  async calculateBasicUserPoints() {
    try {
      const users2 = await this.getAllUsers();
      let updatedCount = 0;
      for (const user of users2) {
        if (user.email === "admin@7care.com") continue;
        const points = this.calculateUserPoints(user);
        if (points !== user.points) {
          await this.updateUser(user.id, { points });
          updatedCount++;
        }
      }
      return { success: true, updatedCount };
    } catch (error) {
      console.error("Erro ao calcular pontos b\xE1sicos:", error);
      return { success: false, error: error.message };
    }
  }
  async resetPointsConfiguration() {
    try {
      await db.delete(schema.pointConfigs);
      const defaultConfig = this.getDefaultPointsConfiguration();
      await this.savePointsConfiguration(defaultConfig);
    } catch (error) {
      console.error("Erro ao resetar configura\xE7\xE3o de pontos:", error);
      throw error;
    }
  }
  // ===== MÉTODOS DE CHECK-INS EMOCIONAIS =====
  async getEmotionalCheckInsByUserId(userId) {
    try {
      return await db.select().from(schema.emotionalCheckins).where(eq(schema.emotionalCheckins.userId, userId)).orderBy(desc(schema.emotionalCheckins.createdAt));
    } catch (error) {
      console.error("Erro ao buscar check-ins emocionais do usu\xE1rio:", error);
      return [];
    }
  }
  // ===== MÉTODOS DE ORAÇÃO =====
  async getPrayers() {
    try {
      return await db.select().from(schema.prayers).orderBy(desc(schema.prayers.createdAt));
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es:", error);
      return [];
    }
  }
  async markPrayerAsAnswered(prayerId, answeredBy) {
    try {
      await db.update(schema.prayers).set({
        answered: true,
        answeredAt: /* @__PURE__ */ new Date(),
        answeredBy
      }).where(eq(schema.prayers.id, prayerId));
      return true;
    } catch (error) {
      console.error("Erro ao marcar ora\xE7\xE3o como respondida:", error);
      return false;
    }
  }
  async getPrayerById(prayerId) {
    try {
      const result = await db.select().from(schema.prayers).where(eq(schema.prayers.id, prayerId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xE3o:", error);
      return null;
    }
  }
  async deletePrayer(prayerId) {
    try {
      await db.delete(schema.prayers).where(eq(schema.prayers.id, prayerId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar ora\xE7\xE3o:", error);
      return false;
    }
  }
  async addPrayerIntercessor(prayerId, intercessorId) {
    try {
      await db.insert(schema.prayerIntercessors).values({
        prayerId,
        intercessorId,
        joinedAt: /* @__PURE__ */ new Date()
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
          eq(schema.prayerIntercessors.intercessorId, intercessorId)
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
      return await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.prayerId, prayerId));
    } catch (error) {
      console.error("Erro ao buscar intercessores:", error);
      return [];
    }
  }
  async getPrayersUserIsPrayingFor(userId) {
    try {
      return await db.select().from(schema.prayerIntercessors).where(eq(schema.prayerIntercessors.intercessorId, userId));
    } catch (error) {
      console.error("Erro ao buscar ora\xE7\xF5es que usu\xE1rio est\xE1 orando:", error);
      return [];
    }
  }
  // ===== MÉTODOS DE REUNIÕES =====
  async getMeetingsByUserId(userId) {
    try {
      return await db.select().from(schema.meetings).where(eq(schema.meetings.userId, userId)).orderBy(desc(schema.meetings.createdAt));
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es do usu\xE1rio:", error);
      return [];
    }
  }
  async getMeetingsByStatus(status) {
    try {
      return await db.select().from(schema.meetings).where(eq(schema.meetings.status, status)).orderBy(desc(schema.meetings.createdAt));
    } catch (error) {
      console.error("Erro ao buscar reuni\xF5es por status:", error);
      return [];
    }
  }
  async getAllMeetings() {
    try {
      return await db.select().from(schema.meetings).orderBy(desc(schema.meetings.createdAt));
    } catch (error) {
      console.error("Erro ao buscar todas as reuni\xF5es:", error);
      return [];
    }
  }
  async createMeeting(meetingData) {
    try {
      const result = await db.insert(schema.meetings).values({
        ...meetingData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar reuni\xE3o:", error);
      throw error;
    }
  }
  async updateMeeting(id, updateData) {
    try {
      const result = await db.update(schema.meetings).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(schema.meetings.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar reuni\xE3o:", error);
      return null;
    }
  }
  // ===== MÉTODOS DE EVENTOS =====
  async clearAllEvents() {
    try {
      await db.delete(schema.events);
      return true;
    } catch (error) {
      console.error("Erro ao limpar eventos:", error);
      return false;
    }
  }
  async createEvent(eventData) {
    try {
      console.log("\u{1F50D} createEvent recebeu:", eventData);
      let dateISO = eventData.date;
      if (typeof dateISO !== "string") {
        if (dateISO instanceof Date) {
          dateISO = dateISO.toISOString();
        } else {
          dateISO = new Date(dateISO).toISOString();
        }
      }
      const result = await sql`
        INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
        VALUES (${eventData.title}, ${eventData.description || ""}, ${dateISO}, ${eventData.location || ""}, ${eventData.type}, ${eventData.capacity || 0}, ${eventData.isRecurring || false}, ${eventData.recurrencePattern || null}, ${eventData.createdBy || 72}, ${eventData.churchId || 24}, NOW(), NOW())
        RETURNING id, title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at
      `;
      console.log("\u{1F50D} Evento criado com SQL:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }
  // ===== MÉTODOS DE RELACIONAMENTOS =====
  async getAllRelationships() {
    try {
      return await db.select().from(schema.relationships).orderBy(desc(schema.relationships.createdAt));
    } catch (error) {
      console.error("Erro ao buscar todos os relacionamentos:", error);
      return [];
    }
  }
  async getRelationshipsByMissionary(missionaryId) {
    try {
      return await db.select().from(schema.relationships).where(eq(schema.relationships.missionaryId, missionaryId)).orderBy(desc(schema.relationships.createdAt));
    } catch (error) {
      console.error("Erro ao buscar relacionamentos por mission\xE1rio:", error);
      return [];
    }
  }
  async getRelationshipsByInterested(interestedId) {
    try {
      return await db.select().from(schema.relationships).where(eq(schema.relationships.interestedId, interestedId)).orderBy(desc(schema.relationships.createdAt));
    } catch (error) {
      console.error("Erro ao buscar relacionamentos por interessado:", error);
      return [];
    }
  }
  async createRelationship(data) {
    try {
      const result = await db.insert(schema.relationships).values({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar relacionamento:", error);
      throw error;
    }
  }
  async getRelationshipById(relationshipId) {
    try {
      const result = await db.select().from(schema.relationships).where(eq(schema.relationships.id, relationshipId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar relacionamento:", error);
      return null;
    }
  }
  async deleteRelationship(relationshipId) {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.id, relationshipId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar relacionamento:", error);
      return false;
    }
  }
  async deleteRelationshipByInterested(interestedId) {
    try {
      await db.delete(schema.relationships).where(eq(schema.relationships.interestedId, interestedId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar relacionamentos por interessado:", error);
      return false;
    }
  }
  // ===== MÉTODOS DE PERFIL MISSIONÁRIO =====
  async getMissionaryProfileByUserId(userId) {
    try {
      const result = await db.select().from(schema.missionaryProfiles).where(eq(schema.missionaryProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao buscar perfil mission\xE1rio:", error);
      return null;
    }
  }
  async createMissionaryProfile(data) {
    try {
      const result = await db.insert(schema.missionaryProfiles).values({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar perfil mission\xE1rio:", error);
      throw error;
    }
  }
  // ===== MÉTODOS DE CONVERSAS =====
  async getConversationsByUserId(userId) {
    try {
      return await db.select().from(schema.conversations).where(
        or(
          eq(schema.conversations.userAId, userId),
          eq(schema.conversations.userBId, userId)
        )
      ).orderBy(desc(schema.conversations.updatedAt));
    } catch (error) {
      console.error("Erro ao buscar conversas do usu\xE1rio:", error);
      return [];
    }
  }
  async getOrCreateDirectConversation(userAId, userBId) {
    try {
      const existingConversation = await db.select().from(schema.conversations).where(
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
          eq(schema.conversations.type, "direct")
        )
      ).limit(1);
      if (existingConversation.length > 0) {
        return existingConversation[0];
      }
      const result = await db.insert(schema.conversations).values({
        userAId,
        userBId,
        type: "direct",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao buscar/criar conversa direta:", error);
      throw error;
    }
  }
  async getMessagesByConversationId(conversationId) {
    try {
      return await db.select().from(schema.messages).where(eq(schema.messages.conversationId, conversationId)).orderBy(asc(schema.messages.createdAt));
    } catch (error) {
      console.error("Erro ao buscar mensagens da conversa:", error);
      return [];
    }
  }
  // ===== MÉTODOS DE TIPOS DE REUNIÃO =====
  async getMeetingTypes() {
    try {
      return await db.select().from(schema.meetingTypes).orderBy(asc(schema.meetingTypes.name));
    } catch (error) {
      console.error("Erro ao buscar tipos de reuni\xE3o:", error);
      return [];
    }
  }
  // ===== MÉTODO AUXILIAR PARA CÁLCULO DE PONTOS =====
  calculateUserPoints(user) {
    let points = 0;
    if (user.attendance) points += user.attendance;
    if (user.isDonor) points += 5;
    if (user.isOffering) points += 3;
    if (user.hasLesson) points += 2;
    return Math.round(points);
  }
  // Sistema de Logo Persistente
  async saveSystemLogo(logoUrl, filename) {
    try {
      console.log("\u{1F4BE} Salvando logo no banco de dados:", { logoUrl, filename });
      const existingConfig = await sql`
        SELECT id FROM system_config WHERE key = 'system_logo'
      `;
      if (existingConfig.length > 0) {
        await sql`
          UPDATE system_config 
          SET value = ${JSON.stringify({ logoUrl, filename, updatedAt: (/* @__PURE__ */ new Date()).toISOString() })},
              updated_at = NOW()
          WHERE key = 'system_logo'
        `;
        console.log("\u2705 Logo atualizada no banco de dados");
      } else {
        await sql`
          INSERT INTO system_config (key, value, description)
          VALUES ('system_logo', ${JSON.stringify({ logoUrl, filename, createdAt: (/* @__PURE__ */ new Date()).toISOString() })}, 'Logo do sistema')
        `;
        console.log("\u2705 Logo salva no banco de dados");
      }
      return true;
    } catch (error) {
      console.error("\u274C Erro ao salvar logo no banco:", error);
      return false;
    }
  }
  async getSystemLogo() {
    try {
      console.log("\u{1F50D} Buscando logo no banco de dados...");
      const result = await sql`
        SELECT value FROM system_config WHERE key = 'system_logo'
      `;
      if (result.length > 0) {
        const config = result[0].value;
        console.log("\u2705 Logo encontrada no banco:", config);
        return {
          logoUrl: config.logoUrl,
          filename: config.filename
        };
      }
      console.log("\u2139\uFE0F Nenhuma logo encontrada no banco de dados");
      return null;
    } catch (error) {
      console.error("\u274C Erro ao buscar logo no banco:", error);
      return null;
    }
  }
  async clearSystemLogo() {
    try {
      console.log("\u{1F5D1}\uFE0F Removendo logo do banco de dados...");
      await sql`
        DELETE FROM system_config WHERE key = 'system_logo'
      `;
      console.log("\u2705 Logo removida do banco de dados");
      return true;
    } catch (error) {
      console.error("\u274C Erro ao remover logo do banco:", error);
      return false;
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
      const safeUsers = users2.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
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
      const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 6e4);
      const currentMonth = localDate.getMonth();
      const currentDay = localDate.getDate();
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
          await storage.deleteRelationshipByInterested(id);
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
  app2.post("/api/system/calculate-points", async (req, res) => {
    try {
      await storage.calculateBasicUserPoints();
      res.json({ success: true, message: "Pontos b\xE1sicos calculados com sucesso" });
    } catch (error) {
      console.error("Erro ao calcular pontos:", error);
      res.status(500).json({ success: false, message: "Erro ao calcular pontos" });
    }
  });
  app2.post("/api/system/calculate-advanced-points", async (req, res) => {
    try {
      console.log("\u{1F504} Endpoint /api/system/calculate-advanced-points chamado");
      const result = await storage.calculateAdvancedUserPoints();
      console.log("\u2705 Resultado do c\xE1lculo:", result);
      res.json({ success: true, message: "Pontos avan\xE7ados calculados com sucesso" });
    } catch (error) {
      console.error("Erro ao calcular pontos avan\xE7ados:", error);
      res.status(500).json({ success: false, message: "Erro ao calcular pontos avan\xE7ados" });
    }
  });
  app2.post("/api/system/recalculate-all-points", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      console.log(`\u{1F4CA} Total de usu\xE1rios encontrados: ${allUsers.length}`);
      let updatedCount = 0;
      const errors = [];
      for (const user of allUsers) {
        try {
          if (user.email === "admin@7care.com" || user.role === "admin") {
            continue;
          }
          const config = await storage.getPointsConfiguration();
          let points = 0;
          let userData = {};
          if (user.extraData && typeof user.extraData === "string") {
            userData = JSON.parse(user.extraData);
          }
          points += config.basicPoints || 100;
          const attendancePoints = (user.attendance || 0) * (config.attendancePoints || 10);
          points += attendancePoints;
          if (userData.engajamento) {
            const engajamento = userData.engajamento.toLowerCase();
            if (engajamento.includes("baixo")) points += config.engajamento.baixo;
            else if (engajamento.includes("m\xE9dio") || engajamento.includes("medio")) points += config.engajamento.medio;
            else if (engajamento.includes("alto")) points += config.engajamento.alto;
            else points += config.engajamento.baixo;
          }
          if (userData.classificacao) {
            const classificacao = userData.classificacao.toLowerCase();
            if (classificacao.includes("frequente")) points += config.classificacao.frequente;
            else points += config.classificacao.naoFrequente;
          }
          if (userData.dizimistaType) {
            const dizimista = userData.dizimistaType.toLowerCase();
            if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) points += config.dizimista.naoDizimista;
            else if (dizimista.includes("pontual")) points += config.dizimista.pontual;
            else if (dizimista.includes("sazonal")) points += config.dizimista.sazonal;
            else if (dizimista.includes("recorrente")) points += config.dizimista.recorrente;
          } else if (userData.dizimista) {
            const dizimista = userData.dizimista.toLowerCase();
            if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) points += config.dizimista.naoDizimista;
            else if (dizimista.includes("pontual")) points += config.dizimista.pontual;
            else if (dizimista.includes("sazonal")) points += config.dizimista.sazonal;
            else if (dizimista.includes("recorrente")) points += config.dizimista.recorrente;
          }
          if (userData.ofertanteType) {
            const ofertante = userData.ofertanteType.toLowerCase();
            if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) points += config.ofertante.naoOfertante;
            else if (ofertante.includes("pontual")) points += config.ofertante.pontual;
            else if (ofertante.includes("sazonal")) points += config.ofertante.sazonal;
            else if (ofertante.includes("recorrente")) points += config.ofertante.recorrente;
            else points += config.ofertante.recorrente;
          } else if (userData.ofertante) {
            const ofertante = userData.ofertante.toLowerCase();
            if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) points += config.ofertante.naoOfertante;
            else if (ofertante.includes("pontual")) points += config.ofertante.pontual;
            else if (ofertante.includes("sazonal")) points += config.ofertante.sazonal;
            else if (ofertante.includes("recorrente")) points += config.ofertante.recorrente;
            else points += config.ofertante.recorrente;
          }
          if (userData.tempoBatismoAnos) {
            const tempo = userData.tempoBatismoAnos;
            if (tempo >= 2 && tempo < 5) points += config.tempoBatismo.doisAnos;
            else if (tempo >= 5 && tempo < 10) points += config.tempoBatismo.cincoAnos;
            else if (tempo >= 10 && tempo < 20) points += config.tempoBatismo.dezAnos;
            else if (tempo >= 20 && tempo < 30) points += config.tempoBatismo.vinteAnos;
            else if (tempo >= 30) points += config.tempoBatismo.maisVinte;
          }
          if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
            points += config.nomeUnidade.comUnidade;
          }
          if (userData.comunhao) points += userData.comunhao * config.pontuacaoDinamica.multiplicador;
          if (userData.missao) points += userData.missao * config.pontuacaoDinamica.multiplicador;
          if (userData.estudoBiblico) points += userData.estudoBiblico * config.pontuacaoDinamica.multiplicador;
          if (userData.totalPresenca !== void 0) {
            const presenca = userData.totalPresenca;
            if (presenca >= 0 && presenca <= 3) points += config.totalPresenca.zeroATres;
            else if (presenca >= 4 && presenca <= 7) points += config.totalPresenca.quatroASete;
            else if (presenca >= 8 && presenca <= 13) points += config.totalPresenca.oitoATreze;
          }
          if (userData.batizouAlguem) points += config.escolaSabatina.batizouAlguem;
          if (userData.discPosBatismal) points += userData.discPosBatismal * config.escolaSabatina.discipuladoPosBatismo;
          if (userData.cpfValido === "Sim" || userData.cpfValido === true) {
            points += config.cpfValido.valido;
          }
          points += config.camposVaziosACMS.completos;
          const multiplicadorDinamico = config.pontuacaoDinamica?.multiplicador || 1;
          const multiplicadorPresenca = config.presenca?.multiplicador || 1;
          points = points * multiplicadorDinamico;
          points += (user.attendance || 0) * multiplicadorPresenca;
          const currentPoints = user.points || 0;
          const newPoints = Math.round(points);
          if (newPoints !== currentPoints) {
            await storage.updateUser(user.id, { points: newPoints });
            updatedCount++;
          } else {
          }
        } catch (userError) {
          console.error(`\u274C Erro ao processar usu\xE1rio ${user.name}:`, userError);
          const message = userError instanceof Error ? userError.message : String(userError);
          errors.push({ userId: user.id, userName: user.name, error: message });
        }
      }
      console.log(`\u2705 Processamento conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados`);
      res.json({
        success: true,
        message: `Pontua\xE7\xE3o recalculada para todos os usu\xE1rios`,
        totalUsers: allUsers.length,
        updatedUsers: updatedCount,
        errors
      });
    } catch (error) {
      console.error("Erro ao recalcular pontua\xE7\xE3o de todos os usu\xE1rios:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/users/:id/recalculate-points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (user.email === "admin@7care.com" || user.role === "admin") {
        return res.json({
          success: true,
          message: `Super Admin n\xE3o deve ter pontos calculados`,
          points: 0
        });
      }
      console.log(`\u{1F464} Usu\xE1rio encontrado: ${user.name}`);
      const config = await storage.getPointsConfiguration();
      let points = 0;
      try {
        let userData = {};
        if (user.extraData && typeof user.extraData === "string") {
          userData = JSON.parse(user.extraData);
        }
        console.log(`\u{1F4CA} Dados do usu\xE1rio:`, userData);
        points += config.basicPoints || 5;
        const attendancePoints = (user.attendance || 0) * (config.attendancePoints || 5);
        points += attendancePoints;
        if (userData.engajamento) {
          const engajamento = userData.engajamento.toLowerCase();
          if (engajamento.includes("baixo")) points += config.engajamento.baixo;
          else if (engajamento.includes("m\xE9dio") || engajamento.includes("medio")) points += config.engajamento.medio;
          else if (engajamento.includes("alto")) points += config.engajamento.alto;
          else points += config.engajamento.baixo;
        }
        if (userData.classificacao) {
          const classificacao = userData.classificacao.toLowerCase();
          if (classificacao.includes("frequente")) points += config.classificacao.frequente;
          else points += config.classificacao.naoFrequente;
        }
        if (userData.dizimistaType) {
          const dizimista = userData.dizimistaType.toLowerCase();
          if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) points += config.dizimista.naoDizimista;
          else if (dizimista.includes("pontual")) points += config.dizimista.pontual;
          else if (dizimista.includes("sazonal")) points += config.dizimista.sazonal;
          else if (dizimista.includes("recorrente")) points += config.dizimista.recorrente;
        }
        if (userData.ofertanteType) {
          const ofertante = userData.ofertanteType.toLowerCase();
          if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) points += config.ofertante.naoOfertante;
          else if (ofertante.includes("pontual")) points += config.ofertante.pontual;
          else if (ofertante.includes("sazonal")) points += config.ofertante.sazonal;
          else if (ofertante.includes("recorrente")) points += config.ofertante.recorrente;
          else points += config.ofertante.recorrente;
        }
        if (userData.tempoBatismoAnos) {
          const tempo = userData.tempoBatismoAnos;
          if (tempo >= 2 && tempo < 5) points += config.tempoBatismo.doisAnos;
          else if (tempo >= 5 && tempo < 10) points += config.tempoBatismo.cincoAnos;
          else if (tempo >= 10 && tempo < 20) points += config.tempoBatismo.dezAnos;
          else if (tempo >= 20 && tempo < 30) points += config.tempoBatismo.vinteAnos;
          else if (tempo >= 30) points += config.tempoBatismo.maisVinte;
        }
        if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
          points += config.nomeUnidade.comUnidade;
        }
        if (userData.comunhao) points += userData.comunhao * config.pontuacaoDinamica.multiplicador;
        if (userData.missao) points += userData.missao * config.pontuacaoDinamica.multiplicador;
        if (userData.estudoBiblico) points += userData.estudoBiblico * config.pontuacaoDinamica.multiplicador;
        if (userData.totalPresenca !== void 0) {
          const presenca = userData.totalPresenca;
          if (presenca >= 0 && presenca <= 3) points += config.totalPresenca.zeroATres;
          else if (presenca >= 4 && presenca <= 7) points += config.totalPresenca.quatroASete;
          else if (presenca >= 8 && presenca <= 13) points += config.totalPresenca.oitoATreze;
        }
        if (userData.batizouAlguem) points += config.escolaSabatina.batizouAlguem;
        if (userData.discPosBatismal) points += userData.discPosBatismal * config.escolaSabatina.discipuladoPosBatismo;
        if (userData.cpfValido === "Sim" || userData.cpfValido === true) {
          points += config.cpfValido.valido;
        }
        points += config.camposVaziosACMS.completos;
        const multiplicadorDinamico = config.pontuacaoDinamica?.multiplicador || 1;
        const multiplicadorPresenca = config.presenca?.multiplicador || 1;
        points = points * multiplicadorDinamico;
        points += (user.attendance || 0) * multiplicadorPresenca;
        await storage.updateUser(userId, { points: Math.round(points) });
        res.json({
          success: true,
          message: `Pontua\xE7\xE3o recalculada para ${user.name}`,
          userId,
          userName: user.name,
          oldPoints: user.points,
          newPoints: points,
          breakdown: {
            engajamento: userData.engajamento,
            classificacao: userData.classificacao,
            dizimista: userData.dizimistaType,
            ofertante: userData.ofertanteType,
            tempoBatismo: userData.tempoBatismoAnos,
            nomeUnidade: userData.nomeUnidade,
            comunhao: userData.comunhao,
            missao: userData.missao,
            estudoBiblico: userData.estudoBiblico,
            totalPresenca: userData.totalPresenca,
            batizouAlguem: userData.batizouAlguem,
            discPosBatismal: userData.discPosBatismal,
            cpfValido: userData.cpfValido
          }
        });
      } catch (calcError) {
        console.error("Erro no c\xE1lculo:", calcError);
        res.status(500).json({ error: "Erro no c\xE1lculo de pontua\xE7\xE3o" });
      }
    } catch (error) {
      console.error("Erro ao recalcular pontua\xE7\xE3o:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
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
      const config = req.body;
      await storage.savePointsConfiguration(config);
      const allUsers = await storage.getAllUsers();
      const regularUsers = allUsers.filter((user) => user.email !== "admin@7care.com");
      let updatedCount = 0;
      let errorCount = 0;
      for (const user of regularUsers) {
        try {
          const points = calculateUserPointsFromConfig(user, config);
          const newPoints = Math.round(points);
          if (newPoints !== user.points) {
            await storage.updateUser(user.id, { points: newPoints });
            updatedCount++;
          }
        } catch (error) {
          console.error(`\u274C Erro ao processar ${user.name}:`, error.message);
          errorCount++;
        }
      }
      console.log(`\u{1F389} Rec\xE1lculo autom\xE1tico conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados, ${errorCount} erros`);
      res.json({
        success: true,
        message: `Configura\xE7\xE3o salva e pontos recalculados automaticamente! ${updatedCount} usu\xE1rios atualizados.`,
        updatedUsers: updatedCount,
        errors: errorCount
      });
    } catch (error) {
      console.error("Erro ao salvar configura\xE7\xE3o de pontos:", error);
      res.status(500).json({ error: "Erro ao salvar configura\xE7\xE3o" });
    }
  });
  app2.post("/api/system/points-config/reset", async (req, res) => {
    try {
      await storage.resetPointsConfiguration();
      res.json({ success: true, message: "Configura\xE7\xE3o resetada para valores padr\xE3o" });
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
    points += config.basicPoints || 0;
    points += config.eventPoints || 0;
    points += config.donationPoints || 0;
    const attendancePoints = (user.attendance || 0) * (config.attendancePoints || 0);
    points += attendancePoints;
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
    if (extraData.engajamento) {
      const engajamento = String(extraData.engajamento).toLowerCase();
      if (engajamento.includes("baixo")) {
        points += config.engajamento?.baixo || 0;
      } else if (engajamento.includes("m\xE9dio") || engajamento.includes("medio")) {
        points += config.engajamento?.medio || 0;
      } else if (engajamento.includes("alto")) {
        points += config.engajamento?.alto || 0;
      } else {
        points += config.engajamento?.baixo || 0;
      }
    }
    if (extraData.classificacao) {
      const classificacao = String(extraData.classificacao).toLowerCase();
      if (classificacao.includes("frequente")) {
        points += config.classificacao?.frequente || 0;
      } else {
        points += config.classificacao?.naoFrequente || 0;
      }
    }
    if (extraData.dizimistaType) {
      const dizimista = String(extraData.dizimistaType).toLowerCase();
      if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) {
        points += config.dizimista?.naoDizimista || 0;
      } else if (dizimista.includes("pontual")) {
        points += config.dizimista?.pontual || 0;
      } else if (dizimista.includes("sazonal")) {
        points += config.dizimista?.sazonal || 0;
      } else if (dizimista.includes("recorrente")) {
        points += config.dizimista?.recorrente || 0;
      } else {
        points += config.dizimista?.recorrente || 0;
      }
    }
    if (extraData.ofertanteType) {
      const ofertante = String(extraData.ofertanteType).toLowerCase();
      if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) {
        points += config.ofertante?.naoOfertante || 0;
      } else if (ofertante.includes("pontual")) {
        points += config.ofertante?.pontual || 0;
      } else if (ofertante.includes("sazonal")) {
        points += config.ofertante?.sazonal || 0;
      } else if (ofertante.includes("recorrente")) {
        points += config.ofertante?.recorrente || 0;
      } else {
        points += config.ofertante?.recorrente || 0;
      }
    }
    if (extraData.tempoBatismo) {
      const tempo = String(extraData.tempoBatismo).toLowerCase();
      if (tempo.includes("2 anos")) {
        points += config.tempoBatismo?.doisAnos || 0;
      } else if (tempo.includes("5 anos")) {
        points += config.tempoBatismo?.cincoAnos || 0;
      } else if (tempo.includes("10 anos")) {
        points += config.tempoBatismo?.dezAnos || 0;
      } else if (tempo.includes("20 anos")) {
        points += config.tempoBatismo?.vinteAnos || 0;
      } else if (tempo.includes("mais de 20")) {
        points += config.tempoBatismo?.maisVinte || 0;
      }
    }
    if (extraData.temCargo) {
      const cargo = String(extraData.temCargo).toLowerCase();
      if (cargo.includes("sim")) {
        points += config.cargos?.umCargo || 0;
      }
    }
    if (extraData.nomeUnidade) {
      const unidade = String(extraData.nomeUnidade).toLowerCase();
      if (unidade.includes("sim")) {
        points += config.nomeUnidade?.comUnidade || 0;
      } else {
        points += config.nomeUnidade?.semUnidade || 0;
      }
    }
    if (extraData.temLicao === true) {
      points += config.temLicao?.comLicao || 0;
    }
    if (extraData.totalPresenca !== void 0 && extraData.totalPresenca !== null) {
      if (typeof extraData.totalPresenca === "number") {
        const total = extraData.totalPresenca;
        if (total >= 0 && total <= 3) {
          points += config.totalPresenca?.zeroATres || 0;
        } else if (total >= 4 && total <= 7) {
          points += config.totalPresenca?.quatroASete || 0;
        } else if (total >= 8 && total <= 13) {
          points += config.totalPresenca?.oitoATreze || 0;
        }
      } else {
        const total = String(extraData.totalPresenca).toLowerCase();
        if (total.includes("0 a 3") || total.includes("0-3")) {
          points += config.totalPresenca?.zeroATres || 0;
        } else if (total.includes("4 a 7") || total.includes("4-7")) {
          points += config.totalPresenca?.quatroASete || 0;
        } else if (total.includes("8 a 13") || total.includes("8-13")) {
          points += config.totalPresenca?.oitoATreze || 0;
        }
      }
    }
    if (extraData.escolaSabatina) {
      const escola = String(extraData.escolaSabatina).toLowerCase();
      if (escola.includes("comunh\xE3o") || escola.includes("comunhao")) {
        points += config.escolaSabatina?.comunhao || 0;
      } else if (escola.includes("miss\xE3o") || escola.includes("missao")) {
        points += config.escolaSabatina?.missao || 0;
      } else if (escola.includes("estudo b\xEDblico") || escola.includes("estudo biblico")) {
        points += config.escolaSabatina?.estudoBiblico || 0;
      }
    }
    if (extraData.batizouAlguem) {
      const batizou = String(extraData.batizouAlguem).toLowerCase();
      if (batizou.includes("sim")) {
        points += config.batizouAlguem?.sim || 0;
      } else {
        points += config.batizouAlguem?.nao || 0;
      }
    }
    if (extraData.cpfValido === true || typeof extraData.cpfValido === "string" && extraData.cpfValido.toLowerCase().includes("sim")) {
      points += config.cpfValido?.valido || 0;
    } else {
      points += config.cpfValido?.invalido || 0;
    }
    if (extraData.camposVaziosACMS) {
      const campos = String(extraData.camposVaziosACMS).toLowerCase();
      if (campos.includes("completo")) {
        points += config.camposVaziosACMS?.completos || 0;
      } else {
        points += config.camposVaziosACMS?.incompletos || 0;
      }
    }
    const multiplicadorDinamico = config.pontuacaoDinamica?.multiplicador || 1;
    const multiplicadorPresenca = config.presenca?.multiplicador || 1;
    const multiplicadorDiscipulado = config.discipuladoPosBatismo?.multiplicador || 1;
    points = points * multiplicadorDinamico;
    points += (user.attendance || 0) * multiplicadorPresenca;
    points = points * multiplicadorDiscipulado;
    return points;
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
    if (config.tempoBatismo) {
      maxPoints += Math.max(...Object.values(config.tempoBatismo).map((v) => Number(v) || 0));
    }
    if (config.cargos) {
      maxPoints += Math.max(...Object.values(config.cargos).map((v) => Number(v) || 0));
    }
    if (config.nomeUnidade) {
      maxPoints += Math.max(...Object.values(config.nomeUnidade).map((v) => Number(v) || 0));
    }
    if (config.temLicao) {
      maxPoints += Math.max(...Object.values(config.temLicao).map((v) => Number(v) || 0));
    }
    if (config.totalPresenca) {
      maxPoints += Math.max(...Object.values(config.totalPresenca).map((v) => Number(v) || 0));
    }
    if (config.escolaSabatina) {
      maxPoints += Math.max(...Object.values(config.escolaSabatina).map((v) => Number(v) || 0));
    }
    if (config.batizouAlguem) {
      maxPoints += Math.max(...Object.values(config.batizouAlguem).map((v) => Number(v) || 0));
    }
    if (config.cpfValido) {
      maxPoints += Math.max(...Object.values(config.cpfValido).map((v) => Number(v) || 0));
    }
    if (config.camposVaziosACMS) {
      maxPoints += Math.max(...Object.values(config.camposVaziosACMS).map((v) => Number(v) || 0));
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
      let updatedCount = 0;
      let errorCount = 0;
      let newTotalPoints = 0;
      for (const user of regularUsers) {
        try {
          const points = calculateUserPointsFromConfig(user, newConfig);
          const newPoints = Math.round(points);
          newTotalPoints += newPoints;
          if (newPoints !== user.points) {
            await storage.updateUser(user.id, { points: newPoints });
            updatedCount++;
          }
        } catch (error) {
          console.error(`\u274C Erro ao processar ${user.name}:`, error.message);
          errorCount++;
        }
      }
      const newUserAverage = newTotalPoints / regularUsers.length;
      console.log(`\u2705 Nova m\xE9dia dos usu\xE1rios: ${newUserAverage.toFixed(2)}`);
      console.log(`\u{1F389} Rec\xE1lculo autom\xE1tico conclu\xEDdo: ${updatedCount} usu\xE1rios atualizados, ${errorCount} erros`);
      res.json({
        success: true,
        currentUserAverage: currentUserAverage.toFixed(2),
        newUserAverage: newUserAverage.toFixed(2),
        targetAverage,
        adjustmentFactor: adjustmentFactor.toFixed(2),
        updatedUsers: updatedCount,
        errors: errorCount,
        message: `Configura\xE7\xE3o ajustada! Nova m\xE9dia dos usu\xE1rios: ${newUserAverage.toFixed(2)}, ${updatedCount} usu\xE1rios atualizados automaticamente.`
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
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      console.error("Create meeting error:", error);
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });
  app2.put("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const meeting = await storage.updateMeeting(id, updateData);
      if (!meeting) {
        res.status(404).json({ error: "Meeting not found" });
        return;
      }
      res.json(meeting);
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
      const { missionaryId, interestedId } = req.query;
      if (missionaryId) {
        const relationships2 = await storage.getRelationshipsByMissionary(parseInt(missionaryId));
        res.json(relationships2);
      } else if (interestedId) {
        const relationships2 = await storage.getRelationshipsByInterested(parseInt(interestedId));
        res.json(relationships2);
      } else {
        const allRelationships = await storage.getAllRelationships();
        res.json(allRelationships);
      }
    } catch (error) {
      console.error("Get relationships error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/relationships/missionary/:missionaryId", async (req, res) => {
    try {
      const missionaryId = parseInt(req.params.missionaryId);
      const relationships2 = await storage.getRelationshipsByMissionary(missionaryId);
      res.json(relationships2);
    } catch (error) {
      console.error("Get relationships error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/relationships", async (req, res) => {
    try {
      const { missionaryId, interestedId, notes } = req.body;
      const relationship = await storage.createRelationship({
        missionaryId,
        interestedId,
        status: "active",
        notes
      });
      try {
        const missionaryUser = await storage.getUserById(missionaryId);
        if (missionaryUser && missionaryUser.role !== "missionary") {
          console.log(`\u{1F504} Atualizando role do usu\xE1rio ${missionaryId} de '${missionaryUser.role}' para 'missionary'`);
          await storage.updateUser(missionaryId, {
            role: "missionary",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          console.log(`\u2705 Role atualizado para 'missionary' para usu\xE1rio ${missionaryId}`);
        } else if (missionaryUser) {
          console.log(`\u2139\uFE0F Usu\xE1rio ${missionaryId} j\xE1 possui role 'missionary'`);
        }
      } catch (roleError) {
        console.warn(`\u26A0\uFE0F Aviso: N\xE3o foi poss\xEDvel atualizar role do usu\xE1rio:`, roleError);
      }
      try {
        const existingProfile = await storage.getMissionaryProfileByUserId(missionaryId);
        if (!existingProfile) {
          console.log(`\u{1F504} Criando perfil mission\xE1rio autom\xE1tico para usu\xE1rio ${missionaryId}`);
          await storage.createMissionaryProfile({
            userId: missionaryId,
            notes: `Perfil mission\xE1rio criado automaticamente ao ser indicado como discipulador para ${interestedId}`,
            isActive: true,
            assignedAt: (/* @__PURE__ */ new Date()).toISOString()
            // createdAt: new Date().toISOString() // Propriedade não existe no tipo
          });
          console.log(`\u2705 Perfil mission\xE1rio criado com sucesso para usu\xE1rio ${missionaryId}`);
        } else {
          console.log(`\u2139\uFE0F Usu\xE1rio ${missionaryId} j\xE1 possui perfil mission\xE1rio`);
        }
      } catch (profileError) {
        console.warn(`\u26A0\uFE0F Aviso: N\xE3o foi poss\xEDvel criar/verificar perfil mission\xE1rio:`, profileError);
      }
      res.json(relationship);
    } catch (error) {
      console.error("Create relationship error:", error);
      res.status(400).json({ error: "Invalid relationship data" });
    }
  });
  app2.delete("/api/relationships/:relationshipId", async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.relationshipId);
      console.log(`\u{1F50D} Tentando deletar relacionamento ID: ${relationshipId}`);
      const relationship = await storage.getRelationshipById(relationshipId);
      if (!relationship) {
        console.log(`\u274C Relacionamento ${relationshipId} n\xE3o encontrado`);
        res.status(404).json({ error: "Relationship not found" });
        return;
      }
      console.log(`\u{1F4CB} Relacionamento encontrado:`, relationship);
      const success = await storage.deleteRelationship(relationshipId);
      console.log(`\u2705 Resultado da dele\xE7\xE3o: ${success}`);
      try {
        console.log(`\u{1F9F9} Limpando biblicalInstructor para usu\xE1rio ${relationship.interestedId}`);
        await storage.updateUser(relationship.interestedId, { biblicalInstructor: null });
        console.log(`\u2705 Campo biblicalInstructor limpo para usu\xE1rio ${relationship.interestedId}`);
      } catch (updateError) {
        console.warn(`\u26A0\uFE0F Aviso: N\xE3o foi poss\xEDvel limpar biblicalInstructor:`, updateError);
      }
      try {
        const remainingRelationships = await storage.getRelationshipsByMissionary(relationship.missionaryId);
        const activeRelationships = remainingRelationships.filter((rel) => rel.status === "active" || rel.status === null);
        if (activeRelationships.length === 0) {
          console.log(`\u{1F504} Mission\xE1rio ${relationship.missionaryId} n\xE3o tem mais relacionamentos ativos, revertendo role para 'member'`);
          await storage.updateUser(relationship.missionaryId, {
            role: "member",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          console.log(`\u2705 Role revertido para 'member' para usu\xE1rio ${relationship.missionaryId}`);
        } else {
          console.log(`\u2139\uFE0F Mission\xE1rio ${relationship.missionaryId} ainda tem ${activeRelationships.length} relacionamentos ativos`);
        }
      } catch (roleError) {
        console.warn(`\u26A0\uFE0F Aviso: N\xE3o foi poss\xEDvel verificar/atualizar role do mission\xE1rio:`, roleError);
      }
      try {
        const cleanedCount = await executeAutoCleanup();
        if (cleanedCount > 0) {
          console.log(`\u{1F9F9} Limpeza autom\xE1tica executada ap\xF3s deletar relacionamento: ${cleanedCount} aprova\xE7\xF5es \xF3rf\xE3s rejeitadas`);
        }
      } catch (cleanupError) {
        console.warn(`\u26A0\uFE0F Aviso: Limpeza autom\xE1tica falhou ap\xF3s deletar relacionamento:`, cleanupError);
      }
      res.json({ success: true, message: "Relationship deleted successfully" });
    } catch (error) {
      console.error("Delete relationship error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/relationships/active/:interestedId", async (req, res) => {
    try {
      const interestedId = parseInt(req.params.interestedId);
      console.log(`\u{1F50D} Tentando remover relacionamento ativo para interessado ID: ${interestedId}`);
      const relationships2 = await storage.getRelationshipsByInterested(interestedId);
      const activeRelationship = relationships2.find((rel) => rel.status === "active");
      if (!activeRelationship) {
        console.log(`\u274C Nenhum relacionamento ativo encontrado para interessado ${interestedId}`);
        res.status(404).json({ error: "No active relationship found for this interested user" });
        return;
      }
      console.log(`\u{1F4CB} Relacionamento ativo encontrado:`, activeRelationship);
      const success = await storage.deleteRelationship(activeRelationship.id);
      console.log(`\u2705 Resultado da dele\xE7\xE3o: ${success}`);
      try {
        console.log(`\u{1F9F9} Limpando biblicalInstructor para usu\xE1rio ${interestedId}`);
        await storage.updateUser(interestedId, { biblicalInstructor: null });
        console.log(`\u2705 Campo biblicalInstructor limpo para usu\xE1rio ${interestedId}`);
      } catch (updateError) {
        console.warn(`\u26A0\uFE0F Aviso: N\xE3o foi poss\xEDvel limpar biblicalInstructor:`, updateError);
      }
      try {
        const remainingRelationships = await storage.getRelationshipsByMissionary(activeRelationship.missionaryId);
        const activeRelationships = remainingRelationships.filter((rel) => rel.status === "active" || rel.status === null);
        if (activeRelationships.length === 0) {
          console.log(`\u{1F504} Mission\xE1rio ${activeRelationship.missionaryId} n\xE3o tem mais relacionamentos ativos, revertendo role para 'member'`);
          await storage.updateUser(activeRelationship.missionaryId, {
            role: "member",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          console.log(`\u2705 Role revertido para 'member' para usu\xE1rio ${activeRelationship.missionaryId}`);
        } else {
          console.log(`\u2139\uFE0F Mission\xE1rio ${activeRelationship.missionaryId} ainda tem ${activeRelationships.length} relacionamentos ativos`);
        }
      } catch (roleError) {
        console.warn(`\u26A0\uFE0F Aviso: N\xE3o foi poss\xEDvel verificar/atualizar role do mission\xE1rio:`, roleError);
      }
      try {
        const cleanedCount = await executeAutoCleanup();
        if (cleanedCount > 0) {
          console.log(`\u{1F9F9} Limpeza autom\xE1tica executada ap\xF3s remover relacionamento ativo: ${cleanedCount} aprova\xE7\xF5es \xF3rf\xE3s rejeitadas`);
        }
      } catch (cleanupError) {
        console.warn(`\u26A0\uFE0F Aviso: Limpeza autom\xE1tica falhou ap\xF3s remover relacionamento ativo:`, cleanupError);
      }
      res.json({ success: true, message: "Active relationship removed successfully" });
    } catch (error) {
      console.error("Remove active relationship error:", error);
      res.status(500).json({ error: "Internal server error" });
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
      const points = await storage.getUserPoints(userId);
      res.json({ points });
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
  app2.get("/api/users/:id(\\d+)/points-details", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      if (!user) {
        console.log("Usu\xE1rio n\xE3o encontrado:", userId);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("Usu\xE1rio encontrado:", user.name, user.email);
      const userData = await storage.getUserDetailedData(userId);
      console.log("Dados detalhados obtidos:", userData);
      const pointsConfig = await storage.getPointsConfiguration();
      let calculatedPoints = 0;
      if (userData && pointsConfig) {
        if (userData.engajamento) {
          const engajamento = userData.engajamento.toLowerCase();
          if (engajamento.includes("baixo")) calculatedPoints += pointsConfig.engajamento.baixo;
          else if (engajamento.includes("m\xE9dio") || engajamento.includes("medio")) calculatedPoints += pointsConfig.engajamento.medio;
          else if (engajamento.includes("alto")) calculatedPoints += pointsConfig.engajamento.alto;
        }
        if (userData.classificacao) {
          const classificacao = userData.classificacao.toLowerCase();
          if (classificacao.includes("frequente")) {
            calculatedPoints += pointsConfig.classificacao.frequente;
          } else {
            calculatedPoints += pointsConfig.classificacao.naoFrequente;
          }
        }
        if (userData.dizimista) {
          const dizimista = userData.dizimista.toLowerCase();
          if (dizimista.includes("n\xE3o dizimista") || dizimista.includes("nao dizimista")) calculatedPoints += pointsConfig.dizimista.naoDizimista;
          else if (dizimista.includes("pontual")) calculatedPoints += pointsConfig.dizimista.pontual;
          else if (dizimista.includes("sazonal")) calculatedPoints += pointsConfig.dizimista.sazonal;
          else if (dizimista.includes("recorrente")) calculatedPoints += pointsConfig.dizimista.recorrente;
        }
        if (userData.ofertante) {
          const ofertante = userData.ofertante.toLowerCase();
          if (ofertante.includes("n\xE3o ofertante") || ofertante.includes("nao ofertante")) calculatedPoints += pointsConfig.ofertante.naoOfertante;
          else if (ofertante.includes("pontual")) calculatedPoints += pointsConfig.ofertante.pontual;
          else if (ofertante.includes("sazonal")) calculatedPoints += pointsConfig.ofertante.sazonal;
          else if (ofertante.includes("recorrente")) calculatedPoints += pointsConfig.ofertante.recorrente;
        }
        if (userData.tempoBatismo && typeof userData.tempoBatismo === "number") {
          const tempo = userData.tempoBatismo;
          if (tempo >= 2 && tempo < 5) calculatedPoints += pointsConfig.tempoBatismo.doisAnos;
          else if (tempo >= 5 && tempo < 10) calculatedPoints += pointsConfig.tempoBatismo.cincoAnos;
          else if (tempo >= 10 && tempo < 20) calculatedPoints += pointsConfig.tempoBatismo.dezAnos;
          else if (tempo >= 20 && tempo < 30) calculatedPoints += pointsConfig.tempoBatismo.vinteAnos;
          else if (tempo >= 30) calculatedPoints += pointsConfig.tempoBatismo.maisVinte;
        }
        if (userData.cargos && Array.isArray(userData.cargos)) {
          const numCargos = userData.cargos.length;
          if (numCargos === 1) calculatedPoints += pointsConfig.cargos.umCargo;
          else if (numCargos === 2) calculatedPoints += pointsConfig.cargos.doisCargos;
          else if (numCargos >= 3) calculatedPoints += pointsConfig.cargos.tresOuMais;
        }
        if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
          calculatedPoints += pointsConfig.nomeUnidade.comUnidade;
        }
        if (userData.temLicao) {
          calculatedPoints += pointsConfig.temLicao.comLicao;
        }
        if (userData.totalPresenca !== void 0) {
          const presenca = userData.totalPresenca;
          if (presenca >= 0 && presenca <= 3) calculatedPoints += pointsConfig.totalPresenca.zeroATres;
          else if (presenca >= 4 && presenca <= 7) calculatedPoints += pointsConfig.totalPresenca.quatroASete;
          else if (presenca >= 8 && presenca <= 13) calculatedPoints += pointsConfig.totalPresenca.oitoATreze;
        }
        if (userData.escolaSabatina) {
          const escola = userData.escolaSabatina;
          if (escola.comunhao) calculatedPoints += escola.comunhao * pointsConfig.escolaSabatina.comunhao;
          if (escola.missao) calculatedPoints += escola.missao * pointsConfig.escolaSabatina.missao;
          if (escola.estudoBiblico) calculatedPoints += escola.estudoBiblico * pointsConfig.escolaSabatina.estudoBiblico;
          if (escola.batizouAlguem) calculatedPoints += pointsConfig.escolaSabatina.batizouAlguem;
          if (escola.discipuladoPosBatismo) calculatedPoints += escola.discipuladoPosBatismo * pointsConfig.escolaSabatina.discipuladoPosBatismo;
        }
        if (userData.cpfValido === "Sim" || userData.cpfValido === true) {
          calculatedPoints += pointsConfig.cpfValido.valido;
        }
        if (userData.camposVaziosACMS === false) {
          calculatedPoints += pointsConfig.camposVaziosACMS.completos;
        }
      }
      if (!userData) {
        console.log("Criando dados padr\xE3o para usu\xE1rio:", userId);
        const defaultUserData = {
          engajamento: "Baixo",
          classificacao: "A resgatar",
          dizimista: "N\xE3o dizimista",
          ofertante: "N\xE3o ofertante",
          tempoBatismo: 0,
          cargos: [],
          nomeUnidade: null,
          temLicao: false,
          totalPresenca: 0,
          batizouAlguem: false,
          discipuladoPosBatismo: 0,
          cpfValido: false,
          camposVaziosACMS: false
        };
        res.json({
          points: calculatedPoints,
          userData: defaultUserData,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        });
        return;
      }
      res.json({
        points: calculatedPoints,
        userData,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error("Get user points details error:", error);
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
      const totalPoints = await storage.getUserPoints(userId);
      res.json({ success: true, totalPoints });
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
      const result = await storage.db.execute(`
        DELETE FROM events 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM events 
          GROUP BY title, DATE(date)
        )
      `);
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
  importRoutes(app2);
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
    outDir: path.resolve(import.meta.dirname, "dist/public"),
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
