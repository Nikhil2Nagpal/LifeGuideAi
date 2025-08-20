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
  private isDemoMode = true; // Force demo mode due to API quota exceeded
  
  private generateDemoResponse(message: string, mode: 'career' | 'health' | 'dual'): AIResponse {
    // Analyze the message for context-specific responses
    const lowerMessage = message.toLowerCase();
    
    if (mode === 'career') {
      if (lowerMessage.includes('12th') || lowerMessage.includes('after 12th') || lowerMessage.includes('stream')) {
        return {
          content: `Great question about your career path after 12th! Based on your interests in Engineering, Medical, Commerce, Arts, and IT, here's my analysis:

**Engineering**: High demand, excellent salary prospects, especially in software, AI, and data science. Requires strong math and problem-solving skills.

**Medical**: Prestigious field with job security, but requires 5-7 years of intensive study. Consider NEET preparation.

**Commerce**: Versatile field leading to CA, MBA, finance careers. Good for business-minded students.

**Arts**: Creative fields growing rapidly, especially digital arts, content creation, and media.

**IT/Computer Science**: Highest growth potential, immediate job opportunities, can start earning while studying.

**My Recommendation**: Given current market trends, consider Computer Science Engineering or IT for immediate opportunities, or Medical if you're passionate about healthcare. Which of these interests you most?`,
          metadata: {
            mode: 'career',
            confidence: 0.95,
            suggestions: ["Research college admission requirements", "Take aptitude tests", "Connect with professionals in chosen field"],
            urgency: 'medium'
          }
        };
      }
      
      if (lowerMessage.includes('engineering') || lowerMessage.includes('software') || lowerMessage.includes('developer')) {
        return {
          content: `Excellent choice for software engineering! Here's your roadmap:

**Step 1**: Learn programming languages (Python, JavaScript, Java)
**Step 2**: Build projects and create a GitHub portfolio
**Step 3**: Practice coding on platforms like LeetCode, HackerRank
**Step 4**: Apply for internships and entry-level positions
**Step 5**: Continuously learn new technologies and frameworks

Current market is very strong for software engineers with 40% job growth expected. Average starting salary is $70,000-$90,000.

What programming languages are you currently familiar with?`,
          metadata: {
            mode: 'career',
            confidence: 0.9,
            suggestions: ["Start learning Python or JavaScript", "Build your first project", "Create LinkedIn profile"],
            urgency: 'low'
          }
        };
      }
    }
    
    // More contextual responses based on message content
    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('career')) {
      return {
        content: `I can help you with your career question! Here's what I recommend:

**For Job Searching:**
- Update your resume with quantifiable achievements
- Optimize your LinkedIn profile 
- Network actively in your industry
- Practice interview skills regularly

**For Career Growth:**
- Identify skill gaps in your field
- Seek mentorship opportunities
- Take on challenging projects
- Consider relevant certifications

What specific career challenge are you facing right now?`,
        metadata: {
          mode: 'career',
          confidence: 0.9,
          suggestions: ["Update resume", "Improve LinkedIn", "Practice interviews"],
          urgency: 'low'
        }
      };
    }
    
    // Default responses as fallback
    const careerResponses = [
      "I'm here to help with your career questions! Whether it's job searching, skill development, interview preparation, or career planning, I can provide personalized guidance. What specific area would you like to focus on?",
      "Great to connect with you! I specialize in career guidance and can help with resume building, job market insights, skill development, and career transitions. What's your current career goal?",
      "Welcome! I'm your career advisor ready to help with job searching, professional development, salary negotiations, and career planning. What brings you here today?"
    ];
    
    // More specific health responses
    if (mode === 'health') {
      if (lowerMessage.includes('headache') || lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        return {
          content: `I understand you're experiencing discomfort. Here are some general wellness tips for common issues:

**For Headaches:**
- Stay hydrated (drink plenty of water)
- Get adequate rest and sleep
- Reduce screen time and eye strain
- Try gentle neck and shoulder stretches
- Manage stress through relaxation techniques

**Important:** If pain is severe, persistent, or accompanied by other symptoms, please consult a healthcare professional immediately.

What specific area of wellness would you like to focus on?`,
          metadata: {
            mode: 'health',
            confidence: 0.9,
            suggestions: ["Stay hydrated", "Get adequate rest", "Consult healthcare provider if severe"],
            urgency: 'medium'
          }
        };
      }
    }
    
    const healthResponses = [
      "Thank you for your health question! I can provide general wellness information to help you maintain good health. For specific medical concerns, please consult a healthcare professional. What aspect of wellness interests you?",
      "I'm here to help with general health and wellness guidance! I can share information about nutrition, exercise, sleep, and stress management. For medical symptoms or conditions, please consult your doctor. What would you like to discuss?",
      "Health and wellness are so important! I can provide general information about healthy living, preventive care, and lifestyle tips. Remember, for specific health concerns, always consult healthcare professionals. How can I help with your wellness journey?"
    ];
    
    const dualResponses = [
      "I'm your dual AI assistant for both career and health guidance! I can help with job searching, skill development, wellness tips, and general health information. Remember, for serious health issues, always consult healthcare professionals. What would you like to discuss?",
      "Great question! Whether it's advancing your career or maintaining good health, I'm here to help. I can provide career advice, job market insights, wellness tips, and general health information. What specific area would you like to focus on?",
      "As your comprehensive AI assistant, I can help with both professional growth and health guidance. For career topics, I provide actionable advice and market insights. For health, I share general wellness information while emphasizing professional medical consultation when needed. How can I assist you today?"
    ];
    
    const responses = mode === 'career' ? careerResponses : mode === 'health' ? healthResponses : dualResponses;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      metadata: {
        mode,
        confidence: 0.9,
        suggestions: mode === 'career' 
          ? ["Update your LinkedIn profile", "Learn a new skill", "Network with industry professionals"]
          : mode === 'health'
          ? ["Maintain regular exercise", "Eat balanced meals", "Get adequate sleep"]
          : ["Focus on work-life balance", "Set career goals", "Prioritize self-care"],
        urgency: 'low'
      }
    };
  }
  
  async generateCareerResponse(message: string, context?: string[]): Promise<AIResponse> {
    if (this.isDemoMode) {
      console.log('Using demo mode for career response');
      return this.generateDemoResponse(message, 'career');
    }
    
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
    if (this.isDemoMode) {
      console.log('Using demo mode for health response');
      return this.generateDemoResponse(message, 'health');
    }
    
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
    if (this.isDemoMode) {
      console.log('Using demo mode for dual response');
      return this.generateDemoResponse(message, 'dual');
    }
    
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
