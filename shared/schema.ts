import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with complete church member data
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Authentication
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  // Basic info
  name: text("name").notNull(),
  phone: text("phone"),
  cpf: text("cpf"),
  profilePhoto: text("profile_photo"),
  // Role and status
  role: text("role").notNull().default("interested"), // admin, missionary, member, interested
  status: text("status").notNull().default("pending"), // approved, pending, rejected
  isApproved: boolean("is_approved").notNull().default(false),
  // Church info
  church: text("church"),
  churchCode: text("church_code"),
  departments: text("departments"),
  // Personal info
  birthDate: timestamp("birth_date"),
  civilStatus: text("civil_status"), // single, married, divorced, widowed
  occupation: text("occupation"),
  education: text("education"),
  address: text("address"),
  // Spiritual info
  baptismDate: timestamp("baptism_date"),
  previousReligion: text("previous_religion"),
  biblicalInstructor: text("biblical_instructor"),
  // Financial
  isDonor: boolean("is_donor").default(false),
  isOffering: boolean("is_offering").default(false),
  // Academic
  isEnrolledES: boolean("is_enrolled_es").default(false), // Escola Sabatina
  hasLesson: boolean("has_lesson").default(false),
  esPeriod: text("es_period"),
  // Engagement
  points: integer("points").default(0),
  level: text("level").default("Iniciante"),
  attendance: integer("attendance").default(0),
  // Extra data
  extraData: jsonb("extra_data"),
  observations: text("observations"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  firstAccess: boolean("first_access").default(true),
});

// Relationships between missionaries and interested people
export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  missionaryId: integer("missionary_id").references(() => users.id).notNull(),
  interestedId: integer("interested_id").references(() => users.id).notNull(),
  status: text("status").default("active"), // active, inactive, completed
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

// Meeting types and requests
export const meetingTypes = pgTable("meeting_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true),
});

// Meeting requests and appointments
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  typeId: integer("type_id").references(() => meetingTypes.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at"),
  duration: integer("duration").default(60), // minutes
  location: text("location"),
  priority: text("priority").default("medium"), // low, medium, high
  isUrgent: boolean("is_urgent").default(false),
  status: text("status").default("pending"), // pending, approved, rejected, completed, cancelled
  materials: text("materials"),
  tags: text("tags"),
  notes: text("notes"),
  pastoralNotes: text("pastoral_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name"), // For group chats
  isGroup: boolean("is_group").default(false),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation participants
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, image, file, emoji
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video call sessions
export const videoCallSessions = pgTable("video_call_sessions", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  meetingId: integer("meeting_id").references(() => meetings.id),
  title: text("title").notNull(),
  roomId: text("room_id").notNull().unique(),
  status: text("status").default("scheduled"), // scheduled, active, ended
  maxParticipants: integer("max_participants").default(10),
  isRecording: boolean("is_recording").default(false),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video call participants
export const videoCallParticipants = pgTable("video_call_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => videoCallSessions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  duration: integer("duration"), // seconds
});

// Events and activities
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // worship, study, prayer, visit, etc
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  organizerId: integer("organizer_id").references(() => users.id).notNull(),
  maxParticipants: integer("max_participants"),
  isPublic: boolean("is_public").default(true),
  church: text("church"),
  requirements: text("requirements").array(),
  materials: text("materials").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").default("registered"), // registered, confirmed, attended, absent
  registeredAt: timestamp("registered_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Points and achievements system
export const pointActivities = pgTable("point_activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  category: text("category").notNull(), // attendance, participation, service, study
  isActive: boolean("is_active").default(true),
});

// User points history
export const userPointsHistory = pgTable("user_points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityId: integer("activity_id").references(() => pointActivities.id).notNull(),
  points: integer("points").notNull(),
  description: text("description"),
  awardedBy: integer("awarded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements and badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  requiredPoints: integer("required_points"),
  requiredConditions: jsonb("required_conditions"),
  badgeColor: text("badge_color").default("#blue"),
  isActive: boolean("is_active").default(true),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // meeting, message, achievement, system
  relatedId: integer("related_id"), // ID of related object (meeting, message, etc)
  relatedType: text("related_type"), // meetings, messages, etc
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertRelationshipSchema = createInsertSchema(relationships).omit({
  id: true,
  assignedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;
export type Relationship = typeof relationships.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type MeetingType = typeof meetingTypes.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type VideoCallSession = typeof videoCallSessions.$inferSelect;
export type PointActivity = typeof pointActivities.$inferSelect;
export type UserPointsHistory = typeof userPointsHistory.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
