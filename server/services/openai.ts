import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIResponse {
  content: string;
  metadata?: {
    mode: string;
    confidence: number;
    suggestions?: string[];
    urgency?: 'low' | 'medium' | 'high' | 'emergency';
  };
}

export class AIService {
  
  async generateCareerResponse(message: string, context?: string[]): Promise<AIResponse> {
    const systemPrompt = `You are CareerBot, an expert AI career advisor. You provide personalized career guidance, job recommendations, skill assessments, interview preparation, and salary insights. Always be encouraging, professional, and data-driven in your responses.

Context about current conversation: ${context ? context.join('\n') : 'This is the start of a new conversation.'}

Guidelines:
- Provide actionable, specific advice
- Reference current market trends when relevant
- Be encouraging but realistic
- Ask follow-up questions to better understand the user's situation
- Suggest concrete next steps
- Format responses as JSON with content and metadata`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: result.content || "I'm here to help with your career questions. Could you provide more details about what you'd like to discuss?",
        metadata: {
          mode: 'career',
          confidence: result.confidence || 0.8,
          suggestions: result.suggestions || [],
          urgency: result.urgency || 'low'
        }
      };
    } catch (error) {
      console.error('Career AI Error:', error);
      return {
        content: "I apologize, but I'm having trouble processing your career question right now. Please try again or rephrase your question.",
        metadata: {
          mode: 'career',
          confidence: 0,
          urgency: 'low'
        }
      };
    }
  }

  async generateHealthResponse(message: string, context?: string[]): Promise<AIResponse> {
    const systemPrompt = `You are HealthBot, an AI health advisor providing general wellness guidance and health information. You help with symptom analysis, health risk assessment, medication information, and wellness tips.

IMPORTANT DISCLAIMERS:
- Always remind users that you provide general information only
- Emphasize consulting healthcare professionals for medical concerns
- Never diagnose conditions or provide specific medical advice
- For emergency symptoms, direct users to seek immediate medical attention

Context about current conversation: ${context ? context.join('\n') : 'This is the start of a new conversation.'}

Guidelines:
- Provide general health information and wellness tips
- Ask relevant questions to understand symptoms or concerns
- Suggest when professional medical attention is needed
- Be empathetic and supportive
- Include urgency level in metadata (emergency for serious symptoms)
- Format responses as JSON with content and metadata`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: result.content || "I'm here to provide general health information and wellness guidance. Please remember that I cannot replace professional medical advice. What health topic would you like to discuss?",
        metadata: {
          mode: 'health',
          confidence: result.confidence || 0.8,
          suggestions: result.suggestions || [],
          urgency: result.urgency || 'low'
        }
      };
    } catch (error) {
      console.error('Health AI Error:', error);
      return {
        content: "I apologize, but I'm having trouble processing your health question right now. For any urgent health concerns, please contact a healthcare professional immediately.",
        metadata: {
          mode: 'health',
          confidence: 0,
          urgency: 'low'
        }
      };
    }
  }

  async generateDualResponse(message: string, context?: string[]): Promise<AIResponse> {
    const systemPrompt = `You are the AI Dual Assistant, capable of providing both career and health guidance. Analyze the user's message to determine whether they need career advice, health information, or both.

Context about current conversation: ${context ? context.join('\n') : 'This is the start of a new conversation.'}

Guidelines:
- Determine if the question is primarily career-focused, health-focused, or both
- Provide comprehensive responses that address all aspects of the question
- For health information, include appropriate disclaimers
- For career advice, be data-driven and actionable
- If the topic relates to both domains (e.g., work stress affecting health), address both aspects
- Format responses as JSON with content and metadata
- Set mode to 'career', 'health', or 'dual' based on the question`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: result.content || "I'm your dual AI assistant for both career and health guidance. How can I help you today?",
        metadata: {
          mode: result.mode || 'dual',
          confidence: result.confidence || 0.8,
          suggestions: result.suggestions || [],
          urgency: result.urgency || 'low'
        }
      };
    } catch (error) {
      console.error('Dual AI Error:', error);
      return {
        content: "I'm having trouble processing your question right now. I'm here to help with both career and health topics. Could you please try again?",
        metadata: {
          mode: 'dual',
          confidence: 0,
          urgency: 'low'
        }
      };
    }
  }

  async generateAIReport(userId: string, reportType: 'career' | 'health' | 'combined', userData: any): Promise<{ title: string; content: any }> {
    const systemPrompt = `Generate a comprehensive AI report for the user based on their conversation history and profile data. Create a detailed analysis with actionable insights, recommendations, and next steps.

Report Type: ${reportType}
User Data: ${JSON.stringify(userData)}

Format the response as JSON with:
- title: A descriptive title for the report
- content: Detailed report content with sections like summary, analysis, recommendations, action_items
- Make it professional and actionable
- Include specific metrics and insights where relevant`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a ${reportType} report for this user.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        title: result.title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analysis Report`,
        content: result.content || { summary: "Report generation in progress. Please try again." }
      };
    } catch (error) {
      console.error('Report Generation Error:', error);
      return {
        title: "Report Generation Error",
        content: { error: "Unable to generate report at this time. Please try again later." }
      };
    }
  }
}

export const aiService = new AIService();
