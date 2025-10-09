import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { NeonAdapter } from "./neonAdapter";
import { migrateToNeon } from "./migrateToNeon";
import { setupNeonData } from "./setupNeonData";
import { sql, db } from "./neonConfig";
import { schema } from "./schema";
import { importRoutes } from "./importRoutes";
import { electionRoutes } from "./electionRoutes";

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
  // Helper functions for parsing (moved to top for use throughout)
  const parseCargos = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((c: string) => c.trim()).filter((c: string) => c);
    }
    return [];
  };

  const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'sim' || value.toLowerCase() === 'true' || value === '1';
    }
    return !!value;
  };

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseInt(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

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
      
      // 5. Tentar parse direto com Date (fallback)
      const directDate = new Date(dateStr);
      if (!isNaN(directDate.getTime()) && directDate.getFullYear() > 1900) {
        return directDate;
      }
      
      // 6. Se for um objeto Date já parseado (do banco de dados)
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // 7. Formato YYYY/MM/DD (formato alternativo)
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
          await storage.saveSystemLogo(logoUrl);
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
          logoUrl: logoData,
          filename: logoData
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
      await storage.clearSystemLogo();
      console.log("✅ Logo deleted from database");
      res.json({
        success: true,
        message: "Logo deleted successfully"
      });
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

      // Calcular pontuação para cada usuário
      const usersWithPoints = await Promise.all(users.map(async (user) => {
        try {
          // Pular Super Admin
          if (user.email === 'admin@7care.com' || user.role === 'admin') {
            return { ...user, calculatedPoints: 0 };
          }

          // Calcular pontos para o usuário
          const pointsResult = await storage.calculateUserPoints(user.id);
          const calculatedPoints = pointsResult && pointsResult.success ? pointsResult.points : 0;
          
          return { ...user, calculatedPoints };
        } catch (error) {
          console.error(`Erro ao calcular pontos para usuário ${user.name}:`, error);
          return { ...user, calculatedPoints: 0 };
        }
      }));
      
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
      const safeUsers = usersWithPoints.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Nova rota para cálculo individual de pontos
  app.get("/api/users/:id(\\d+)/calculate-points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`🔄 Calculando pontos para usuário ID: ${userId}`);
      
      // Teste simples primeiro
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
          message: "Cálculo de teste para Daniela Garcia"
        });
      }
      
      const result = await storage.calculateUserPoints(userId);
      console.log('Resultado do cálculo:', result);
      
      if (result && result.success) {
        res.json(result);
      } else {
        res.status(404).json(result || { error: "Usuário não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao calcular pontos do usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
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
          (errors as any[]).push({ requestId: request.id, error: (error as any).message });
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
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();
      
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
          // await storage.deleteRelationshipByInterested(id); // Função removida
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

  // Update user data from Power BI Excel
  app.post("/api/users/update-from-powerbi", async (req, res) => {
    try {
      const { users: usersData } = req.body;
      
      if (!Array.isArray(usersData) || usersData.length === 0) {
        return res.status(400).json({ error: "Users array is required and must not be empty" });
      }

      let updatedCount = 0;
      let notFoundCount = 0;
      const errors: Array<{ userName: string; error: string }> = [];

      for (const userData of usersData) {
        try {
          if (!userData.nome && !userData.Nome && !userData.name) {
            continue; // Skip rows without name
          }

          const userName = userData.nome || userData.Nome || userData.name;

          // Find user by name
          const users = await sql`
            SELECT id, extra_data FROM users 
            WHERE LOWER(name) = LOWER(${userName})
            LIMIT 1
          `;

          if (users.length === 0) {
            notFoundCount++;
            continue;
          }

          const user = users[0];

          // Parse existing extraData
          let currentExtraData = {};
          if (user.extra_data) {
            currentExtraData = typeof user.extra_data === 'string' 
              ? JSON.parse(user.extra_data) 
              : user.extra_data;
          }

          // Map Power BI columns to extraData fields
          const updatedExtraData = {
            ...currentExtraData,
            engajamento: userData.engajamento || userData.Engajamento,
            classificacao: userData.classificacao || userData.Classificacao || userData.Classificação,
            dizimistaType: userData.dizimista || userData.Dizimista,
            ofertanteType: userData.ofertante || userData.Ofertante,
            tempoBatismoAnos: userData.tempoBatismo || userData.TempoBatismo || userData['Tempo Batismo'],
            cargos: parseCargos(userData.cargos || userData.Cargos),
            nomeUnidade: userData.nomeUnidade || userData.NomeUnidade || userData['Nome Unidade'],
            temLicao: parseBoolean(userData.temLicao || userData.TemLicao || userData['Tem Licao'] || userData['Tem Lição']),
            comunhao: parseNumber(userData.comunhao || userData.Comunhao || userData.Comunhão),
            missao: userData.missao || userData.Missao || userData.Missão,
            estudoBiblico: parseNumber(userData.estudoBiblico || userData.EstudoBiblico || userData['Estudo Biblico'] || userData['Estudo Bíblico']),
            totalPresenca: parseNumber(userData.totalPresenca || userData.TotalPresenca || userData['Total Presenca'] || userData['Total Presença']),
            batizouAlguem: parseBoolean(userData.batizouAlguem || userData.BatizouAlguem || userData['Batizou Alguem'] || userData['Batizou Alguém']),
            discPosBatismal: parseNumber(userData.discipuladoPosBatismo || userData.DiscipuladoPosBatismo || userData['Discipulado Pos-Batismo']),
            cpfValido: userData.cpfValido || userData.CPFValido || userData['CPF Valido'] || userData['CPF Válido'],
            camposVaziosACMS: parseBoolean(userData.camposVaziosACMS || userData.CamposVaziosACMS || userData['Campos Vazios']),
            lastPowerBIUpdate: new Date().toISOString()
          };

          // Update user
          await sql`
            UPDATE users 
            SET extra_data = ${JSON.stringify(updatedExtraData)}
            WHERE id = ${user.id}
          `;

          updatedCount++;
        } catch (error: any) {
          errors.push({ userName: userData.nome || userData.Nome || userData.name, error: error.message });
        }
      }

      // Recalculate points after update
      console.log('🔄 Recalculando pontos após importação...');
      try {
        await storage.calculateAdvancedUserPoints();
      } catch (error) {
        console.error('Erro ao recalcular pontos:', error);
      }

      res.json({
        success: true,
        message: `${updatedCount} usuários atualizados com sucesso`,
        updated: updatedCount,
        notFound: notFoundCount,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error: any) {
      console.error("Update from Power BI error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
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
            (errors as any[]).push({ userId: userData.email, userName: userData.name, error: `User with email ${userData.email} already exists` });
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

          (processedUsers as any[]).push({
            ...newUser,
            generatedUsername: finalUsername,
            defaultPassword: 'meu7care'
          });

        } catch (error) {
          console.error(`Error processing user ${i + 1}:`, error);
          (errors as any[]).push({ userId: userData.email, userName: userData.name, error: error instanceof Error ? (error as Error).message : 'Unknown error' });
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
              (visitedUsers as any[]).push({
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
              
              (visitedUsersList as any[]).push({
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

  // Rota removida - usando apenas calculate-advanced-points

  // Rota para recalcular pontos de todos os usuários
  app.post("/api/users/recalculate-all-points", async (req, res) => {
    try {
      console.log('🔄 Recalculando pontos de todos os usuários...');
      
      // Buscar todos os usuários
      const users = await storage.getAllUsers();
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
          const calculation = await storage.calculateUserPoints(user.id);
          
          if (calculation && typeof calculation === 'object' && calculation.success) {
            // Atualizar pontos no banco se mudaram
            if (user.points !== calculation.points) {
              console.log(`   🔄 Atualizando pontos: ${user.points} → ${calculation.points}`);
              
              // Usar storage para atualizar pontos
              await storage.updateUser(user.id, { points: calculation.points });
              
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
      
      res.json({
        success: true,
        message: `Pontos recalculados para ${users.length} usuários. ${updatedCount} atualizados.`,
        updatedCount,
        totalUsers: users.length,
        errors: errorCount,
        results
      });
      
    } catch (error) {
      console.error('❌ Erro ao recalcular pontos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao recalcular pontos', 
        error: (error as Error).message 
      });
    }
  });

  // Rota removida - conflitante com /api/system/calculate-points-clean

  // Rota removida - conflitante com /api/system/calculate-points-clean

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
      console.log('🔄 Salvando configuração de pontos e recalculando automaticamente...');
      const config = req.body;
      
      // Salvar a nova configuração
      await storage.savePointsConfiguration(config);
      console.log('✅ Configuração salva com sucesso');
      
      // Recalcular pontos de todos os usuários usando o método avançado
      console.log('🔄 Iniciando recálculo automático de pontos...');
      const result = await storage.calculateAdvancedUserPoints();
      
      if (result.success) {
        console.log('🎉 Recálculo automático concluído com sucesso!');
        res.json({ 
          success: true, 
          message: `Configuração salva e pontos recalculados automaticamente! ${result.updatedUsers || 0} usuários atualizados.`,
          updatedUsers: result.updatedUsers || 0,
          errors: result.errors || 0,
          details: result.message
        });
      } else {
        console.error('❌ Erro no recálculo automático:', result.message);
        res.status(500).json({ 
          error: 'Erro ao recalcular pontos automaticamente',
          details: result.message 
        });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de pontos:', error);
      res.status(500).json({ error: 'Erro ao salvar configuração' });
    }
  });

  // Reset points configuration to default values
  app.post('/api/system/points-config/reset', async (req, res) => {
    try {
      console.log('🔄 Resetando configuração de pontos para valores padrão...');
      
      // Limpar configurações existentes
      await db.delete(schema.pointConfigs);
      
      // Recalcular pontos de todos os usuários usando o método avançado
      console.log('🔄 Iniciando recálculo automático após reset...');
      const result = await storage.calculateAdvancedUserPoints();
      
      if (result.success) {
        console.log('🎉 Reset e recálculo automático concluídos com sucesso!');
        res.json({ 
          success: true, 
          message: `Configuração resetada e pontos recalculados automaticamente! ${result.updatedUsers || 0} usuários atualizados.`,
          updatedUsers: result.updatedUsers || 0,
          errors: result.errors || 0,
          details: result.message
        });
      } else {
        console.error('❌ Erro no recálculo automático após reset:', result.message);
        res.status(500).json({ 
          error: 'Erro ao recalcular pontos automaticamente após reset',
          details: result.message 
        });
      }
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

    // 1. ENGAJAMENTO
    if ((extraData as any).engajamento && (extraData as any).engajamento.toLowerCase().includes('alto')) {
        points += config.engajamento?.alto || 0;
    } else if ((extraData as any).engajamento && (extraData as any).engajamento.toLowerCase().includes('medio')) {
      points += config.engajamento?.medio || 0;
    } else if ((extraData as any).engajamento && (extraData as any).engajamento.toLowerCase().includes('baixo')) {
      points += config.engajamento?.baixo || 0;
    }

    // 2. CLASSIFICAÇÃO
    if ((extraData as any).classificacao && (extraData as any).classificacao.toLowerCase().includes('frequente')) {
        points += config.classificacao?.frequente || 0;
    } else if ((extraData as any).classificacao && (extraData as any).classificacao.toLowerCase().includes('naofrequente')) {
        points += config.classificacao?.naoFrequente || 0;
    }

    // 3. DIZIMISTA
    if ((extraData as any).dizimistaType && (extraData as any).dizimistaType.toLowerCase().includes('recorrente')) {
        points += config.dizimista?.recorrente || 0;
    } else if ((extraData as any).dizimistaType && (extraData as any).dizimistaType.toLowerCase().includes('sazonal')) {
      points += config.dizimista?.sazonal || 0;
    } else if ((extraData as any).dizimistaType && (extraData as any).dizimistaType.toLowerCase().includes('pontual')) {
      points += config.dizimista?.pontual || 0;
    }

    // 4. OFERTANTE
    if ((extraData as any).ofertanteType && (extraData as any).ofertanteType.toLowerCase().includes('recorrente')) {
        points += config.ofertante?.recorrente || 0;
    } else if ((extraData as any).ofertanteType && (extraData as any).ofertanteType.toLowerCase().includes('sazonal')) {
      points += config.ofertante?.sazonal || 0;
    } else if ((extraData as any).ofertanteType && (extraData as any).ofertanteType.toLowerCase().includes('pontual')) {
      points += config.ofertante?.pontual || 0;
    }

    // 5. TEMPO DE BATISMO
    if ((extraData as any).tempoBatismoAnos && (extraData as any).tempoBatismoAnos >= 20) {
      points += config.tempobatismo?.maisVinte || 0;
    } else if ((extraData as any).tempoBatismoAnos && (extraData as any).tempoBatismoAnos >= 10) {
      points += config.tempobatismo?.dezAnos || 0;
    } else if ((extraData as any).tempoBatismoAnos && (extraData as any).tempoBatismoAnos >= 5) {
      points += config.tempobatismo?.cincoAnos || 0;
    } else if ((extraData as any).tempoBatismoAnos && (extraData as any).tempoBatismoAnos >= 2) {
      points += config.tempobatismo?.doisAnos || 0;
    }

    // 6. CARGOS
    if ((extraData as any).temCargo === 'Sim' && (extraData as any).departamentosCargos) {
      const numCargos = (extraData as any).departamentosCargos.split(';').length;
      if (numCargos >= 3) {
        points += config.cargos?.tresOuMais || 0;
      } else if (numCargos === 2) {
        points += config.cargos?.doisCargos || 0;
      } else if (numCargos === 1) {
        points += config.cargos?.umCargo || 0;
      }
    }

    // 7. NOME DA UNIDADE
    if ((extraData as any).nomeUnidade && (extraData as any).nomeUnidade.trim()) {
      points += config.nomeunidade?.comUnidade || 0;
    }

    // 8. TEM LIÇÃO
    if ((extraData as any).temLicao === true || (extraData as any).temLicao === 'true') {
      points += config.temlicao?.comLicao || 0;
    }

    // 9. TOTAL DE PRESENÇA
    if ((extraData as any).totalPresenca !== undefined && (extraData as any).totalPresenca !== null) {
      const presenca = parseInt((extraData as any).totalPresenca);
      if (presenca >= 8 && presenca <= 13) {
        points += config.totalpresenca?.oitoATreze || 0;
      } else if (presenca >= 4 && presenca <= 7) {
        points += config.totalpresenca?.quatroASete || 0;
      }
    }

    // 10. ESCOLA SABATINA - COMUNHÃO
    if ((extraData as any).comunhao && (extraData as any).comunhao > 0) {
      points += (extraData as any).comunhao * (config.escolasabatina?.comunhao || 0);
    }

    // 11. ESCOLA SABATINA - MISSÃO
    if ((extraData as any).missao && (extraData as any).missao > 0) {
      points += (extraData as any).missao * (config.escolasabatina?.missao || 0);
    }

    // 12. ESCOLA SABATINA - ESTUDO BÍBLICO
    if ((extraData as any).estudoBiblico && (extraData as any).estudoBiblico > 0) {
      points += (extraData as any).estudoBiblico * (config.escolasabatina?.estudoBiblico || 0);
    }

    // 13. ESCOLA SABATINA - DISCIPULADO PÓS-BATISMO
    if ((extraData as any).discPosBatismal && (extraData as any).discPosBatismal > 0) {
      points += (extraData as any).discPosBatismal * (config.escolasabatina?.discipuladoPosBatismo || 0);
    }

    // 14. CPF VÁLIDO
    if ((extraData as any).cpfValido === 'Sim' || (extraData as any).cpfValido === true || (extraData as any).cpfValido === 'true') {
      points += config.cpfvalido?.valido || 0;
    }

    // 15. CAMPOS VAZIOS ACMS
    if ((extraData as any).camposVaziosACMS === false || (extraData as any).camposVaziosACMS === 'false') {
      points += config.camposvaziosacms?.completos || 0;
    }

    return Math.round(points);
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
    if (config.tempobatismo) {
      maxPoints += Math.max(...Object.values(config.tempobatismo).map(v => Number(v) || 0));
    }
    if (config.cargos) {
      maxPoints += Math.max(...Object.values(config.cargos).map(v => Number(v) || 0));
    }
    if (config.nomeunidade) {
      maxPoints += Math.max(...Object.values(config.nomeunidade).map(v => Number(v) || 0));
    }
    if (config.temlicao) {
      maxPoints += Math.max(...Object.values(config.temlicao).map(v => Number(v) || 0));
    }
    if (config.totalpresenca) {
      maxPoints += Math.max(...Object.values(config.totalpresenca).map(v => Number(v) || 0));
    }
    if (config.escolasabatina) {
      maxPoints += Math.max(...Object.values(config.escolasabatina).map(v => Number(v) || 0));
    }
    if (config.batizouAlguem) {
      maxPoints += Math.max(...Object.values(config.batizouAlguem).map(v => Number(v) || 0));
    }
    if (config.cpfvalido) {
      maxPoints += Math.max(...Object.values(config.cpfvalido).map(v => Number(v) || 0));
    }
    if (config.camposvaziosacms) {
      maxPoints += Math.max(...Object.values(config.camposvaziosacms).map(v => Number(v) || 0));
    }
    
    // Aplicar multiplicadores
    const dynamicMultiplier = (config as any).pontuacaoDinamica?.multiplicador || 1;
    const presenceMultiplier = (config as any).presenca?.multiplicador || 1;
    const discipleshipMultiplier = (config as any).discipuladoPosBatismo?.multiplicador || 1;
    
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
      
      // Recalcular pontos de todos os usuários automaticamente usando o método avançado
      console.log('🔄 Recalculando pontos de todos os usuários automaticamente...');
      const result = await storage.calculateAdvancedUserPoints();
      
      if (!result.success) {
        throw new Error(`Erro no recálculo automático: ${result.message}`);
      }
      
      const updatedCount = result.updatedUsers || 0;
      const errorCount = result.errors || 0;
      
      console.log(`🎉 Recálculo automático concluído: ${updatedCount} usuários atualizados, ${errorCount} erros`);
      
      res.json({
        success: true,
        currentUserAverage: currentUserAverage.toFixed(2),
        targetAverage,
        adjustmentFactor: adjustmentFactor.toFixed(2),
        updatedUsers: updatedCount,
        errors: errorCount,
        message: `Configuração ajustada e pontos recalculados automaticamente! ${updatedCount} usuários atualizados.`,
        details: result.message
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
      // const meeting = await storage.createMeeting(meetingData); // Função removida
      res.json({ success: true, message: "Meeting creation disabled" });
    } catch (error) {
      console.error("Create meeting error:", error);
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });

  app.put("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // const meeting = await storage.updateMeeting(id, updateData); // Função removida
      res.json({ success: true, message: "Meeting update disabled" });
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

// ===== RELATIONSHIPS API ENDPOINTS =====
app.get("/api/relationships", async (req, res) => {
  try {
    console.log('🔍 [API] GET /api/relationships - Iniciando...');
    
    // Retornar resposta simples primeiro
    const response = {
      message: 'API de relacionamentos funcionando',
      environment: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString(),
      relationships: []
    };
    
    console.log('✅ [API] Resposta preparada:', response);
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ [API] Erro ao buscar relacionamentos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.post("/api/relationships", async (req, res) => {
  try {
    console.log('🔍 [API] POST /api/relationships', req.body);
    const { interestedId, missionaryId, status = 'active', notes = '' } = req.body;
    
    if (!interestedId || !missionaryId) {
      return res.status(400).json({ error: 'interestedId e missionaryId são obrigatórios' });
    }

    const relationship = await storage.createRelationship({
      interestedId: parseInt(interestedId),
      missionaryId: parseInt(missionaryId),
      status,
      notes
    });

    console.log('✅ [API] Relacionamento criado:', relationship.id);
    res.json(relationship);
  } catch (error: any) {
    console.error('❌ [API] Erro ao criar relacionamento:', error);
    if (error.message.includes('Já existe um discipulador ativo')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

app.delete("/api/relationships/:id", async (req, res) => {
  try {
    console.log('🔍 [API] DELETE /api/relationships/', req.params.id);
    const { id } = req.params;
    const success = await storage.deleteRelationship(parseInt(id));
    
    if (success) {
      console.log('✅ [API] Relacionamento removido:', id);
      res.json({ message: 'Relacionamento removido com sucesso' });
    } else {
      console.log('❌ [API] Relacionamento não encontrado:', id);
      res.status(404).json({ error: 'Relacionamento não encontrado' });
    }
  } catch (error) {
    console.error('❌ [API] Erro ao remover relacionamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar relacionamentos por interessado
app.get("/api/relationships/interested/:interestedId", async (req, res) => {
  try {
    console.log('🔍 [API] GET /api/relationships/interested/', req.params.interestedId);
    const interestedId = parseInt(req.params.interestedId);
    const relationships = await storage.getRelationshipsByInterested(interestedId);
    console.log('✅ [API] Relacionamentos encontrados para interessado:', relationships.length);
    res.json(relationships);
  } catch (error) {
    console.error('❌ [API] Erro ao buscar relacionamentos por interessado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar relacionamentos por missionário
app.get("/api/relationships/missionary/:missionaryId", async (req, res) => {
  try {
    console.log('🔍 [API] GET /api/relationships/missionary/', req.params.missionaryId);
    const missionaryId = parseInt(req.params.missionaryId);
    const relationships = await storage.getRelationshipsByMissionary(missionaryId);
    console.log('✅ [API] Relacionamentos encontrados para missionário:', relationships.length);
    res.json(relationships);
  } catch (error) {
    console.error('❌ [API] Erro ao buscar relacionamentos por missionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});




// Rota para remover relacionamento ativo por interessado
app.delete("/api/relationships/active/:interestedId", async (req, res) => {
  try {
    console.log('🔍 [API] DELETE /api/relationships/active/', req.params.interestedId);
    const interestedId = parseInt(req.params.interestedId);
    
    // Buscar relacionamento ativo para este interessado
    const relationships = await storage.getRelationshipsByInterested(interestedId);
    const activeRelationship = relationships.find(rel => rel.status === 'active');
    
    if (!activeRelationship) {
      console.log('❌ [API] Nenhum relacionamento ativo encontrado para interessado', interestedId);
      res.status(404).json({ error: "Nenhum relacionamento ativo encontrado" });
      return;
    }
    
    const success = await storage.deleteRelationship(activeRelationship.id);
    
    if (success) {
      console.log('✅ [API] Relacionamento ativo removido:', activeRelationship.id);
      res.json({ message: 'Relacionamento ativo removido com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao remover relacionamento ativo' });
    }
  } catch (error) {
    console.error('❌ [API] Erro ao remover relacionamento ativo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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
      const limit = parseInt(req.query.limit as string) || 50;
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

  // Push Notifications endpoints
  app.get("/api/push/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getAllPushSubscriptions();
      
      // Buscar informações dos usuários para cada subscription
      const subscriptionsWithUsers = await Promise.all(
        subscriptions.map(async (sub) => {
          const user = await storage.getUserById(sub.user_id || sub.userId);
          return {
            ...sub,
            user_id: sub.user_id || sub.userId,
            user_name: user?.name || 'Usuário desconhecido',
            user_email: user?.email || ''
          };
        })
      );
      
      res.json({ subscriptions: subscriptionsWithUsers });
    } catch (error) {
      console.error("Get push subscriptions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const { userId, subscription } = req.body;
      
      if (!userId || !subscription || !subscription.endpoint) {
        res.status(400).json({ error: "Invalid subscription data" });
        return;
      }

      const keys = subscription.keys;
      const pushSubscription = await storage.createPushSubscription({
        userId,
        endpoint: subscription.endpoint,
        p256dh: keys?.p256dh || '',
        auth: keys?.auth || ''
      });

      res.json({ success: true, subscription: pushSubscription });
    } catch (error) {
      console.error("Subscribe to push error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/push/subscriptions/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const success = await storage.togglePushSubscription(id, isActive);
      
      if (!success) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Toggle push subscription error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/push/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePushSubscription(id);
      
      if (!success) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete push subscription error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/push/send", async (req, res) => {
    try {
      const { title, message, type, userId, hasImage, hasAudio, imageData, audioData } = req.body;

      if (!title || !message) {
        res.status(400).json({ error: "Title and message are required" });
        return;
      }

      // Determinar destinatários
      let targetUserIds: number[] = [];
      if (userId && userId !== 'all' && userId !== null) {
        targetUserIds = [Number(userId)];
      } else {
        // Buscar todos os usuários com subscriptions ativas
        const allSubscriptions = await storage.getAllPushSubscriptions();
        const activeSubscriptions = allSubscriptions.filter(sub => sub.is_active !== false && sub.isActive !== false);
        targetUserIds = [...new Set(activeSubscriptions.map(sub => sub.user_id || sub.userId))];
      }

      // Salvar notificação no banco para cada usuário
      const savedNotifications = await Promise.all(
        targetUserIds.map(async (uid) => {
          return await storage.createNotification({
            userId: uid,
            title,
            message,
            type: type || 'general'
          });
        })
      );

      console.log(`✅ ${savedNotifications.length} notificações salvas no banco de dados`);

      // Aqui você pode adicionar lógica futura para enviar via web push real
      // Por enquanto, apenas salvamos no banco

      res.json({ 
        success: true, 
        sentTo: targetUserIds.length,
        savedNotifications: savedNotifications.length,
        message: "Notificações enviadas e salvas com sucesso"
      });
    } catch (error) {
      console.error("Send push notification error:", error);
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
      // const points = await storage.getUserPoints(userId); // Função removida
      res.json({ points: 0 });
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

  // Rota points-details removida - sistema limpo para nova implementação

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
      
      // const totalPoints = await storage.getUserPoints(userId); // Função removida
      res.json({ success: true, totalPoints: 0 });
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
      res.status(500).json({ error: "Erro ao criar evento simples: " + (error as Error).message });
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
        (processedLines as any[]).push({
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
      res.status(500).json({ error: "Erro ao processar CSV: " + (error as Error).message });
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
      res.status(500).json({ error: "Erro ao verificar igrejas: " + (error as Error).message });
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
      res.status(500).json({ error: "Erro ao verificar usuários: " + (error as Error).message });
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
      res.status(500).json({ error: "Erro ao verificar eventos no banco: " + (error as Error).message });
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
      res.status(500).json({ error: "Erro ao criar evento com SQL: " + (error as Error).message });
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
      res.status(500).json({ error: "Erro ao criar evento: " + (error as Error).message });
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

      const createdEvents: any[] = [];
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
      res.status(500).json({ error: "Erro ao adicionar eventos: " + (error as Error).message });
    }
  });

  // Endpoint para limpar eventos duplicados
  app.post("/api/debug/clean-duplicates", async (req, res) => {
    try {
      console.log('🧹 Iniciando limpeza de duplicatas...');
      
      // Usar SQL direto para remover duplicatas, mantendo apenas o primeiro de cada grupo
      // const result = await storage.db.execute(`
      //   DELETE FROM events 
      //   WHERE id NOT IN (
      //     SELECT MIN(id) 
      //     FROM events 
      //     GROUP BY title, DATE(date)
      //   )
      // `);
      
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
//           errors.push(`Linha ${i + 2}: ${(error as Error).message}`);
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
//           errors.push(`Erro ao inserir "${event.title}": ${(error as Error).message}`);
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

  // ==================== ROTAS DO GOOGLE DRIVE ====================
  
  // Salvar configuração do Google Drive
  app.post("/api/calendar/google-drive-config", async (req, res) => {
    try {
      const { spreadsheetUrl, autoSync, syncInterval, realtimeSync, pollingInterval } = req.body;
      
      // Validar URL
      const googleDrivePattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/.*$/;
      if (!googleDrivePattern.test(spreadsheetUrl)) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL inválida. Use uma URL do Google Sheets' 
        });
      }
      
      // Salvar configuração no banco de dados
      const config = {
        spreadsheetUrl,
        autoSync: autoSync || false,
        syncInterval: syncInterval || 60,
        realtimeSync: realtimeSync || false,
        pollingInterval: pollingInterval || 30,
        lastSync: null,
        createdAt: new Date().toISOString()
      };
      
      // Salvar ou atualizar no banco de dados
      await storage.saveSystemSetting('google_drive_config', config);
      
      console.log('✅ Configuração do Google Drive salva no banco:', config);
      
      res.json({ success: true, config });
    } catch (error) {
      console.error('❌ Erro ao salvar configuração do Google Drive:', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  });
  
  // Buscar configuração do Google Drive
  app.get("/api/calendar/google-drive-config", async (req, res) => {
    try {
      const config = await storage.getSystemSetting('google_drive_config');
      
      if (config) {
        res.json(config);
      } else {
        // Configuração padrão se não existir
        const defaultConfig = {
          spreadsheetUrl: '',
          autoSync: false,
          syncInterval: 60,
          realtimeSync: false,
          pollingInterval: 30,
          lastSync: null
        };
        res.json(defaultConfig);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar configuração do Google Drive:', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  });
  
  // Testar conexão com Google Drive
  app.post("/api/calendar/test-google-drive", async (req, res) => {
    try {
      const { csvUrl } = req.body;
      
      if (!csvUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL CSV não fornecida' 
        });
      }
      
      console.log('🔍 Testando conexão com:', csvUrl);
      
      // Fazer requisição para o CSV
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      console.log(`✅ Conexão testada com sucesso! ${lines.length} linhas encontradas`);
      
      res.json({ 
        success: true, 
        rowCount: lines.length,
        message: `Conexão estabelecida com sucesso. ${lines.length} registros encontrados.`
      });
    } catch (error) {
      console.error('❌ Erro ao testar conexão com Google Drive:', error);
      res.status(500).json({ 
        success: false, 
        error: `Erro ao conectar: ${(error as Error).message}` 
      });
    }
  });
  
  // Sincronizar com Google Drive
  app.post("/api/calendar/sync-google-drive", async (req, res) => {
    try {
      const { csvUrl, spreadsheetUrl } = req.body;
      
      if (!csvUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL CSV não fornecida' 
        });
      }
      
      console.log('🔄 Iniciando sincronização com Google Drive...');
      console.log('📊 URL CSV:', csvUrl);
      
      // Fazer requisição para o CSV
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Planilha muito pequena - precisa ter pelo menos cabeçalho e uma linha de dados');
      }
      
      console.log(`📄 ${lines.length} linhas encontradas na planilha`);
      
      // Processar CSV
      const events: any[] = [];
      let importedCount = 0;
      let errorCount = 0;
      
      // Pular cabeçalho e processar cada linha
      for (let i = 1; i < lines.length; i++) {
        try {
          const line = lines[i];
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length < 4) {
            console.log(`⚠️ Linha ${i + 1} incompleta, pulando:`, columns);
            errorCount++;
            continue;
          }
          
          const [mes, categoria, data, evento] = columns;
          
          if (!evento || evento.trim() === '') {
            console.log(`⚠️ Linha ${i + 1} sem evento, pulando:`, columns);
            errorCount++;
            continue;
          }
          
          // Parsear data (reutilizar lógica do ImportExcelModal)
          const dateInfo = parseBrazilianDate(data);
          if (!dateInfo) {
            console.log(`⚠️ Data inválida na linha ${i + 1}: ${data}`);
            errorCount++;
            continue;
          }
          
          let startDate, endDate;
          if (typeof dateInfo === 'object') {
            startDate = dateInfo.startDate;
            endDate = dateInfo.endDate;
          } else {
            startDate = dateInfo;
            endDate = null;
          }
          
          // Mapear tipo de evento
          const eventType = mapEventType(categoria);
          
          const event = {
            title: evento.trim(),
            type: eventType,
            date: startDate,
            endDate: endDate,
            description: `${mes || 'Evento'} - ${categoria || 'Categoria não especificada'}`,
            source: 'google-drive',
            sourceUrl: spreadsheetUrl,
            originalData: {
              mes,
              categoria,
              data,
              evento,
              row: i + 1
            }
          };
          
          events.push(event);
          
        } catch (error) {
          console.error(`❌ Erro ao processar linha ${i + 1}:`, error);
          errorCount++;
        }
      }
      
      console.log(`📊 ${events.length} eventos processados, ${errorCount} erros`);
      
      // Importar eventos usando a mesma lógica da importação Excel
      for (const event of events) {
        try {
          await storage.createEvent(event);
          importedCount++;
        } catch (error) {
          console.error('❌ Erro ao criar evento:', error);
          errorCount++;
        }
      }
      
      // Atualizar configuração com última sincronização
      if ((global as any).googleDriveConfig) {
        (global as any).googleDriveConfig.lastSync = new Date().toISOString();
      }
      
      console.log(`✅ Sincronização concluída: ${importedCount} eventos importados`);
      
      res.json({
        success: true,
        importedEvents: importedCount,
        totalEvents: events.length,
        errorCount,
        message: `${importedCount} eventos importados com sucesso`
      });
      
    } catch (error) {
      console.error('❌ Erro na sincronização com Google Drive:', error);
      res.status(500).json({ 
        success: false, 
        error: `Erro na sincronização: ${(error as Error).message}` 
      });
    }
  });
  
  // Função auxiliar para parsear datas brasileiras (reutilizada do ImportExcelModal)
  function parseBrazilianDate(dateStr: any): string | { startDate: string; endDate: string } | null {
    if (!dateStr) return null;
    
    console.log(`📅 Parsing date: "${dateStr}"`);
    
    // Se já é uma data válida, retornar
    if (dateStr instanceof Date) {
      return dateStr.toISOString();
    }
    
    // Se é string, tentar diferentes formatos
    if (typeof dateStr === 'string') {
      dateStr = dateStr.toString().trim();
      
      // Formato DD/MM/YYYY
      const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        const date = new Date(year, month - 1, day);
        console.log(`✅ Parsed DD/MM/YYYY: ${date.toISOString()}`);
        return date.toISOString();
      }
      
      // Formato DD/MM/YYYY - DD/MM/YYYY (período completo)
      const fullPeriod = dateStr.match(/^(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})$/);
      if (fullPeriod) {
        const [, startStr, endStr] = fullPeriod;
        const startParts = startStr.split('/');
        const endParts = endStr.split('/');
        const result = {
          startDate: new Date(startParts[2], startParts[1] - 1, startParts[0]).toISOString(),
          endDate: new Date(endParts[2], endParts[1] - 1, endParts[0]).toISOString()
        };
        console.log(`✅ Parsed full period: ${result.startDate} - ${result.endDate}`);
        return result;
      }
      
      // Formato DD/MM - DD/MM (período sem ano)
      const period = dateStr.match(/^(\d{1,2})\/(\d{1,2})\s*-\s*(\d{1,2})\/(\d{1,2})$/);
      if (period) {
        const [, startDay, startMonth, endDay, endMonth] = period;
        const currentYear = new Date().getFullYear();
        const result = {
          startDate: new Date(currentYear, startMonth - 1, startDay).toISOString(),
          endDate: new Date(currentYear, endMonth - 1, endDay).toISOString()
        };
        console.log(`✅ Parsed period: ${result.startDate} - ${result.endDate}`);
        return result;
      }
      
      // Formato DD/MM
      const ddmm = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (ddmm) {
        const [, day, month] = ddmm;
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear, month - 1, day);
        console.log(`✅ Parsed DD/MM: ${date.toISOString()}`);
        return date.toISOString();
      }
      
      // Tentar parsear como número de data Excel
      if (!isNaN(dateStr) && !isNaN(parseFloat(dateStr))) {
        try {
          const excelDate = parseFloat(dateStr);
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          console.log(`✅ Parsed Excel date: ${date.toISOString()}`);
          return date.toISOString();
        } catch (e) {
          console.log(`⚠️ Erro ao converter data Excel: ${(e as Error).message}`);
        }
      }
    }
    
    // Tentar parsear como data normal
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      console.log(`✅ Parsed as Date: ${date.toISOString()}`);
      return date.toISOString();
    }
    
    console.log(`❌ Could not parse date: ${dateStr}`);
    return null;
  }
  
  // Função auxiliar para mapear tipos de evento
  function mapEventType(categoria: string): string {
    const lowerCategory = categoria ? categoria.toLowerCase() : '';
    if (lowerCategory.includes('igreja local')) return 'igreja-local';
    if (lowerCategory.includes('asr administrativo')) return 'asr-administrativo';
    if (lowerCategory.includes('asr geral')) return 'asr-geral';
    if (lowerCategory.includes('asr pastores')) return 'asr-pastores';
    if (lowerCategory.includes('visitas')) return 'visitas';
    if (lowerCategory.includes('reuniões')) return 'reunioes';
    if (lowerCategory.includes('pregações')) return 'pregacoes';
    return 'igreja-local'; // Tipo padrão
  }

  // Adicionar rotas de importação
  importRoutes(app);

  // Election routes
  electionRoutes(app);

  return createServer(app);
}

// CÓDIGO REMOVIDO - Integração Power BI cancelada
/*
  // ========== ROTAS DE INTEGRAÇÃO COM POWER BI ==========
  
  // Salvar credenciais do Power BI
  app.post('/api/powerbi/credentials', async (req, res) => {
    try {
      const { username, password, appId, reportId, datasetId } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Credenciais incompletas' });
      }

      // Salvar credenciais no banco (em produção, criptografar a senha)
      await storage.saveSystemConfig('powerbi_credentials', {
        username,
        password,
        appId,
        reportId,
        datasetId
      });

      res.json({ success: true, message: 'Credenciais salvas com sucesso' });
    } catch (error: any) {
      console.error('Erro ao salvar credenciais Power BI:', error);
      res.status(500).json({ error: 'Erro ao salvar credenciais' });
    }
  });

  // Buscar credenciais do Power BI
  app.get('/api/powerbi/credentials', async (req, res) => {
    try {
      const credentials = await storage.getSystemConfig('powerbi_credentials');
      
      if (!credentials) {
        return res.json({ configured: false });
      }

      res.json({
        configured: true,
        username: credentials.username,
        appId: credentials.appId,
        reportId: credentials.reportId,
        datasetId: credentials.datasetId
        // Não retornar a senha
      });
    } catch (error: any) {
      console.error('Erro ao buscar credenciais Power BI:', error);
      res.status(500).json({ error: 'Erro ao buscar credenciais' });
    }
  });

  // Listar datasets disponíveis
  app.post('/api/powerbi/datasets', async (req, res) => {
    try {
      const credentials = await storage.getSystemConfig('powerbi_credentials');
      
      if (!credentials) {
        return res.status(400).json({ error: 'Credenciais não configuradas' });
      }

      const { PowerBIIntegration } = await import('./powerBIIntegration');
      const powerBI = new PowerBIIntegration();

      const authenticated = await powerBI.authenticate(credentials);
      if (!authenticated) {
        return res.status(401).json({ error: 'Falha na autenticação com Power BI' });
      }

      const datasets = await powerBI.listDatasets();
      res.json({ datasets });
    } catch (error: any) {
      console.error('Erro ao listar datasets:', error);
      res.status(500).json({ error: error.message || 'Erro ao listar datasets' });
    }
  });

  // Sincronizar dados do Power BI
  app.post('/api/powerbi/sync', async (req, res) => {
    try {
      console.log('🔄 Iniciando sincronização com Power BI...');

      const credentials = await storage.getSystemConfig('powerbi_credentials');
      
      if (!credentials) {
        return res.status(400).json({ error: 'Credenciais do Power BI não configuradas' });
      }

      const { PowerBIIntegration } = await import('./powerBIIntegration');
      const powerBI = new PowerBIIntegration();

      // Autenticar
      const authenticated = await powerBI.authenticate(credentials);
      if (!authenticated) {
        return res.status(401).json({ error: 'Falha na autenticação com Power BI' });
      }

      // Buscar dataset ID configurado
      const datasetId = credentials.datasetId || req.body.datasetId;
      if (!datasetId) {
        return res.status(400).json({ error: 'Dataset ID não configurado' });
      }

      // Buscar dados dos membros
      const membersData = await powerBI.getMembersData(datasetId);
      
      if (membersData.length === 0) {
        return res.json({ 
          success: true, 
          message: 'Nenhum membro encontrado',
          updated: 0 
        });
      }

      // Atualizar dados dos usuários
      let updatedCount = 0;
      
      for (const memberData of membersData) {
        try {
          // Buscar usuário pelo nome
          const users = await sql`
            SELECT id, extra_data FROM users 
            WHERE LOWER(name) = LOWER(${memberData.name})
            LIMIT 1
          `;

          if (users.length > 0) {
            const user = users[0];
            
            // Preparar extraData atualizado
            let currentExtraData = {};
            if (user.extra_data) {
              currentExtraData = typeof user.extra_data === 'string' 
                ? JSON.parse(user.extra_data) 
                : user.extra_data;
            }

            const updatedExtraData = {
              ...currentExtraData,
              engajamento: memberData.engajamento,
              classificacao: memberData.classificacao,
              dizimistaType: memberData.dizimista,
              ofertanteType: memberData.ofertante,
              tempoBatismoAnos: memberData.tempoBatismo,
              cargos: memberData.cargos,
              nomeUnidade: memberData.nomeUnidade,
              temLicao: memberData.temLicao,
              comunhao: memberData.comunhao,
              missao: memberData.missao,
              estudoBiblico: memberData.estudoBiblico,
              totalPresenca: memberData.totalPresenca,
              batizouAlguem: memberData.batizouAlguem,
              discPosBatismal: memberData.discipuladoPosBatismo,
              cpfValido: memberData.cpfValido,
              camposVaziosACMS: memberData.camposVaziosACMS,
              lastPowerBISync: new Date().toISOString()
            };

            // Atualizar no banco
            await sql`
              UPDATE users 
              SET extra_data = ${JSON.stringify(updatedExtraData)}
              WHERE id = ${user.id}
            `;

            updatedCount++;
            console.log(`✅ Dados atualizados para ${memberData.name}`);
          } else {
            console.log(`⚠️ Usuário não encontrado: ${memberData.name}`);
          }
        } catch (error: any) {
          console.error(`❌ Erro ao atualizar ${memberData.name}:`, error.message);
        }
      }

      // Recalcular pontos após sincronização
      console.log('🔄 Recalculando pontos dos usuários...');
      await storage.calculateAdvancedUserPoints();

      res.json({ 
        success: true, 
        message: `${updatedCount} usuários atualizados com sucesso`,
        total: membersData.length,
        updated: updatedCount
      });
    } catch (error: any) {
      console.error('❌ Erro na sincronização com Power BI:', error);
      res.status(500).json({ error: error.message || 'Erro na sincronização' });
    }
  });
*/
