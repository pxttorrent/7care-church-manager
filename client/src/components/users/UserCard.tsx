import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserCardProps {
  user: any;
  onClick: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export const UserCard = ({ user, onClick, onApprove, onReject, onEdit, showActions = true }: UserCardProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'missionary': return 'bg-blue-500 text-white';
      case 'member': return 'bg-green-500 text-white';
      case 'interested': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'missionary': return 'Missionário';
      case 'member': return 'Membro';
      case 'interested': return 'Interessado';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  // Check if user has phone warning
  const hasPhoneWarning = () => {
    try {
      if (user.extraData && typeof user.extraData === 'string') {
        const extraData = JSON.parse(user.extraData);
        return extraData.phoneWarning === true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid={`card-user-${user.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profilePhoto} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {hasPhoneWarning() && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1" title="Telefone inválido durante importação">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate" data-testid={`text-username-${user.id}`}>
                  {user.name}
                </h3>
                <Badge className={getRoleColor(user.role)} data-testid={`badge-role-${user.id}`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                {getStatusIcon(user.status)}
                <Badge variant="secondary" className={getStatusColor(user.status)} data-testid={`badge-status-${user.id}`}>
                  {getStatusLabel(user.status)}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                {user.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate" data-testid={`text-email-${user.id}`}>{user.email}</span>
                  </div>
                )}
                
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span data-testid={`text-phone-${user.id}`}>{user.phone}</span>
                  </div>
                )}
                
                {user.church && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate" data-testid={`text-church-${user.id}`}>{user.church}</span>
                  </div>
                )}
                
                {user.lastLogin && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span data-testid={`text-last-login-${user.id}`}>
                      Último acesso: {user.lastLogin}
                    </span>
                  </div>
                )}
              </div>
              
              {user.points !== undefined && (
                <div className="mt-2 text-xs text-primary font-medium" data-testid={`text-points-${user.id}`}>
                  {user.points} pontos • Nível {user.level || 'Iniciante'}
                </div>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {user.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove?.();
                    }}
                    data-testid={`button-approve-${user.id}`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject?.();
                    }}
                    data-testid={`button-reject-${user.id}`}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    data-testid={`button-menu-${user.id}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onEdit?.()}
                    data-testid={`menu-edit-${user.id}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </DropdownMenuItem>
                  {user.status === 'approved' && user.role === 'interested' && (
                    <DropdownMenuItem data-testid={`menu-promote-${user.id}`}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Promover a Membro
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};