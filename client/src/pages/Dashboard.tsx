import { Calendar, Users, MessageSquare, Video, BarChart3, Clock, Heart, Plus, Cake, TrendingUp, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const dashboardData = {
    admin: {
      totalUsers: 156,
      totalInterested: 23,
      totalChurches: 5,
      pendingApprovals: 3,
      thisWeekEvents: 12,
      totalMessages: 89,
      birthdaysToday: 2,
      birthdaysThisWeek: 8,
      visitometroThisWeek: 85,
      visitometroLastWeek: 78,
      averageAttendance: 142
    },
    missionary: {
      myInterested: 8,
      scheduledMeetings: 4,
      completedStudies: 15,
      thisWeekGoal: 10,
      birthdaysToday: 1,
      birthdaysThisWeek: 3,
      visitometroThisWeek: 85,
      visitometroLastWeek: 78
    },
    member: {
      nextEvents: 3,
      unreadMessages: 2,
      completedActivities: 7,
      points: 450,
      level: 3,
      nextLevelPoints: 500,
      birthdaysToday: 1,
      birthdaysThisWeek: 3,
      visitometroThisWeek: 85
    },
    interested: {
      nextStudy: "Quarta-feira, 19h",
      completedLessons: 3,
      nextMeeting: "Amanhã",
      points: 85,
      level: 1,
      nextLevelPoints: 100,
      birthdaysToday: 0,
      birthdaysThisWeek: 1
    }
  };

  // Mock birthday data
  const birthdayData = {
    today: [
      { name: 'Maria Silva', age: 28, date: '26/01' },
      { name: 'João Santos', age: 45, date: '26/01' }
    ],
    thisWeek: [
      { name: 'Ana Costa', age: 32, date: '27/01' },
      { name: 'Pedro Lima', age: 38, date: '28/01' },
      { name: 'Sofia Oliveira', age: 25, date: '30/01' }
    ]
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const quickActions = {
    admin: [
      { title: "Gerenciar Usuários", icon: Users, action: () => navigate('/users'), color: "bg-blue-500" },
      { title: "Ver Relatórios", icon: BarChart3, action: () => navigate('/reports'), color: "bg-green-500" },
      { title: "Configurações", icon: MessageSquare, action: () => navigate('/settings'), color: "bg-purple-500" }
    ],
    missionary: [
      { title: "Meus Interessados", icon: Heart, action: () => navigate('/my-interested'), color: "bg-red-500" },
      { title: "Nova Reunião", icon: Plus, action: () => navigate('/meetings'), color: "bg-blue-500" },
      { title: "Enviar Mensagem", icon: MessageSquare, action: () => navigate('/messages'), color: "bg-green-500" }
    ],
    member: [
      { title: "Ver Agenda", icon: Calendar, action: () => navigate('/calendar'), color: "bg-blue-500" },
      { title: "Chat", icon: MessageSquare, action: () => navigate('/chat'), color: "bg-green-500" },
      { title: "Videochamadas", icon: Video, action: () => navigate('/video-calls'), color: "bg-purple-500" }
    ],
    interested: [
      { title: "Próximos Estudos", icon: Calendar, action: () => navigate('/calendar'), color: "bg-blue-500" },
      { title: "Agendar Reunião", icon: Clock, action: () => navigate('/meetings'), color: "bg-green-500" }
    ]
  };

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.admin.totalUsers}</div>
          <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interessados</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.admin.totalInterested}</div>
          <p className="text-xs text-muted-foreground">+3 novos esta semana</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos da Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.admin.thisWeekEvents}</div>
          <p className="text-xs text-muted-foreground">Incluindo cultos e estudos</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderMissionaryDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meus Interessados</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.myInterested}</div>
          <p className="text-xs text-muted-foreground">Acompanhando ativamente</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reuniões Agendadas</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.scheduledMeetings}</div>
          <p className="text-xs text-muted-foreground">Para esta semana</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudos Completos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.completedStudies}</div>
          <p className="text-xs text-muted-foreground">Neste mês</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meta da Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.thisWeekGoal}</div>
          <p className="text-xs text-muted-foreground">Contatos planejados</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderMemberDashboard = () => (
    <div className="space-y-6">
      {/* Points Progress Card */}
      <Card className="shadow-divine bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {dashboardData.member.level}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg">Nível {dashboardData.member.level}</div>
                <div className="text-sm text-muted-foreground">
                  {dashboardData.member.points} pontos totais
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Próximo nível</div>
              <div className="text-lg font-semibold text-primary">
                {dashboardData.member.nextLevelPoints} pts
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Nível</span>
              <span>{dashboardData.member.points}/{dashboardData.member.nextLevelPoints}</span>
            </div>
            <div className="bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(dashboardData.member.points / dashboardData.member.nextLevelPoints) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Faltam {dashboardData.member.nextLevelPoints - dashboardData.member.points} pontos para o próximo nível
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.member.nextEvents}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.member.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Não lidas</p>
          </CardContent>
        </Card>

        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.member.completedActivities}</div>
            <p className="text-xs text-muted-foreground">Concluídas este mês</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInterestedDashboard = () => (
    <div className="space-y-6">
      {/* Points Progress Card */}
      <Card className="shadow-divine bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {dashboardData.interested.level}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg">Nível {dashboardData.interested.level}</div>
                <div className="text-sm text-muted-foreground">
                  {dashboardData.interested.points} pontos totais
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Próximo nível</div>
              <div className="text-lg font-semibold text-primary">
                {dashboardData.interested.nextLevelPoints} pts
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Nível</span>
              <span>{dashboardData.interested.points}/{dashboardData.interested.nextLevelPoints}</span>
            </div>
            <div className="bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(dashboardData.interested.points / dashboardData.interested.nextLevelPoints) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Faltam {dashboardData.interested.nextLevelPoints - dashboardData.interested.points} pontos para o próximo nível
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle className="text-lg">Próximo Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-primary">{dashboardData.interested.nextStudy}</div>
            <p className="text-sm text-muted-foreground mt-2">Estudo bíblico em grupo</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle className="text-lg">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{dashboardData.interested.completedLessons} lições</div>
            <p className="text-sm text-muted-foreground mt-2">Completadas com sucesso</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const currentActions = quickActions[user?.role || 'interested'];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-lg p-8 text-white shadow-divine">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-white/90 text-lg">
          {user?.role === 'admin' && "Gerencie sua igreja com excelência"}
          {user?.role === 'missionary' && "Continue impactando vidas para Cristo"}
          {user?.role === 'member' && "Participe ativamente da comunidade"}
          {user?.role === 'interested' && "Continue sua jornada de fé"}
        </p>
      </div>

      {/* Dashboard Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Resumo</h2>
        {user?.role === 'admin' && renderAdminDashboard()}
        {user?.role === 'missionary' && renderMissionaryDashboard()}
        {user?.role === 'member' && renderMemberDashboard()}
        {user?.role === 'interested' && renderInterestedDashboard()}
      </div>

      {/* Aniversariantes e Visitômetro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aniversariantes */}
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-orange-600" />
              Aniversariantes
            </CardTitle>
            <CardDescription>
              Celebre a vida dos membros da igreja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hoje */}
            {birthdayData.today.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Hoje ({birthdayData.today.length})
                </h4>
                {birthdayData.today.map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          {person.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{person.name}</div>
                        <div className="text-xs text-muted-foreground">{person.age} anos</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{person.date}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Esta Semana */}
            {birthdayData.thisWeek.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Esta Semana ({birthdayData.thisWeek.length})
                </h4>
                {birthdayData.thisWeek.map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {person.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{person.name}</div>
                        <div className="text-xs text-muted-foreground">{person.age} anos</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{person.date}</div>
                  </div>
                ))}
              </div>
            )}

            {birthdayData.today.length === 0 && birthdayData.thisWeek.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Cake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum aniversário esta semana</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitômetro */}
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Visitômetro
            </CardTitle>
            <CardDescription>
              Acompanhe a frequência semanal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Esta Semana */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {user?.role === 'admin' ? dashboardData.admin.visitometroThisWeek :
                     user?.role === 'missionary' ? dashboardData.missionary.visitometroThisWeek :
                     user?.role === 'member' ? dashboardData.member.visitometroThisWeek : 85} pessoas
                  </div>
                  <div className="text-sm text-muted-foreground">Esta semana</div>
                </div>
                <div className="text-right">
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        +{dashboardData.admin.visitometroThisWeek - dashboardData.admin.visitometroLastWeek}
                      </span>
                    </div>
                  )}
                  {user?.role === 'missionary' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        +{dashboardData.missionary.visitometroThisWeek - dashboardData.missionary.visitometroLastWeek}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta Semanal</span>
                  <span>100 pessoas</span>
                </div>
                <div className="bg-muted rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((user?.role === 'admin' ? dashboardData.admin.visitometroThisWeek :
                               user?.role === 'missionary' ? dashboardData.missionary.visitometroThisWeek :
                               user?.role === 'member' ? dashboardData.member.visitometroThisWeek : 85) / 100 * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {100 - (user?.role === 'admin' ? dashboardData.admin.visitometroThisWeek :
                          user?.role === 'missionary' ? dashboardData.missionary.visitometroThisWeek :
                          user?.role === 'member' ? dashboardData.member.visitometroThisWeek : 85)} pessoas para atingir a meta
                </div>
              </div>

              {/* Comparação com semana passada */}
              {(user?.role === 'admin' || user?.role === 'missionary') && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Semana passada</span>
                    <span className="font-medium">
                      {user?.role === 'admin' ? dashboardData.admin.visitometroLastWeek : dashboardData.missionary.visitometroLastWeek} pessoas
                    </span>
                  </div>
                </div>
              )}

              {/* Média Geral (apenas admin) */}
              {user?.role === 'admin' && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Média mensal</span>
                    <span className="font-medium">{dashboardData.admin.averageAttendance} pessoas</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentActions.map((action, index) => (
            <Card key={index} className="shadow-divine hover:shadow-glow transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;