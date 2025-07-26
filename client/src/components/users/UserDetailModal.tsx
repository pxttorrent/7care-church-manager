import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Gift,
  Award,
  X,
  AlertTriangle,
  Church,
  GraduationCap,
  Briefcase,
  Users,
  Baby
} from "lucide-react";

interface UserDetailModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: number, data: any) => void;
}

export const UserDetailModal = ({ user, isOpen, onClose, onUpdate }: UserDetailModalProps) => {
  if (!user) return null;

  // Helper functions
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'Não informado';
    return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + ' anos';
  };

  const calculateYearsSince = (date: string | null) => {
    if (!date) return 'Não informado';
    return Math.floor((new Date().getTime() - new Date(date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + ' anos';
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
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

  const getCivilStatusLabel = (status: string) => {
    switch (status) {
      case 'single': return 'Solteiro(a)';
      case 'married': return 'Casado(a)';
      case 'divorced': return 'Divorciado(a)';
      case 'widowed': return 'Viúvo(a)';
      default: return 'Não informado';
    }
  };

  const getDepartments = () => {
    if (!user.departments) return [];
    if (typeof user.departments === 'string') {
      return user.departments.split(',').map(d => d.trim()).filter(d => d);
    }
    if (Array.isArray(user.departments)) {
      return user.departments;
    }
    return [];
  };

  // Check if user has phone warning
  const getPhoneWarning = () => {
    try {
      if (user.extraData && typeof user.extraData === 'string') {
        const extraData = JSON.parse(user.extraData);
        return extraData.phoneWarning ? {
          hasWarning: true,
          originalPhone: extraData.originalPhone
        } : { hasWarning: false };
      }
      return { hasWarning: false };
    } catch {
      return { hasWarning: false };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profilePhoto} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <Badge variant="outline" className="ml-auto">
              {getRoleLabel(user.role)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas do membro - Sistema 7Care Plus
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Igreja</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.church || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Código</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.churchCode || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Badge className="mt-1" variant="secondary">{getRoleLabel(user.role)}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Sexo</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Idade</label>
                  <p className="text-sm text-muted-foreground mt-1">{calculateAge(user.birthDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nascimento</label>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(user.birthDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Engajamento</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.attendance || 0} presenças</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Dízimos e Ofertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Classificação</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.level || 'Iniciante'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Dizimista</label>
                  <Badge className="mt-1" variant={user.isDonor ? "default" : "secondary"}>
                    {user.isDonor ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Dízimos - 12m</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Último dízimo - 12m</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor dízimo - 12m</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Número de meses s/ dizimar</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Dizimista antes do últ. dízimo</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Ofertante</label>
                  <Badge className="mt-1" variant={user.isOffering ? "default" : "secondary"}>
                    {user.isOffering ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Ofertas - 12m</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Última oferta - 12m</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor oferta - 12m</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Número de meses s/ ofertar</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Ofertante antes da últ. oferta</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Último movimento</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data do último movimento</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de entrada</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Batismo */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Batismo e Vida Espiritual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Tempo de batismo</label>
                  <p className="text-sm text-muted-foreground mt-1">{calculateYearsSince(user.baptismDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Batismo</label>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(user.baptismDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Localidade do batismo</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Batizado por</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Idade no Batismo</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tempo de batismo - anos</label>
                  <p className="text-sm text-muted-foreground mt-1">{calculateYearsSince(user.baptismDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Religião anterior</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.previousReligion || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Como conheceu a IASD</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fator decisivo</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Como estudou a Bíblia</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Instrutor bíblico</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.biblicalInstructor || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Instrutor bíblico 2</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tem cargo</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teen</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Departamentos e cargos</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getDepartments().length > 0 ? (
                      getDepartments().map((dept: string, index: number) => (
                        <Badge key={index} variant="secondary" data-testid={`badge-department-${index}`}>
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhum departamento</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Familiares */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Informações Familiares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da mãe</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome do pai</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado civil</label>
                  <p className="text-sm text-muted-foreground mt-1">{getCivilStatusLabel(user.civilStatus)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de casamento</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais e Educacionais */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educação e Profissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Grau de educação</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.education || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Ocupação</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.occupation || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Aluno educação Adv.</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Parentesco p/ c/ aluno</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contato e Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    Celular
                    {getPhoneWarning().hasWarning && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" title="Telefone inválido durante importação" />
                    )}
                  </label>
                  <div>
                    <p className="text-sm text-muted-foreground mt-1">{user.phone || 'Não informado'}</p>
                    {getPhoneWarning().hasWarning && (
                      <div className="flex items-center gap-2 mt-1 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="text-xs text-yellow-700 dark:text-yellow-300">
                          <strong>Telefone original:</strong> {getPhoneWarning().originalPhone}
                          <br />
                          <span className="text-muted-foreground">Telefone muito curto durante a importação</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Cidade e Estado</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Bairro</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.address || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Cidade de nascimento</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado de nascimento</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">CPF</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.cpf || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">CPF válido</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escola Sabatina */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Escola Sabatina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da unidade</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Matriculado na ES</label>
                  <Badge className="mt-1" variant={user.isEnrolledES ? "default" : "secondary"}>
                    {user.isEnrolledES ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Tem lição</label>
                  <Badge className="mt-1" variant={user.hasLesson ? "default" : "secondary"}>
                    {user.hasLesson ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Período ES</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.esPeriod || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Comunhão</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Missão</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estudo bíblico</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Batizou alguém</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Disc. pós batismal</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total presença no cartão</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Presença no quiz local</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Presença no quiz outra unidade</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Presença no quiz online</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total de presença</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.attendance || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teve participação</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="shadow-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Colaboração e Outros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Campo - colaborador</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Área - colaborador</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estabelecimento - colaborador</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Função - colaborador</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Campos vazios/inválidos</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome dos campos vazios no ACMS</label>
                  <p className="text-sm text-muted-foreground mt-1">Não informado</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Pontos</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.points || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nível</label>
                  <p className="text-sm text-muted-foreground mt-1">{user.level || 'Iniciante'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {user.observations && (
            <Card className="shadow-divine">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{user.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} data-testid="button-close">
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;