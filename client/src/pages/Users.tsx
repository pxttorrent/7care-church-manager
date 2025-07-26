import { useState } from 'react';
import { User, Search, Filter, UserPlus, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { UserCard } from '@/components/users/UserCard';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockUsers = [
  {
    id: 1,
    name: "Pastor João Silva",
    email: "admin@7care.com",
    role: "admin",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "Hoje, 14:30",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    birthDate: "1975-03-15",
    civilStatus: "married",
    occupation: "Pastor",
    education: "Teologia",
    address: "Rua das Flores, 123, Centro, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Pastoral", "Administração"],
    baptismDate: "1995-12-25",
    previousReligion: "Adventista do 7º Dia",
    biblicalInstructor: "Pastor Antônio",
    isDonor: true,
    isOffering: true,
    points: 1500,
    level: "Pastor",
    attendance: 95,
    observations: "Líder experiente e dedicado"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@7care.com",
    role: "missionary",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "Ontem, 19:00",
    phone: "(11) 88888-8888",
    cpf: "234.567.890-11",
    birthDate: "1985-07-22",
    civilStatus: "single",
    occupation: "Professora",
    education: "Pedagogia",
    address: "Av. Paulista, 456, Bela Vista, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Escola Sabatina", "Deaconisas"],
    baptismDate: "2010-06-15",
    previousReligion: "Católica",
    biblicalInstructor: "Irmã Joana",
    isDonor: true,
    isOffering: true,
    points: 1200,
    level: "Missionário",
    attendance: 88,
    observations: "Muito ativa na evangelização"
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    role: "member",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "2 dias atrás",
    phone: "(11) 77777-7777",
    cpf: "345.678.901-22",
    birthDate: "1990-11-08",
    civilStatus: "married",
    occupation: "Engenheiro",
    education: "Engenharia Civil",
    address: "Rua Augusta, 789, Consolação, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Jovens", "Música"],
    baptismDate: "2015-04-18",
    previousReligion: "Evangélica",
    biblicalInstructor: "Pastor João",
    isDonor: false,
    isOffering: true,
    points: 800,
    level: "Membro Ativo",
    attendance: 75,
    observations: "Talentoso músico, toca piano"
  },
  {
    id: 4,
    name: "Ana Costa",
    email: "ana@email.com",
    role: "interested",
    church: "Igreja Central",
    status: "pending",
    lastLogin: "Nunca",
    phone: "(11) 66666-6666",
    cpf: "456.789.012-33",
    birthDate: "1988-02-14",
    civilStatus: "divorced",
    occupation: "Enfermeira",
    education: "Enfermagem",
    address: "Rua da Liberdade, 321, Liberdade, São Paulo, SP",
    churchCode: "IC001",
    departments: [],
    baptismDate: null,
    previousReligion: "Espírita",
    biblicalInstructor: "Maria Santos",
    isDonor: false,
    isOffering: false,
    points: 50,
    level: "Interessado",
    attendance: 12,
    observations: "Iniciando estudos bíblicos, muito interessada"
  },
  {
    id: 5,
    name: "Pedro Almeida",
    email: "pedro@email.com",
    role: "member",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "1 semana atrás",
    phone: "(11) 55555-5555",
    cpf: "567.890.123-44",
    birthDate: "1982-09-30",
    civilStatus: "single",
    occupation: "Designer",
    education: "Design Gráfico",
    address: "Rua Ibirapuera, 654, Vila Olímpia, São Paulo, SP",
    churchCode: "IC001",
    departments: ["Comunicação", "Arte"],
    baptismDate: "2018-08-12",
    previousReligion: "Agnóstico",
    biblicalInstructor: "Carlos Oliveira",
    isDonor: true,
    isOffering: true,
    points: 950,
    level: "Membro",
    attendance: 82,
    observations: "Responsável pela arte visual da igreja"
  }
];

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApproveUser = (userId: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'approved' } : u
    ));
    toast({
      title: "Usuário aprovado",
      description: "O usuário foi aprovado com sucesso.",
    });
  };

  const handleRejectUser = (userId: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'rejected' } : u
    ));
    toast({
      title: "Usuário rejeitado",
      description: "O usuário foi rejeitado.",
      variant: "destructive"
    });
  };

  const handleUserClick = (clickedUser: any) => {
    setSelectedUser(clickedUser);
    setShowUserModal(true);
  };

  const handleUpdateUser = (userId: number, data: any) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...data } : u
    ));
    setSelectedUser((prev: any) => prev ? { ...prev, ...data } : null);
    toast({
      title: "Usuário atualizado",
      description: "As informações do usuário foram atualizadas com sucesso.",
    });
  };

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-pending-count">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {user?.role === 'admin' && (
            <Button size="sm" className="bg-primary hover:bg-primary-dark" data-testid="button-new-user">
              <UserPlus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600" data-testid="stat-admins">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600" data-testid="stat-missionaries">
                {users.filter(u => u.role === 'missionary').length}
              </div>
              <div className="text-sm text-muted-foreground">Missionários</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="stat-members">
                {users.filter(u => u.role === 'member').length}
              </div>
              <div className="text-sm text-muted-foreground">Membros</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-interested">
                {users.filter(u => u.role === 'interested').length}
              </div>
              <div className="text-sm text-muted-foreground">Interessados</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger data-testid="select-role-filter">
                  <SelectValue placeholder="Todos os papéis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="missionary">Missionário</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="interested">Interessado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onClick={() => handleUserClick(u)}
              onApprove={() => handleApproveUser(u.id)}
              onReject={() => handleRejectUser(u.id)}
              onEdit={() => handleUserClick(u)}
              showActions={user?.role === 'admin'}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8" data-testid="empty-state">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        )}

        {/* User Detail Modal */}
        <UserDetailModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onUpdate={handleUpdateUser}
        />
      </div>
    </MobileLayout>
  );
}