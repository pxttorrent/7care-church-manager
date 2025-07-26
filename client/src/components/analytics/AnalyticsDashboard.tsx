import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  MessageCircle,
  Star,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
}

const mockMetrics: MetricCard[] = [
  {
    title: 'Membros Ativos',
    value: 127,
    change: 12,
    changeType: 'increase',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Frequência Média',
    value: '85%',
    change: 5,
    changeType: 'increase',
    icon: Calendar,
    color: 'text-green-600'
  },
  {
    title: 'Novos Interessados',
    value: 18,
    change: -3,
    changeType: 'decrease',
    icon: Star,
    color: 'text-orange-600'
  },
  {
    title: 'Conversas Ativas',
    value: 45,
    change: 8,
    changeType: 'increase',
    icon: MessageCircle,
    color: 'text-purple-600'
  }
];

const attendanceData = [
  { month: 'Jan', cultos: 85, escola: 72, jovens: 45 },
  { month: 'Fev', cultos: 88, escola: 75, jovens: 48 },
  { month: 'Mar', cultos: 92, escola: 78, jovens: 52 },
  { month: 'Abr', cultos: 87, escola: 74, jovens: 49 },
  { month: 'Mai', cultos: 90, escola: 80, jovens: 55 },
  { month: 'Jun', cultos: 93, escola: 82, jovens: 58 }
];

const departmentStats = [
  { name: 'Escola Sabatina', members: 68, attendance: 82, growth: 12 },
  { name: 'Jovens', members: 45, attendance: 75, growth: 8 },
  { name: 'Deaconato', members: 12, attendance: 95, growth: 2 },
  { name: 'Ministério da Música', members: 25, attendance: 88, growth: 5 },
  { name: 'Evangelismo', members: 32, attendance: 70, growth: 15 }
];

interface AnalyticsDashboardProps {
  period?: '7d' | '30d' | '90d' | '1y';
  showExport?: boolean;
}

export const AnalyticsDashboard = ({ 
  period = '30d', 
  showExport = true 
}: AnalyticsDashboardProps) => {

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">
            Insights e métricas da comunidade
          </p>
        </div>
        
        {showExport && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" data-testid="button-filter">
              <Filter className="h-4 w-4 mr-1" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold" data-testid={`metric-${index}`}>
                      {metric.value}
                    </p>
                  </div>
                  <IconComponent className={cn("h-8 w-8", metric.color)} />
                </div>
                
                <div className="flex items-center mt-4">
                  {getChangeIcon(metric.changeType)}
                  <span className={cn(
                    "text-sm font-medium ml-1",
                    getChangeColor(metric.changeType)
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    vs período anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Frequência por Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceData.slice(-3).map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{data.month}</span>
                    <span>Total: {data.cultos + data.escola + data.jovens}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs">Cultos</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(data.cultos / 100) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-right">{data.cultos}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs">Escola</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(data.escola / 100) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-right">{data.escola}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs">Jovens</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(data.jovens / 100) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-right">{data.jovens}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dept.members} membros
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs",
                          dept.growth > 10 ? "text-green-600" : 
                          dept.growth > 5 ? "text-orange-600" : "text-muted-foreground"
                        )}
                      >
                        +{dept.growth}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Presença</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          dept.attendance >= 90 ? "bg-green-600" :
                          dept.attendance >= 80 ? "bg-blue-600" :
                          dept.attendance >= 70 ? "bg-orange-600" : "bg-red-600"
                        )}
                        style={{ width: `${dept.attendance}%` }}
                      />
                    </div>
                    <span className="text-xs w-10 text-right">{dept.attendance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Pontos Positivos</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <span>Crescimento de 12% em membros ativos este mês</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <span>Deaconato mantém 95% de presença consistente</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <span>Aumentou em 8 conversas ativas no chat</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-orange-600">Oportunidades de Melhoria</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <span>Evangelismo precisa de mais engajamento (70% presença)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <span>Foco em reter os 18 novos interessados</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <span>Considerar eventos especiais para jovens</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};