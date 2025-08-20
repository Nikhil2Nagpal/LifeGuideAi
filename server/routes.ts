import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiService } from "./services/openai";
import { chatMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketWithUser extends WebSocket {
  userId?: string;
  conversationId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocketWithUser>();
  
  wss.on('connection', (ws: WebSocketWithUser, req) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, ws);
    
    // Auto-assign a default user for demo purposes
    ws.userId = 'demo-user-' + clientId;
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established'
    }));
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);
        
        if (message.type === 'chat') {
          const { message: userMessage, mode, conversationId } = message;
          
          // Create or get conversation
          let convId = conversationId;
          if (!convId && ws.userId) {
            const conversation = await storage.createConversation({
              userId: ws.userId,
              title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
              mode: mode || 'dual'
            });
            convId = conversation.id;
            ws.conversationId = convId;
          }
          
          // Save user message
          if (convId) {
            await storage.createMessage({
              conversationId: convId,
              role: 'user',
              content: userMessage
            });
          }
          
          // Get AI response
          let aiResponse;
          const recentMessages = convId ? await storage.getMessagesByConversation(convId) : [];
          const context = recentMessages.slice(-10).map(m => `${m.role}: ${m.content}`);
          
          switch (mode) {
            case 'career':
              aiResponse = await aiService.generateCareerResponse(userMessage, context);
              break;
            case 'health':
              aiResponse = await aiService.generateHealthResponse(userMessage, context);
              break;
            default:
              aiResponse = await aiService.generateDualResponse(userMessage, context);
          }
          
          // Save AI response
          if (convId) {
            await storage.createMessage({
              conversationId: convId,
              role: 'assistant',
              content: aiResponse.content,
              metadata: aiResponse.metadata
            });
          }
          
          // Send response to client
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_response',
              content: aiResponse.content,
              metadata: aiResponse.metadata,
              conversationId: convId
            }));
          }
        }
        
        if (message.type === 'auth') {
          ws.userId = message.userId;
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
    });
  });

  // REST API routes
  
  // Chat endpoint (alternative to WebSocket)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, mode } = chatMessageSchema.parse(req.body);
      
      let aiResponse;
      switch (mode) {
        case 'career':
          aiResponse = await aiService.generateCareerResponse(message);
          break;
        case 'health':
          aiResponse = await aiService.generateHealthResponse(message);
          break;
        default:
          aiResponse = await aiService.generateDualResponse(message);
      }
      
      res.json(aiResponse);
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  });
  
  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  
  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByConversation(id);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
  // Generate AI report
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { userId, type } = req.body;
      
      if (!userId || !type) {
        return res.status(400).json({ error: "User ID and report type required" });
      }
      
      // Get user data for report generation
      const userProfile = await storage.getUserProfile(userId);
      const conversations = await storage.getConversationsByUser(userId);
      
      const userData = {
        profile: userProfile,
        conversations: conversations.slice(-10) // Recent conversations
      };
      
      const reportData = await aiService.generateAIReport(userId, type, userData);
      
      const report = await storage.createAiReport(userId, {
        type,
        title: reportData.title,
        content: reportData.content
      });
      
      res.json(report);
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });
  
  // Get user reports
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const reports = await storage.getAiReportsByUser(userId);
      res.json(reports);
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });
  
  // Update user profile
  app.post("/api/profile", async (req, res) => {
    try {
      const { userId, ...profileData } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const profile = await storage.createOrUpdateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  return httpServer;
}
