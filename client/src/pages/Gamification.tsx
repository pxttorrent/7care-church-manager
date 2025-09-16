import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Mountain, 
  Star, 
  TrendingUp,
  Crown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MountainProgress } from '@/components/dashboard/MountainProgress';
import { PointsBreakdown } from '@/components/gamification/PointsBreakdown';

import { MountainJourney } from '@/components/gamification/MountainJourney';
import { getLevelByPoints, getMountName, getLevelIcon, getLevelColor, getNextLevel, getProgressToNextLevel, getPointsToNextLevel } from '@/lib/gamification';
import { MountIcon } from '@/components/ui/mount-icon';
import { useUserPoints } from '@/hooks/useUserPoints';

export default function Gamification() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useUserPoints();
  const [activeTab, setActiveTab] = useState('my-progress');
  
  

  // Loading state
  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando sua pontuação...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {error || 'Erro ao carregar dados de pontuação'}
            </p>
            <Button onClick={refetch} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const { total, breakdown, userData } = data;
  const currentLevel = getLevelByPoints(total);
  const nextLevel = getNextLevel(total);
  const progress = getProgressToNextLevel(total);
  const pointsToNext = getPointsToNextLevel(total);

  return (
    <MobileLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-2xl font-bold">Minha Pontuação</h1>
          </div>
          <p className="text-muted-foreground">
            Acompanhe seu progresso na jornada espiritual
          </p>
          
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="my-progress">Meu Progresso</TabsTrigger>
          </TabsList>

          {/* Meu Progresso */}
          <TabsContent value="my-progress" className="space-y-6">
            {/* Resumo Atual */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mountain className="h-5 w-5 text-purple-600" />
                  Seu Monte Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    <MountIcon iconType={getLevelIcon(total)} className="h-24 w-24 mx-auto" />
                  </div>
                  <div className={getLevelColor(total) + " text-2xl font-bold mb-2"}>
                    {getMountName(total)}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {currentLevel.name}
                  </div>
                </div>

                {nextLevel && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso para {nextLevel.mount}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-center text-xs text-muted-foreground">
                      {pointsToNext > 0 
                        ? `${pointsToNext} pontos para ${nextLevel.mount}`
                        : 'Monte máximo alcançado!'
                      }
                    </div>
                  </div>
                )}

                {total >= 1000 && (
                  <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-yellow-50 rounded-lg">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-700">
                      Status Máximo Alcançado!
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>





            {/* Jornada dos Montes */}
            <MountainJourney userPoints={total} showCurrent={true} />

            {/* Breakdown Detalhado */}
            <PointsBreakdown userData={userData} showDetails={true} />


          </TabsContent>


        </Tabs>
      </div>
    </MobileLayout>
  );
} 