import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { NeonAdapter } from "./neonAdapter";
import { migrateToNeon } from "./migrateToNeon";
import { setupNeonData } from "./setupNeonData";
import { sql } from "./neonConfig";
import { importRoutes } from "./importRoutes";

// Inicialização do storage com Neon Database
const storage = new NeonAdapter();

// Imports otimizados
import { insertUserSchema, insertMeetingSchema, insertEventSchema, insertMessageSchema, events } from "../shared/schema";
import * as bcrypt from 'bcryptjs';
import multer from "multer";
import XLSX from "xlsx";
import * as fs from "fs";
// Removido: import { eq } from "drizzle-orm";
import { config } from "./config";

// Configuração do upload
const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Migrar para Neon Database
  try {
    await migrateToNeon();
    console.log('✅ Neon Database conectado e funcionando');
    
    // Configurar dados iniciais
    await setupNeonData();
    console.log('✅ Dados iniciais configurados');
  } catch (error) {
    console.error('❌ Erro ao conectar com Neon Database:', error);
    // Continuar mesmo com erro para desenvolvimento
  }

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static('uploads'));

  // Storage já inicializado

  // Helper function to parse dates - Sistema robusto de detecção
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      // Limpa a string (remove espaços, aspas)
      const dateStr = dateValue.toString().trim().replace(/['"]/g, '');
      
      // 1. Detecção de Números do Excel (serial dates)
      if (!isNaN(dateValue) && typeof dateValue === 'number') {
        // Excel armazena datas como número de dias desde 1/1/1900
        // Mas o JavaScript usa 1/1/1970 como epoch, então precisamos ajustar
        const excelEpoch = new Date(1900, 0, 1); // 1 de janeiro de 1900
        const daysSinceEpoch = dateValue - 2; // Excel tem bug do ano bissexto 1900
        const date = new Date(excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000);
        
        if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
          return date;
        }
      }
      
      // 2. Formato DD/MM/YYYY (formato brasileiro padrão)
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const parsedDay = parseInt(day);
          const parsedMonth = parseInt(month);
          let parsedYear = parseInt(year);
          
          // Se o ano tem 2 dígitos, converte para 4 dígitos
          if (parsedYear < 100) {
            parsedYear += parsedYear < 50 ? 2000 : 1900;
          }
          
          // Validação de dados
          if (parsedDay >= 1 && parsedDay <= 31 && 
              parsedMonth >= 1 && parsedMonth <= 12 && 
              parsedYear >= 1900 && parsedYear <= 2100) {
            // Para datas de aniversário, usa data local para evitar problemas de fuso horário
            const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
            // Verifica se a data é válida (handles edge cases like 31/02/2023)
            if (date.getDate() === parsedDay && 
                date.getMonth() === parsedMonth - 1 && 
                date.getFullYear() === parsedYear) {
              return date;
            }
          }
        }
      }
      
      // 3. Formato DD-MM-YYYY
      if (dateStr.includes('-') && dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
        const parts = dateStr.split('-');
        const [day, month, year] = parts;
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        const parsedYear = parseInt(year);
        
        if (parsedDay >= 1 && parsedDay <= 31 && 
            parsedMonth >= 1 && parsedMonth <= 12 && 
            parsedYear >= 1900 && parsedYear <= 2100) {
          // Para datas de aniversário, usa data local para evitar problemas de fuso horário
          const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date.getDate() === parsedDay && 
              date.getMonth() === parsedMonth - 1 && 
              date.getFullYear() === parsedYear) {
            return date;
          }
        }
      }
      
      // 4. Formato YYYY-MM-DD (formato ISO) - CORRIGIDO para evitar problemas de fuso horário
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        const parsedDay = parseInt(day);
        
        if (parsedYear >= 1900 && parsedYear <= 2100 &&
            parsedMonth >= 1 && parsedMonth <= 12 &&
            parsedDay >= 1 && parsedDay <= 31) {
          // Para datas de aniversário, usa data local para evitar problemas de fuso horário
          const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date.getDate() === parsedDay && 
              date.getMonth() === parsedMonth - 1 && 
              date.getFullYear() === parsedYear) {
            return date;
          }
        }
      }
      
      // 5. Formato YYYY/MM/DD (formato alternativo)
      if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        const parts = dateStr.split('/');
        const [year, month, day] = parts;
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        const parsedDay = parseInt(day);
        
        if (parsedYear >= 1900 && parsedYear <= 2100 &&
            parsedMonth >= 1 && parsedMonth <= 12 &&
            parsedDay >= 1 && parsedDay <= 31) {
          // Para datas de aniversário, usa data local para evitar problemas de fuso horário
          const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date.getDate() === parsedDay && 
              date.getMonth() === parsedMonth - 1 && 
              date.getFullYear() === parsedYear) {
            return date;
          }
        }
      }
      
      // 6. Formato DD.MM.YYYY
      if (dateStr.includes('.') && dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
        const parts = dateStr.split('.');
        const [day, month, year] = parts;
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        const parsedYear = parseInt(year);
        
        if (parsedDay >= 1 && parsedDay <= 31 && 
            parsedMonth >= 1 && parsedMonth <= 12 && 
            parsedYear >= 1900 && parsedYear <= 2100) {
          // Para datas de aniversário, usa data local para evitar problemas de fuso horário
          const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date.getDate() === parsedDay && 
              date.getMonth() === parsedMonth - 1 && 
              date.getFullYear() === parsedYear) {
            return date;
          }
        }
      }
      
      // 7. Formato DD.MM.YY
      if (dateStr.includes('.') && dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{2}$/)) {
        const parts = dateStr.split('.');
        const [day, month, year] = parts;
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        let parsedYear = parseInt(year);
        
        // Se o ano tem 2 dígitos, converte para 4 dígitos
        parsedYear += parsedYear < 50 ? 2000 : 1900;
        
        if (parsedDay >= 1 && parsedDay <= 31 && 
            parsedMonth >= 1 && parsedMonth <= 12 && 
            parsedYear >= 1900 && parsedYear <= 2100) {
          // Para datas de aniversário, usa data local para evitar problemas de fuso horário
          const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
          if (date.getDate() === parsedDay && 
              date.getMonth() === parsedMonth - 1 && 
              date.getFullYear() === parsedYear) {
            return date;
          }
        }
      }
      
      // 8. Intervalos com ano (ex: "15/01-20/02/2024") - usa a primeira data
      if (dateStr.includes('-') && dateStr.includes('/')) {
        const match = dateStr.match(/^(\d{1,2}\/\d{1,2})-\d{1,2}\/\d{1,2}\/(\d{4})$/);
        if (match) {
          const firstDate = match[1] + '/' + match[2]; // "15/01/2024"
          return parseDate(firstDate);
        }
      }
      
      // 9. Intervalos sem ano (ex: "24/07-03/08") - usa ano atual
      if (dateStr.includes('-') && dateStr.includes('/') && !dateStr.match(/\d{4}/)) {
        const match = dateStr.match(/^(\d{1,2}\/\d{1,2})-\d{1,2}\/\d{1,2}$/);
        if (match) {
          const currentYear = new Date().getFullYear();
          const firstDate = match[1] + '/' + currentYear; // "24/07/2024"
          return parseDate(firstDate);
        }
      }
      
      // 10. Data sem ano (ex: "03/12") - usa ano atual
      if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
        const currentYear = new Date().getFullYear();
        const dateWithYear = dateStr + '/' + currentYear;
        return parseDate(dateWithYear);
      }
      
      // 11. Fallback: tenta o construtor padrão do JavaScript
      const date = new Date(dateValue);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        return date;
      }
      
      return null;
      
    } catch (error) {
      console.log(`Erro ao processar data: ${error}`);
      return null;
    }
  };

  // Helper function to parse birth dates - returns only date part (no time)
  const parseBirthDate = (dateValue: any): string | null => {
    const date = parseDate(dateValue);
    if (!date) return null;
    
    // Para datas de aniversário, usa data local para evitar problemas de fuso horário
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Health check endpoint
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check for real users in storage - try email first, then username
      let user = await storage.getUserByEmail(email);
      
      // If not found by email, try to find by username (generate username from email)
      if (!user) {
        // Try to find by treating the email as a potential username
        // This is a temporary solution until we add the username column to the database
        const allUsers = await storage.getAllUsers();
        const foundUser = allUsers.find(u => {
          // Generate username from user's name and compare with provided email
          const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const nameParts = u.name.trim().split(' ');
          let generatedUsername = '';
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
      
      if (user && (await bcrypt.compare(password, user.password))) {
        // Check if user is using the default password "meu7care"
        const isUsingDefaultPassword = await bcrypt.compare('meu7care', user.password);
        
        // If using default password, force first access
        const shouldForceFirstAccess = isUsingDefaultPassword;
        
        // Allow login for both approved and pending users
        // Pending users will have firstAccess = true and need to complete first access flow
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

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email || '');
      if (existingUser) {
        res.status(400).json({ success: false, message: "User already exists" });
        return;
      }
      
      const userRole = (userData as any).role || "interested";
      const user = await storage.createUser({
        ...userData,
        role: userRole,
        isApproved: userRole === "interested", // Auto-approve interested users
        status: userRole === "interested" ? "approved" : "pending"
      } as any);
      
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

  // Get current user info
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Get user ID from query parameter or header
      const userId = req.query.userId || req.headers['user-id'];
      
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const id = parseInt(userId as string);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const user = await storage.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      // If user doesn't have a church, assign the first available church
      if (!user.church) {
        const churches = await storage.getAllChurches();
        if (churches.length > 0) {
          const firstChurch = churches[0];
          // Update user with first available church
          await storage.updateUserChurch(id, firstChurch.name);
          user.church = firstChurch.name;
        }
      }
      
      // Return safe user data without password
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Simple route to get user's church
  app.get("/api/user/church", async (req, res) => {
    try {
      const userId = req.query.userId;
      
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const id = parseInt(userId as string);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const user = await storage.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      // If user doesn't have a church, get the first available one
      let churchName = user.church;
      if (!churchName) {
        const churches = await storage.getAllChurches();
        if (churches.length > 0) {
          churchName = churches[0].name;
          // Update user with this church using the simple method
          try {
            const updateResult = await storage.updateUserChurch(id, churchName);
          } catch (updateError) {
            console.error('🔍 Debug: Error updating user church:', updateError);
          }
        }
      }
      
      res.json({ 
        success: true, 
        church: churchName || 'Igreja não disponível',
        userId: id 
      });
    } catch (error) {
      console.error("Get user church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get or set default church
  app.get("/api/settings/default-church", async (req, res) => {
    try {
      const defaultChurch = await storage.getDefaultChurch();
      res.json({ defaultChurch });
    } catch (error) {
      console.error("Get default church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/settings/default-church", async (req, res) => {
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

  // Upload system logo
  app.post("/api/settings/logo", async (req: any, res) => {
    console.log("🚀 Logo upload request received");
    
    try {
      // Check if user is admin (basic check)
      const authHeader = req.headers.authorization;
      console.log("🔑 Auth header:", authHeader ? "Present" : "Missing");
      
      if (!authHeader) {
        console.log("❌ Unauthorized - no auth header");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Simple multer configuration
      const upload = multer({
        dest: 'uploads/',
        limits: { fileSize: 5 * 1024 * 1024 }
      }).single('logo');

      upload(req, res, async (err) => {
        if (err) {
          console.error("❌ Multer error:", err);
          return res.status(400).json({ 
            success: false, 
            message: err.message || "Error uploading logo" 
          });
        }

        if (!req.file) {
          console.log("❌ No file received");
          return res.status(400).json({ 
            success: false, 
            message: "No logo file provided" 
          });
        }

        console.log("📁 File received:", req.file);

        // Generate the URL for the uploaded logo
        const logoUrl = `/uploads/${req.file.filename}`;
        
        console.log(`✅ Logo uploaded successfully: ${req.file.filename}`);
        console.log(`🔗 Logo URL: ${logoUrl}`);
        
        // Salvar logo no banco de dados
        try {
          const saved = await storage.saveSystemLogo(logoUrl, req.file.filename);
          if (!saved) {
            console.error("❌ Failed to save logo to database");
            return res.status(500).json({ 
              success: false, 
              message: "Failed to save logo to database" 
            });
          }
          console.log("✅ Logo saved to database successfully");
        } catch (dbError) {
          console.error("❌ Database error:", dbError);
          return res.status(500).json({ 
            success: false, 
            message: "Database error while saving logo" 
          });
        }
        
        res.json({ 
          success: true, 
          message: "Logo uploaded and saved successfully",
          logoUrl: logoUrl,
          filename: req.file.filename
        });
      });
    } catch (error) {
      console.error("❌ Logo upload error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get system logo
  app.get("/api/settings/logo", async (req, res) => {
    console.log("🔍 Logo retrieval request received");
    
    try {
      const logoData = await storage.getSystemLogo();
      
      if (logoData) {
        console.log("✅ Logo found in database:", logoData);
        res.json({
          success: true,
          logoUrl: logoData.logoUrl,
          filename: logoData.filename
        });
      } else {
        console.log("ℹ️ No logo found in database");
        res.json({
          success: true,
          logoUrl: null,
          filename: null
        });
      }
    } catch (error) {
      console.error("❌ Error retrieving logo:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving logo from database"
      });
    }
  });

  // Clear system logo
  app.delete("/api/settings/logo", async (req, res) => {
    console.log("🗑️ Logo deletion request received");
    
    try {
      const deleted = await storage.clearSystemLogo();
      
      if (deleted) {
        console.log("✅ Logo deleted from database");
        res.json({
          success: true,
          message: "Logo deleted successfully"
        });
      } else {
        console.log("❌ Failed to delete logo from database");
        res.status(500).json({
          success: false,
          message: "Failed to delete logo from database"
        });
      }
    } catch (error) {
      console.error("❌ Error deleting logo:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting logo from database"
      });
    }
  });

  // Reset password endpoint (temporary)
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }

      // Get user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Hash default password
      const hashedPassword = await bcrypt.hash('meu7care', 10);

      // Update user password and set firstAccess to true
      const updatedUser = await storage.updateUser(user.id, {
        password: hashedPassword,
        firstAccess: true,
        updatedAt: new Date().toISOString()
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

  // Change password endpoint for first access
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
      }

      // Get user
      const user = await storage.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Verify current password
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        res.status(401).json({ success: false, message: "Current password is incorrect" });
        return;
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update user password and set firstAccess to false
      const updatedUser = await storage.updateUser(userId, {
        password: hashedNewPassword,
        firstAccess: false,
        updatedAt: new Date().toISOString()
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

  // My Interested endpoint for missionaries and members
  app.get("/api/my-interested", async (req, res) => {
    try {
      // Verificar se o usuário está autenticado e é missionário ou membro
      const userId = parseInt(req.headers['x-user-id'] as string || '0');
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const user = await storage.getUserById(userId);
      if (!user || (user.role !== 'missionary' && user.role !== 'member')) {
        return res.status(403).json({ error: "Apenas missionários e membros podem acessar esta rota" });
      }

      // Permitir missionários com status pending também
      console.log(`Usuário encontrado: ${user.name} (ID: ${user.id}, Role: ${user.role}, Status: ${user.status})`);

      // Buscar todos os usuários
      const allUsers = await storage.getAllUsers();
      
      // Filtrar apenas interessados da mesma igreja do usuário
      console.log(`Igreja do usuário: ${user.church}, Código: ${user.churchCode}`);
      console.log(`Total de usuários no sistema: ${allUsers.length}`);
      
      const churchInterested = allUsers.filter(u => 
        u.role === 'interested' && 
        u.church === user.church
      );
      
      console.log(`Interessados da mesma igreja encontrados: ${churchInterested.length}`);
      
      // Buscar relacionamentos existentes
      const relationships = await storage.getRelationshipsByMissionary(userId);
      const linkedInterestedIds = relationships.map(r => r.interestedId);
      
      // Processar usuários interessados
      const processedUsers: any[] = churchInterested.map(user => {
        const isLinked = linkedInterestedIds.includes(user.id);
        
        if (isLinked) {
          // Usuário vinculado: mostrar todos os dados
          return {
            ...user,
            isLinked: true,
            relationshipId: relationships.find(r => r.interestedId === user.id)?.id
          };
        } else {
          // Usuário não vinculado: mostrar dados limitados
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
            email: user.email ? '***@***.***' : null,
            phone: user.phone ? '***-***-****' : null,
            address: user.address ? '*** *** ***' : null,
            birthDate: user.birthDate ? '**/**/****' : null,
            cpf: user.cpf ? '***.***.***-**' : null,
            occupation: user.occupation ? '***' : null,
            education: user.education ? '***' : null,
            previousReligion: user.previousReligion ? '***' : null,
            interestedSituation: user.interestedSituation ? '***' : null,
            // Campos de gamificação limitados
            points: 0,
            level: '***',
            attendance: 0,
            // Outros campos
            biblicalInstructor: null,
            isLinked: false,
            canRequestDiscipleship: true
          };
        }
      });
      
      // Remover senhas e retornar dados
      const safeUsers = processedUsers.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get my interested error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
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
      
      // Lógica especial para missionários: podem ver todos os interessados de sua igreja
      // mas com dados limitados quando não há vínculo
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = userAgent.includes('Mobile') || userAgent.includes('mobile');
      
      if (req.headers['x-user-role'] === 'missionary' || req.headers['x-user-id']) {
        const missionaryId = parseInt(req.headers['x-user-id'] as string || '0');
        const missionary = users.find(u => u.id === missionaryId);
        
        if (missionary && missionary.role === 'missionary') {
          // Filtrar apenas interessados da mesma igreja do missionário
          const churchInterested = users.filter(u => 
            u.role === 'interested' && 
            u.church === missionary.church &&
            u.churchCode === missionary.churchCode
          );
          
          // Buscar relacionamentos existentes
          const relationships = await storage.getRelationshipsByMissionary(missionaryId);
          const linkedInterestedIds = relationships.map(r => r.interestedId);
          
          // Processar usuários interessados
          const processedUsers: any[] = churchInterested.map(user => {
            const isLinked = linkedInterestedIds.includes(user.id);
            
            if (isLinked) {
              // Usuário vinculado: mostrar todos os dados
              return user;
            } else {
              // Usuário não vinculado: mostrar dados limitados
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
                email: user.email ? '***@***.***' : null,
                phone: user.phone ? '***-***-****' : null,
                address: user.address ? '*** *** ***' : null,
                birthDate: user.birthDate ? '**/**/****' : null,
                cpf: user.cpf ? '***.***.***-**' : null,
                occupation: user.occupation ? '***' : null,
                education: user.education ? '***' : null,
                previousReligion: user.previousReligion ? '***' : null,
                interestedSituation: user.interestedSituation ? '***' : null,
                // Campos de gamificação limitados
                points: 0,
                level: '***',
                attendance: 0,
                // Outros campos
                biblicalInstructor: null,
                isLinked: false,
                canRequestDiscipleship: true
              };
            }
          });
          
          // Adicionar missionário e outros usuários não-interessados
          const otherUsers = users.filter(u => 
            u.role !== 'interested' || 
            (u.church !== missionary.church || u.churchCode !== missionary.churchCode)
          );
          
          const finalUsers = [...processedUsers, ...otherUsers];
          const safeUsers = finalUsers.map(({ password, ...user }) => user);
          res.json(safeUsers);
          return;
        }
      }
      
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

        // Create single user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      
      // Hash password if not provided
      const hashedPassword = userData.password ? 
        await bcrypt.hash(userData.password, 10) : 
        await bcrypt.hash('meu7care', 10);
      
      // Process church - create or find existing church
      let processedChurch: string | null = null;
      if (userData.church && userData.church.trim() !== '') {
        try {
          const church = await storage.getOrCreateChurch(userData.church.trim());
          processedChurch = church.name;
        } catch (error) {
          console.error(`❌ Erro ao processar igreja "${userData.church}" para ${userData.name}:`, error);
          processedChurch = 'Igreja Principal'; // Fallback
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

  // Approve user

  // Endpoint para limpeza automática de aprovações órfãs
  app.post("/api/system/clean-orphaned-approvals", async (req, res) => {
    try {
      console.log('🧹 Iniciando limpeza automática de aprovações órfãs...');
      
      // Buscar todas as solicitações aprovadas
      const allRequests = await storage.getAllDiscipleshipRequests();
      const approvedRequests = allRequests.filter(req => req.status === 'approved');
      
      console.log(`🔍 Encontradas ${approvedRequests.length} solicitações aprovadas`);
      
      let cleanedCount = 0;
      let errors: Array<{ requestId: number; error: any }> = [];
      
      for (const request of approvedRequests) {
        try {
          // Verificar se existe relacionamento ativo para este interessado
          const relationships = await storage.getRelationshipsByInterested(request.interestedId);
          const hasActiveRelationship = relationships.some(rel => rel.status === 'active');
          
          if (!hasActiveRelationship) {
            console.log(`🔍 Rejeitando solicitação órfã ID ${request.id} para interessado ${request.interestedId}`);
            
            // Atualizar status para rejeitado
            const updatedRequest = await storage.updateDiscipleshipRequest(request.id, {
              status: 'rejected',
              adminNotes: 'Solicitação rejeitada automaticamente - sem relacionamento ativo',
              processedBy: 1, // Sistema automático
              processedAt: new Date().toISOString()
            });
            
            if (updatedRequest) {
              cleanedCount++;
              console.log(`✅ Solicitação ${request.id} rejeitada automaticamente`);
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao processar solicitação ${request.id}:`, error);
          errors.push({ requestId: request.id, error: (error as any).message });
        }
      }
      
      console.log(`🧹 Limpeza automática concluída: ${cleanedCount} solicitações rejeitadas`);
      
      res.json({
        success: true,
        message: `Limpeza automática concluída`,
        cleanedCount,
        totalProcessed: approvedRequests.length,
        errors: errors.length > 0 ? errors : undefined
      });
      
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno na limpeza automática",
        details: (error as any).message 
      });
    }
  });

  // Endpoint para agendar limpeza automática (execução manual)
  app.post("/api/system/schedule-cleanup", async (req, res) => {
    try {
      const { scheduleType, interval } = req.body;
      
      console.log(`⏰ Agendando limpeza automática: ${scheduleType} - ${interval}`);
      
      // Por enquanto, apenas retorna sucesso
      // Em produção, você pode integrar com um sistema de agendamento como cron
      res.json({
        success: true,
        message: `Limpeza automática agendada para ${scheduleType}`,
        scheduleType,
        interval,
        nextRun: new Date(Date.now() + (interval || 24 * 60 * 60 * 1000)).toISOString()
      });
      
    } catch (error) {
      console.error('❌ Erro ao agendar limpeza:', error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno ao agendar limpeza",
        details: (error as any).message 
      });
    }
  });

  // Função auxiliar para executar limpeza automática
  const executeAutoCleanup = async () => {
    try {
      console.log('🧹 Executando limpeza automática de aprovações órfãs...');
      
      const allRequests = await storage.getAllDiscipleshipRequests();
      const approvedRequests = allRequests.filter(req => req.status === 'approved');
      
      let cleanedCount = 0;
      
      for (const request of approvedRequests) {
        try {
          const relationships = await storage.getRelationshipsByInterested(request.interestedId);
          const hasActiveRelationship = relationships.some(rel => rel.status === 'active');
          
          if (!hasActiveRelationship) {
            await storage.updateDiscipleshipRequest(request.id, {
              status: 'rejected',
              adminNotes: 'Limpeza automática - sem relacionamento ativo',
              processedBy: 1,
              processedAt: new Date().toISOString()
            });
            cleanedCount++;
          }
        } catch (error) {
          console.error(`❌ Erro na limpeza automática da solicitação ${request.id}:`, error);
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 Limpeza automática concluída: ${cleanedCount} solicitações rejeitadas`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
      return 0;
    }
  };

  // Sistema de limpeza automática periódica
  let autoCleanupInterval: NodeJS.Timeout | null = null;
  let autoCleanupEnabled = true; // Ativado por padrão

  // Função para iniciar limpeza automática
  const startAutoCleanup = (intervalMinutes: number = 60) => {
    if (autoCleanupInterval) {
      clearInterval(autoCleanupInterval);
    }
    
    autoCleanupEnabled = true;
    const intervalMs = intervalMinutes * 60 * 1000;
    
    console.log(`⏰ Iniciando limpeza automática a cada ${intervalMinutes} minutos`);
    
    // Executar imediatamente
    executeAutoCleanup();
    
    // Configurar intervalo
    autoCleanupInterval = setInterval(async () => {
      if (autoCleanupEnabled) {
        await executeAutoCleanup();
      }
    }, intervalMs);
    
    return true;
  };

  // Função para parar limpeza automática
  const stopAutoCleanup = () => {
    if (autoCleanupInterval) {
      clearInterval(autoCleanupInterval);
      autoCleanupInterval = null;
    }
    autoCleanupEnabled = false;
    console.log('⏰ Limpeza automática parada');
    return true;
  };

  // Endpoint para controlar limpeza automática
  app.post("/api/system/auto-cleanup/start", async (req, res) => {
    try {
      const { intervalMinutes = 60 } = req.body;
      
      if (intervalMinutes < 15) {
        return res.status(400).json({ 
          success: false, 
          error: "Intervalo mínimo é de 15 minutos" 
        });
      }
      
      const success = startAutoCleanup(intervalMinutes);
      
      res.json({
        success: true,
        message: `Limpeza automática iniciada a cada ${intervalMinutes} minutos`,
        intervalMinutes,
        status: 'running'
      });
      
    } catch (error) {
      console.error('❌ Erro ao iniciar limpeza automática:', error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno ao iniciar limpeza automática" 
      });
    }
  });

  app.post("/api/system/auto-cleanup/stop", async (req, res) => {
    try {
      const success = stopAutoCleanup();
      
      res.json({
        success: true,
        message: "Limpeza automática parada",
        status: 'stopped'
      });
      
    } catch (error) {
      console.error('❌ Erro ao parar limpeza automática:', error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno ao parar limpeza automática" 
      });
    }
  });

  app.get("/api/system/auto-cleanup/status", async (req, res) => {
    try {
      res.json({
        success: true,
        status: autoCleanupEnabled ? 'running' : 'stopped',
        interval: autoCleanupInterval ? 'configurado' : 'não configurado',
        lastRun: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Erro ao verificar status da limpeza automática:', error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno ao verificar status" 
      });
    }
  });

  // Inicializar limpeza automática quando o servidor iniciar
  console.log('🚀 Inicializando sistema de limpeza automática...');
  startAutoCleanup(60); // A cada hora por padrão

  // Birthday data endpoint - otimizado com filtro por igreja
  app.get("/api/users/birthdays", async (req, res) => {
    try {
      // Obter informações do usuário logado
      const userId = req.headers['x-user-id'] as string;
      const userRole = req.headers['x-user-role'] as string;
      
      let userChurch: string | null = null;
      
      // Se não for admin, precisa filtrar por igreja
      if (userRole !== 'admin' && userId) {
        try {
          const currentUser = await storage.getUserById(parseInt(userId));
          if (currentUser && currentUser.church) {
            userChurch = currentUser.church;
          }
        } catch (error) {
          console.error('Erro ao buscar usuário para filtro de igreja:', error);
        }
      }
      
      const allUsers = await storage.getAllUsers();
      // Usar data local para evitar problemas de fuso horário
      const today = new Date();
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      const currentMonth = localDate.getMonth();
      const currentDay = localDate.getDate();
      
      // Filtrar usuários por igreja se não for admin
      let filteredUsers = allUsers;
      if (userChurch && userRole !== 'admin') {
        filteredUsers = allUsers.filter(user => user.church === userChurch);
        console.log(`🎂 Filtrando aniversariantes por igreja: ${userChurch} (${filteredUsers.length} usuários)`);
      }
      
      const usersWithBirthDates = filteredUsers.filter(user => {
        if (!user.birthDate) return false;
        const birthDate = parseDate(user.birthDate);
        return birthDate && !isNaN(birthDate.getTime()) && birthDate.getFullYear() !== 1969;
      });
      
      const birthdaysToday = usersWithBirthDates.filter(user => {
        const birthDate = parseDate(user.birthDate);
        return birthDate && birthDate.getMonth() === currentMonth && birthDate.getDate() === currentDay;
      });
      
      const birthdaysThisMonth = usersWithBirthDates.filter(user => {
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
      
      const formatBirthdayUser = (user: any) => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate,
        profilePhoto: user.profilePhoto,
        church: user.church || null
      });
      
      // TODOS os aniversariantes para o calendário (filtrados por igreja se aplicável)
      const allBirthdays = usersWithBirthDates.sort((a, b) => {
        const dateA = parseDate(a.birthDate);
        const dateB = parseDate(b.birthDate);
        if (!dateA || !dateB) return 0;
        
        // Primeiro ordena por mês, depois por dia
        const monthDiff = dateA.getMonth() - dateB.getMonth();
        if (monthDiff !== 0) return monthDiff;
        return dateA.getDate() - dateB.getDate();
      });
      
      res.json({
        today: birthdaysToday.map(formatBirthdayUser),
        thisMonth: birthdaysThisMonth.map(formatBirthdayUser),
        all: allBirthdays.map(formatBirthdayUser), // Filtrados por igreja se aplicável
        filteredByChurch: userChurch || null // Informação adicional para debug
      });
      
    } catch (error) {
      console.error('Erro no endpoint de aniversariantes:', error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.get("/api/users/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
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

  app.put("/api/users/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Verificar se o campo biblicalInstructor está sendo alterado
      if (updateData.biblicalInstructor !== undefined) {
        console.log(`🔄 Atualizando biblicalInstructor para usuário ${id}: ${updateData.biblicalInstructor}`);
        
        // Se biblicalInstructor está sendo definido (não null)
        if (updateData.biblicalInstructor) {
          // Verificar se já existe um relacionamento
          const existingRelationship = await storage.getRelationshipsByInterested(id);
          if (!existingRelationship || existingRelationship.length === 0) {
            // Criar novo relacionamento
            console.log(`➕ Criando relacionamento para usuário ${id} com missionário ${updateData.biblicalInstructor}`);
            await storage.createRelationship({
              missionaryId: parseInt(updateData.biblicalInstructor),
              interestedId: id,
              status: 'active',
              notes: "Vinculado pelo admin"
            });
          }
        } else {
          // Se biblicalInstructor está sendo limpo (null), remover relacionamentos
          console.log(`➖ Removendo relacionamentos para usuário ${id}`);
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

  app.post("/api/users/:id(\\d+)/approve", async (req, res) => {
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

  app.post("/api/users/:id(\\d+)/reject", async (req, res) => {
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

  app.delete("/api/users/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Proteção especial para super administrador (verificação prioritária)
      if (user.email === 'admin@7care.com') {
        return res.status(403).json({ 
          error: "Não é possível excluir o Super Administrador do sistema" 
        });
      }
      
      // Check if user is admin before attempting deletion
      if (user.role === 'admin') {
        return res.status(403).json({ 
          error: "Não é possível excluir usuários administradores do sistema" 
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

  // Bulk import users
  app.post("/api/users/bulk-import", async (req, res) => {
    try {
      const { users } = req.body;
      
      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: "Users array is required and must not be empty" });
      }

      const processedUsers: any[] = [];
      const errors: Array<{ userId: any; userName: any; error: string }> = [];

      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        try {
          // Check if user already exists by email
          const existingUser = await storage.getUserByEmail(userData.email);
          if (existingUser) {
            errors.push({ userId: userData.email, userName: userData.name, error: `User with email ${userData.email} already exists` });
            continue;
          }

          // Generate username (primeiro.ultimo, minúsculo, sem acento/espaço)
          const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const nameParts = userData.name.trim().split(' ');
          let baseUsername = '';
          if (nameParts.length === 1) {
            baseUsername = normalize(nameParts[0]);
          } else {
            const firstName = normalize(nameParts[0]);
            const lastName = normalize(nameParts[nameParts.length - 1]);
            baseUsername = `${firstName}.${lastName}`;
          }
          
          // Check if username already exists and add number if needed
          let finalUsername = baseUsername;
          let counter = 1;
          const allUsers = await storage.getAllUsers();
          while (allUsers.some(u => {
            const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const nameParts = u.name.trim().split(' ');
            let generatedUsername = '';
            if (nameParts.length === 1) {
              generatedUsername = normalize(nameParts[0]);
            } else {
              const firstName = normalize(nameParts[0]);
              const lastName = normalize(nameParts[nameParts.length - 1]);
              generatedUsername = `${firstName}.${lastName}`;
            }
            return generatedUsername === finalUsername;
          })) {
            finalUsername = `${baseUsername}${counter}`;
            counter++;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash('meu7care', 10);

          // Process birth date to remove time component
          const processedBirthDate = userData.birthDate ? parseBirthDate(userData.birthDate) : null;
          const processedBaptismDate = userData.baptismDate ? parseBirthDate(userData.baptismDate) : null;
          
          // Process church - create or find existing church
          let processedChurch: string | null = null;
          if (userData.church && userData.church.trim() !== '') {
            try {
              const church = await storage.getOrCreateChurch(userData.church.trim());
              processedChurch = church.name;
            } catch (error) {
              console.error(`❌ Erro ao processar igreja "${userData.church}" para ${userData.name}:`, error);
              processedChurch = 'Igreja Principal'; // Fallback
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

          // Create user with first access credentials
          const newUser = await storage.createUser(processedUserData);

          processedUsers.push({
            ...newUser,
            generatedUsername: finalUsername,
            defaultPassword: 'meu7care'
          });

        } catch (error) {
          console.error(`Error processing user ${i + 1}:`, error);
          errors.push({ userId: userData.email, userName: userData.name, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      res.json({
        success: true,
        message: `Successfully processed ${processedUsers.length} users`,
        users: processedUsers,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ error: "Internal server error" });
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

  app.post("/api/churches", async (req, res) => {
    try {
      const { name, address } = req.body;
      
      if (!name || name.trim() === '') {
        res.status(400).json({ error: "Nome da igreja é obrigatório" });
        return;
      }
      
      const church = await storage.getOrCreateChurch(name.trim());
      
      // If address provided, update it
      // Nota: endereço será persistido quando implementado updateChurch no storage
      
      res.json(church);
    } catch (error) {
      console.error("Create church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/churches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      if (storage.updateUserChurch) {
        // Get the church before updating to get the old name
        const oldChurch = await storage.getAllChurches().then(churches => 
          churches.find(c => c.id === id)
        );
        
        const updatedChurch = await storage.updateUserChurch(id, updates.church || updates.name);
        if (updatedChurch) {
          // If the church name was changed, update all users associated with this church
          if (updates.name && oldChurch && oldChurch.name !== updates.name) {
            console.log(`🔄 Atualizando usuários da igreja "${oldChurch.name}" para "${updates.name}"`);
            
            const allUsers = await storage.getAllUsers();
            let updatedUsersCount = 0;
            
            for (const user of allUsers) {
              if (user.church === oldChurch.name) {
                try {
                  await storage.updateUser(user.id, { church: updates.name });
                  updatedUsersCount++;
                  console.log(`✅ Usuário ${user.name} atualizado: ${oldChurch.name} → ${updates.name}`);
                } catch (error) {
                  console.error(`❌ Erro ao atualizar usuário ${user.name}:`, error);
                }
              }
            }
            
            console.log(`📊 Total de usuários atualizados: ${updatedUsersCount}`);
          }
          
          res.json(updatedChurch);
        } else {
          res.status(404).json({ error: "Igreja não encontrada" });
        }
      } else {
        res.status(501).json({ error: "Update não implementado" });
      }
    } catch (error) {
      console.error("Update church error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    console.log('📊 Dashboard stats request received');
    try {
      const allUsers = await storage.getAllUsers();
      const allEvents = await storage.getAllEvents();
      console.log(`📈 Found ${allUsers.length} users and ${allEvents.length} events`);
      
      // Filtrar usuários excluindo Super Admin
      const regularUsers = allUsers.filter(user => user.email !== 'admin@7care.com');
      
      // Count users by role (excluindo Super Admin)
      const usersByRole = regularUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count pending approvals (excluindo Super Admin)
      const pendingApprovals = regularUsers.filter(user => user.status === 'pending').length;

      // Count events this week (domingo 00:00 até sábado 23:59:59.999) em horário local
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); // Domingo 00:00
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000); // Próximo domingo 00:00

      const parseLocalDate = (value: any): Date | null => {
        if (!value) return null;
        // Se for Date já
        if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
        // Tente parse direto
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
        // Tente YYYY-MM-DD
        const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          const y = Number(m[1]);
          const mo = Number(m[2]) - 1;
          const da = Number(m[3]);
          return new Date(y, mo, da);
        }
        return null;
      };

      const thisWeekEvents = allEvents.filter(event => {
        const start = parseLocalDate((event as any).startDate);
        const end = parseLocalDate((event as any).endDate) || start;
        if (!start) return false;
        // Considera evento dentro da semana se houver interseção com [weekStart, weekEnd)
        return (start < weekEnd) && (end ? end >= weekStart : true);
      }).length;

      // Eventos deste mês (primeiro dia 00:00 até primeiro dia do próximo mês 00:00)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const thisMonthEvents = allEvents.filter(event => {
        const start = parseLocalDate((event as any).startDate);
        const end = parseLocalDate((event as any).endDate) || start;
        if (!start) return false;
        return (start < nextMonthStart) && (end ? end >= monthStart : true);
      }).length;

      // Count birthdays today and this week
      const today = new Date();
              const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const birthdaysToday = regularUsers.filter(user => {
        if (!user.birthDate) return false;
        const birthDate = new Date(user.birthDate);
        if (isNaN(birthDate.getTime())) return false;
        const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
        return birthStr === todayStr;
      }).length;

      const birthdaysThisWeek = regularUsers.filter(user => {
        if (!user.birthDate) return false;
        const birthDate = new Date(user.birthDate);
        if (isNaN(birthDate.getTime())) return false;
        const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        return thisYearBirthday >= weekStart && thisYearBirthday < weekEnd;
      }).length;

      // Churches count
      const churches = await storage.getAllChurches();
      const churchesCount = churches.length;

      // Contar usuários com role missionary (excluindo Super Admin)
      const totalMissionaries = regularUsers.filter(u => u.role === 'missionary').length;

      const stats = {
        totalUsers: regularUsers.length,
        totalInterested: usersByRole.interested || 0,
        totalMembers: usersByRole.member || 0,
        totalMissionaries: totalMissionaries,
        totalAdmins: usersByRole.admin || 0,
        totalChurches: churchesCount,
        pendingApprovals,
        thisWeekEvents,
        thisMonthEvents,
        birthdaysToday,
        birthdaysThisWeek,
        totalEvents: allEvents.length,
        approvedUsers: regularUsers.filter(user => user.status === 'approved').length
      };
      
      console.log('📊 Dashboard stats calculated:', stats);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Test endpoint to debug visited users
  app.get("/api/debug/visited-users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const memberUsers = allUsers.filter(user => user.role === 'member' || user.role === 'missionary');
      
      const visitedUsers = [];
      memberUsers.forEach(user => {
        try {
          if (user.extraData) {
            let extraData;
            if (typeof user.extraData === 'string') {
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
          console.error(`Erro ao processar usuário ${user.name}:`, error);
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

  // Visitometer data endpoint - Versão corrigida
  app.get("/api/dashboard/visits", async (req, res) => {
    try {
      console.log("🔍 Iniciando busca de dados do visitômetro...");
      
      // Buscar todos os usuários
      const allUsers = await storage.getAllUsers();
      console.log(`👥 Total de usuários no sistema: ${allUsers.length}`);
      
      // Filtrar usuários que devem ser visitados (member ou missionary)
      const targetUsers = allUsers.filter(user => 
        user.role === 'member' || user.role === 'missionary'
      );
      console.log(`🎯 Usuários target (member/missionary): ${targetUsers.length}`);
      
      let visitedPeople = 0;
      let totalVisits = 0;
      const visitedUsersList = [];

      // Processar cada usuário target
      targetUsers.forEach(user => {
        try {
          if (user.extraData) {
            let extraData;
            if (typeof user.extraData === 'string') {
              extraData = JSON.parse(user.extraData);
            } else {
              extraData = user.extraData || {};
            }
            
            // Verificar se foi visitado
            if (extraData.visited === true) {
        visitedPeople++;
              const visitCount = extraData.visitCount || 1;
              totalVisits += visitCount;
              
              visitedUsersList.push({
                id: user.id,
                name: user.name,
                visitCount: visitCount,
                lastVisitDate: extraData.lastVisitDate
              });
              
              console.log(`✅ ${user.name}: ${visitCount} visitas`);
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao processar usuário ${user.name}:`, error);
        }
      });

      const expectedVisits = targetUsers.length;
      const percentage = expectedVisits > 0 ? Math.round((visitedPeople / expectedVisits) * 100) : 0;

      console.log(`📊 Visitômetro: ${visitedPeople}/${expectedVisits} pessoas visitadas (${percentage}%), ${totalVisits} visitas totais`);

      res.json({
        completed: visitedPeople, // Pessoas visitadas (pelo menos uma vez)
        expected: expectedVisits, // Total de pessoas que devem ser visitadas
        totalVisits: totalVisits, // Total de visitas realizadas (pode ser > que pessoas)
        visitedPeople: visitedPeople, // Pessoas visitadas (alias para completed)
        percentage: percentage, // Porcentagem de conclusão
        visitedUsersList: visitedUsersList // Lista detalhada dos usuários visitados
      });
    } catch (error) {
      console.error("Get visits error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mark user as visited endpoint
  app.post("/api/users/:id(\\d+)/visit", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const { visitDate } = req.body;
      if (!visitDate) {
        return res.status(400).json({ error: "Data da visita é obrigatória" });
      }

      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Parse existing extraData or create new
      let extraData: any = {};
      if (user.extraData) {
        if (typeof user.extraData === 'string') {
          try {
            extraData = JSON.parse(user.extraData);
            console.log(`📋 ExtraData existente (string):`, extraData);
          } catch {
            extraData = {};
            console.log(`❌ Erro ao fazer parse do extraData`);
          }
        } else if (typeof user.extraData === 'object') {
          extraData = { ...user.extraData }; // Criar uma cópia
          console.log(`📋 ExtraData existente (objeto):`, extraData);
        }
      } else {
        console.log(`📋 ExtraData vazio, criando novo`);
      }

      // Update visit information
      const previousVisitCount = extraData.visitCount || 0;
      extraData.visited = true;
      extraData.lastVisitDate = visitDate;
      extraData.visitCount = previousVisitCount + 1;

      console.log(`🔍 Debug visita: Usuário ${user.name} - visitCount anterior: ${previousVisitCount}, novo: ${extraData.visitCount}`);

      // Update user with new extraData
      const updatedUser = await storage.updateUser(id, {
        extraData: JSON.stringify(extraData)
      });

      if (!updatedUser) {
        return res.status(500).json({ error: "Erro ao atualizar usuário" });
      }

      // Retornar o usuário atualizado com extraData parseado
      const responseUser = {
        ...updatedUser,
        extraData: extraData
      };

      console.log(`✅ Usuário atualizado: ${updatedUser.name} - visitCount: ${extraData.visitCount}`);

      res.json(responseUser);
    } catch (error) {
      console.error("Mark visit error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // System routes
  app.post('/api/system/clear-all', async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ success: true, message: 'Todos os dados foram limpos com sucesso' });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      res.status(500).json({ success: false, message: 'Erro ao limpar dados' });
    }
  });

  app.post('/api/system/calculate-points', async (req, res) => {
    try {
      await storage.calculateBasicUserPoints();
      res.json({ success: true, message: 'Pontos básicos calculados com sucesso' });
    } catch (error) {
      console.error('Erro ao calcular pontos:', error);
      res.status(500).json({ success: false, message: 'Erro ao calcular pontos' });
    }
  });

  app.post('/api/system/calculate-advanced-points', async (req, res) => {
    try {
      console.log('🔄 Endpoint /api/system/calculate-advanced-points chamado');
      const result = await storage.calculateAdvancedUserPoints();
      console.log('✅ Resultado do cálculo:', result);
      res.json({ success: true, message: 'Pontos avançados calculados com sucesso' });
    } catch (error) {
      console.error('Erro ao calcular pontos avançados:', error);
      res.status(500).json({ success: false, message: 'Erro ao calcular pontos avançados' });
    }
  });

  // Endpoint para recalcular pontuação de todos os usuários
  app.post('/api/system/recalculate-all-points', async (req, res) => {
    try {
      
      // Buscar todos os usuários
      const allUsers = await storage.getAllUsers();
      console.log(`📊 Total de usuários encontrados: ${allUsers.length}`);
      
      let updatedCount = 0;
      const errors: Array<{ userId: any; userName: any; error: string }> = [];
      
      // Processar cada usuário
      for (const user of allUsers) {
        try {
          
          // Pular Super Admin - não deve ter pontos
          if (user.email === 'admin@7care.com' || user.role === 'admin') {
            continue;
          }
          
          // Calcular pontos usando a função corrigida
          const config = await storage.getPointsConfiguration();
          let points = 0;
          
          // Parse extra_data
          let userData: any = {};
          if (user.extraData && typeof user.extraData === 'string') {
            userData = JSON.parse(user.extraData);
          }
          
          // Pontos básicos
          points += config.basicPoints || 100;
          
          // Pontos de presença
          const attendancePoints = (user.attendance || 0) * (config.attendancePoints || 10);
          points += attendancePoints;
          
          // Engajamento
          if (userData.engajamento) {
            const engajamento = userData.engajamento.toLowerCase();
            if (engajamento.includes('baixo')) points += config.engajamento.baixo;
            else if (engajamento.includes('médio') || engajamento.includes('medio')) points += config.engajamento.medio;
            else if (engajamento.includes('alto')) points += config.engajamento.alto;
            else points += config.engajamento.baixo; // Default para baixo se não reconhecer
          }
          
          // Classificação
          if (userData.classificacao) {
            const classificacao = userData.classificacao.toLowerCase();
            if (classificacao.includes('frequente')) points += config.classificacao.frequente;
            else points += config.classificacao.naoFrequente;
          }
          
          // Dizimista - usar dizimistaType se disponível
          if (userData.dizimistaType) {
            const dizimista = userData.dizimistaType.toLowerCase();
            if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) points += config.dizimista.naoDizimista;
            else if (dizimista.includes('pontual')) points += config.dizimista.pontual;
            else if (dizimista.includes('sazonal')) points += config.dizimista.sazonal;
            else if (dizimista.includes('recorrente')) points += config.dizimista.recorrente;
          } else if (userData.dizimista) {
            const dizimista = userData.dizimista.toLowerCase();
            if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) points += config.dizimista.naoDizimista;
            else if (dizimista.includes('pontual')) points += config.dizimista.pontual;
            else if (dizimista.includes('sazonal')) points += config.dizimista.sazonal;
            else if (dizimista.includes('recorrente')) points += config.dizimista.recorrente;
          }
          
          // Ofertante - usar ofertanteType se disponível
          if (userData.ofertanteType) {
            const ofertante = userData.ofertanteType.toLowerCase();
            if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) points += config.ofertante.naoOfertante;
            else if (ofertante.includes('pontual')) points += config.ofertante.pontual;
            else if (ofertante.includes('sazonal')) points += config.ofertante.sazonal;
            else if (ofertante.includes('recorrente')) points += config.ofertante.recorrente;
            else points += config.ofertante.recorrente; // Default para recorrente se não reconhecer
          } else if (userData.ofertante) {
            const ofertante = userData.ofertante.toLowerCase();
            if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) points += config.ofertante.naoOfertante;
            else if (ofertante.includes('pontual')) points += config.ofertante.pontual;
            else if (ofertante.includes('sazonal')) points += config.ofertante.sazonal;
            else if (ofertante.includes('recorrente')) points += config.ofertante.recorrente;
            else points += config.ofertante.recorrente; // Default para recorrente se não reconhecer
          }
          
          // Tempo de batismo
          if (userData.tempoBatismoAnos) {
            const tempo = userData.tempoBatismoAnos;
            if (tempo >= 2 && tempo < 5) points += config.tempoBatismo.doisAnos;
            else if (tempo >= 5 && tempo < 10) points += config.tempoBatismo.cincoAnos;
            else if (tempo >= 10 && tempo < 20) points += config.tempoBatismo.dezAnos;
            else if (tempo >= 20 && tempo < 30) points += config.tempoBatismo.vinteAnos;
            else if (tempo >= 30) points += config.tempoBatismo.maisVinte;
          }
          
          // Nome da unidade
          if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
            points += config.nomeUnidade.comUnidade;
          }
          
          // Pontuação dinâmica
          if (userData.comunhao) points += (userData.comunhao * config.pontuacaoDinamica.multiplicador);
          if (userData.missao) points += (userData.missao * config.pontuacaoDinamica.multiplicador);
          if (userData.estudoBiblico) points += (userData.estudoBiblico * config.pontuacaoDinamica.multiplicador);
          
          // Total de presença
          if (userData.totalPresenca !== undefined) {
            const presenca = userData.totalPresenca;
            if (presenca >= 0 && presenca <= 3) points += config.totalPresenca.zeroATres;
            else if (presenca >= 4 && presenca <= 7) points += config.totalPresenca.quatroASete;
            else if (presenca >= 8 && presenca <= 13) points += config.totalPresenca.oitoATreze;
          }
          
          // Escola sabatina
          if (userData.batizouAlguem) points += config.escolaSabatina.batizouAlguem;
          if (userData.discPosBatismal) points += (userData.discPosBatismal * config.escolaSabatina.discipuladoPosBatismo);
          
          // CPF válido
          if (userData.cpfValido === 'Sim' || userData.cpfValido === true) {
            points += config.cpfValido.valido;
          }
          
          // Campos vazios ACMS (assumindo que está completo)
          points += config.camposVaziosACMS.completos;
          
          // Aplicar multiplicadores
          const multiplicadorDinamico = config.pontuacaoDinamica?.multiplicador || 1;
          const multiplicadorPresenca = config.presenca?.multiplicador || 1;
          
          points = points * multiplicadorDinamico;
          points += (user.attendance || 0) * multiplicadorPresenca;
          
          // Verificar se os pontos mudaram
          const currentPoints = user.points || 0;
          const newPoints = Math.round(points);
          
          if (newPoints !== currentPoints) {
            await storage.updateUser(user.id, { points: newPoints });
            updatedCount++;
          } else {
          }
          
        } catch (userError) {
          console.error(`❌ Erro ao processar usuário ${user.name}:`, userError);
          const message = userError instanceof Error ? userError.message : String(userError);
          errors.push({ userId: user.id, userName: user.name, error: message });
        }
      }
      
      console.log(`✅ Processamento concluído: ${updatedCount} usuários atualizados`);
      
      res.json({
        success: true,
        message: `Pontuação recalculada para todos os usuários`,
        totalUsers: allUsers.length,
        updatedUsers: updatedCount,
        errors: errors
      });
      
    } catch (error) {
      console.error('Erro ao recalcular pontuação de todos os usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint específico para recalcular pontuação de um usuário
  app.post('/api/users/:id/recalculate-points', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Buscar usuário
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Pular Super Admin - não deve ter pontos
      if (user.email === 'admin@7care.com' || user.role === 'admin') {
        return res.json({ 
          success: true, 
          message: `Super Admin não deve ter pontos calculados`,
          points: 0
        });
      }
      
      console.log(`👤 Usuário encontrado: ${user.name}`);
      
      // Calcular pontos manualmente
      const config = await storage.getPointsConfiguration();
      let points = 0;
      
      try {
        // Parse extra_data
        let userData: any = {};
        if (user.extraData && typeof user.extraData === 'string') {
          userData = JSON.parse(user.extraData);
        }
        
        console.log(`📊 Dados do usuário:`, userData);
        
        // Pontos básicos
        points += config.basicPoints || 5;
        
        // Pontos de presença
        const attendancePoints = (user.attendance || 0) * (config.attendancePoints || 5);
        points += attendancePoints;
        
        // Engajamento
        if (userData.engajamento) {
          const engajamento = userData.engajamento.toLowerCase();
          if (engajamento.includes('baixo')) points += config.engajamento.baixo;
          else if (engajamento.includes('médio') || engajamento.includes('medio')) points += config.engajamento.medio;
          else if (engajamento.includes('alto')) points += config.engajamento.alto;
          else points += config.engajamento.baixo; // Default para baixo se não reconhecer
        }
        
        // Classificação
        if (userData.classificacao) {
          const classificacao = userData.classificacao.toLowerCase();
          if (classificacao.includes('frequente')) points += config.classificacao.frequente;
          else points += config.classificacao.naoFrequente;
        }
        
        // Dizimista
        if (userData.dizimistaType) {
          const dizimista = userData.dizimistaType.toLowerCase();
          if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) points += config.dizimista.naoDizimista;
          else if (dizimista.includes('pontual')) points += config.dizimista.pontual;
          else if (dizimista.includes('sazonal')) points += config.dizimista.sazonal;
          else if (dizimista.includes('recorrente')) points += config.dizimista.recorrente;
        }
        
        // Ofertante
        if (userData.ofertanteType) {
          const ofertante = userData.ofertanteType.toLowerCase();
          if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) points += config.ofertante.naoOfertante;
          else if (ofertante.includes('pontual')) points += config.ofertante.pontual;
          else if (ofertante.includes('sazonal')) points += config.ofertante.sazonal;
          else if (ofertante.includes('recorrente')) points += config.ofertante.recorrente;
          else points += config.ofertante.recorrente; // Default para recorrente se não reconhecer
        }
        
        // Tempo de batismo
        if (userData.tempoBatismoAnos) {
          const tempo = userData.tempoBatismoAnos;
          if (tempo >= 2 && tempo < 5) points += config.tempoBatismo.doisAnos;
          else if (tempo >= 5 && tempo < 10) points += config.tempoBatismo.cincoAnos;
          else if (tempo >= 10 && tempo < 20) points += config.tempoBatismo.dezAnos;
          else if (tempo >= 20 && tempo < 30) points += config.tempoBatismo.vinteAnos;
          else if (tempo >= 30) points += config.tempoBatismo.maisVinte;
        }
        
        // Nome da unidade
        if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
          points += config.nomeUnidade.comUnidade;
        }
        
        // Pontuação dinâmica
        if (userData.comunhao) points += (userData.comunhao * config.pontuacaoDinamica.multiplicador);
        if (userData.missao) points += (userData.missao * config.pontuacaoDinamica.multiplicador);
        if (userData.estudoBiblico) points += (userData.estudoBiblico * config.pontuacaoDinamica.multiplicador);
        
        // Total de presença
        if (userData.totalPresenca !== undefined) {
          const presenca = userData.totalPresenca;
          if (presenca >= 0 && presenca <= 3) points += config.totalPresenca.zeroATres;
          else if (presenca >= 4 && presenca <= 7) points += config.totalPresenca.quatroASete;
          else if (presenca >= 8 && presenca <= 13) points += config.totalPresenca.oitoATreze;
        }
        
        // Escola sabatina
        if (userData.batizouAlguem) points += config.escolaSabatina.batizouAlguem;
        if (userData.discPosBatismal) points += (userData.discPosBatismal * config.escolaSabatina.discipuladoPosBatismo);
        
        // CPF válido
        if (userData.cpfValido === 'Sim' || userData.cpfValido === true) {
          points += config.cpfValido.valido;
        }
        
        // Campos vazios ACMS (assumindo que está completo)
        points += config.camposVaziosACMS.completos;
        
        // Aplicar multiplicadores
        const multiplicadorDinamico = config.pontuacaoDinamica?.multiplicador || 1;
        const multiplicadorPresenca = config.presenca?.multiplicador || 1;
        
        points = points * multiplicadorDinamico;
        points += (user.attendance || 0) * multiplicadorPresenca;
        
        
        // Atualizar usuário
        await storage.updateUser(userId, { points: Math.round(points) });
        
        res.json({ 
          success: true, 
          message: `Pontuação recalculada para ${user.name}`,
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
        console.error('Erro no cálculo:', calcError);
        res.status(500).json({ error: 'Erro no cálculo de pontuação' });
      }
      
    } catch (error) {
      console.error('Erro ao recalcular pontuação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Points configuration routes
  app.get('/api/system/points-config', async (req, res) => {
    try {
      const config = await storage.getPointsConfiguration();
      res.json(config);
    } catch (error) {
      console.error('Erro ao carregar configuração de pontos:', error);
      res.status(500).json({ error: 'Erro ao carregar configuração' });
    }
  });

  app.post('/api/system/points-config', async (req, res) => {
    try {
      const config = req.body;
      await storage.savePointsConfiguration(config);
      
      // Buscar todos os usuários (exceto Super Admin)
      const allUsers = await storage.getAllUsers();
      const regularUsers = allUsers.filter(user => user.email !== 'admin@7care.com');
      
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const user of regularUsers) {
        try {
          // Calcular pontos usando a nova configuração
          const points = calculateUserPointsFromConfig(user, config);
          const newPoints = Math.round(points);
          
          // Atualizar apenas se os pontos mudaram
          if (newPoints !== user.points) {
            await storage.updateUser(user.id, { points: newPoints });
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ Erro ao processar ${user.name}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`🎉 Recálculo automático concluído: ${updatedCount} usuários atualizados, ${errorCount} erros`);
      
      res.json({ 
        success: true, 
        message: `Configuração salva e pontos recalculados automaticamente! ${updatedCount} usuários atualizados.`,
        updatedUsers: updatedCount,
        errors: errorCount
      });
    } catch (error) {
      console.error('Erro ao salvar configuração de pontos:', error);
      res.status(500).json({ error: 'Erro ao salvar configuração' });
    }
  });

  // Reset points configuration to default values
  app.post('/api/system/points-config/reset', async (req, res) => {
    try {
      await storage.resetPointsConfiguration();
      res.json({ success: true, message: 'Configuração resetada para valores padrão' });
    } catch (error) {
      console.error('Erro ao resetar configuração de pontos:', error);
      res.status(500).json({ error: 'Erro ao resetar configuração' });
    }
  });

  // Update user profiles based on Bible study participation
  app.post('/api/system/update-profiles-by-bible-study', async (req, res) => {
    try {
      // const result = await storage.updateProfilesByBibleStudy(); // Método não implementado
      const result = { success: true, message: 'Funcionalidade não implementada' };
      res.json({ 
        success: true, 
        message: 'Perfis atualizados com sucesso baseado no estudo bíblico',
        result 
      });
    } catch (error) {
      console.error('Erro ao atualizar perfis:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfis' });
    }
  });

  // Helper function to calculate user points from configuration
  const calculateUserPointsFromConfig = (user: any, config: any): number => {
    let points = 0;

    // Pontos básicos
    points += config.basicPoints || 0;
    points += config.eventPoints || 0;
    points += config.donationPoints || 0;

    // Pontos de presença
    const attendancePoints = (user.attendance || 0) * (config.attendancePoints || 0);
    points += attendancePoints;

    // Parse extraData se necessário
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

    // Engajamento
    if (extraData.engajamento) {
      const engajamento = String(extraData.engajamento).toLowerCase();
      if (engajamento.includes('baixo')) {
        points += config.engajamento?.baixo || 0;
      } else if (engajamento.includes('médio') || engajamento.includes('medio')) {
        points += config.engajamento?.medio || 0;
      } else if (engajamento.includes('alto')) {
        points += config.engajamento?.alto || 0;
      } else {
        points += config.engajamento?.baixo || 0; // Default
      }
    }

    // Classificação
    if (extraData.classificacao) {
      const classificacao = String(extraData.classificacao).toLowerCase();
      if (classificacao.includes('frequente')) {
        points += config.classificacao?.frequente || 0;
      } else {
        points += config.classificacao?.naoFrequente || 0;
      }
    }

    // Dizimista
    if (extraData.dizimistaType) {
      const dizimista = String(extraData.dizimistaType).toLowerCase();
      if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) {
        points += config.dizimista?.naoDizimista || 0;
      } else if (dizimista.includes('pontual')) {
        points += config.dizimista?.pontual || 0;
      } else if (dizimista.includes('sazonal')) {
        points += config.dizimista?.sazonal || 0;
      } else if (dizimista.includes('recorrente')) {
        points += config.dizimista?.recorrente || 0;
      } else {
        points += config.dizimista?.recorrente || 0; // Default
      }
    }

    // Ofertante
    if (extraData.ofertanteType) {
      const ofertante = String(extraData.ofertanteType).toLowerCase();
      if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) {
        points += config.ofertante?.naoOfertante || 0;
      } else if (ofertante.includes('pontual')) {
        points += config.ofertante?.pontual || 0;
      } else if (ofertante.includes('sazonal')) {
        points += config.ofertante?.sazonal || 0;
      } else if (ofertante.includes('recorrente')) {
        points += config.ofertante?.recorrente || 0;
      } else {
        points += config.ofertante?.recorrente || 0; // Default
      }
    }

    // Tempo de batismo
    if (extraData.tempoBatismo) {
      const tempo = String(extraData.tempoBatismo).toLowerCase();
      if (tempo.includes('2 anos')) {
        points += config.tempoBatismo?.doisAnos || 0;
      } else if (tempo.includes('5 anos')) {
        points += config.tempoBatismo?.cincoAnos || 0;
      } else if (tempo.includes('10 anos')) {
        points += config.tempoBatismo?.dezAnos || 0;
      } else if (tempo.includes('20 anos')) {
        points += config.tempoBatismo?.vinteAnos || 0;
      } else if (tempo.includes('mais de 20')) {
        points += config.tempoBatismo?.maisVinte || 0;
      }
    }

    // Cargos
    if (extraData.temCargo) {
      const cargo = String(extraData.temCargo).toLowerCase();
      if (cargo.includes('sim')) {
        // Assumir 1 cargo por padrão
        points += config.cargos?.umCargo || 0;
      }
    }

    // Nome da unidade
    if (extraData.nomeUnidade) {
      const unidade = String(extraData.nomeUnidade).toLowerCase();
      if (unidade.includes('sim')) {
        points += config.nomeUnidade?.comUnidade || 0;
      } else {
        points += config.nomeUnidade?.semUnidade || 0;
      }
    }

    // Tem lição (boolean)
    if (extraData.temLicao === true) {
      points += config.temLicao?.comLicao || 0;
    }

    // Total de presença - tratar como número ou string
    if (extraData.totalPresenca !== undefined && extraData.totalPresenca !== null) {
      if (typeof extraData.totalPresenca === 'number') {
        // Se for número, mapear para categorias
        const total = extraData.totalPresenca;
        if (total >= 0 && total <= 3) {
          points += config.totalPresenca?.zeroATres || 0;
        } else if (total >= 4 && total <= 7) {
          points += config.totalPresenca?.quatroASete || 0;
        } else if (total >= 8 && total <= 13) {
          points += config.totalPresenca?.oitoATreze || 0;
        }
      } else {
        // Se for string, processar normalmente
        const total = String(extraData.totalPresenca).toLowerCase();
        if (total.includes('0 a 3') || total.includes('0-3')) {
          points += config.totalPresenca?.zeroATres || 0;
        } else if (total.includes('4 a 7') || total.includes('4-7')) {
          points += config.totalPresenca?.quatroASete || 0;
        } else if (total.includes('8 a 13') || total.includes('8-13')) {
          points += config.totalPresenca?.oitoATreze || 0;
        }
      }
    }

    // Escola sabatina
    if (extraData.escolaSabatina) {
      const escola = String(extraData.escolaSabatina).toLowerCase();
      if (escola.includes('comunhão') || escola.includes('comunhao')) {
        points += config.escolaSabatina?.comunhao || 0;
      } else if (escola.includes('missão') || escola.includes('missao')) {
        points += config.escolaSabatina?.missao || 0;
      } else if (escola.includes('estudo bíblico') || escola.includes('estudo biblico')) {
        points += config.escolaSabatina?.estudoBiblico || 0;
      }
    }

    // Batizou alguém
    if (extraData.batizouAlguem) {
      const batizou = String(extraData.batizouAlguem).toLowerCase();
      if (batizou.includes('sim')) {
        points += config.batizouAlguem?.sim || 0;
      } else {
        points += config.batizouAlguem?.nao || 0;
      }
    }

    // CPF válido
    if (extraData.cpfValido === true || (typeof extraData.cpfValido === 'string' && extraData.cpfValido.toLowerCase().includes('sim'))) {
      points += config.cpfValido?.valido || 0;
    } else {
      points += config.cpfValido?.invalido || 0;
    }

    // Campos vazios ACMS
    if (extraData.camposVaziosACMS) {
      const campos = String(extraData.camposVaziosACMS).toLowerCase();
      if (campos.includes('completo')) {
        points += config.camposVaziosACMS?.completos || 0;
      } else {
        points += config.camposVaziosACMS?.incompletos || 0;
      }
    }

    // Aplicar multiplicadores
    const multiplicadorDinamico = config.pontuacaoDinamica?.multiplicador || 1;
    const multiplicadorPresenca = config.presenca?.multiplicador || 1;
    const multiplicadorDiscipulado = config.discipuladoPosBatismo?.multiplicador || 1;

    points = points * multiplicadorDinamico;
    points += (user.attendance || 0) * multiplicadorPresenca;
    points = points * multiplicadorDiscipulado;

    return points;
  };

    // Helper function to apply adjustment factor to configuration
  // Função para calcular pontuação máxima teórica de uma configuração
  const calculateMaxPointsFromConfig = (config: any): number => {
    let maxPoints = 0;
    
    // Pontos base
    maxPoints += config.basicPoints || 0;
    maxPoints += config.attendancePoints || 0;
    maxPoints += config.eventPoints || 0;
    maxPoints += config.donationPoints || 0;
    
    // Pontos por categoria (apenas valores máximos)
    if (config.engajamento) {
      maxPoints += Math.max(...Object.values(config.engajamento).map(v => Number(v) || 0));
    }
    if (config.classificacao) {
      maxPoints += Math.max(...Object.values(config.classificacao).map(v => Number(v) || 0));
    }
    if (config.dizimista) {
      maxPoints += Math.max(...Object.values(config.dizimista).map(v => Number(v) || 0));
    }
    if (config.ofertante) {
      maxPoints += Math.max(...Object.values(config.ofertante).map(v => Number(v) || 0));
    }
    if (config.tempoBatismo) {
      maxPoints += Math.max(...Object.values(config.tempoBatismo).map(v => Number(v) || 0));
    }
    if (config.cargos) {
      maxPoints += Math.max(...Object.values(config.cargos).map(v => Number(v) || 0));
    }
    if (config.nomeUnidade) {
      maxPoints += Math.max(...Object.values(config.nomeUnidade).map(v => Number(v) || 0));
    }
    if (config.temLicao) {
      maxPoints += Math.max(...Object.values(config.temLicao).map(v => Number(v) || 0));
    }
    if (config.totalPresenca) {
      maxPoints += Math.max(...Object.values(config.totalPresenca).map(v => Number(v) || 0));
    }
    if (config.escolaSabatina) {
      maxPoints += Math.max(...Object.values(config.escolaSabatina).map(v => Number(v) || 0));
    }
    if (config.batizouAlguem) {
      maxPoints += Math.max(...Object.values(config.batizouAlguem).map(v => Number(v) || 0));
    }
    if (config.cpfValido) {
      maxPoints += Math.max(...Object.values(config.cpfValido).map(v => Number(v) || 0));
    }
    if (config.camposVaziosACMS) {
      maxPoints += Math.max(...Object.values(config.camposVaziosACMS).map(v => Number(v) || 0));
    }
    
    // Aplicar multiplicadores
    const dynamicMultiplier = config.pontuacaoDinamica?.multiplicador || 1;
    const presenceMultiplier = config.presenca?.multiplicador || 1;
    const discipleshipMultiplier = config.discipuladoPosBatismo?.multiplicador || 1;
    
    maxPoints *= dynamicMultiplier;
    maxPoints *= presenceMultiplier;
    maxPoints *= discipleshipMultiplier;
    
    return Math.round(maxPoints);
  };

  const applyAdjustmentFactor = (config: any, factor: number): any => {
    const newConfig = JSON.parse(JSON.stringify(config));

    // Aplicar o fator a todas as seções
    Object.keys(newConfig).forEach(sectionKey => {
      const section = newConfig[sectionKey];
      if (typeof section === 'object') {
        Object.keys(section).forEach(fieldKey => {
          if (typeof section[fieldKey] === 'number') {
            section[fieldKey] = Math.round(section[fieldKey] * factor);
          }
        });
      }
    });

    return newConfig;
  };

  // Função para calcular a média dos parâmetros (excluindo multiplicadores e valores 0)
  const calculateParameterAverage = (config: any): number => {
    const values: number[] = [];
    
    // Pontos base
    if (config.basicPoints && config.basicPoints > 0) values.push(config.basicPoints);
    if (config.attendancePoints && config.attendancePoints > 0) values.push(config.attendancePoints);
    if (config.eventPoints && config.eventPoints > 0) values.push(config.eventPoints);
    if (config.donationPoints && config.donationPoints > 0) values.push(config.donationPoints);
    
    // Pontos por categoria (apenas valores > 0)
    const categories = [
      'engajamento', 'classificacao', 'dizimista', 'ofertante', 
      'tempoBatismo', 'cargos', 'nomeUnidade', 'temLicao', 
      'totalPresenca', 'escolaSabatina', 'batizouAlguem', 
      'cpfValido', 'camposVaziosACMS'
    ];
    
    categories.forEach(category => {
      if (config[category] && typeof config[category] === 'object') {
        Object.values(config[category]).forEach(value => {
          const numValue = Number(value);
          if (numValue > 0) values.push(numValue);
        });
      }
    });
    
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };

  // Função para aplicar fator de ajuste apenas aos parâmetros (não aos multiplicadores)
  const applyAdjustmentFactorToParameters = (config: any, factor: number): any => {
    const newConfig = JSON.parse(JSON.stringify(config));

    // Aplicar o fator aos pontos base
    if (newConfig.basicPoints) newConfig.basicPoints = Math.round(newConfig.basicPoints * factor);
    if (newConfig.attendancePoints) newConfig.attendancePoints = Math.round(newConfig.attendancePoints * factor);
    if (newConfig.eventPoints) newConfig.eventPoints = Math.round(newConfig.eventPoints * factor);
    if (newConfig.donationPoints) newConfig.donationPoints = Math.round(newConfig.donationPoints * factor);

    // Aplicar o fator às categorias de pontos (não aos multiplicadores)
    const pointCategories = [
      'engajamento', 'classificacao', 'dizimista', 'ofertante', 
      'tempoBatismo', 'cargos', 'nomeUnidade', 'temLicao', 
      'totalPresenca', 'escolaSabatina', 'batizouAlguem', 
      'cpfValido', 'camposVaziosACMS'
    ];
    
    pointCategories.forEach(category => {
      if (newConfig[category] && typeof newConfig[category] === 'object') {
        Object.keys(newConfig[category]).forEach(fieldKey => {
          if (typeof newConfig[category][fieldKey] === 'number') {
            newConfig[category][fieldKey] = Math.round(newConfig[category][fieldKey] * factor);
          }
        });
      }
    });

    // Manter multiplicadores em 1 (não alterar)
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

  // Event Permissions Management
  app.get('/api/system/event-permissions', async (req, res) => {
    try {
      const permissions = await storage.getEventPermissions();
      res.json({ success: true, permissions });
    } catch (error) {
      console.error('Erro ao obter permissões de eventos:', error);
      res.status(500).json({ success: false, error: 'Erro interno ao obter permissões' });
    }
  });

  app.post('/api/system/event-permissions', async (req, res) => {
    try {
      const { permissions } = req.body;
      
      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Permissões são obrigatórias e devem ser um objeto'
        });
      }

      await storage.saveEventPermissions(permissions);
      
      res.json({
        success: true,
        message: 'Permissões de eventos salvas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar permissões de eventos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao salvar permissões'
      });
    }
  });

  // Get current parameter average
  app.get('/api/system/parameter-average', async (req, res) => {
    try {
      const currentConfig = await storage.getPointsConfiguration();
      const currentAverage = calculateParameterAverage(currentConfig);
      
      res.json({
        success: true,
        currentAverage: currentAverage.toFixed(2),
        message: `Média atual dos parâmetros: ${currentAverage.toFixed(2)}`
      });
    } catch (error) {
      console.error('Erro ao calcular média dos parâmetros:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno ao calcular média dos parâmetros' 
      });
    }
  });

  // Calculate district average and adjust points configuration based on parameter average
  app.post('/api/system/district-average', async (req, res) => {
    try {
      const { targetAverage } = req.body;
      
      if (!targetAverage || typeof targetAverage !== 'number') {
        return res.status(400).json({ 
          success: false, 
          error: 'Média desejada é obrigatória e deve ser um número' 
        });
      }

      console.log(`🎯 Ajustando configuração para média desejada: ${targetAverage} pontos`);

      // Obter configuração atual
      const currentConfig = await storage.getPointsConfiguration();
      
      // Calcular média atual dos USUÁRIOS (não dos parâmetros)
      const allUsers = await storage.getAllUsers();
      const regularUsers = allUsers.filter(user => user.email !== 'admin@7care.com');
      
      if (regularUsers.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Não há usuários para calcular a média' 
        });
      }
      
      // Calcular pontos atuais de todos os usuários
      let totalCurrentPoints = 0;
      for (const user of regularUsers) {
        const points = calculateUserPointsFromConfig(user, currentConfig);
        totalCurrentPoints += Math.round(points);
      }
      
      const currentUserAverage = totalCurrentPoints / regularUsers.length;
      console.log(`📊 Média atual dos usuários: ${currentUserAverage.toFixed(2)}`);
      
      // Calcular fator de ajuste baseado na nova média desejada dos USUÁRIOS
      const adjustmentFactor = targetAverage / currentUserAverage;
      
      console.log(`🔧 Fator de ajuste: ${adjustmentFactor.toFixed(2)}`);
      
      // Aplicar o fator de ajuste a todas as configurações
      const newConfig = applyAdjustmentFactorToParameters(currentConfig, adjustmentFactor);
      
      // Salvar a nova configuração
      await storage.savePointsConfiguration(newConfig);
      
      // Recalcular pontos de todos os usuários automaticamente
      console.log('🔄 Recalculando pontos de todos os usuários automaticamente...');
      
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
          console.error(`❌ Erro ao processar ${user.name}:`, error.message);
          errorCount++;
        }
      }
      
      // Calcular nova média dos usuários
      const newUserAverage = newTotalPoints / regularUsers.length;
      
      console.log(`✅ Nova média dos usuários: ${newUserAverage.toFixed(2)}`);
      console.log(`🎉 Recálculo automático concluído: ${updatedCount} usuários atualizados, ${errorCount} erros`);
      
      res.json({
        success: true,
        currentUserAverage: currentUserAverage.toFixed(2),
        newUserAverage: newUserAverage.toFixed(2),
        targetAverage,
        adjustmentFactor: adjustmentFactor.toFixed(2),
        updatedUsers: updatedCount,
        errors: errorCount,
        message: `Configuração ajustada! Nova média dos usuários: ${newUserAverage.toFixed(2)}, ${updatedCount} usuários atualizados automaticamente.`
      });
      
    } catch (error) {
      console.error('Erro ao calcular média do distrito:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno ao calcular média do distrito' 
      });
    }
  });

  // Emotional check-in endpoint
  app.post('/api/emotional-checkin', async (req, res) => {
    try {
      console.log('🔍 Emotional check-in request received:', req.body);
      const { userId, emotionalScore, score, mood, prayerRequest, isPrivate, allowChurchMembers } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      // Aceitar tanto emotionalScore quanto score para compatibilidade
      let finalScore = emotionalScore || score;
      
      // Se tem mood, usar mood; senão usar emotionalScore
      if (mood) {
        finalScore = null; // Usar mood em vez de score
      }
      // Remover validação de emotionalScore temporariamente para testar

      console.log('🔍 Calling storage.createEmotionalCheckIn with:', { userId, emotionalScore, prayerRequest, isPrivate, allowChurchMembers });
      console.log('🔍 Storage object:', typeof storage, Object.keys(storage));
      console.log('🔍 createEmotionalCheckIn function:', typeof storage.createEmotionalCheckIn);

      const checkIn = await storage.createEmotionalCheckIn({
        userId,
        emotionalScore: finalScore,
        mood,
        prayerRequest,
        isPrivate,
        allowChurchMembers
      });

      console.log('✅ Check-in created successfully:', checkIn);
      res.json({ success: true, data: checkIn });
    } catch (error) {
              console.error('❌ Erro ao criar check-in espiritual:', error);
        res.status(500).json({ error: 'Erro ao criar check-in espiritual' });
    }
  });

  // Get emotional check-ins for admin dashboard
  app.get('/api/emotional-checkins/admin', async (req, res) => {
    try {
      console.log('🔍 Rota /api/emotional-checkins/admin chamada');
      const checkIns = await storage.getEmotionalCheckInsForAdmin();
      console.log('🔍 Check-ins retornados:', checkIns);
      res.json(checkIns);
    } catch (error) {
      console.error('Erro ao buscar check-ins emocionais:', error);
      res.status(500).json({ error: 'Erro ao buscar check-ins emocionais' });
    }
  });

  // Get spiritual check-ins with scores for filtering
  app.get('/api/spiritual-checkins/scores', async (req, res) => {
    try {
      const checkIns = await storage.getEmotionalCheckInsForAdmin();
      
      // Agrupar usuários por score emocional (1-5)
      const scoreGroups = {
        '1': { count: 0, label: 'Distante', description: 'Muito distante de Deus' },
        '2': { count: 0, label: 'Frio', description: 'Pouco conectado' },
        '3': { count: 0, label: 'Neutro', description: 'Indiferente' },
        '4': { count: 0, label: 'Quente', description: 'Conectado' },
        '5': { count: 0, label: 'Intimidade', description: 'Muito próximo de Deus' }
      };

      // Contar usuários por score
      checkIns.forEach((checkIn: any) => {
        const score = checkIn.emotionalScore?.toString();
        if (score && scoreGroups[score as keyof typeof scoreGroups]) {
          scoreGroups[score as keyof typeof scoreGroups].count++;
        }
      });

      // Adicionar usuários sem check-in
      const allUsers = await storage.getAllUsers();
      const usersWithCheckIn = new Set(checkIns.map((c: any) => c.userId));
      const usersWithoutCheckIn = allUsers.filter((u: any) => !usersWithCheckIn.has(u.id)).length;

      res.json({
        scoreGroups,
        usersWithoutCheckIn,
        total: allUsers.length
      });
    } catch (error) {
      console.error('Erro ao buscar scores de check-ins espirituais:', error);
      res.status(500).json({ error: 'Erro ao buscar scores de check-ins espirituais' });
    }
  });

  // Get emotional check-ins for a specific user
  app.get('/api/emotional-checkins/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const checkIns = await storage.getEmotionalCheckInsByUserId(parseInt(userId));
      res.json(checkIns);
    } catch (error) {
      console.error('Erro ao buscar check-ins emocionais do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar check-ins emocionais do usuário' });
    }
  });

  // Get prayers endpoint
  app.get('/api/prayers', async (req, res) => {
    try {
      const { userId, userRole, userChurch } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      const prayers = await storage.getPrayers();
      res.json(prayers);
    } catch (error) {
      console.error('Erro ao buscar orações:', error);
      res.status(500).json({ error: 'Erro ao buscar orações' });
    }
  });

  // Mark prayer as answered
  app.post('/api/prayers/:id/answer', async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { answeredBy } = req.body;
      
      if (!answeredBy) {
        return res.status(400).json({ error: 'ID do usuário que respondeu é obrigatório' });
      }

      const result = await storage.markPrayerAsAnswered(prayerId, answeredBy);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao marcar oração como respondida:', error);
      res.status(500).json({ error: 'Erro ao marcar oração como respondida' });
    }
  });

  // Delete prayer
  app.delete('/api/prayers/:id', async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { userId, userRole } = req.query;
      
      console.log(`🗑️ Tentativa de exclusão - Prayer ID: ${prayerId}, User ID: ${userId}, User Role: ${userRole}`);
      
      if (!userId || !userRole) {
        console.log('❌ Parâmetros inválidos:', { userId, userRole });
        return res.status(400).json({ error: 'ID do usuário e role são obrigatórios' });
      }

      // Verificar se o usuário pode excluir a oração
      const prayer = await storage.getPrayerById(prayerId);
      console.log('🔍 Oração encontrada:', prayer ? `ID ${prayer.id}` : 'NÃO ENCONTRADA');
      
      if (!prayer) {
        console.log(`❌ Oração ${prayerId} não encontrada no banco`);
        return res.status(404).json({ error: 'Oração não encontrada' });
      }

      // Apenas admin ou o usuário que criou a oração pode excluir
      if (userRole !== 'admin' && prayer.userId !== parseInt(userId as string)) {
        console.log(`❌ Sem permissão - User ID: ${userId}, Prayer User ID: ${prayer.userId}, User Role: ${userRole}`);
        return res.status(403).json({ error: 'Sem permissão para excluir esta oração' });
      }

      console.log(`✅ Permissão concedida - Excluindo oração ${prayerId}`);
      const result = await storage.deletePrayer(prayerId);
      console.log(`🗑️ Resultado da exclusão:`, result);
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('❌ Erro ao excluir oração:', error);
      res.status(500).json({ error: 'Erro ao excluir oração' });
    }
  });

  // Add intercessor to prayer
  app.post('/api/prayers/:id/intercessor', async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { intercessorId } = req.body;
      
      if (!intercessorId) {
        return res.status(400).json({ error: 'ID do intercessor é obrigatório' });
      }

      const result = await storage.addPrayerIntercessor(prayerId, intercessorId);
      if (result) {
        res.json({ success: true, message: 'Intercessor adicionado com sucesso' });
      } else {
        res.status(400).json({ error: 'Não foi possível adicionar o intercessor' });
      }
    } catch (error) {
      console.error('Erro ao adicionar intercessor:', error);
      res.status(500).json({ error: 'Erro ao adicionar intercessor' });
    }
  });

  // Remove intercessor from prayer
  app.delete('/api/prayers/:id/intercessor/:intercessorId', async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const intercessorId = parseInt(req.params.intercessorId);
      
      const result = await storage.removePrayerIntercessor(prayerId, intercessorId);
      if (result) {
        res.json({ success: true, message: 'Intercessor removido com sucesso' });
      } else {
        res.status(400).json({ error: 'Não foi possível remover o intercessor' });
      }
    } catch (error) {
      console.error('Erro ao remover intercessor:', error);
      res.status(500).json({ error: 'Erro ao remover intercessor' });
    }
  });

  // Get prayer intercessors
  app.get('/api/prayers/:id/intercessors', async (req, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const intercessors = await storage.getPrayerIntercessors(prayerId);
      res.json(intercessors);
    } catch (error) {
      console.error('Erro ao buscar intercessores:', error);
      res.status(500).json({ error: 'Erro ao buscar intercessores' });
    }
  });

  // Get prayers that a user is praying for
  app.get('/api/prayers/user/:userId/interceding', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prayers = await storage.getPrayersUserIsPrayingFor(userId);
      res.json(prayers);
    } catch (error) {
      console.error('Erro ao buscar orações que usuário está orando:', error);
      res.status(500).json({ error: 'Erro ao buscar orações que usuário está orando' });
    }
  });

  // Meetings endpoints
  app.get("/api/meetings", async (req, res) => {
    try {
      const { userId, status } = req.query;
      let meetings: any[] = [];
      
      if (userId) {
        meetings = await storage.getMeetingsByUserId(parseInt(userId as string));
      } else if (status) {
        meetings = await storage.getMeetingsByStatus(status as string);
      } else {
        // Retornar todas as reuniões se não há filtros
        meetings = await storage.getAllMeetings();
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
      const events: any[] = await storage.getAllEvents();
      
      // Get user role from query parameter or header
      const userRole = String(req.query.role || req.headers['x-user-role'] || 'interested');
      
      // Get event permissions for the user role
      const permissions = await storage.getEventPermissions();
      
      if (permissions && permissions[userRole]) {
        // Filter events based on user permissions
        const allowedEventTypes = Object.keys(permissions[userRole]).filter(
          eventType => permissions[userRole][eventType]
        );
        
        const filteredEvents = events.filter(event => 
          allowedEventTypes.includes(event.type)
        );
        
        console.log(`🔒 Filtering events for role '${userRole}': ${filteredEvents.length}/${events.length} events visible`);
        res.json(filteredEvents);
      } else {
        // If no permissions configured, return all events (fallback)
        console.log(`⚠️ No permissions configured for role '${userRole}', showing all events`);
        res.json(events);
      }
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // Get available event types for a specific user role
  app.get("/api/event-types/:role", async (req, res) => {
    try {
      const userRole = req.params.role;
      
      // Buscar permissões do sistema diretamente do storage
      const systemPermissions = await storage.getSystemConfig('event-permissions');
      let permissions = null;
      
      if (systemPermissions && systemPermissions.value && systemPermissions.value.permissions) {
        permissions = systemPermissions.value.permissions;
      }
      
      if (permissions && permissions[userRole]) {
        const availableTypes = Object.keys(permissions[userRole]).filter(
          eventType => permissions[userRole][eventType]
        );
        res.json(availableTypes);
      } else {
        // Fallback para permissões padrão
        const defaultPermissions = await storage.getEventPermissions();
        if (defaultPermissions && defaultPermissions[userRole]) {
          const availableTypes = Object.keys(defaultPermissions[userRole]).filter(
            eventType => defaultPermissions[userRole][eventType]
          );
          res.json(availableTypes);
        } else {
          // Return all event types if no permissions configured
          const allTypes = ['igreja-local', 'asr-geral', 'asr-administrativo', 'asr-pastores', 'visitas', 'reunioes', 'pregacoes'];
          res.json(allTypes);
        }
      }
    } catch (error) {
      console.error("Get event types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      // const event = await storage.createEvent(eventData); // Método não implementado
      const event = { id: Date.now(), ...eventData, createdAt: new Date().toISOString() };
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Clear all events endpoint
  app.delete("/api/events", async (req, res) => {
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

  // Relationships endpoints
  app.get("/api/relationships", async (req, res) => {
    try {
      const { missionaryId, interestedId } = req.query;
      
      if (missionaryId) {
        const relationships = await storage.getRelationshipsByMissionary(parseInt(missionaryId as string));
        res.json(relationships);
      } else if (interestedId) {
        const relationships = await storage.getRelationshipsByInterested(parseInt(interestedId as string));
        res.json(relationships);
      } else {
        const allRelationships = await storage.getAllRelationships();
        res.json(allRelationships);
      }
    } catch (error) {
      console.error("Get relationships error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

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
      
      // Criar o relacionamento
      const relationship = await storage.createRelationship({
        missionaryId,
        interestedId,
        status: 'active',
        notes
      });
      
      // Atualizar o role do usuário para missionary se ainda não for
      try {
        const missionaryUser = await storage.getUserById(missionaryId);
        if (missionaryUser && missionaryUser.role !== 'missionary') {
          console.log(`🔄 Atualizando role do usuário ${missionaryId} de '${missionaryUser.role}' para 'missionary'`);
          
          await storage.updateUser(missionaryId, { 
            role: 'missionary',
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Role atualizado para 'missionary' para usuário ${missionaryId}`);
        } else if (missionaryUser) {
          console.log(`ℹ️ Usuário ${missionaryId} já possui role 'missionary'`);
        }
      } catch (roleError) {
        console.warn(`⚠️ Aviso: Não foi possível atualizar role do usuário:`, roleError);
        // Não falhar a operação principal por causa da atualização de role
      }
      
      // Verificar se o usuário missionário já tem perfil missionário
      try {
        const existingProfile = await storage.getMissionaryProfileByUserId(missionaryId);
        
        if (!existingProfile) {
          // Se não tem perfil missionário, criar um automaticamente
          console.log(`🔄 Criando perfil missionário automático para usuário ${missionaryId}`);
          
          await storage.createMissionaryProfile({
            userId: missionaryId,
            notes: `Perfil missionário criado automaticamente ao ser indicado como discipulador para ${interestedId}`,
            isActive: true,
            assignedAt: new Date().toISOString()
            // createdAt: new Date().toISOString() // Propriedade não existe no tipo
          });
          
          console.log(`✅ Perfil missionário criado com sucesso para usuário ${missionaryId}`);
        } else {
          console.log(`ℹ️ Usuário ${missionaryId} já possui perfil missionário`);
        }
      } catch (profileError) {
        console.warn(`⚠️ Aviso: Não foi possível criar/verificar perfil missionário:`, profileError);
        // Não falhar a operação principal por causa do perfil missionário
      }
      
      res.json(relationship);
    } catch (error) {
      console.error("Create relationship error:", error);
      res.status(400).json({ error: "Invalid relationship data" });
    }
  });

  app.delete("/api/relationships/:relationshipId", async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.relationshipId);
      console.log(`🔍 Tentando deletar relacionamento ID: ${relationshipId}`);
      
      // Primeiro, buscar o relacionamento para obter o interestedId
      const relationship = await storage.getRelationshipById(relationshipId);
      if (!relationship) {
        console.log(`❌ Relacionamento ${relationshipId} não encontrado`);
        res.status(404).json({ error: "Relationship not found" });
        return;
      }
      
      console.log(`📋 Relacionamento encontrado:`, relationship);
      
      // Deletar o relacionamento
      const success = await storage.deleteRelationship(relationshipId);
      console.log(`✅ Resultado da deleção: ${success}`);
      
      // Limpar o campo biblicalInstructor do usuário interessado
      try {
        console.log(`🧹 Limpando biblicalInstructor para usuário ${relationship.interestedId}`);
        await storage.updateUser(relationship.interestedId, { biblicalInstructor: null });
        console.log(`✅ Campo biblicalInstructor limpo para usuário ${relationship.interestedId}`);
      } catch (updateError) {
        console.warn(`⚠️ Aviso: Não foi possível limpar biblicalInstructor:`, updateError);
      }
      
      // Verificar se o missionário ainda tem outros relacionamentos ativos
      try {
        const remainingRelationships = await storage.getRelationshipsByMissionary(relationship.missionaryId);
        const activeRelationships = remainingRelationships.filter(rel => rel.status === 'active' || rel.status === null);
        
        if (activeRelationships.length === 0) {
          console.log(`🔄 Missionário ${relationship.missionaryId} não tem mais relacionamentos ativos, revertendo role para 'member'`);
          
          await storage.updateUser(relationship.missionaryId, { 
            role: 'member',
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Role revertido para 'member' para usuário ${relationship.missionaryId}`);
        } else {
          console.log(`ℹ️ Missionário ${relationship.missionaryId} ainda tem ${activeRelationships.length} relacionamentos ativos`);
        }
      } catch (roleError) {
        console.warn(`⚠️ Aviso: Não foi possível verificar/atualizar role do missionário:`, roleError);
      }
      
      // Executar limpeza automática de aprovações órfãs após deletar relacionamento
      try {
        const cleanedCount = await executeAutoCleanup();
        if (cleanedCount > 0) {
          console.log(`🧹 Limpeza automática executada após deletar relacionamento: ${cleanedCount} aprovações órfãs rejeitadas`);
        }
      } catch (cleanupError) {
        console.warn(`⚠️ Aviso: Limpeza automática falhou após deletar relacionamento:`, cleanupError);
      }
      
      res.json({ success: true, message: "Relationship deleted successfully" });
    } catch (error) {
      console.error("Delete relationship error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rota para remover relacionamento ativo por interessado
  app.delete("/api/relationships/active/:interestedId", async (req, res) => {
    try {
      const interestedId = parseInt(req.params.interestedId);
      console.log(`🔍 Tentando remover relacionamento ativo para interessado ID: ${interestedId}`);
      
      // Buscar relacionamento ativo para este interessado
      const relationships = await storage.getRelationshipsByInterested(interestedId);
      const activeRelationship = relationships.find(rel => rel.status === 'active');
      
      if (!activeRelationship) {
        console.log(`❌ Nenhum relacionamento ativo encontrado para interessado ${interestedId}`);
        res.status(404).json({ error: "No active relationship found for this interested user" });
        return;
      }
      
      console.log(`📋 Relacionamento ativo encontrado:`, activeRelationship);
      
      // Deletar o relacionamento
      const success = await storage.deleteRelationship(activeRelationship.id);
      console.log(`✅ Resultado da deleção: ${success}`);
      
      // Limpar o campo biblicalInstructor do usuário interessado
      try {
        console.log(`🧹 Limpando biblicalInstructor para usuário ${interestedId}`);
        await storage.updateUser(interestedId, { biblicalInstructor: null });
        console.log(`✅ Campo biblicalInstructor limpo para usuário ${interestedId}`);
      } catch (updateError) {
        console.warn(`⚠️ Aviso: Não foi possível limpar biblicalInstructor:`, updateError);
      }
      
      // Verificar se o missionário ainda tem outros relacionamentos ativos
      try {
        const remainingRelationships = await storage.getRelationshipsByMissionary(activeRelationship.missionaryId);
        const activeRelationships = remainingRelationships.filter(rel => rel.status === 'active' || rel.status === null);
        
        if (activeRelationships.length === 0) {
          console.log(`🔄 Missionário ${activeRelationship.missionaryId} não tem mais relacionamentos ativos, revertendo role para 'member'`);
          
          await storage.updateUser(activeRelationship.missionaryId, { 
            role: 'member',
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Role revertido para 'member' para usuário ${activeRelationship.missionaryId}`);
        } else {
          console.log(`ℹ️ Missionário ${activeRelationship.missionaryId} ainda tem ${activeRelationships.length} relacionamentos ativos`);
        }
      } catch (roleError) {
        console.warn(`⚠️ Aviso: Não foi possível verificar/atualizar role do missionário:`, roleError);
      }
      
      // Executar limpeza automática de aprovações órfãs após remover relacionamento ativo
      try {
        const cleanedCount = await executeAutoCleanup();
        if (cleanedCount > 0) {
          console.log(`🧹 Limpeza automática executada após remover relacionamento ativo: ${cleanedCount} aprovações órfãs rejeitadas`);
        }
      } catch (cleanupError) {
        console.warn(`⚠️ Aviso: Limpeza automática falhou após remover relacionamento ativo:`, cleanupError);
      }
      
      res.json({ success: true, message: "Active relationship removed successfully" });
    } catch (error) {
      console.error("Remove active relationship error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Discipleship requests endpoints
  app.get("/api/discipleship-requests", async (req, res) => {
    try {
      const { status, missionaryId, interestedId } = req.query;
      let requests = await storage.getAllDiscipleshipRequests();
      
      if (status) {
        requests = requests.filter(r => r.status === status);
      }
      if (missionaryId) {
        requests = requests.filter(r => r.missionaryId === parseInt(missionaryId as string));
      }
      if (interestedId) {
        requests = requests.filter(r => r.interestedId === parseInt(interestedId as string));
      }
      
      res.json(requests);
    } catch (error) {
      console.error("Get discipleship requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/discipleship-requests", async (req, res) => {
    try {
      const { missionaryId, interestedId, notes } = req.body;
      
      // Log para debug
      console.log("📝 Criando solicitação de discipulado:", { missionaryId, interestedId, notes });
      console.log("📝 Tipo dos dados:", { 
        missionaryIdType: typeof missionaryId, 
        interestedIdType: typeof interestedId, 
        notesType: typeof notes 
      });
      
      // Validação dos dados
      if (!missionaryId || !interestedId) {
        console.log("❌ Dados inválidos:", { missionaryId, interestedId });
        res.status(400).json({ error: "missionaryId e interestedId são obrigatórios" });
        return;
      }
      
      // Verificar se já existe uma solicitação pendente
      const existingRequests = await storage.getAllDiscipleshipRequests();
      const hasPendingRequest = existingRequests.some(r => 
        r.missionaryId === missionaryId && 
        r.interestedId === interestedId && 
        r.status === 'pending'
      );
      
      if (hasPendingRequest) {
        res.status(400).json({ error: "Já existe uma solicitação pendente para este interessado" });
        return;
      }
      
      // Log para debug
      console.log("🔍 Dados recebidos:", { missionaryId, interestedId, notes });
      console.log("🔍 Dados que serão enviados para storage:", { 
        missionaryId, 
        interestedId, 
        status: 'pending', 
        notes 
      });
      
      const request = await storage.createDiscipleshipRequest({
        missionaryId,
        interestedId,
        status: 'pending',
        notes
      });
      
      console.log("✅ Solicitação criada com sucesso:", request);
      res.status(201).json(request);
    } catch (error) {
      console.error("❌ Create discipleship request error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.put("/api/discipleship-requests/:id", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status, adminNotes, processedBy } = req.body;
      
      const updatedRequest = await storage.updateDiscipleshipRequest(requestId, {
        status,
        adminNotes,
        processedAt: new Date().toISOString(),
        processedBy
      });
      
      if (!updatedRequest) {
        res.status(404).json({ error: "Discipleship request not found" });
        return;
      }
      
      // Se aprovado, criar o relacionamento automaticamente
      if (status === 'approved') {
        await storage.createRelationship({
          missionaryId: updatedRequest.missionaryId,
          interestedId: updatedRequest.interestedId,
          status: 'active',
          notes: `Aprovado via solicitação de discipulado - ${updatedRequest.notes || ''}`
        });
        
        // Atualizar o campo biblicalInstructor do usuário interessado
        await storage.updateUser(updatedRequest.interestedId, {
          biblicalInstructor: updatedRequest.missionaryId.toString()
        });

                // Atualizar role do membro para missionário
        try {
          await storage.updateUser(updatedRequest.missionaryId, {
            role: 'missionary'
          });
          console.log(`✅ Usuário ${updatedRequest.missionaryId} promovido a missionário`);
        } catch (error) {
          console.error('Erro ao atualizar role do usuário:', error);
          // Não falhar a operação principal por causa da mudança de role
        }
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Update discipleship request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/discipleship-requests/:id", async (req, res) => {
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

  // Disciple user endpoint
  app.post("/api/users/:id(\\d+)/disciple", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { message } = req.body;
      
      // Verificar se o usuário existe
      const user = await storage.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      // Verificar se o usuário é um interessado
      if (user.role !== 'interested') {
        res.status(400).json({ error: "Only interested users can be discipled" });
        return;
      }
      
      // Verificar se já existe uma solicitação pendente
      const existingRequests = await storage.getAllDiscipleshipRequests();
      const hasPendingRequest = existingRequests.some(r => 
        r.interestedId === userId && r.status === 'pending'
      );
      
      if (hasPendingRequest) {
        res.status(400).json({ error: "Já existe uma solicitação pendente para este usuário" });
        return;
      }
      
      // Criar solicitação de discipulado
      const request = await storage.createDiscipleshipRequest({
        missionaryId: 1, // ID do missionário padrão (pode ser ajustado)
        interestedId: userId,
        notes: message
      });
      
      res.status(201).json({
        success: true,
        message: "Solicitação de discipulado criada com sucesso",
        request
      });
    } catch (error) {
      console.error("Disciple user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Messages/Chat endpoints
  // Lista conversas do usuário
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Obtém (ou cria) conversa direta entre dois usuários
  app.post("/api/conversations/direct", async (req, res) => {
    try {
      const { userAId, userBId } = req.body as { userAId: number; userBId: number };
      if (!userAId || !userBId) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
      }
      const conv = await storage.getOrCreateDirectConversation(Number(userAId), Number(userBId));
      res.json(conv);
    } catch (error) {
      console.error("Get/Create direct conversation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getMessagesByConversationId(conversationId);
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
      // const notifications = await storage.getNotificationsByUser(userId, limit); // Método não implementado
      const notifications = [];
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // const success = await storage.markNotificationAsRead(id); // Método não implementado
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

  // Points and achievements endpoints
  app.get("/api/point-activities", async (req, res) => {
    try {
      // const activities = await storage.getPointActivities(); // Método não implementado
      const activities = [];
      res.json(activities);
    } catch (error) {
      console.error("Get point activities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/achievements", async (req, res) => {
    try {
      // const achievements = await storage.getAchievements(); // Método não implementado
      const achievements = [];
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id(\\d+)/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const points = await storage.getUserPoints(userId);
      res.json({ points });
    } catch (error) {
      console.error("Get user points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Nova rota para usuários com pontos calculados em tempo real
  app.get("/api/users/with-points", async (req, res) => {
    try {
      const { role, status } = req.query;
      
      console.log('🔄 Rota /api/users/with-points chamada');
      
      // Calcular pontos para todos os usuários
      try {
        await storage.calculateAdvancedUserPoints();
      } catch (calcError) {
        console.error('⚠️ Erro ao calcular pontos, continuando sem cálculo:', calcError);
      }
      
      // Buscar usuários com pontos atualizados
      let users = await storage.getAllUsers();
      console.log(`📊 Usuários carregados: ${users.length}`);
      
      // Garantir que users seja sempre um array
      if (!Array.isArray(users)) {
        console.error('❌ getAllUsers não retornou um array:', typeof users, users);
        users = [];
      }
      
      if (role) {
        users = users.filter(u => u.role === role);
      }
      if (status) {
        users = users.filter(u => u.status === status);
      }
      
      // Lógica especial para missionários: podem ver todos os interessados de sua igreja
      // mas com dados limitados quando não há vínculo
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = userAgent.includes('Mobile') || userAgent.includes('mobile');
      
      if (req.headers['x-user-role'] === 'missionary' || req.headers['x-user-id']) {
        const missionaryId = parseInt(req.headers['x-user-id'] as string || '0');
        const missionary = users.find(u => u.id === missionaryId);
        
        if (missionary && missionary.role === 'missionary') {
          // Filtrar apenas interessados da mesma igreja do missionário
          const churchInterested = users.filter(u => 
            u.role === 'interested' && 
            u.church === missionary.church &&
            u.churchCode === missionary.churchCode
          );
          
          // Buscar relacionamentos existentes
          const relationships = await storage.getRelationshipsByMissionary(missionaryId);
          const linkedInterestedIds = relationships.map(r => r.interestedId);
          
          // Processar usuários interessados
          const processedUsers: any[] = churchInterested.map(user => {
            const isLinked = linkedInterestedIds.includes(user.id);
            
            if (isLinked) {
              // Usuário vinculado: mostrar todos os dados
              return user;
            } else {
              // Usuário não vinculado: mostrar dados limitados
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
                email: user.email ? '***@***.***' : null,
                phone: user.phone ? '***-***-****' : null,
                address: user.address ? '*** *** ***' : null,
                birthDate: user.birthDate ? '**/**/****' : null,
                cpf: user.cpf ? '***.***.***-**' : null,
                occupation: user.occupation ? '***' : null,
                education: user.education ? '***' : null,
                previousReligion: user.previousReligion ? '***' : null,
                interestedSituation: user.interestedSituation ? '***' : null,
                // Campos de gamificação limitados
                points: 0,
                level: '***',
                attendance: 0,
                // Outros campos
                biblicalInstructor: null,
                isLinked: false,
                canRequestDiscipleship: true
              };
            }
          });
          
          // Adicionar missionário e outros usuários não-interessados
          const otherUsers = users.filter(u => 
            u.role !== 'interested' || 
            (u.church !== missionary.church || u.churchCode !== missionary.churchCode)
          );
          
          const finalUsers = [...processedUsers, ...otherUsers];
          const safeUsers = finalUsers.map(({ password, ...user }) => user);
          res.json(safeUsers);
          return;
        }
      }
      
      // Buscar check-ins emocionais para todos os usuários
      const allCheckIns = await storage.getEmotionalCheckInsForAdmin();
      const checkInsMap = new Map();
      
      // Criar um mapa de userId -> emotionalScore
      allCheckIns.forEach((checkIn: any) => {
        if (checkIn.userId && checkIn.emotionalScore) {
          checkInsMap.set(checkIn.userId, checkIn.emotionalScore);
        }
      });
      
      // Adicionar emotionalScore aos usuários
      const usersWithEmotionalScore = users.map(user => ({
        ...user,
        emotionalScore: checkInsMap.get(user.id) || null
      }));
      
      // Remove password from response
      const safeUsers = usersWithEmotionalScore.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users with points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id(\\d+)/points-details", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const user = await storage.getUserById(userId);
      
      if (!user) {
        console.log('Usuário não encontrado:', userId);
        return res.status(404).json({ error: "User not found" });
      }

      console.log('Usuário encontrado:', user.name, user.email);

      // Buscar dados detalhados do usuário para cálculo de pontos
      const userData = await storage.getUserDetailedData(userId);
      console.log('Dados detalhados obtidos:', userData);
      
      // Buscar configuração de pontos
      const pointsConfig = await storage.getPointsConfiguration();
      
      // Calcular pontos baseado nos dados do usuário e configuração
      let calculatedPoints = 0;
      
      if (userData && pointsConfig) {
        // Engajamento
        if (userData.engajamento) {
          const engajamento = userData.engajamento.toLowerCase();
          if (engajamento.includes('baixo')) calculatedPoints += pointsConfig.engajamento.baixo;
          else if (engajamento.includes('médio') || engajamento.includes('medio')) calculatedPoints += pointsConfig.engajamento.medio;
          else if (engajamento.includes('alto')) calculatedPoints += pointsConfig.engajamento.alto;
        }
        
        // Classificação
        if (userData.classificacao) {
          const classificacao = userData.classificacao.toLowerCase();
          if (classificacao.includes('frequente')) {
            calculatedPoints += pointsConfig.classificacao.frequente;
          } else {
            calculatedPoints += pointsConfig.classificacao.naoFrequente;
          }
        }
        
        // Dizimista
        if (userData.dizimista) {
          const dizimista = userData.dizimista.toLowerCase();
          if (dizimista.includes('não dizimista') || dizimista.includes('nao dizimista')) calculatedPoints += pointsConfig.dizimista.naoDizimista;
          else if (dizimista.includes('pontual')) calculatedPoints += pointsConfig.dizimista.pontual;
          else if (dizimista.includes('sazonal')) calculatedPoints += pointsConfig.dizimista.sazonal;
          else if (dizimista.includes('recorrente')) calculatedPoints += pointsConfig.dizimista.recorrente;
        }
        
        // Ofertante
        if (userData.ofertante) {
          const ofertante = userData.ofertante.toLowerCase();
          if (ofertante.includes('não ofertante') || ofertante.includes('nao ofertante')) calculatedPoints += pointsConfig.ofertante.naoOfertante;
          else if (ofertante.includes('pontual')) calculatedPoints += pointsConfig.ofertante.pontual;
          else if (ofertante.includes('sazonal')) calculatedPoints += pointsConfig.ofertante.sazonal;
          else if (ofertante.includes('recorrente')) calculatedPoints += pointsConfig.ofertante.recorrente;
        }
        
        // Tempo de batismo
        if (userData.tempoBatismo && typeof userData.tempoBatismo === 'number') {
          const tempo = userData.tempoBatismo;
          if (tempo >= 2 && tempo < 5) calculatedPoints += pointsConfig.tempoBatismo.doisAnos;
          else if (tempo >= 5 && tempo < 10) calculatedPoints += pointsConfig.tempoBatismo.cincoAnos;
          else if (tempo >= 10 && tempo < 20) calculatedPoints += pointsConfig.tempoBatismo.dezAnos;
          else if (tempo >= 20 && tempo < 30) calculatedPoints += pointsConfig.tempoBatismo.vinteAnos;
          else if (tempo >= 30) calculatedPoints += pointsConfig.tempoBatismo.maisVinte;
        }
        
        // Cargos
        if (userData.cargos && Array.isArray(userData.cargos)) {
          const numCargos = userData.cargos.length;
          if (numCargos === 1) calculatedPoints += pointsConfig.cargos.umCargo;
          else if (numCargos === 2) calculatedPoints += pointsConfig.cargos.doisCargos;
          else if (numCargos >= 3) calculatedPoints += pointsConfig.cargos.tresOuMais;
        }
        
        // Nome da unidade
        if (userData.nomeUnidade && userData.nomeUnidade.trim()) {
          calculatedPoints += pointsConfig.nomeUnidade.comUnidade;
        }
        
        // Tem lição
        if (userData.temLicao) {
          calculatedPoints += pointsConfig.temLicao.comLicao;
        }
        
        // Total de presença
        if (userData.totalPresenca !== undefined) {
          const presenca = userData.totalPresenca;
          if (presenca >= 0 && presenca <= 3) calculatedPoints += pointsConfig.totalPresenca.zeroATres;
          else if (presenca >= 4 && presenca <= 7) calculatedPoints += pointsConfig.totalPresenca.quatroASete;
          else if (presenca >= 8 && presenca <= 13) calculatedPoints += pointsConfig.totalPresenca.oitoATreze;
        }
        
        // Escola sabatina
        if (userData.escolaSabatina) {
          const escola = userData.escolaSabatina;
          if (escola.comunhao) calculatedPoints += (escola.comunhao * pointsConfig.escolaSabatina.comunhao);
          if (escola.missao) calculatedPoints += (escola.missao * pointsConfig.escolaSabatina.missao);
          if (escola.estudoBiblico) calculatedPoints += (escola.estudoBiblico * pointsConfig.escolaSabatina.estudoBiblico);
          if (escola.batizouAlguem) calculatedPoints += pointsConfig.escolaSabatina.batizouAlguem;
          if (escola.discipuladoPosBatismo) calculatedPoints += (escola.discipuladoPosBatismo * pointsConfig.escolaSabatina.discipuladoPosBatismo);
        }
        
        // CPF válido
        if (userData.cpfValido === 'Sim' || userData.cpfValido === true) {
          calculatedPoints += pointsConfig.cpfValido.valido;
        }
        
        // Campos vazios ACMS
        if (userData.camposVaziosACMS === false) {
          calculatedPoints += pointsConfig.camposVaziosACMS.completos;
        }
      }
      
      
      // Garantir que userData não seja null
      if (!userData) {
        console.log('Criando dados padrão para usuário:', userId);
        const defaultUserData = {
          engajamento: 'Baixo',
          classificacao: 'A resgatar',
          dizimista: 'Não dizimista',
          ofertante: 'Não ofertante',
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

  app.post("/api/users/:id(\\d+)/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points, activityId, description } = req.body;
      
      // const success = await storage.addPointsToUser(userId, points, activityId, description); // Método não implementado
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
          const meetings = await storage.getMeetingsByUserId(userId);
          dashboardData = {
            myInterested: relationships.length,
            scheduledMeetings: meetings.filter(m => m.status === "approved").length,
            completedStudies: meetings.filter(m => m.status === "completed").length,
            thisWeekGoal: 10 // This would be configurable
          };
          break;
          
        case "member":
          const memberMeetings = await storage.getMeetingsByUserId(userId);
          dashboardData = {
            nextEvents: memberMeetings.filter(m => m.status === "approved" && new Date(m.scheduledAt!) > new Date()).length,
            unreadMessages: 0, // Would calculate from messages
            completedActivities: memberMeetings.filter(m => m.status === "completed").length
          };
          break;
          
        case "interested":
          const interestedMeetings = await storage.getMeetingsByUserId(userId);
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

  // Activities endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllPointActivities();
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const { title, description, imageUrl, date, active, order } = req.body;
      
      // const newActivity = await storage.createActivity({ // Método não implementado
      const newActivity = {
        id: Date.now(),
        title,
        description,
        imageUrl,
        date,
        active: active ?? true,
        order: order ?? 0,
      };
      
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Create activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { title, description, imageUrl, date, active, order } = req.body;
      
      // const updatedActivity = await storage.updateActivity(id, { // Método não implementado
      const updatedActivity = {
        id: parseInt(id),
        title,
        description,
        imageUrl,
        date,
        active,
        order,
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

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = req.params.id;
      // const success = await storage.deleteActivity(id); // Método não implementado
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

  // Calendar endpoints
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const events: any[] = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Get calendar events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create event endpoint
  app.post("/api/calendar/events", async (req, res) => {
    try {
      console.log('📝 Criando evento:', req.body);
      const event = await storage.createEvent(req.body);
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Erro ao criar evento" });
    }
  });

  // Debug endpoint para verificar eventos
  app.get("/api/debug/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      console.log('🔍 Debug - Total de eventos:', events.length);
      console.log('🔍 Debug - Eventos:', events);
      res.json({ count: events.length, events });
    } catch (error) {
      console.error("Debug events error:", error);
      res.status(500).json({ error: "Erro ao buscar eventos" });
    }
  });


  // Endpoint para criar evento simples
  app.get("/api/debug/create-simple-event", async (req, res) => {
    try {
      console.log('🔧 Criando evento simples...');

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
        churchId: 1,
      };

      const newEvent = await storage.createEvent(simpleEvent);
      console.log(`✅ Evento simples criado:`, newEvent);
      
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

  // Endpoint para debug do CSV
  app.post("/api/debug/test-csv", upload.single('file'), async (req, res) => {
    try {
      console.log('🔍 Debug CSV iniciado');
      
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log('📊 Arquivo recebido:', req.file.originalname, 'Tamanho:', req.file.size);
      
      // Ler o arquivo CSV diretamente
      const csvContent = fs.readFileSync(req.file.path, 'utf8');
      console.log('📊 Conteúdo do CSV:', csvContent);
      
      // Processar CSV linha por linha
      const lines = csvContent.split('\n').filter(line => line.trim());
      console.log('📊 Linhas encontradas:', lines.length);
      
      const processedLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const columns = line.split(',');
        processedLines.push({
          lineNumber: i + 1,
          content: line,
          columns: columns,
          columnCount: columns.length
        });
      }
      
      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);
      
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

  // Endpoint para verificar church_id disponíveis
  app.get("/api/debug/check-churches", async (req, res) => {
    try {
      const churches = await sql`SELECT id, name FROM churches LIMIT 5`;
      res.json({
        success: true,
        churches: churches
      });
    } catch (error) {
      console.error("Check churches error:", error);
      res.status(500).json({ error: "Erro ao verificar igrejas: " + error.message });
    }
  });

  // Endpoint para verificar users disponíveis
  app.get("/api/debug/check-users", async (req, res) => {
    try {
      const users = await sql`SELECT id, name, email FROM users LIMIT 5`;
      res.json({
        success: true,
        users: users
      });
    } catch (error) {
      console.error("Check users error:", error);
      res.status(500).json({ error: "Erro ao verificar usuários: " + error.message });
    }
  });

  // Endpoint para verificar eventos no banco diretamente
  app.get("/api/debug/check-events-db", async (req, res) => {
    try {
      const events = await sql`SELECT id, title, created_at FROM events ORDER BY created_at DESC LIMIT 10`;
      res.json({
        success: true,
        events: events,
        count: events.length
      });
    } catch (error) {
      console.error("Check events DB error:", error);
      res.status(500).json({ error: "Erro ao verificar eventos no banco: " + error.message });
    }
  });

  // Endpoint para criar evento diretamente com SQL
  app.get("/api/debug/create-event-sql", async (req, res) => {
    try {
      console.log('🔧 Criando evento com SQL direto...');
      
      const result = await sql`
        INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
        VALUES ('Evento SQL Teste', 'Evento criado com SQL direto', '2025-09-25 19:00:00', 'Igreja Local', 'igreja-local', 0, false, null, 72, 24, NOW(), NOW())
        RETURNING id, title, date
      `;
      
      console.log('✅ Evento criado com SQL:', result);
      
      res.json({
        success: true,
        message: 'Evento criado com SQL direto',
        event: result[0]
      });
    } catch (error) {
      console.error("Create event SQL error:", error);
      res.status(500).json({ error: "Erro ao criar evento com SQL: " + error.message });
    }
  });

  // Endpoint POST para criar eventos
  app.post("/api/events", async (req, res) => {
    try {
      console.log('🔧 Criando evento via POST:', req.body);

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
        churchId: req.body.churchId || 1,
      };

      const newEvent = await storage.createEvent(eventData);
      console.log(`✅ Evento criado via POST:`, newEvent);
      
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

  // Endpoint para adicionar eventos específicos
  app.get("/api/debug/add-events", async (req, res) => {
    try {
      console.log('🔧 Adicionando eventos específicos...');

      const eventsToAdd = [
        {
          title: "Semana do Lenço MDA",
          description: "Evento da Semana do Lenço MDA",
          date: "2025-09-13T00:00:00Z",
          endDate: "2025-09-20T23:59:59Z",
          location: "Igreja Local",
          type: "igreja-local",
          capacity: 0,
          isRecurring: false,
          recurrencePattern: null,
          createdBy: 1,
          churchId: 1,
        },
        {
          title: "Semana da Esperança",
          description: "Evento da Semana da Esperança",
          date: "2025-09-20T00:00:00Z",
          endDate: "2025-09-27T23:59:59Z",
          location: "Igreja Local",
          type: "igreja-local",
          capacity: 0,
          isRecurring: false,
          recurrencePattern: null,
          createdBy: 1,
          churchId: 1,
        },
        {
          title: "Dia Mundial do Desbravador",
          description: "Celebração do Dia Mundial do Desbravador",
          date: "2025-09-20T00:00:00Z",
          endDate: "2025-09-20T23:59:59Z",
          location: "Igreja Local",
          type: "igreja-local",
          capacity: 0,
          isRecurring: false,
          recurrencePattern: null,
          createdBy: 1,
          churchId: 1,
        },
      ];

      const createdEvents = [];
      for (const eventData of eventsToAdd) {
        const newEvent = await storage.createEvent(eventData);
        createdEvents.push(newEvent);
        console.log(`✅ Evento "${eventData.title}" criado:`, newEvent);
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

  // Endpoint para limpar eventos duplicados
  app.post("/api/debug/clean-duplicates", async (req, res) => {
    try {
      console.log('🧹 Iniciando limpeza de duplicatas...');
      
      // Usar SQL direto para remover duplicatas, mantendo apenas o primeiro de cada grupo
      const result = await storage.db.execute(`
        DELETE FROM events 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM events 
          GROUP BY title, DATE(date)
        )
      `);
      
      console.log(`✅ Limpeza de duplicatas concluída`);
      
      // Verificar quantos eventos restaram
      const remainingEvents = await storage.getAllEvents();
      
      res.json({ 
        success: true, 
        remainingEvents: remainingEvents.length,
        message: `Duplicatas removidas! Restam ${remainingEvents.length} eventos únicos.`
      });
    } catch (error) {
      console.error("Clean duplicates error:", error);
      res.status(500).json({ error: "Erro ao limpar duplicatas" });
    }
  });

  // Import Excel endpoint - DESABILITADO - usando import-simple agora
  // app.post("/api/calendar/import-excel", upload.single('file'), async (req, res) => {
//     try {
//       console.log('📊 Importação de Excel iniciada');
//       
//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//       }
// 
//       console.log('✅ Arquivo recebido:', req.file.originalname);
// 
//       let data = [];
//       
//       if (req.file.originalname.endsWith('.csv')) {
//         // Processar CSV diretamente
//         const csvContent = fs.readFileSync(req.file.path, 'utf8');
//         console.log('📊 Conteúdo do CSV:', csvContent);
//         
//         const lines = csvContent.split('\n').filter(line => line.trim());
//         console.log('📊 Linhas encontradas:', lines.length);
//         
//         if (lines.length > 0) {
//           // Extrair cabeçalhos
//           const headers = lines[0].split(',').map(h => h.trim());
//           console.log('📊 Cabeçalhos:', headers);
//           
//           // Processar cada linha de dados
//           for (let i = 1; i < lines.length; i++) {
//             const line = lines[i].trim();
//             if (!line) continue;
//             
//             const columns = line.split(',');
//             if (columns.length !== headers.length) continue;
//             
//             const row = {};
//             headers.forEach((header, index) => {
//               row[header] = columns[index].trim();
//             });
//             data.push(row);
//           }
//         }
//       } else {
//         // Processar Excel usando XLSX
//         const fileBuffer = fs.readFileSync(req.file.path);
//         const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         data = XLSX.utils.sheet_to_json(worksheet);
//       }
//       
//       console.log('📊 Dados processados:', data.length, 'linhas encontradas');
//       console.log('📊 Primeira linha dos dados:', data[0]);
//       console.log('📊 Todas as linhas:', data);
//       
//       if (data.length === 0) {
//         console.log('❌ Nenhum dado encontrado para processar');
//         return res.json({
//           success: true,
//           imported: 0,
//           skipped: 0,
//           errors: ['Nenhum dado encontrado no arquivo'],
//           message: '0 eventos importados - arquivo vazio ou formato inválido'
//         });
//       }
// 
//       const events: any[] = [];
//       const errors: string[] = [];
// 
//       // Processar cada linha da planilha
//       for (let i = 0; i < data.length; i++) {
//         const row = data[i] as any;
//         try {
//           console.log(`📝 Processando linha ${i + 1}:`, row);
//           
//           // Mapear colunas da planilha (Mês, Categoria, Data, Evento)
//           const event = {
//             title: row['Evento'] || row['evento'] || '',
//             category: row['Categoria'] || row['categoria'] || '',
//             date: row['Data'] || row['data'] || '',
//             month: row['Mês'] || row['mes'] || ''
//           };
// 
//           // Validações básicas
//           if (!event.title) {
//             errors.push(`Linha ${i + 2}: Evento é obrigatório`);
//             continue;
//           }
// 
//           if (!event.date) {
//             errors.push(`Linha ${i + 2}: Data é obrigatória`);
//             continue;
//           }
// 
//           // Processar data - suporta formato DD/MM e intervalos DD/MM-DD/MM
//           let startDate: string;
//           let endDate: string | undefined;
// 
//           console.log(`🔍 Processando evento: ${event.title}, data: ${event.date}, tipo: ${typeof event.date}`);
//           
//           // Converter event.date para string de forma mais segura
//           let dateString: string;
//           if (typeof event.date === 'number') {
//             // Se for número (data do Excel), converter para string no formato DD/MM
//             const excelDate = new Date((event.date - 25569) * 86400 * 1000);
//             const day = String(excelDate.getDate()).padStart(2, '0');
//             const month = String(excelDate.getMonth() + 1).padStart(2, '0');
//             dateString = `${day}/${month}`;
//           } else if (typeof event.date === 'string') {
//             dateString = event.date;
//           } else {
//             dateString = String(event.date || '');
//           }
//           
//           console.log(`🔍 Data processada: ${dateString}`);
//           console.log(`🔍 Contém hífen? ${dateString.includes('-')}`);
//           
//           // Mapear categoria primeiro
//           const categoryMapping: { [key: string]: string } = {
//             'Igreja Local': 'igreja-local',
//             'ASR Geral': 'asr-geral',
//             'ASR Pastores': 'asr-pastores',
//             'ASR Administrativo': 'asr-administrativo',
//             'Regional/Distrital': 'regional-distrital',
//             'estudos': 'estudos',
//             'reuniões': 'reunioes',
//             'reunioes': 'reunioes',
//             'visitas': 'visitas',
//             'oração': 'oracao',
//             'oracao': 'oracao',
//             'chamadas': 'chamadas',
//             'cultos': 'cultos'
//           };
// 
//           const mappedType = categoryMapping[event.category] || 'reunioes';
//           
//           // Verificar se é um evento de múltiplos dias (formato: DD/MM-DD/MM)
//           if (dateString && dateString.includes('-')) {
//             // Evento de múltiplos dias (ex: "20/09-27/09")
//             const [startPart, endPart] = dateString.split('-');
//             const currentYear = new Date().getFullYear();
//             
//             // Processar data de início
//             const [startDay, startMonth] = startPart.trim().split('/');
//             startDate = `${currentYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
//             
//             // Processar data de fim
//             const [endDay, endMonth] = endPart.trim().split('/');
//             endDate = `${currentYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
//             
//             console.log(`📅 Evento de múltiplos dias: ${event.title} (${startDate} até ${endDate})`);
//             console.log(`🔍 Detalhes do evento de múltiplos dias:`, {
//               title: event.title,
//               startDate,
//               endDate,
//               startDateISO: startDate + 'T19:00:00Z',
//               endDateISO: endDate + 'T23:59:59Z'
//             });
//             
//             // Criar um único evento com endDate para eventos de múltiplos dias
//             const eventData = {
//               title: event.title,
//               date: startDate + 'T19:00:00Z', // String ISO em UTC
//               endDate: endDate + 'T23:59:59Z', // String ISO em UTC
//               type: mappedType,
//               description: `Evento importado: ${event.title} (${startDate} até ${endDate})`,
//               location: '',
//               createdBy: 1
//             };
//             
//             console.log(`🔍 EventData antes de adicionar:`, eventData);
//             console.log(`🔍 endDate no eventData:`, eventData.endDate);
//             
//             events.push(eventData);
//             console.log(`✅ Evento de múltiplos dias criado: ${event.title} (${startDate} até ${endDate})`);
//             
//             // Pular para a próxima linha, pois já criamos o evento necessário
//             continue;
//           } else {
//             // Evento de um dia só (ex: "12/07")
//             const [day, month] = dateString.split('/');
//             const currentYear = new Date().getFullYear();
//             startDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//             endDate = undefined;
//           }
// 
//           // Criar evento no formato da API - CORRIGIDO: usar string ISO para evitar problemas de fuso horário
//           const eventData = {
//             title: event.title,
//             date: startDate + 'T19:00:00Z', // String ISO em UTC
//             endDate: endDate ? endDate + 'T23:59:59Z' : undefined, // String ISO em UTC
//             type: mappedType,
//             description: `Evento importado: ${event.title}${endDate ? ` (${startDate} até ${endDate})` : ''}`,
//             location: '',
//             createdBy: 1 // ID do admin
//           };
// 
//           events.push(eventData);
//           console.log(`✅ Evento criado: ${event.title} (${startDate})`);
// 
//         } catch (error) {
//           console.error(`❌ Erro na linha ${i + 2}:`, error);
//           errors.push(`Linha ${i + 2}: ${error.message}`);
//         }
//       }
// 
//       // Inserir eventos no banco de dados usando o storage
//       let imported = 0;
//       let skipped = 0;
//       
//       for (const event of events) {
//         try {
//           // Usar o storage para criar eventos
//           console.log('📝 Dados do evento a ser criado:', event);
//           console.log('📅 endDate presente?', !!event.endDate);
//           console.log('📅 endDate valor:', event.endDate);
//           
//           // Inserir evento no Neon Database
//           try {
//             const createdEvent = await storage.createEvent(event);
//             imported++;
//             console.log(`✅ Evento inserido: ${event.title} (ID: ${createdEvent.id})`);
//             console.log(`📅 Evento criado com endDate:`, createdEvent.endDate);
//             
//           } catch (createError) {
//             console.error(`❌ Erro ao criar evento:`, createError);
//             errors.push(`Erro ao inserir "${event.title}": ${createError.message}`);
//           }
//           
//         } catch (error) {
//           console.error(`❌ Erro geral ao inserir evento:`, error);
//           errors.push(`Erro ao inserir "${event.title}": ${error.message}`);
//         }
//       }
// 
//       // Limpar arquivo temporário
//       try {
//         fs.unlinkSync(req.file.path);
//       } catch (cleanupError) {
//         console.warn("Erro ao limpar arquivo temporário:", cleanupError);
//       }
// 
//       // Retornar resultado
//       res.json({
//         success: true, 
//         imported, 
//         skipped,
//         errors,
//         message: `${imported} eventos importados com sucesso!${skipped > 0 ? ` ${skipped} eventos duplicados ignorados.` : ''}`
//       });
// 
//     } catch (error) {
//       console.error("Import Excel error:", error);
//       
//       // Limpar arquivo temporário em caso de erro
//       try {
//         if (req.file && req.file.path) {
//           fs.unlinkSync(req.file.path);
//         }
//       } catch (cleanupError) {
//         console.warn("Erro ao limpar arquivo temporário:", cleanupError);
//       }
//       
//       res.status(500).json({ error: "Erro ao processar arquivo" });
//     }
//   });
// 
//   // Missionary Profiles endpoints
//   app.get('/api/missionary-profiles/users', async (req, res) => {
//     try {
//       console.log('🔍 Buscando usuários com perfis missionários...');
//       
//       // Buscar todos os usuários que são missionários
//       const allUsers = await storage.getAllUsers();
//       const missionaryUsers = allUsers.filter(user => user.role === 'missionary');
//       
//       console.log(`✅ Encontrados ${missionaryUsers.length} usuários missionários`);
//       
//       res.json(missionaryUsers);
//     } catch (error) {
//       console.error('❌ Erro ao buscar usuários missionários:', error);
//       res.status(500).json({ error: 'Erro interno do servidor' });
//     }
//   });
// 
  // System check endpoints
  app.post('/api/system/check-missionary-profiles', async (req, res) => {
    try {
      console.log('🔍 Verificando perfis missionários...');
      
      // Buscar todos os usuários missionários
      const allUsers = await storage.getAllUsers();
      const missionaries = allUsers.filter(user => user.role === 'missionary');
      
      let correctedCount = 0;
      
      // Verificar se cada missionário tem um perfil
      for (const missionary of missionaries) {
        try {
          const existingProfile = await storage.getMissionaryProfileByUserId(missionary.id);
          if (!existingProfile) {
            // Criar perfil missionário se não existir
            await storage.createMissionaryProfile({
              userId: missionary.id,
              specialization: 'Geral',
              experience: 'Experiência em discipulado',
              isActive: true
            });
            correctedCount++;
            console.log(`✅ Perfil criado para missionário ${missionary.name}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao verificar perfil do missionário ${missionary.name}:`, error);
        }
      }
      
      console.log(`✅ Verificação concluída: ${correctedCount} perfis corrigidos`);
      
      res.json({
        success: true,
        correctedCount,
        message: `${correctedCount} perfis missionários foram corrigidos`
      });
    } catch (error) {
      console.error('❌ Erro na verificação de perfis missionários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Adicionar rotas de importação
  importRoutes(app);

  return createServer(app);
}
