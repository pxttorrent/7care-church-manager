import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMeetingSchema, insertEventSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // First check for demo users for easy testing
      const demoUsers = [
        { email: "admin@7care.com", password: "admin123", role: "admin", name: "Pastor João Silva", isApproved: true },
        { email: "missionary@7care.com", password: "missionary123", role: "missionary", name: "Missionário João", isApproved: true },
        { email: "member@7care.com", password: "member123", role: "member", name: "Membro Maria", isApproved: true },
        { email: "interested@7care.com", password: "interested123", role: "interested", name: "Pedro Silva", isApproved: true }
      ];
      
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        // Check if demo user exists in storage, if not create them
        let user = await storage.getUserByEmail(email);
        if (!user) {
          user = await storage.createUser({
            email: demoUser.email,
            password: demoUser.password,
            name: demoUser.name,
            role: demoUser.role,
            isApproved: demoUser.isApproved,
            status: "approved",
            church: "Igreja Central"
          });
        }
        
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
        return;
      }
      
      // Check for real users in storage
      const user = await storage.getUserByEmail(email);
      if (user && user.password === password) {
        if (!user.isApproved) {
          res.status(401).json({ success: false, message: "Account pending approval" });
          return;
        }
        
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
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        res.status(400).json({ success: false, message: "User already exists" });
        return;
      }
      
      const user = await storage.createUser({
        ...userData,
        role: userData.role || "interested",
        isApproved: userData.role === "interested", // Auto-approve interested users
        status: userData.role === "interested" ? "approved" : "pending"
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

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });

  // User management endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const { role, status } = req.query;
      let users = await storage.getAllUsers();
      
      if (role) {
        users = users.filter(u => u.role === role);
      }
      if (status) {
        users = users.filter(u => u.status === status);
      }
      
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
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

  app.post("/api/users/:id/approve", async (req, res) => {
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

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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

  // Bulk import users endpoint
  app.post("/api/users/bulk-import", async (req, res) => {
    try {
      const { users } = req.body;
      
      if (!Array.isArray(users) || users.length === 0) {
        res.status(400).json({ error: "Invalid users data" });
        return;
      }

      let processedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      // Validate and process each user with error handling
      const processedUsers = [];
      
      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        
        try {
          // Skip if no name
          if (!userData.name || userData.name.toString().trim() === '') {
            skippedCount++;
            errors.push(`Linha ${i + 1}: Nome é obrigatório - linha ignorada`);
            continue;
          }

          // Generate email if not provided or invalid
          if (!userData.email || !userData.email.includes('@')) {
            const namePart = userData.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
            userData.email = `${namePart}@igreja.com`;
          }
          
          // Generate password if not provided
          if (!userData.password) {
            userData.password = '123456'; // Default password
          }

          // Set default role if not provided
          if (!userData.role) {
            userData.role = 'member';
          }

          // Format phone number to WhatsApp standard: +55(DDD)99999-9999
          if (userData.phone) {
            const cleanPhone = userData.phone.toString().replace(/[^0-9]/g, '');
            
            if (cleanPhone.length >= 10) {
              let formattedPhone = '';
              
              // If doesn't start with 55 (Brazil code), add it
              if (!cleanPhone.startsWith('55') && cleanPhone.length === 11) {
                formattedPhone = '55' + cleanPhone;
              } else if (!cleanPhone.startsWith('55') && cleanPhone.length === 10) {
                formattedPhone = '55' + cleanPhone;
              } else {
                formattedPhone = cleanPhone;
              }
              
              // Format to +55(DDD)99999-9999 or +55(DDD)9999-9999
              if (formattedPhone.length === 13) { // 55 + 11 digits
                const countryCode = formattedPhone.substring(0, 2);
                const areaCode = formattedPhone.substring(2, 4);
                const firstPart = formattedPhone.substring(4, 9);
                const lastPart = formattedPhone.substring(9, 13);
                userData.phone = `+${countryCode}(${areaCode})${firstPart}-${lastPart}`;
              } else if (formattedPhone.length === 12) { // 55 + 10 digits
                const countryCode = formattedPhone.substring(0, 2);
                const areaCode = formattedPhone.substring(2, 4);
                const firstPart = formattedPhone.substring(4, 8);
                const lastPart = formattedPhone.substring(8, 12);
                userData.phone = `+${countryCode}(${areaCode})${firstPart}-${lastPart}`;
              } else {
                // Keep original if doesn't match expected format
                userData.phone = cleanPhone;
              }
            } else {
              // Phone too short - ignore and mark user with warning
              userData.phone = null;
              if (!userData.extraData) {
                userData.extraData = {};
              }
              if (typeof userData.extraData === 'string') {
                userData.extraData = JSON.parse(userData.extraData);
              }
              userData.extraData.phoneWarning = true;
              userData.extraData.originalPhone = cleanPhone;
              userData.extraData = JSON.stringify(userData.extraData);
            }
          }
          
          // Auto-create churches if they don't exist
          if (userData.church && userData.church.trim() !== '') {
            try {
              const churchResult = await storage.getOrCreateChurch(userData.church);
              userData.church = churchResult.name;
              console.log(`Igreja processada: ${churchResult.name}`);
            } catch (error) {
              console.error(`Erro ao processar igreja "${userData.church}":`, error);
              // Continue with original church name if error
            }
          }

          // Parse dates safely
          if (userData.birthDate && typeof userData.birthDate === 'string') {
            try {
              userData.birthDate = new Date(userData.birthDate);
              if (isNaN(userData.birthDate.getTime())) {
                userData.birthDate = null;
              }
            } catch {
              userData.birthDate = null;
            }
          }
          
          if (userData.baptismDate && typeof userData.baptismDate === 'string') {
            try {
              userData.baptismDate = new Date(userData.baptismDate);
              if (isNaN(userData.baptismDate.getTime())) {
                userData.baptismDate = null;
              }
            } catch {
              userData.baptismDate = null;
            }
          }

          processedUsers.push(userData);
          processedCount++;
          
        } catch (error) {
          skippedCount++;
          errors.push(`Linha ${i + 1}: Erro no processamento - linha ignorada`);
          console.error(`Error processing user ${i + 1}:`, error);
        }
      }

      // Process users individually to handle duplicates gracefully
      let actuallyCreated = 0;
      let duplicatesSkipped = 0;
      
      for (let i = 0; i < processedUsers.length; i++) {
        const userData = processedUsers[i];
        
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(userData.email);
          
          if (existingUser) {
            duplicatesSkipped++;
            console.log(`Usuário já existe: ${userData.email} - ignorado`);
            continue;
          }
          
          // Create new user
          await storage.createUser(userData);
          actuallyCreated++;
          
          if ((i + 1) % 10 === 0) {
            console.log(`Processados ${i + 1}/${processedUsers.length} usuários`);
          }
          
        } catch (error) {
          console.error(`Error creating user ${userData.name} (${userData.email}):`, error);
          errors.push(`Erro ao criar usuário ${userData.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          skippedCount++;
        }
      }
      
      let message = `${actuallyCreated} usuários importados com sucesso`;
      if (duplicatesSkipped > 0) {
        message += `. ${duplicatesSkipped} usuários já existiam e foram ignorados`;
      }
      if (skippedCount > 0) {
        message += `. ${skippedCount} linhas com erro foram ignoradas`;
      }
      
      res.json({ 
        success: true, 
        message,
        imported: actuallyCreated,
        processed: processedUsers.length,
        skipped: skippedCount + duplicatesSkipped,
        total: users.length,
        errors: errors.slice(0, 5) // Return first 5 errors
      });
      
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({ error: "Failed to import users" });
    }
  });

  // Meeting types endpoints
  app.get("/api/meeting-types", async (req, res) => {
    try {
      const meetingTypes = await storage.getMeetingTypes();
      res.json(meetingTypes);
    } catch (error) {
      console.error("Get meeting types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Churches endpoints
  app.get("/api/churches", async (req, res) => {
    try {
      const churches = await storage.getAllChurches();
      res.json(churches);
    } catch (error) {
      console.error("Get churches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allEvents = await storage.getAllEvents();
      
      // Count users by role
      const usersByRole = allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count pending approvals
      const pendingApprovals = allUsers.filter(user => user.status === 'pending').length;

      // Count events this week
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const thisWeekEvents = allEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= weekStart && eventDate < weekEnd;
      }).length;

      // Count birthdays today and this week
      const today = new Date();
      const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const birthdaysToday = allUsers.filter(user => {
        if (!user.birthDate) return false;
        const birthDate = new Date(user.birthDate);
        const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
        return birthStr === todayStr;
      }).length;

      const birthdaysThisWeek = allUsers.filter(user => {
        if (!user.birthDate) return false;
        const birthDate = new Date(user.birthDate);
        const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        return thisYearBirthday >= weekStart && thisYearBirthday < weekEnd;
      }).length;

      // Churches count
      const churches = await storage.getAllChurches();
      const churchesCount = churches.length;

      res.json({
        totalUsers: allUsers.length,
        totalInterested: usersByRole.interested || 0,
        totalMembers: usersByRole.member || 0,
        totalMissionaries: usersByRole.missionary || 0,
        totalAdmins: usersByRole.admin || 0,
        totalChurches: churchesCount,
        pendingApprovals,
        thisWeekEvents,
        birthdaysToday,
        birthdaysThisWeek,
        totalEvents: allEvents.length,
        approvedUsers: allUsers.filter(user => user.status === 'approved').length
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // System cleanup endpoint
  app.post("/api/system/clear-all", async (req, res) => {
    try {
      const success = await storage.clearAllData();
      if (success) {
        res.json({ success: true, message: "Todos os dados do sistema foram limpos com sucesso" });
      } else {
        res.status(500).json({ error: "Falha ao limpar os dados do sistema" });
      }
    } catch (error) {
      console.error("Clear all data error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Meetings endpoints
  app.get("/api/meetings", async (req, res) => {
    try {
      const { userId, status } = req.query;
      let meetings: any[] = [];
      
      if (userId) {
        meetings = await storage.getMeetingsByUser(parseInt(userId as string));
      } else if (status) {
        meetings = await storage.getMeetingsByStatus(status as string);
      }
      
      res.json(meetings);
    } catch (error) {
      console.error("Get meetings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      console.error("Create meeting error:", error);
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });

  app.put("/api/meetings/:id", async (req, res) => {
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

  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Relationships endpoints
  app.get("/api/relationships/missionary/:missionaryId", async (req, res) => {
    try {
      const missionaryId = parseInt(req.params.missionaryId);
      const relationships = await storage.getRelationshipsByMissionary(missionaryId);
      res.json(relationships);
    } catch (error) {
      console.error("Get relationships error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/relationships", async (req, res) => {
    try {
      const { missionaryId, interestedId, notes } = req.body;
      const relationship = await storage.createRelationship({
        missionaryId,
        interestedId,
        notes
      });
      res.json(relationship);
    } catch (error) {
      console.error("Create relationship error:", error);
      res.status(400).json({ error: "Invalid relationship data" });
    }
  });

  // Messages/Chat endpoints
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getMessagesByConversation(conversationId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 20;
      const notifications = await storage.getNotificationsByUser(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);
      
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

  // Points and achievements endpoints
  app.get("/api/point-activities", async (req, res) => {
    try {
      const activities = await storage.getPointActivities();
      res.json(activities);
    } catch (error) {
      console.error("Get point activities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const points = await storage.getUserPoints(userId);
      res.json({ points });
    } catch (error) {
      console.error("Get user points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users/:id/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points, activityId, description } = req.body;
      
      const success = await storage.addPointsToUser(userId, points, activityId, description);
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

  // Dashboard data endpoints
  app.get("/api/dashboard/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const userId = parseInt(req.query.userId as string);
      
      let dashboardData = {};
      
      switch (role) {
        case "admin":
          const allUsers = await storage.getAllUsers();
          const pendingUsers = allUsers.filter(u => u.status === "pending");
          dashboardData = {
            totalUsers: allUsers.length,
            totalInterested: allUsers.filter(u => u.role === "interested").length,
            totalChurches: new Set(allUsers.map(u => u.church).filter(Boolean)).size,
            pendingApprovals: pendingUsers.length,
            thisWeekEvents: 0, // Would calculate from events
            totalMessages: 0   // Would calculate from messages
          };
          break;
          
        case "missionary":
          const relationships = await storage.getRelationshipsByMissionary(userId);
          const meetings = await storage.getMeetingsByUser(userId);
          dashboardData = {
            myInterested: relationships.length,
            scheduledMeetings: meetings.filter(m => m.status === "approved").length,
            completedStudies: meetings.filter(m => m.status === "completed").length,
            thisWeekGoal: 10 // This would be configurable
          };
          break;
          
        case "member":
          const memberMeetings = await storage.getMeetingsByUser(userId);
          dashboardData = {
            nextEvents: memberMeetings.filter(m => m.status === "approved" && new Date(m.scheduledAt!) > new Date()).length,
            unreadMessages: 0, // Would calculate from messages
            completedActivities: memberMeetings.filter(m => m.status === "completed").length
          };
          break;
          
        case "interested":
          const interestedMeetings = await storage.getMeetingsByUser(userId);
          const nextMeeting = interestedMeetings
            .filter(m => m.status === "approved" && new Date(m.scheduledAt!) > new Date())
            .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())[0];
          
          dashboardData = {
            nextStudy: nextMeeting ? new Date(nextMeeting.scheduledAt!).toLocaleDateString('pt-BR') : "Nenhum agendado",
            completedLessons: interestedMeetings.filter(m => m.status === "completed").length,
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

  // Catch-all for undefined routes
  app.use("/api/*", (req, res) => {
    console.log("404 Error: User attempted to access non-existent route:", req.path);
    res.status(404).json({ error: "Route not found", path: req.path });
  });

  const httpServer = createServer(app);

  return httpServer;
}
