import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  UserCheck,
  Clock,
  Activity,
  Heart,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

interface ReportData {
  attendance: {
    weekly: Array<{
      week: string;
      cultos: number;
      escolaSabatina: number;
      jovens: number;
      total: number;
    }>;
    monthly: Array<{
      month: string;
      average: number;
      growth: number;
    }>;
  };
  membership: {
    newMembers: number;
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    byRole: {
      admin: number;
      missionary: number;
      member: number;
      interested: number;
    };
  };
  activities: {
    meetings: number;
    biblicalStudies: number;
    evangelism: number;
    socialEvents: number;
    totalHours: number;
  };
  engagement: {
    messagesExchanged: number;
    activeChatUsers: number;
    pointsDistributed: number;
    achievementsUnlocked: number;
  };
}

const mockReportData: ReportData = {
  attendance: {
    weekly: [
      { week: '01/01', cultos: 85, escolaSabatina: 72, jovens: 45, total: 202 },
      { week: '08/01', cultos: 88, escolaSabatina: 75, jovens: 48, total: 211 },
      { week: '15/01', cultos: 92, escolaSabatina: 78, jovens: 52, total: 222 },
      { week: '22/01', cultos: 87, escolaSabatina: 74, jovens: 49, total: 210 }
    ],
    monthly: [
      { month: 'Dezembro', average: 198, growth: 8 },
      { month: 'Janeiro', average: 211, growth: 12 },
      { month: 'Fevereiro', average: 205, growth: -3 },
      { month: 'Março', average: 218, growth: 15 }
    ]
  },
  membership: {
    newMembers: 12,
    totalMembers: 156,
    activeMembers: 142,
    inactiveMembers: 14,
    byRole: {
      admin: 3,
      missionary: 8,
      member: 125,
      interested: 20
    }
  },
  activities: {
    meetings: 24,
    biblicalStudies: 16,
    evangelism: 8,
    socialEvents: 6,
    totalHours: 120
  },
  engagement: {
    messagesExchanged: 1247,
    activeChatUsers: 89,
    pointsDistributed: 3450,
    achievementsUnlocked: 156
  }
};

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportData] = useState<ReportData>(mockReportData);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleExportReport = () => {
    toast({
      title: "Relatório exportado",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "text-primary" 
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        {change !== undefined && (
          <div className="flex items-center mt-4">
            {change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : change < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            ) : null}
            <span className={`text-sm font-medium ${
              change > 0 ? 'text-green-600' : 
              change < 0 ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleExportReport} data-testid="button-export">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Geral</TabsTrigger>
            <TabsTrigger value="attendance">Frequência</TabsTrigger>
            <TabsTrigger value="membership">Membros</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total de Membros"
                value={reportData.membership.totalMembers}
                change={12}
                icon={Users}
                color="text-blue-600"
              />
              
              <MetricCard
                title="Frequência Média"
                value="85%"
                change={5}
                icon={UserCheck}
                color="text-green-600"
              />
              
              <MetricCard
                title="Atividades Realizadas"
                value={reportData.activities.meetings + reportData.activities.biblicalStudies}
                change={8}
                icon={Activity}
                color="text-purple-600"
              />
              
              <MetricCard
                title="Engajamento"
                value={reportData.engagement.activeChatUsers}
                change={15}
                icon={MessageSquare}
                color="text-orange-600"
              />
            </div>

            {/* Analytics Dashboard Integration */}
            <AnalyticsDashboard showExport={false} />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequência Semanal</CardTitle>
                  <CardDescription>Últimas 4 semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.attendance.weekly.map((week, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Semana {week.week}</span>
                          <span className="font-medium">Total: {week.total}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs">Cultos</div>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(week.cultos / 100) * 100}%` }}
                              />
                            </div>
                            <div className="w-8 text-xs text-right">{week.cultos}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs">E.S.</div>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(week.escolaSabatina / 100) * 100}%` }}
                              />
                            </div>
                            <div className="w-8 text-xs text-right">{week.escolaSabatina}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs">Jovens</div>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full"
                                style={{ width: `${(week.jovens / 100) * 100}%` }}
                              />
                            </div>
                            <div className="w-8 text-xs text-right">{week.jovens}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendências Mensais</CardTitle>
                  <CardDescription>Crescimento da frequência</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.attendance.monthly.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{month.month}</div>
                          <div className="text-sm text-muted-foreground">
                            Média: {month.average} pessoas
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {month.growth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            variant={month.growth > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {month.growth > 0 ? '+' : ''}{month.growth}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Membership Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Membros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Membros Ativos</span>
                      <Badge className="bg-green-100 text-green-800">
                        {reportData.membership.activeMembers}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Membros Inativos</span>
                      <Badge variant="secondary">
                        {reportData.membership.inactiveMembers}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Novos Membros (mês)</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        +{reportData.membership.newMembers}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roles Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Papel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Administradores</span>
                      <Badge className="bg-red-100 text-red-800">
                        {reportData.membership.byRole.admin}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missionários</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {reportData.membership.byRole.missionary}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Membros</span>
                      <Badge className="bg-green-100 text-green-800">
                        {reportData.membership.byRole.member}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interessados</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {reportData.membership.byRole.interested}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Atividades</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Reuniões</span>
                      </div>
                      <span className="font-bold">{reportData.activities.meetings}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>Estudos Bíblicos</span>
                      </div>
                      <span className="font-bold">{reportData.activities.biblicalStudies}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span>Evangelismo</span>
                      </div>
                      <span className="font-bold">{reportData.activities.evangelism}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>Eventos Sociais</span>
                      </div>
                      <span className="font-bold">{reportData.activities.socialEvents}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Engajamento</CardTitle>
                  <CardDescription>Atividade da comunidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Mensagens Trocadas</span>
                      <span className="font-bold text-blue-600">
                        {reportData.engagement.messagesExchanged.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Usuários Ativos no Chat</span>
                      <span className="font-bold text-green-600">
                        {reportData.engagement.activeChatUsers}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Pontos Distribuídos</span>
                      <span className="font-bold text-orange-600">
                        {reportData.engagement.pointsDistributed.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Conquistas Desbloqueadas</span>
                      <span className="font-bold text-purple-600">
                        {reportData.engagement.achievementsUnlocked}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}