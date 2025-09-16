import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, RefreshCw } from 'lucide-react';

interface VisitometerProps {
  visitsCompleted: number;
  visitsExpected: number;
  totalVisits?: number;
  visitedPeople?: number;
  percentage?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const Visitometer = ({ visitsCompleted, visitsExpected, totalVisits = 0, visitedPeople = 0, percentage: apiPercentage = 0, isLoading = false, onRefresh }: VisitometerProps) => {
  // Usar o percentage da API ou calcular localmente
  const percentage = apiPercentage || (visitsExpected > 0 ? Math.round((visitsCompleted / visitsExpected) * 100) : 0);
  
  // Log para debug
  console.log('📊 Visitômetro atualizado:', { visitsCompleted, visitsExpected, totalVisits, visitedPeople, percentage });
  
  const getColor = (percent: number) => {
    if (percent >= 100) return '#10b981'; // Verde - meta atingida
    if (percent >= 60) return '#f59e0b'; // Amarelo - em progresso
    return '#ef4444'; // Vermelho - atrasado
  };

  const getStatusText = (percent: number) => {
    if (percent >= 100) return 'Meta Atingida';
    if (percent >= 60) return 'Em Progresso';
    return 'Atrasado';
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  // Criar o SVG do velocímetro
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getColor(percentage);

  if (isLoading) {
    return (
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Visitômetro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-divine">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Visitômetro
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(percentage)}>
            {getStatusText(percentage)}
          </Badge>
          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRefresh}
              className="h-6 w-6 p-0"
              title="Atualizar visitômetro"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-96 flex flex-col justify-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Velocímetro SVG */}
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              {/* Fundo do velocímetro */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progresso do velocímetro */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s ease-in-out'
                }}
              />
              {/* Marcadores do velocímetro */}
              <g stroke="#6b7280" strokeWidth="2">
                {/* 0% */}
                <line x1="70" y1="10" x2="70" y2="20" />
                {/* 25% */}
                <line x1="110" y1="30" x2="105" y2="35" />
                {/* 50% */}
                <line x1="130" y1="70" x2="120" y2="70" />
                {/* 75% */}
                <line x1="110" y1="110" x2="105" y2="105" />
                {/* 100% */}
                <line x1="70" y1="130" x2="70" y2="120" />
              </g>
              {/* Texto central */}
              <text
                x="70"
                y="70"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-current"
                style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}
              >
                {percentage}%
              </text>
            </svg>
          </div>

          {/* Estatísticas */}
          <div className="text-center space-y-4">
            {/* Pessoas Visitadas */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Pessoas Visitadas</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {visitedPeople || visitsCompleted} / {visitsExpected}
              </div>
              <p className="text-xs text-muted-foreground">
                {visitsExpected - (visitedPeople || visitsCompleted) > 0 
                  ? `${visitsExpected - (visitedPeople || visitsCompleted)} pessoas pendentes`
                  : 'Todas as pessoas foram visitadas!'
                }
              </p>
            </div>

            {/* Separador visual */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {/* Total de Visitas Realizadas */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Visitas Realizadas</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalVisits}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalVisits > (visitedPeople || visitsCompleted) 
                  ? `Média de ${(totalVisits / (visitedPeople || visitsCompleted)).toFixed(1)} visitas por pessoa`
                  : 'Uma visita por pessoa'
                }
              </p>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 