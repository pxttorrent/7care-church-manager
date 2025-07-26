import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MobileLayout } from '@/components/layout/MobileLayout';

interface InterestedPerson {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  age?: number;
  interests: string[];
  status: 'novo' | 'contato-inicial' | 'estudando' | 'batizado' | 'inativo';
  assignedDate: string;
  lastContact: string;
  nextStudy?: string;
  studiesCompleted: number;
  totalStudies: number;
  notes: string;
  source: 'evento' | 'indicacao' | 'online' | 'visita' | 'outro';
}

const mockInterestedList: InterestedPerson[] = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-1111',
    address: 'Rua das Flores, 123',
    age: 28,
    interests: ['Família', 'Saúde', 'Profecia'],
    status: 'estudando',
    assignedDate: '2024-12-15',
    lastContact: '2025-01-24',
    nextStudy: '2025-01-27T19:00:00',
    studiesCompleted: 8,
    totalStudies: 20,
    notes: 'Muito interessada nos estudos. Marido também demonstra interesse.',
    source: 'evento'
  },
  {
    id: 2,
    name: 'Carlos Santos',
    email: 'carlos@email.com',
    phone: '(11) 99999-2222',
    address: 'Av. Central, 456',
    age: 35,
    interests: ['Profecia', 'História'],
    status: 'contato-inicial',
    assignedDate: '2025-01-10',
    lastContact: '2025-01-22',
    studiesCompleted: 2,
    totalStudies: 20,
    notes: 'Procura respostas sobre profecias bíblicas.',
    source: 'online'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 99999-3333',
    address: 'Rua da Paz, 789',
    age: 42,
    interests: ['Saúde', 'Família', 'Vida Cristã'],
    status: 'novo',
    assignedDate: '2025-01-20',
    lastContact: '2025-01-20',
    studiesCompleted: 0,
    totalStudies: 20,
    notes: 'Primeiro contato muito positivo. Agenda próxima semana.',
    source: 'indicacao'
  }
];

export default function MyInterested() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [interestedList, setInterestedList] = useState(mockInterestedList);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredList = interestedList.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || person.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contato-inicial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'estudando':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'batizado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'inativo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'novo':
        return 'Novo';
      case 'contato-inicial':
        return 'Contato Inicial';
      case 'estudando':
        return 'Estudando';
      case 'batizado':
        return 'Batizado';
      case 'inativo':
        return 'Inativo';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContact = (person: InterestedPerson, type: 'phone' | 'email' | 'message') => {
    toast({
      title: `Contato iniciado`,
      description: `${type === 'phone' ? 'Ligação' : type === 'email' ? 'Email' : 'Mensagem'} para ${person.name}`,
    });
  };

  const handleScheduleStudy = (person: InterestedPerson) => {
    toast({
      title: "Estudo agendado",
      description: `Estudo marcado com ${person.name}`,
    });
  };

  // Summary stats
  const stats = {
    total: interestedList.length,
    new: interestedList.filter(p => p.status === 'novo').length,
    studying: interestedList.filter(p => p.status === 'estudando').length,
    baptized: interestedList.filter(p => p.status === 'batizado').length,
    avgProgress: Math.round(
      interestedList.reduce((acc, p) => acc + (p.studiesCompleted / p.totalStudies), 0) / 
      interestedList.length * 100
    )
  };

  return (
    <MobileLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Meus Interessados</h1>
          </div>
          
          <Button size="sm" className="bg-primary hover:bg-primary-dark" data-testid="button-new-interested">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600" data-testid="stat-total">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-new">
                {stats.new}
              </div>
              <div className="text-sm text-muted-foreground">Novos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="stat-studying">
                {stats.studying}
              </div>
              <div className="text-sm text-muted-foreground">Estudando</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600" data-testid="stat-baptized">
                {stats.baptized}
              </div>
              <div className="text-sm text-muted-foreground">Batizados</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar interessados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
            data-testid="filter-all"
          >
            Todos
          </Button>
          <Button
            variant={selectedStatus === 'novo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('novo')}
            data-testid="filter-new"
          >
            Novos
          </Button>
          <Button
            variant={selectedStatus === 'estudando' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('estudando')}
            data-testid="filter-studying"
          >
            Estudando
          </Button>
          <Button
            variant={selectedStatus === 'batizado' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('batizado')}
            data-testid="filter-baptized"
          >
            Batizados
          </Button>
        </div>

        {/* Interested List */}
        <div className="space-y-4">
          {filteredList.map((person) => (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-white">
                          {person.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold" data-testid={`person-name-${person.id}`}>
                          {person.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{person.email}</p>
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(person.status)}>
                      {getStatusLabel(person.status)}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{person.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{person.address}</span>
                    </div>
                  </div>

                  {/* Study Progress */}
                  {person.studiesCompleted > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso dos Estudos</span>
                        <span>{person.studiesCompleted}/{person.totalStudies}</span>
                      </div>
                      <div className="bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(person.studiesCompleted / person.totalStudies) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Next Study */}
                  {person.nextStudy && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Próximo estudo: {formatDateTime(person.nextStudy)}</span>
                    </div>
                  )}

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1">
                    {person.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContact(person, 'phone')}
                      data-testid={`button-call-${person.id}`}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Ligar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContact(person, 'message')}
                      data-testid={`button-message-${person.id}`}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Mensagem
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScheduleStudy(person)}
                      data-testid={`button-schedule-${person.id}`}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Agendar
                    </Button>
                  </div>

                  {/* Notes */}
                  {person.notes && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      <strong>Observações:</strong> {person.notes}
                    </div>
                  )}

                  {/* Last Contact */}
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Último contato: {formatDate(person.lastContact)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-8" data-testid="empty-state">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum interessado encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}