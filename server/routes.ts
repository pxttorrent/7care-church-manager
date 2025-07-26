import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock authentication endpoints for development
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    // Simple demo credentials
    const demoUsers = [
      { email: "admin@7care.com", password: "admin123", role: "admin", name: "Administrador" },
      { email: "missionary@7care.com", password: "missionary123", role: "missionary", name: "Missionário João" },
      { email: "member@7care.com", password: "member123", role: "member", name: "Membro Maria" },
      { email: "interested@7care.com", password: "interested123", role: "interested", name: "Pedro Silva" }
    ];
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.json({ 
        success: true, 
        user: { 
          id: Math.random().toString(36),
          name: user.name, 
          email: user.email, 
          role: user.role,
          isApproved: true
        } 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Mock registration response
    res.json({ 
      success: true, 
      user: { 
        id: Math.random().toString(36),
        name, 
        email, 
        role: role || "interested",
        isApproved: role === "interested"
      } 
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });

  // Catch-all for undefined routes
  app.use("/api/*", (req, res) => {
    console.log("404 Error: User attempted to access non-existent route:", req.path);
    res.status(404).json({ error: "Route not found", path: req.path });
  });

  const httpServer = createServer(app);

  return httpServer;
}
