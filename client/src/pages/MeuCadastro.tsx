import { useState } from 'react';
import { Camera, Save, User, Mail, Phone, Church, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const MeuCadastro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    church: user?.church || ''
  });

  const handleSave = () => {
    // Mock save - in real app would make API call
    console.log('Saving user data:', formData);
    setIsEditing(false);
    toast({
      title: "Dados atualizados",
      description: "Suas informações foram salvas com sucesso"
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      church: user?.church || ''
    });
    setIsEditing(false);
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Meu Cadastro</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Photo */}
        <Card className="shadow-divine">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-muted-foreground capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'missionary' ? 'Missionário' :
                   user?.role === 'member' ? 'Membro' : 'Interessado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Informações Pessoais</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} size="sm">
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancelar
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="church">Igreja</Label>
              <div className="relative">
                <Church className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="church"
                  value={formData.church}
                  onChange={(e) => setFormData(prev => ({ ...prev, church: e.target.value }))}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default MeuCadastro;