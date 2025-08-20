import { 
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation,
  type Message, 
  type InsertMessage,
  type UserProfile,
  type InsertUserProfile,
  type AiReport,
  type InsertAiReport
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation>;
  
  // Message operations
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createOrUpdateUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  
  // AI reports operations
  getAiReportsByUser(userId: string): Promise<AiReport[]>;
  createAiReport(userId: string, report: InsertAiReport): Promise<AiReport>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private userProfiles: Map<string, UserProfile>;
  private aiReports: Map<string, AiReport>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.userProfiles = new Map();
    this.aiReports = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conv) => conv.userId === userId,
    );
  }

  async createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation> {
    const id = randomUUID();
    const conv: Conversation = {
      ...conversation,
      id,
      createdAt: new Date()
    };
    this.conversations.set(id, conv);
    return conv;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createOrUpdateUserProfile(userId: string, insertProfile: InsertUserProfile): Promise<UserProfile> {
    const existing = await this.getUserProfile(userId);
    
    if (existing) {
      const updated: UserProfile = {
        ...existing,
        ...insertProfile,
        updatedAt: new Date()
      };
      this.userProfiles.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const profile: UserProfile = {
        ...insertProfile,
        id,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.userProfiles.set(id, profile);
      return profile;
    }
  }

  async getAiReportsByUser(userId: string): Promise<AiReport[]> {
    return Array.from(this.aiReports.values())
      .filter((report) => report.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createAiReport(userId: string, insertReport: InsertAiReport): Promise<AiReport> {
    const id = randomUUID();
    const report: AiReport = {
      ...insertReport,
      id,
      userId,
      createdAt: new Date()
    };
    this.aiReports.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();
