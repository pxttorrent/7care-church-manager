import { pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar, date } from 'drizzle-orm/pg-core';

// Tabela de usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('member'),
  church: text('church'),
  churchCode: text('church_code'),
  departments: text('departments'),
  birthDate: date('birth_date'),
  civilStatus: text('civil_status'),
  occupation: text('occupation'),
  education: text('education'),
  address: text('address'),
  baptismDate: date('baptism_date'),
  previousReligion: text('previous_religion'),
  biblicalInstructor: text('biblical_instructor'),
  interestedSituation: text('interested_situation'),
  isDonor: boolean('is_donor').default(false),
  isTither: boolean('is_tither').default(false),
  isApproved: boolean('is_approved').default(false),
  points: integer('points').default(0),
  level: text('level').default('Iniciante'),
  attendance: integer('attendance').default(0),
  extraData: jsonb('extra_data'),
  observations: text('observations'),
  firstAccess: boolean('first_access').default(true),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de igrejas
export const churches = pgTable('churches', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  address: text('address'),
  email: text('email'),
  phone: text('phone'),
  pastor: text('pastor'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de eventos
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  type: text('type').notNull(),
  capacity: integer('capacity'),
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: text('recurrence_pattern'),
  createdBy: integer('created_by').references(() => users.id),
  churchId: integer('church_id').references(() => churches.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de relacionamentos
export const relationships = pgTable('relationships', {
  id: serial('id').primaryKey(),
  interestedId: integer('interested_id').references(() => users.id),
  missionaryId: integer('missionary_id').references(() => users.id),
  status: text('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de reuniões
export const meetings = pgTable('meetings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  location: text('location'),
  type: text('type').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  churchId: integer('church_id').references(() => churches.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de mensagens
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  senderId: integer('sender_id').references(() => users.id),
  conversationId: integer('conversation_id').references(() => conversations.id),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de conversas
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  title: text('title'),
  type: text('type').default('private'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de notificações
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de solicitações de discipulado
export const discipleshipRequests = pgTable('discipleship_requests', {
  id: serial('id').primaryKey(),
  interestedId: integer('interested_id').references(() => users.id),
  missionaryId: integer('missionary_id').references(() => users.id),
  status: text('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de perfis missionários
export const missionaryProfiles = pgTable('missionary_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  specialization: text('specialization'),
  experience: text('experience'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de check-ins emocionais
export const emotionalCheckins = pgTable('emotional_checkins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  mood: text('mood').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de configurações de pontos
export const pointConfigs = pgTable('point_configs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: integer('value').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de conquistas
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  pointsRequired: integer('points_required').notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de atividades de pontos
export const pointActivities = pgTable('point_activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  activity: text('activity').notNull(),
  points: integer('points').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de configurações do sistema
export const systemConfig = pgTable('system_config', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de configurações do sistema (settings)
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de participantes de eventos
export const eventParticipants = pgTable('event_participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  userId: integer('user_id').references(() => users.id),
  status: text('status').default('registered'),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de tipos de reunião
export const meetingTypes = pgTable('meeting_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de conquistas do usuário
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  achievementId: integer('achievement_id').references(() => achievements.id),
  earnedAt: timestamp('earned_at').defaultNow()
});

// Tabela de histórico de pontos do usuário
export const userPointsHistory = pgTable('user_points_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  points: integer('points').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de orações
export const prayers = pgTable('prayers', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  requesterId: integer('requester_id').references(() => users.id),
  status: text('status').default('active'),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela de intercessores de oração
export const prayerIntercessors = pgTable('prayer_intercessors', {
  id: serial('id').primaryKey(),
  prayerId: integer('prayer_id').references(() => prayers.id),
  userId: integer('user_id').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow()
});

// Tabela de sessões de vídeo
export const videoCallSessions = pgTable('video_call_sessions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  hostId: integer('host_id').references(() => users.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  status: text('status').default('scheduled'),
  meetingId: text('meeting_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabela de participantes de vídeo
export const videoCallParticipants = pgTable('video_call_participants', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => videoCallSessions.id),
  userId: integer('user_id').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at')
});

// Tabela de participantes de conversas
export const conversationParticipants = pgTable('conversation_participants', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id),
  userId: integer('user_id').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow()
});

// Tabela de permissões de filtros de eventos
export const eventFilterPermissions = pgTable('event_filter_permissions', {
  id: serial('id').primaryKey(),
  permissions: jsonb('permissions').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Exportar todas as tabelas
export const schema = {
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
