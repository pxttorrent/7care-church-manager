import { 
  User, InsertUser, Relationship, InsertRelationship, Meeting, InsertMeeting, 
  Event, InsertEvent, Message, InsertMessage, Conversation, VideoCallSession,
  MeetingType, Notification, InsertNotification, Achievement, PointActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  createUser(data: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>;
  approveUser(id: number): Promise<User | null>;
  bulkCreateUsers(users: InsertUser[]): Promise<User[]>;
  
  // Churches
  getOrCreateChurch(name: string): Promise<{ id: number; name: string }>;
  getAllChurches(): Promise<Array<{ id: number; name: string; address?: string; isActive: boolean }>>;

  // Relationships (Missionary-Interested)
  createRelationship(data: InsertRelationship): Promise<Relationship>;
  getRelationshipsByMissionary(missionaryId: number): Promise<Relationship[]>;
  getRelationshipsByInterested(interestedId: number): Promise<Relationship[]>;
  updateRelationship(id: number, data: Partial<InsertRelationship>): Promise<Relationship | null>;

  // Meetings
  createMeeting(data: InsertMeeting): Promise<Meeting>;
  getMeetingById(id: number): Promise<Meeting | null>;
  getMeetingsByUser(userId: number): Promise<Meeting[]>;
  getMeetingsByStatus(status: string): Promise<Meeting[]>;
  updateMeeting(id: number, data: Partial<InsertMeeting>): Promise<Meeting | null>;
  deleteMeeting(id: number): Promise<boolean>;
  
  // Meeting Types
  getMeetingTypes(): Promise<MeetingType[]>;
  createMeetingType(data: Omit<MeetingType, 'id'>): Promise<MeetingType>;

  // Events
  createEvent(data: InsertEvent): Promise<Event>;
  getEventById(id: number): Promise<Event | null>;
  getAllEvents(): Promise<Event[]>;
  getEventsByDate(startDate: Date, endDate: Date): Promise<Event[]>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null>;
  deleteEvent(id: number): Promise<boolean>;

  // Messages and Conversations
  createConversation(name: string | null, isGroup: boolean, createdBy: number): Promise<Conversation>;
  getConversationById(id: number): Promise<Conversation | null>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number, limit?: number): Promise<Message[]>;

  // Video Calls
  createVideoCallSession(data: Omit<VideoCallSession, 'id' | 'createdAt'>): Promise<VideoCallSession>;
  getVideoCallSessionById(id: number): Promise<VideoCallSession | null>;
  updateVideoCallSession(id: number, data: Partial<VideoCallSession>): Promise<VideoCallSession | null>;

  // Notifications
  createNotification(data: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;

  // Points and Achievements
  getPointActivities(): Promise<PointActivity[]>;
  getAchievements(): Promise<Achievement[]>;
  addPointsToUser(userId: number, points: number, activityId: number, description?: string): Promise<boolean>;
  getUserPoints(userId: number): Promise<number>;
}

class MemoryStorage implements IStorage {
  private users: User[] = [];
  private relationships: Relationship[] = [];
  private meetings: Meeting[] = [];
  private meetingTypes: MeetingType[] = [];
  private events: Event[] = [];
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private videoCallSessions: VideoCallSession[] = [];
  private notifications: Notification[] = [];
  private pointActivities: PointActivity[] = [];
  private achievements: Achievement[] = [];
  
  private nextUserId = 1;
  private nextRelationshipId = 1;
  private nextMeetingId = 1;
  private nextMeetingTypeId = 1;
  private nextEventId = 1;
  private nextConversationId = 1;
  private nextMessageId = 1;
  private nextVideoCallId = 1;
  private nextNotificationId = 1;
  private nextPointActivityId = 1;
  private nextAchievementId = 1;
  
  // Churches storage
  private churches: Array<{ id: number; name: string; address?: string; isActive: boolean }> = [];
  private nextChurchId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default meeting types
    this.meetingTypes = [
      { id: 1, name: "Oração", description: "Pedidos de oração", icon: "Heart", color: "#ef4444", isActive: true },
      { id: 2, name: "Estudo Bíblico", description: "Estudos bíblicos", icon: "BookOpen", color: "#3b82f6", isActive: true },
      { id: 3, name: "Aconselhamento", description: "Aconselhamento pastoral", icon: "MessageCircle", color: "#10b981", isActive: true },
      { id: 4, name: "Preparação para Batismo", description: "Preparação batismal", icon: "User", color: "#8b5cf6", isActive: true },
      { id: 5, name: "Aconselhamento Matrimonial", description: "Casais", icon: "Heart", color: "#f59e0b", isActive: true },
      { id: 6, name: "Aconselhamento Familiar", description: "Famílias", icon: "Users", color: "#06b6d4", isActive: true },
      { id: 7, name: "Orientação Espiritual", description: "Orientação geral", icon: "Target", color: "#84cc16", isActive: true },
      { id: 8, name: "Discipulado", description: "Discipulado", icon: "BookOpen", color: "#ec4899", isActive: true },
      { id: 9, name: "Visita", description: "Visitas pastorais", icon: "Home", color: "#f97316", isActive: true },
      { id: 10, name: "Videochamada", description: "Chamadas online", icon: "Video", color: "#6366f1", isActive: true }
    ];
    this.nextMeetingTypeId = 11;

    // Initialize point activities
    this.pointActivities = [
      { id: 1, name: "Presença no Culto", description: "Participar do culto", points: 10, category: "attendance", isActive: true },
      { id: 2, name: "Estudo Bíblico", description: "Participar de estudo bíblico", points: 15, category: "study", isActive: true },
      { id: 3, name: "Oração", description: "Participar de reunião de oração", points: 8, category: "participation", isActive: true },
      { id: 4, name: "Serviço Voluntário", description: "Realizar serviço na igreja", points: 20, category: "service", isActive: true },
      { id: 5, name: "Visita Pastoral", description: "Realizar visita pastoral", points: 25, category: "service", isActive: true }
    ];
    this.nextPointActivityId = 6;

    // Initialize achievements
    this.achievements = [
      { id: 1, name: "Primeira Participação", description: "Participou da primeira atividade", icon: "Star", requiredPoints: 10, requiredConditions: null, badgeColor: "#fbbf24", isActive: true },
      { id: 2, name: "Estudioso", description: "Completou 5 estudos bíblicos", icon: "BookOpen", requiredPoints: 75, requiredConditions: null, badgeColor: "#3b82f6", isActive: true },
      { id: 3, name: "Servo Fiel", description: "Realizou 10 serviços voluntários", icon: "Heart", requiredPoints: 200, requiredConditions: null, badgeColor: "#10b981", isActive: true },
      { id: 4, name: "Missionário Ativo", description: "Realizou 20 visitas pastorais", icon: "Users", requiredPoints: 500, requiredConditions: null, badgeColor: "#8b5cf6", isActive: true }
    ];
    this.nextAchievementId = 5;
    
    // Initialize default churches
    this.churches = [
      { id: 1, name: "Igreja Central", address: "Rua Principal, 123", isActive: true },
      { id: 2, name: "Igreja Norte", address: "Av. Norte, 456", isActive: true },
      { id: 3, name: "Igreja Sul", address: "Rua Sul, 789", isActive: true }
    ];
    this.nextChurchId = 4;
  }

  // Users
  async createUser(data: InsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      id: this.nextUserId++,
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone || null,
      cpf: data.cpf || null,
      profilePhoto: data.profilePhoto || null,
      role: data.role || "interested",
      status: data.status || "pending",
      isApproved: data.isApproved || false,
      church: data.church || null,
      churchCode: data.churchCode || null,
      departments: data.departments || null,
      birthDate: data.birthDate || null,
      civilStatus: data.civilStatus || null,
      occupation: data.occupation || null,
      education: data.education || null,
      address: data.address || null,
      baptismDate: data.baptismDate || null,
      previousReligion: data.previousReligion || null,
      biblicalInstructor: data.biblicalInstructor || null,
      isDonor: data.isDonor || false,
      isOffering: data.isOffering || false,
      isEnrolledES: data.isEnrolledES || false,
      hasLesson: data.hasLesson || false,
      esPeriod: data.esPeriod || null,
      points: data.points || 0,
      level: data.level || "Iniciante",
      attendance: data.attendance || 0,
      extraData: data.extraData || null,
      observations: data.observations || null,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      firstAccess: data.firstAccess !== undefined ? data.firstAccess : true
    };
    this.users.push(user);
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.users.filter(user => user.role === role);
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { 
      ...this.users[userIndex], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.users[userIndex];
  }

  async approveUser(id: number): Promise<User | null> {
    return this.updateUser(id, { isApproved: true, status: "approved" });
  }

  async deleteUser(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async bulkCreateUsers(users: InsertUser[]): Promise<User[]> {
    const createdUsers: User[] = [];
    
    for (const userData of users) {
      // Check if user already exists by email
      const existingUser = this.users.find(u => u.email === userData.email);
      if (existingUser) {
        continue; // Skip duplicates
      }
      
      const newUser = await this.createUser(userData);
      createdUsers.push(newUser);
    }
    
    return createdUsers;
  }
  
  async getOrCreateChurch(name: string): Promise<{ id: number; name: string }> {
    if (!name || name.trim() === '') {
      throw new Error('Nome da igreja é obrigatório');
    }
    
    // Try to find existing church (case insensitive)
    const existingChurch = this.churches.find(
      church => church.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (existingChurch) {
      return { id: existingChurch.id, name: existingChurch.name };
    }
    
    // Create new church if not found
    const newChurch = {
      id: this.nextChurchId++,
      name: name.trim(),
      address: null,
      isActive: true
    };
    
    this.churches.push(newChurch);
    console.log(`Nova igreja criada automaticamente: ${newChurch.name} (ID: ${newChurch.id})`);
    return { id: newChurch.id, name: newChurch.name };
  }
  
  async getAllChurches(): Promise<Array<{ id: number; name: string; address?: string; isActive: boolean }>> {
    return [...this.churches];
  }

  // Relationships
  async createRelationship(data: InsertRelationship): Promise<Relationship> {
    const relationship: Relationship = {
      id: this.nextRelationshipId++,
      missionaryId: data.missionaryId,
      interestedId: data.interestedId,
      status: data.status || "active",
      assignedAt: new Date(),
      notes: data.notes || null
    };
    this.relationships.push(relationship);
    return relationship;
  }

  async getRelationshipsByMissionary(missionaryId: number): Promise<Relationship[]> {
    return this.relationships.filter(rel => rel.missionaryId === missionaryId);
  }

  async getRelationshipsByInterested(interestedId: number): Promise<Relationship[]> {
    return this.relationships.filter(rel => rel.interestedId === interestedId);
  }

  async updateRelationship(id: number, data: Partial<InsertRelationship>): Promise<Relationship | null> {
    const relIndex = this.relationships.findIndex(rel => rel.id === id);
    if (relIndex === -1) return null;

    this.relationships[relIndex] = { ...this.relationships[relIndex], ...data };
    return this.relationships[relIndex];
  }

  // Meetings
  async createMeeting(data: InsertMeeting): Promise<Meeting> {
    const now = new Date();
    const meeting: Meeting = {
      id: this.nextMeetingId++,
      requesterId: data.requesterId,
      assignedToId: data.assignedToId || null,
      typeId: data.typeId,
      title: data.title,
      description: data.description || null,
      scheduledAt: data.scheduledAt || null,
      duration: data.duration || 60,
      location: data.location || null,
      priority: data.priority || "medium",
      isUrgent: data.isUrgent || false,
      status: data.status || "pending",
      materials: data.materials || null,
      tags: data.tags || null,
      notes: data.notes || null,
      pastoralNotes: data.pastoralNotes || null,
      createdAt: now,
      updatedAt: now
    };
    this.meetings.push(meeting);
    return meeting;
  }

  async getMeetingById(id: number): Promise<Meeting | null> {
    return this.meetings.find(meeting => meeting.id === id) || null;
  }

  async getMeetingsByUser(userId: number): Promise<Meeting[]> {
    return this.meetings.filter(meeting => 
      meeting.requesterId === userId || meeting.assignedToId === userId
    );
  }

  async getMeetingsByStatus(status: string): Promise<Meeting[]> {
    return this.meetings.filter(meeting => meeting.status === status);
  }

  async updateMeeting(id: number, data: Partial<InsertMeeting>): Promise<Meeting | null> {
    const meetingIndex = this.meetings.findIndex(meeting => meeting.id === id);
    if (meetingIndex === -1) return null;

    this.meetings[meetingIndex] = { 
      ...this.meetings[meetingIndex], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.meetings[meetingIndex];
  }

  async deleteMeeting(id: number): Promise<boolean> {
    const meetingIndex = this.meetings.findIndex(meeting => meeting.id === id);
    if (meetingIndex === -1) return false;

    this.meetings.splice(meetingIndex, 1);
    return true;
  }

  // Meeting Types
  async getMeetingTypes(): Promise<MeetingType[]> {
    return [...this.meetingTypes];
  }

  async createMeetingType(data: Omit<MeetingType, 'id'>): Promise<MeetingType> {
    const meetingType: MeetingType = {
      id: this.nextMeetingTypeId++,
      ...data
    };
    this.meetingTypes.push(meetingType);
    return meetingType;
  }

  // Events
  async createEvent(data: InsertEvent): Promise<Event> {
    const now = new Date();
    const event: Event = {
      id: this.nextEventId++,
      title: data.title,
      description: data.description || null,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location || null,
      organizerId: data.organizerId,
      maxParticipants: data.maxParticipants || null,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      church: data.church || null,
      requirements: data.requirements || null,
      materials: data.materials || null,
      createdAt: now,
      updatedAt: now
    };
    this.events.push(event);
    return event;
  }

  async getEventById(id: number): Promise<Event | null> {
    return this.events.find(event => event.id === id) || null;
  }

  async getAllEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async getEventsByDate(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.events.filter(event => 
      event.startDate >= startDate && event.endDate <= endDate
    );
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null> {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) return null;

    this.events[eventIndex] = { 
      ...this.events[eventIndex], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.events[eventIndex];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) return false;

    this.events.splice(eventIndex, 1);
    return true;
  }

  // Messages and Conversations
  async createConversation(name: string | null, isGroup: boolean, createdBy: number): Promise<Conversation> {
    const now = new Date();
    const conversation: Conversation = {
      id: this.nextConversationId++,
      name,
      isGroup,
      createdBy,
      createdAt: now,
      updatedAt: now
    };
    this.conversations.push(conversation);
    return conversation;
  }

  async getConversationById(id: number): Promise<Conversation | null> {
    return this.conversations.find(conv => conv.id === id) || null;
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    // In a real implementation, this would join with conversationParticipants
    return this.conversations.filter(conv => conv.createdBy === userId);
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const now = new Date();
    const message: Message = {
      id: this.nextMessageId++,
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      messageType: data.messageType || "text",
      attachmentUrl: data.attachmentUrl || null,
      attachmentName: data.attachmentName || null,
      isEdited: data.isEdited || false,
      createdAt: now,
      updatedAt: now
    };
    this.messages.push(message);
    return message;
  }

  async getMessagesByConversation(conversationId: number, limit: number = 50): Promise<Message[]> {
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  // Video Calls
  async createVideoCallSession(data: Omit<VideoCallSession, 'id' | 'createdAt'>): Promise<VideoCallSession> {
    const session: VideoCallSession = {
      id: this.nextVideoCallId++,
      ...data,
      createdAt: new Date()
    };
    this.videoCallSessions.push(session);
    return session;
  }

  async getVideoCallSessionById(id: number): Promise<VideoCallSession | null> {
    return this.videoCallSessions.find(session => session.id === id) || null;
  }

  async updateVideoCallSession(id: number, data: Partial<VideoCallSession>): Promise<VideoCallSession | null> {
    const sessionIndex = this.videoCallSessions.findIndex(session => session.id === id);
    if (sessionIndex === -1) return null;

    this.videoCallSessions[sessionIndex] = { ...this.videoCallSessions[sessionIndex], ...data };
    return this.videoCallSessions[sessionIndex];
  }

  // Notifications
  async createNotification(data: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextNotificationId++,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedId: data.relatedId || null,
      relatedType: data.relatedType || null,
      isRead: data.isRead || false,
      actionUrl: data.actionUrl || null,
      createdAt: new Date()
    };
    this.notifications.push(notification);
    return notification;
  }

  async getNotificationsByUser(userId: number, limit: number = 20): Promise<Notification[]> {
    return this.notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notifIndex = this.notifications.findIndex(notif => notif.id === id);
    if (notifIndex === -1) return false;

    this.notifications[notifIndex].isRead = true;
    return true;
  }

  // Points and Achievements
  async getPointActivities(): Promise<PointActivity[]> {
    return [...this.pointActivities];
  }

  async getAchievements(): Promise<Achievement[]> {
    return [...this.achievements];
  }

  async addPointsToUser(userId: number, points: number, activityId: number, description?: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    user.points = (user.points || 0) + points;
    await this.updateUser(userId, { points: user.points });
    
    // In a real implementation, this would also create a record in userPointsHistory
    return true;
  }

  async getUserPoints(userId: number): Promise<number> {
    const user = await this.getUserById(userId);
    return user?.points || 0;
  }
}

import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { 
  users, relationships, meetings, events, messages, conversations,
  videoCallSessions, notifications, meetingTypes, pointActivities, achievements
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        firstAccess: true,
        isApproved: data.isApproved ?? false,
        status: data.status ?? 'pending',
        points: data.points ?? 0,
        level: data.level ?? 'Iniciante',
        attendance: data.attendance ?? 0,
      })
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async approveUser(id: number): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        status: 'approved',
        isApproved: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async bulkCreateUsers(userData: InsertUser[]): Promise<User[]> {
    const usersWithDefaults = userData.map(data => ({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstAccess: true,
      isApproved: data.isApproved ?? false,
      status: data.status ?? 'pending',
      points: data.points ?? 0,
      level: data.level ?? 'Iniciante',
      attendance: data.attendance ?? 0,
    }));

    return await db.insert(users).values(usersWithDefaults).returning();
  }

  // Churches (simplified implementation for now)
  async getOrCreateChurch(name: string): Promise<{ id: number; name: string }> {
    // Simplified implementation - just log and return mock data
    console.log(`Igreja processada: ${name} (${name.includes('(g)') ? 'g' : 'i'})`);
    return { id: 1, name };
  }

  async getAllChurches(): Promise<Array<{ id: number; name: string; address?: string; isActive: boolean }>> {
    // Simplified implementation 
    return [];
  }

  // Relationships (keeping existing implementation for compatibility)
  async createRelationship(data: InsertRelationship): Promise<Relationship> {
    const [relationship] = await db.insert(relationships).values(data).returning();
    return relationship;
  }

  async getRelationshipsByMissionary(missionaryId: number): Promise<Relationship[]> {
    return await db.select().from(relationships).where(eq(relationships.missionaryId, missionaryId));
  }

  async getRelationshipsByInterested(interestedId: number): Promise<Relationship[]> {
    return await db.select().from(relationships).where(eq(relationships.interestedId, interestedId));
  }

  async updateRelationship(id: number, data: Partial<InsertRelationship>): Promise<Relationship | null> {
    const [relationship] = await db
      .update(relationships)
      .set(data)
      .where(eq(relationships.id, id))
      .returning();
    return relationship || null;
  }

  // Meetings (keeping minimal implementation)
  async createMeeting(data: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(data).returning();
    return meeting;
  }

  async getMeetingById(id: number): Promise<Meeting | null> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting || null;
  }

  async getMeetingsByUser(userId: number): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.userId, userId));
  }

  async getMeetingsByStatus(status: string): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.status, status));
  }

  async updateMeeting(id: number, data: Partial<InsertMeeting>): Promise<Meeting | null> {
    const [meeting] = await db
      .update(meetings)
      .set(data)
      .where(eq(meetings.id, id))
      .returning();
    return meeting || null;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    const result = await db.delete(meetings).where(eq(meetings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Meeting Types (minimal implementation)
  async getMeetingTypes(): Promise<MeetingType[]> {
    return await db.select().from(meetingTypes);
  }

  async createMeetingType(data: Omit<MeetingType, 'id'>): Promise<MeetingType> {
    const [meetingType] = await db.insert(meetingTypes).values(data).returning();
    return meetingType;
  }

  // Events (minimal implementation)
  async createEvent(data: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(data).returning();
    return event;
  }

  async getEventById(id: number): Promise<Event | null> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || null;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventsByDate(startDate: Date, endDate: Date): Promise<Event[]> {
    return await db.select().from(events).where(
      and(
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
      )
    );
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null> {
    const [event] = await db
      .update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning();
    return event || null;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Messages and Conversations (minimal implementation)
  async createConversation(name: string | null, isGroup: boolean, createdBy: number): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({
      name,
      isGroup,
      createdBy,
      createdAt: new Date()
    }).returning();
    return conversation;
  }

  async getConversationById(id: number): Promise<Conversation | null> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || null;
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.createdBy, userId));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  async getMessagesByConversation(conversationId: number, limit: number = 50): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  // Video Calls (minimal implementation)
  async createVideoCallSession(data: Omit<VideoCallSession, 'id' | 'createdAt'>): Promise<VideoCallSession> {
    const [session] = await db.insert(videoCallSessions).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return session;
  }

  async getVideoCallSessionById(id: number): Promise<VideoCallSession | null> {
    const [session] = await db.select().from(videoCallSessions).where(eq(videoCallSessions.id, id));
    return session || null;
  }

  async updateVideoCallSession(id: number, data: Partial<VideoCallSession>): Promise<VideoCallSession | null> {
    const [session] = await db
      .update(videoCallSessions)
      .set(data)
      .where(eq(videoCallSessions.id, id))
      .returning();
    return session || null;
  }

  // Notifications (minimal implementation)
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return notification;
  }

  async getNotificationsByUser(userId: number, limit: number = 20): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Points and Achievements (minimal implementation)
  async getPointActivities(): Promise<PointActivity[]> {
    return await db.select().from(pointActivities);
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async addPointsToUser(userId: number, points: number, activityId: number, description?: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    const newPoints = (user.points || 0) + points;
    await this.updateUser(userId, { points: newPoints });
    
    return true;
  }

  async getUserPoints(userId: number): Promise<number> {
    const user = await this.getUserById(userId);
    return user?.points || 0;
  }
}

export const storage = new DatabaseStorage();