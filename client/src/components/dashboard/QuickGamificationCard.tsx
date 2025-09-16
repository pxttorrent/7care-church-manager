import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp } from 'lucide-react';
import { getLevelByPoints, getMountName, getLevelIcon, getLevelColor, getNextLevel, getProgressToNextLevel, getPointsToNextLevel } from '@/lib/gamification';
import { MountIcon } from '@/components/ui/mount-icon';
import { PointsCalculator, UserData } from '@/lib/pointsCalculator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface QuickGamificationCardProps {
  userData?: UserData;
  showDetails?: boolean;
}

export const QuickGamificationCard = ({ userData, showDetails = false }: QuickGamificationCardProps) => {
  const navigate = useNavigate();
  
  // Dados de exemplo se não fornecidos
  const defaultUserData: UserData = {
    engajamento: 'Alto',
    classificacao: 'Recorrente',
    dizimista: 'Recorrente (8-12 meses)',
    ofertante: 'Sazonal (4-7 meses)',
    tempoBatismo: 15,
    cargos: ['Líder de Jovens', 'Músico'],
    departamentos: ['Jovens', 'Música', 'Evangelismo'],
    nomeUnidade: 'Unidade Central',
    temLicao: true,
    comunhao: 12,
    missao: 10,
    estudoBiblico: 8,
    totalPresenca: 25,
    batizouAlguem: true,
    discipuladoPosBatismo: 5,
    cpfValido: true,
    camposVaziosACMS: false
  };

  // Se não temos userData, usar dados padrão
  const data = userData || defaultUserData;
  
  // Se temos userData real, usar os pontos da API em vez de calcular
  let total: number;
  if (userData && userData.actualPoints !== undefined) {
    total = userData.actualPoints;
  } else {
    // Fallback para cálculo padrão apenas se não tivermos dados reais
    const calculated = PointsCalculator.calculateDetailedPoints(data);
    total = calculated.total;
  }
  const currentLevel = getLevelByPoints(total);
  const nextLevel = getNextLevel(total);
  const progress = getProgressToNextLevel(total);
  const pointsToNext = getPointsToNextLevel(total);

  return (
    <Card 
      onClick={() => navigate('/gamification')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/gamification'); }}
      className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-gray-700">Minha Pontuação</CardTitle>
        <div className="p-2 rounded-full bg-gradient-to-br from-yellow-500 to-purple-600 text-white shadow-lg">
          <Trophy className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex-1">
        <div className="space-y-3">
          {/* Pontuação Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pontos atuais:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-purple-800 bg-clip-text text-transparent">
              {total}
            </span>
          </div>
          
          {/* Montanha Atual */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Montanha atual:</span>
            <div className="flex items-center gap-2">
              <MountIcon iconType={getLevelIcon(total)} className="h-6 w-6" />
              <span className="text-sm font-semibold text-gray-800">
                {getMountName(total)}
              </span>
            </div>
          </div>
          

          
          {/* Progresso para próxima montanha */}
          {nextLevel && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Para {nextLevel.mount}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-center text-xs text-gray-500">
                {pointsToNext > 0 
                  ? `${pointsToNext} pts restantes`
                  : 'Monte máximo!'
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button
          variant="link"
          size="sm"
          className="p-0 text-blue-700"
          onClick={() => navigate('/gamification')}
        >
          Toque para ver detalhes
        </Button>
      </div>
    </Card>
  );
}; 