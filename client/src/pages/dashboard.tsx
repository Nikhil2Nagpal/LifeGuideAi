import { useState, useCallback } from "react";
import { Link } from "wouter";
import { AssistantCard } from "@/components/ui/assistant-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AI_MODES, type AIMode } from "@/lib/constants";

export default function Dashboard() {
  const [selectedMode, setSelectedMode] = useState<AIMode>(AI_MODES.DUAL);
  const { toast } = useToast();
  
  const handleModeSelect = useCallback((mode: AIMode) => {
    setSelectedMode(mode);
    toast({
      title: `${mode === 'career' ? 'CareerBot' : mode === 'health' ? 'HealthBot' : 'Dual AI'} Activated`,
      description: `Switched to ${mode} assistance mode.`
    });
  }, [toast]);

  const handleQuickAction = useCallback((action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} feature will be available in the next update.`
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-medical-blue to-career-gold rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="gradient-text-blue">LifeGuide</span>
              <span className="gradient-text-gold">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              className="glass-effect border-gray-600 hover:border-medical-blue"
              onClick={() => handleModeSelect(AI_MODES.DUAL)}
              data-testid="button-switch-mode"
            >
              <i className="fas fa-exchange-alt mr-2"></i>Switch Mode
            </Button>
            <Button
              variant="outline"
              className="glass-effect border-gray-600 hover:border-career-gold"
              onClick={() => toast({
                title: "LifeGuide AI",
                description: "Your revolutionary AI platform for career and health guidance!"
              })}
              data-testid="button-about"
            >
              <i className="fas fa-info-circle mr-2"></i>About
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-career-gold to-medical-blue rounded-full"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Welcome to Your
            <span className="gradient-text-blue"> Dual AI </span>
            <span className="gradient-text-gold">Assistant</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get personalized career guidance and health insights powered by advanced AI technology
          </p>
        </div>

        {/* Dual Assistant Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <AssistantCard
            mode="career"
            title="CareerBot"
            description="Your AI Career Advisor"
            icon="fas fa-briefcase"
            isActive={selectedMode === 'career'}
            features={[
              { icon: "fas fa-chart-line", text: "Skill Assessment & Gap Analysis" },
              { icon: "fas fa-search", text: "Job Recommendations & Market Insights" },
              { icon: "fas fa-microphone", text: "Interview Preparation & Practice" },
              { icon: "fas fa-dollar-sign", text: "Salary Insights & Negotiation" }
            ]}
            quote="Get personalized career guidance based on current market trends and your unique skills."
            onClick={() => handleModeSelect('career')}
          />
          
          <AssistantCard
            mode="health"
            title="HealthBot"
            description="Your AI Health Advisor"
            icon="fas fa-heartbeat"
            isActive={selectedMode === 'health'}
            features={[
              { icon: "fas fa-stethoscope", text: "Symptom Analysis & Assessment" },
              { icon: "fas fa-shield-alt", text: "Health Risk Assessment" },
              { icon: "fas fa-pills", text: "Medication Guidance & Reminders" },
              { icon: "fas fa-exclamation-triangle", text: "Emergency Health Alerts" }
            ]}
            quote="Get AI-powered health insights and personalized wellness recommendations."
            onClick={() => handleModeSelect('health')}
          />
        </div>

        {/* Chat Interface Link */}
        <div className="text-center mb-12">
          <Link href="/chat">
            <Button
              size="lg"
              className="bg-gradient-to-r from-medical-blue to-career-gold hover:from-medical-blue-dark hover:to-career-gold-dark text-white font-semibold px-8 py-4 text-lg"
              data-testid="button-start-chat"
            >
              <i className="fas fa-comments mr-3"></i>
              Start AI Conversation
            </Button>
          </Link>
        </div>

        {/* Quick Actions Dashboard */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="glass-effect rounded-xl p-6 text-center hover:neon-glow-gold transition-all duration-300 cursor-pointer"
            onClick={() => handleQuickAction('Skill Assessment')}
            data-testid="card-skill-assessment"
          >
            <CardContent className="p-0">
              <div className="w-12 h-12 bg-gradient-to-r from-career-gold to-career-gold-dark rounded-lg mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-tasks text-white"></i>
              </div>
              <h4 className="font-semibold mb-2">Skill Assessment</h4>
              <p className="text-sm text-gray-400">Evaluate your current skills</p>
            </CardContent>
          </Card>
          
          <Card 
            className="glass-effect rounded-xl p-6 text-center hover:neon-glow-blue transition-all duration-300 cursor-pointer"
            onClick={() => handleQuickAction('Health Check')}
            data-testid="card-health-check"
          >
            <CardContent className="p-0">
              <div className="w-12 h-12 bg-gradient-to-r from-medical-blue to-medical-blue-dark rounded-lg mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-heart text-white"></i>
              </div>
              <h4 className="font-semibold mb-2">Health Check</h4>
              <p className="text-sm text-gray-400">Quick health assessment</p>
            </CardContent>
          </Card>
          
          <Card 
            className="glass-effect rounded-xl p-6 text-center hover:neon-glow-gold transition-all duration-300 cursor-pointer"
            onClick={() => handleQuickAction('Job Search')}
            data-testid="card-job-search"
          >
            <CardContent className="p-0">
              <div className="w-12 h-12 bg-gradient-to-r from-career-gold to-career-gold-dark rounded-lg mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-search text-white"></i>
              </div>
              <h4 className="font-semibold mb-2">Job Search</h4>
              <p className="text-sm text-gray-400">Find matching opportunities</p>
            </CardContent>
          </Card>
          
          <Card 
            className="glass-effect rounded-xl p-6 text-center hover:neon-glow-blue transition-all duration-300 cursor-pointer"
            onClick={() => handleQuickAction('Generate Report')}
            data-testid="card-generate-report"
          >
            <CardContent className="p-0">
              <div className="w-12 h-12 bg-gradient-to-r from-medical-blue to-medical-blue-dark rounded-lg mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-file-pdf text-white"></i>
              </div>
              <h4 className="font-semibold mb-2">Generate Report</h4>
              <p className="text-sm text-gray-400">Export AI insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Insights */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Conversations */}
          <Card className="glass-effect rounded-xl p-6">
            <CardContent className="p-0">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-clock text-medical-blue mr-2"></i>
                Recent Conversations
              </h4>
              <div className="space-y-3" data-testid="recent-conversations">
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-comments text-3xl mb-2"></i>
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with the AI to see your history here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Insights */}
          <Card className="glass-effect rounded-xl p-6">
            <CardContent className="p-0">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-lightbulb text-career-gold mr-2"></i>
                AI Insights
              </h4>
              <div className="space-y-4" data-testid="ai-insights">
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-brain text-3xl mb-2"></i>
                  <p>Building insights...</p>
                  <p className="text-sm">Chat with the AI to unlock personalized insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Progress Stats */}
          <Card className="glass-effect rounded-xl p-6">
            <CardContent className="p-0">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-chart-bar text-neon-blue mr-2"></i>
                Your Progress
              </h4>
              <div className="space-y-4" data-testid="progress-stats">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Career Goals</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">Complete your profile to see progress</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Health Score</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">Take a health assessment to get started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-dark-card bg-opacity-50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-medical-blue to-career-gold rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white"></i>
            </div>
            <span className="text-lg font-semibold">LifeGuide AI</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Empowering your career and health decisions with advanced AI technology
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-medical-blue transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-career-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neon-blue transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
