import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { AIMode } from "@/lib/constants";

interface AssistantCardProps {
  mode: AIMode;
  title: string;
  description: string;
  icon: string;
  features: { icon: string; text: string }[];
  quote: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export function AssistantCard({
  mode,
  title,
  description,
  icon,
  features,
  quote,
  onClick,
  className,
  isActive = false
}: AssistantCardProps) {
  const isCareer = mode === 'career';
  const colorClass = isCareer ? 'career-gold' : 'medical-blue';
  const hoverClass = isCareer ? 'hover:neon-glow-gold' : 'hover:neon-glow-blue';
  const gradientClass = isCareer 
    ? 'from-career-gold to-career-gold-dark' 
    : 'from-medical-blue to-medical-blue-dark';
  const textGradientClass = isCareer ? 'gradient-text-gold' : 'gradient-text-blue';
  
  return (
    <Card 
      className={cn(
        "glass-effect rounded-2xl p-8 transition-all duration-500 cursor-pointer group",
        hoverClass,
        isActive && (isCareer ? 'neon-glow-gold' : 'neon-glow-blue'),
        className
      )}
      onClick={onClick}
      data-testid={`assistant-card-${mode}`}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center float-animation",
              gradientClass
            )}>
              <i className={cn("text-2xl text-white", icon)}></i>
            </div>
            <div>
              <h3 className={cn("text-2xl font-bold", textGradientClass)}>
                {title}
              </h3>
              <p className="text-gray-300">{description}</p>
            </div>
          </div>
          <div className={cn(
            "group-hover:scale-110 transition-transform",
            `text-${colorClass}`
          )}>
            <i className="fas fa-arrow-right text-2xl"></i>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <i className={cn(feature.icon, `text-${colorClass}`)}></i>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
        
        <div className="glass-effect rounded-lg p-4">
          <p className="text-sm text-gray-300 italic">
            "{quote}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
