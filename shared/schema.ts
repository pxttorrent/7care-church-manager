// Schema simplificado para LocalStorage
// Removidas dependências do Drizzle ORM
import { z } from "zod";

// Tipos TypeScript para as entidades
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member' | 'interested' | 'missionary';
  church: string;
  churchCode: string;
  departments: string;
  birthDate: string;
  civilStatus: string;
  occupation: string;
  education: string;
  address: string;
  baptismDate: string;
  previousReligion: string;
  biblicalInstructor: string | null;
  interestedSituation: string;
  isDonor: boolean;
  isTither: boolean;
  isApproved: boolean;
  points: number;
  level: string;
  attendance: number;
  extraData: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
  firstAccess: boolean;
  status?: string;
  phone?: string;
  cpf?: string;
  profilePhoto?: string;
  isOffering?: boolean;
  hasLesson?: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizerId: number;
  church: string;
  isRecurring: boolean;
  recurrencePattern: string;
  maxParticipants: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Church {
  id: number;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schemas Zod para validação
export const insertUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'member', 'interested', 'missionary']),
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
  firstAccess: z.boolean().default(true),
});

export const insertMeetingSchema = z.object({
  requesterId: z.number(),
  assignedToId: z.number().optional(),
  typeId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string(),
  duration: z.number().default(60),
  location: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isUrgent: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export const insertEventSchema = z.object({
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
  isPublic: z.boolean().default(true),
});

export const insertMessageSchema = z.object({
  conversationId: z.number(),
  senderId: z.number(),
  content: z.string().min(1),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  isRead: z.boolean().default(false),
});

// Tipos adicionais para compatibilidade
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  updatedAt?: string;
};
export type InsertEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertChurch = Omit<Church, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertMeeting = any;
export type InsertMessage = any;
export type InsertNotification = any;
export type InsertDiscipleshipRequest = any;
export type InsertRelationship = any;

// Interfaces adicionais para compatibilidade
export interface Relationship {
  id: number;
  userId1: number;
  userId2: number;
  relationshipType: string;
  createdAt: string;
  interestedId?: number;
  missionaryId?: number;
  status?: string;
  notes?: string;
}

export interface Meeting {
  id: number;
  requesterId: number;
  assignedToId: number;
  typeId: number;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  location: string;
  priority: string;
  isUrgent: boolean;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  type: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoCallSession {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingType {
  id: number;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  requiredConditions: string;
  badgeColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointActivity {
  id: number;
  userId: number;
  pointId: number;
  points: number;
  description: string;
  createdAt: string;
}

export interface DiscipleshipRequest {
  id: number;
  requesterId: number;
  mentorId: number;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  interestedId?: number;
  missionaryId?: number;
  notes?: string;
}

export interface MissionaryProfile {
  id: number;
  userId: number;
  missionField: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

// Exportar arrays vazios para compatibilidade
export const users: User[] = [];
export const events: Event[] = [];
export const churches: Church[] = [];
