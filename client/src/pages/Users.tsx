import { useState } from 'react';
import { User, Search, Filter, UserPlus, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';

const mockUsers = [
  {
    id: 1,
    name: "Pastor João Silva",
    email: "admin@7care.com",
    role: "admin",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "Hoje, 14:30",
    phone: "(11) 99999-9999"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@7care.com",
    role: "missionary",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "Ontem, 19:00",
    phone: "(11) 88888-8888"
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    role: "member",
    church: "Igreja Central",
    status: "approved",
    lastLogin: "2 dias atrás",
    phone: "(11) 77777-7777"
  },
  {
    id: 4,
    name: "Ana Costa",
    email: "ana@email.com",
    role: "interested",
    church: "Igreja Central",
    status: "pending",
    lastLogin: "Nunca",
    phone: "(11) 66666-6666"
  }
];

const roleColors = {
  admin: "bg-purple-500 text-white",
  missionary: "bg-blue-500 text-white", 
  member: "bg-green-500 text-white",
  interested: "bg-yellow-500 text-white"
};

const roleLabels = {
  admin: "Admin",
  missionary: "Missionário",
  member: "Membro",
  interested: "Interessado"
};

const statusColors = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800"
};

const statusLabels = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Recusado"
};

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleApproveUser = (userId: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: "approved" } : u
    ));
  };

  const handleRejectUser = (userId: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: "rejected" } : u
    ));
  };

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    admins: users.filter(u => u.role === 'admin').length,
    missionaries: users.filter(u => u.role === 'missionary').length
  };

  if (user?.role !== 'admin') {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas administradores podem gerenciar usuários.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">Gerencie membros da igreja</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.missionaries}</div>
              <p className="text-xs text-muted-foreground">Missionários</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'admin', 'missionary', 'member', 'interested'].map((role) => (
              <Button
                key={role}
                variant={filterRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(role)}
                className="whitespace-nowrap"
              >
                {role === 'all' ? 'Todos' : roleLabels[role as keyof typeof roleLabels]}
              </Button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <Card key={u.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{u.name}</h3>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={roleColors[u.role as keyof typeof roleColors]}>
                        {roleLabels[u.role as keyof typeof roleLabels]}
                      </Badge>
                      <Badge className={statusColors[u.status as keyof typeof statusColors]}>
                        {statusLabels[u.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Igreja:</span> {u.church}
                    </div>
                    <div>
                      <span className="font-medium">Último acesso:</span> {u.lastLogin}
                    </div>
                  </div>

                  {u.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleRejectUser(u.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Recusar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        onClick={() => handleApproveUser(u.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="text-center py-8 shadow-sm">
            <CardContent>
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default Users;