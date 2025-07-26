import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Star,
  MessageCircle,
  Gift,
  Award,
  ChevronRight,
  Edit2,
  Save,
  X
} from "lucide-react";

interface UserDetailModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: number, data: any) => void;
}

export const UserDetailModal = ({ user, isOpen, onClose, onUpdate }: UserDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user || {});

  if (!user) return null;

  const handleSave = () => {
    onUpdate(user.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'missionary': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'interested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profilePhoto} />
              <AvatarFallback className="text-xl">{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role === 'admin' ? 'Administrador' :
                   user.role === 'missionary' ? 'Missionário' :
                   user.role === 'member' ? 'Membro' : 'Interessado'}
                </Badge>
                <Badge className={getStatusColor(user.status)}>
                  {user.status === 'approved' ? 'Aprovado' :
                   user.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-user"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  data-testid="button-save-user"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal" data-testid="tab-personal">Pessoal</TabsTrigger>
            <TabsTrigger value="church" data-testid="tab-church">Igreja</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-contact">Contato</TabsTrigger>
            <TabsTrigger value="spiritual" data-testid="tab-spiritual">Espiritual</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engajamento</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        data-testid="input-name"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.name || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        data-testid="input-email"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.email || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    {isEditing ? (
                      <Input
                        id="cpf"
                        value={editData.cpf || ''}
                        onChange={(e) => setEditData({...editData, cpf: e.target.value})}
                        data-testid="input-cpf"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.cpf || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    {isEditing ? (
                      <Input
                        id="birthDate"
                        type="date"
                        value={editData.birthDate || ''}
                        onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                        data-testid="input-birth-date"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="civilStatus">Estado Civil</Label>
                    {isEditing ? (
                      <Select value={editData.civilStatus || ''} onValueChange={(value) => setEditData({...editData, civilStatus: value})}>
                        <SelectTrigger data-testid="select-civil-status">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Solteiro(a)</SelectItem>
                          <SelectItem value="married">Casado(a)</SelectItem>
                          <SelectItem value="divorced">Divorciado(a)</SelectItem>
                          <SelectItem value="widowed">Viúvo(a)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.civilStatus === 'single' ? 'Solteiro(a)' :
                         user.civilStatus === 'married' ? 'Casado(a)' :
                         user.civilStatus === 'divorced' ? 'Divorciado(a)' :
                         user.civilStatus === 'widowed' ? 'Viúvo(a)' : 'Não informado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="occupation">Profissão</Label>
                    {isEditing ? (
                      <Input
                        id="occupation"
                        value={editData.occupation || ''}
                        onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                        data-testid="input-occupation"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.occupation || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="education">Escolaridade</Label>
                    {isEditing ? (
                      <Input
                        id="education"
                        value={editData.education || ''}
                        onChange={(e) => setEditData({...editData, education: e.target.value})}
                        data-testid="input-education"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.education || 'Não informado'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editData.address || ''}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        data-testid="input-address"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.address || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="church" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Informações da Igreja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="church">Igreja</Label>
                    {isEditing ? (
                      <Input
                        id="church"
                        value={editData.church || ''}
                        onChange={(e) => setEditData({...editData, church: e.target.value})}
                        data-testid="input-church"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.church || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="churchCode">Código da Igreja</Label>
                    {isEditing ? (
                      <Input
                        id="churchCode"
                        value={editData.churchCode || ''}
                        onChange={(e) => setEditData({...editData, churchCode: e.target.value})}
                        data-testid="input-church-code"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.churchCode || 'Não informado'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label>Departamentos</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.departments?.map((dept: string, index: number) => (
                        <Badge key={index} variant="secondary" data-testid={`badge-department-${index}`}>
                          {dept}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">Nenhum departamento</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        data-testid="input-phone"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.phone || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Vida Espiritual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baptismDate">Data do Batismo</Label>
                    {isEditing ? (
                      <Input
                        id="baptismDate"
                        type="date"
                        value={editData.baptismDate || ''}
                        onChange={(e) => setEditData({...editData, baptismDate: e.target.value})}
                        data-testid="input-baptism-date"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.baptismDate ? new Date(user.baptismDate).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="previousReligion">Religião Anterior</Label>
                    {isEditing ? (
                      <Input
                        id="previousReligion"
                        value={editData.previousReligion || ''}
                        onChange={(e) => setEditData({...editData, previousReligion: e.target.value})}
                        data-testid="input-previous-religion"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.previousReligion || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="biblicalInstructor">Instrutor Bíblico</Label>
                    {isEditing ? (
                      <Input
                        id="biblicalInstructor"
                        value={editData.biblicalInstructor || ''}
                        onChange={(e) => setEditData({...editData, biblicalInstructor: e.target.value})}
                        data-testid="input-biblical-instructor"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.biblicalInstructor || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Engajamento e Pontos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary" data-testid="text-points">
                      {user.points || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Pontos Totais</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600" data-testid="text-level">
                      {user.level || 'Iniciante'}
                    </div>
                    <p className="text-sm text-muted-foreground">Nível</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600" data-testid="text-attendance">
                      {user.attendance || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Presença</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label>Observações</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.observations || ''}
                      onChange={(e) => setEditData({...editData, observations: e.target.value})}
                      placeholder="Adicione observações sobre este membro..."
                      data-testid="input-observations"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.observations || 'Nenhuma observação'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};