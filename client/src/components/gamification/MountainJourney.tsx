import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, Crown, Star, TrendingUp } from 'lucide-react';
import { GAMIFICATION_LEVELS } from '@/lib/gamification';
import { MountIcon } from '@/components/ui/mount-icon';

interface MountainJourneyProps {
  userPoints?: number | { actualPoints?: number };
  showCurrent?: boolean;
  className?: string;
}

export const MountainJourney = ({ userPoints = 0, showCurrent = true, className = "" }: MountainJourneyProps) => {
  // Usar os pontos reais do usuário se disponível
  const actualPoints: number = typeof userPoints === 'number' 
    ? userPoints 
    : ((userPoints as any)?.actualPoints || 0);
  
  const getCurrentLevel = () => {
    return GAMIFICATION_LEVELS.find(level => 
      actualPoints >= level.minPoints && (!level.maxPoints || actualPoints <= level.maxPoints)
    );
  };

  const currentLevel = getCurrentLevel();

  return (
    <Card className={`bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mountain className="h-6 w-6 text-blue-600" />
          Jornada dos Montes Espirituais
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sua ascensão espiritual através dos montes bíblicos
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 md:gap-3">
          {GAMIFICATION_LEVELS.map((level, index) => {
            const isCurrentLevel = actualPoints >= level.minPoints && 
              (!level.maxPoints || actualPoints <= level.maxPoints);
            const isCompleted = actualPoints > (level.maxPoints || level.minPoints);
            const isNext = index === (currentLevel?.id || 0) + 1;
            
            return (
              <div 
                key={level.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isCurrentLevel 
                    ? 'scale-110 z-10' 
                    : isCompleted 
                    ? 'scale-105' 
                    : 'scale-100'
                }`}
              >
                {/* Card do Monte */}
                <Card 
                  className={`h-32 md:h-40 transition-all duration-300 border-2 ${
                    isCurrentLevel 
                      ? 'ring-4 ring-orange-400 border-orange-300 bg-gradient-to-b from-orange-50 to-orange-100 shadow-lg' 
                      : isCompleted 
                      ? 'border-green-300 bg-gradient-to-b from-green-50 to-green-100 shadow-md' 
                      : isNext
                      ? 'border-blue-300 bg-gradient-to-b from-blue-50 to-blue-100 shadow-sm'
                      : 'border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100'
                  } hover:shadow-lg hover:scale-105`}
                >
                  <CardContent className="p-2 md:p-3 h-full flex flex-col items-center justify-center">
                    {/* Ícone do Monte */}
                    <div className={`text-2xl md:text-4xl mb-2 transition-all duration-300 ${
                      isCurrentLevel ? 'scale-125' : 'scale-100'
                    }`}>
                      <MountIcon 
                        iconType={level.icon} 
                        className={`h-8 w-8 md:h-12 md:w-12 ${
                          isCurrentLevel ? 'text-orange-600' : 
                          isCompleted ? 'text-green-600' : 
                          'text-gray-600'
                        }`}
                      />
                    </div>
                    
                    {/* Nome do Monte */}
                    <div className={`text-center font-bold text-xs md:text-sm mb-1 transition-colors duration-300 ${
                      isCurrentLevel ? 'text-orange-700' : 
                      isCompleted ? 'text-green-700' : 
                      'text-gray-600'
                    }`}>
                      {level.mount}
                    </div>
                    
                    {/* Pontos */}
                    <div className="text-center text-xs text-muted-foreground">
                      {level.minPoints}+ pts
                    </div>
                  </CardContent>
                </Card>
                
                {/* Indicadores de Status */}
                {isCurrentLevel && (
                  <div className="absolute -top-2 -right-2 z-20">
                    <Badge className="bg-orange-500 text-white text-xs px-2 py-1 animate-pulse">
                      <Star className="h-3 w-3 mr-1" />
                      Atual
                    </Badge>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 z-20">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  </div>
                )}
                
                {/* Linha de Progresso */}
                {index < GAMIFICATION_LEVELS.length - 1 && (
                  <div className={`hidden md:block absolute top-1/2 -right-1.5 w-3 h-0.5 transform -translate-y-1/2 transition-all duration-300 ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 whitespace-nowrap">
                  <div className="font-bold mb-1">{level.name}</div>
                  <div className="text-gray-300">
                    {level.minPoints} - {level.maxPoints || '∞'} pontos
                  </div>
                  <div className="text-orange-300 mt-1">
                    {level.benefits.slice(0, 2).join(', ')}
                  </div>
                  {/* Seta do tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
                </div>
              </div>
            );
          })}
        </div>
        

      </CardContent>
    </Card>
  );
};
