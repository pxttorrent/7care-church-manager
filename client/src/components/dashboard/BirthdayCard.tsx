import React from 'react';
import { Cake, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BirthdayUser {
  id: number;
  name: string;
  phone?: string;
  birthDate: string;
  profilePhoto?: string;
  church?: string | null;
}

interface BirthdayCardProps {
  birthdaysToday: BirthdayUser[];
  birthdaysThisMonth: BirthdayUser[];
  isLoading?: boolean;
}

export const BirthdayCard = ({ birthdaysToday, birthdaysThisMonth, isLoading = false }: BirthdayCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return 'Data inválida';
      }

      // Para formato YYYY-MM-DD simples, extrai diretamente os componentes
      if (dateString.includes('-') && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        
        // Validação básica
        if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12) {
          return `${String(parsedDay).padStart(2, '0')}/${String(parsedMonth).padStart(2, '0')}`;
        }
      }

      // Para formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ), extrai apenas a parte da data
      if (dateString.includes('T') && dateString.includes('Z')) {
        const datePart = dateString.split('T')[0]; // Pega apenas YYYY-MM-DD
        const [year, month, day] = datePart.split('-');
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        
        // Validação básica
        if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12) {
          return `${String(parsedDay).padStart(2, '0')}/${String(parsedMonth).padStart(2, '0')}`;
        }
      }
      
      // Para outros formatos, usa a lógica anterior
      const date = new Date(dateString);
      
      // Se a data for inválida, tenta parsear manualmente
      if (isNaN(date.getTime())) {
        // Tenta parsear formato DD/MM/YYYY
        if (dateString.includes('/')) {
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            const parsedDay = parseInt(day);
            const parsedMonth = parseInt(month);
            let parsedYear = parseInt(year);
            
            // Se o ano tem 2 dígitos, converte para 4 dígitos
            if (parsedYear < 100) {
              parsedYear += parsedYear < 50 ? 2000 : 1900;
            }
            
            // Validação básica
            if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12) {
              // Cria a data usando data local para evitar problemas de fuso horário
              const localDate = new Date(parsedYear, parsedMonth - 1, parsedDay);
              if (!isNaN(localDate.getTime())) {
                return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              }
            }
          }
        }
        
        return 'Data inválida';
      }
      
      // Para datas válidas, usa data local para evitar problemas de fuso horário
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Data:', dateString);
      return 'Data inválida';
    }
  };

  const formatDayName = (dateString: string) => {
    try {
      console.log('🔍 formatDayName chamada com:', dateString);
      
      if (!dateString || typeof dateString !== 'string') {
        return 'Dia inválido';
      }

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentBirthdayYear = 2025; // Usar 2025 para calcular o dia da semana do aniversário que será - VERSÃO CORRIGIDA
      
      console.log('📅 currentBirthdayYear:', currentBirthdayYear);
      
      // Para datas ISO, extrai apenas a parte da data e cria como data local
      let dateToProcess = dateString;
      if (dateString.includes('T') && dateString.includes('Z')) {
        const datePart = dateString.split('T')[0]; // Pega apenas YYYY-MM-DD
        const [year, month, day] = datePart.split('-');
        // Cria uma data local para 2025 usando os componentes extraídos para evitar problemas de fuso horário
        const localDate2025 = new Date(currentBirthdayYear, parseInt(month) - 1, parseInt(day));
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const dayName = dayNames[localDate2025.getDay()];
        
        console.log('🌍 ISO Data processada:', { datePart, year, month, day });
        console.log('📆 Data 2025 criada:', localDate2025.toDateString());
        console.log('📝 Dia da semana retornado:', dayName);
        
        return dayName;
      }
      
      // Evita problemas de fuso horário criando a data de forma explícita
      const date = new Date(dateToProcess);
      
      // Se a data for inválida, tenta parsear manualmente
      if (isNaN(date.getTime())) {
        // Tenta parsear formato DD/MM/YYYY
        if (dateString.includes('/')) {
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const [day, month] = parts;
            const parsedDay = parseInt(day);
            const parsedMonth = parseInt(month);
            
            // Validação básica
            if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12) {
              // Cria a data usando 2025 para calcular o dia da semana do aniversário que será
              const currentYearBirthday = new Date(currentBirthdayYear, parsedMonth - 1, parsedDay);
              
              // Get day name
              const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
              const dayName = dayNames[currentYearBirthday.getDay()];
              
              return dayName;
            }
          }
        }
        
        // Tenta parsear formato YYYY-MM-DD
        if (dateString.includes('-') && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateString.split('-');
          const parsedDay = parseInt(day);
          const parsedMonth = parseInt(month);
          
          // Validação básica
          if (parsedDay >= 1 && parsedDay <= 31 && parsedMonth >= 1 && parsedMonth <= 12) {
            // Cria a data usando 2025 para calcular o dia da semana do aniversário que será
            const currentYearBirthday = new Date(currentBirthdayYear, parsedMonth - 1, parsedDay);
            
            // Get day name
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const dayName = dayNames[currentYearBirthday.getDay()];
            
            return dayName;
          }
        }
        
        return 'Dia inválido';
      }
      
      // Para datas válidas, usa 2025 para calcular o dia da semana do aniversário que será
      const currentYearBirthday = new Date(currentBirthdayYear, date.getMonth(), date.getDate());
      
      // Get day name
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = dayNames[currentYearBirthday.getDay()];
      
      return dayName;
    } catch (error) {
      console.error('Erro ao formatar nome do dia:', error, 'Data:', dateString);
      return 'Dia inválido';
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    
    // Para datas ISO, extrai apenas a parte da data para evitar problemas de fuso horário
    let dateToProcess = dateString;
    if (dateString.includes('T') && dateString.includes('Z')) {
      const datePart = dateString.split('T')[0]; // Pega apenas YYYY-MM-DD
      dateToProcess = datePart;
    }
    
    const birthDate = new Date(dateToProcess);
    
    // Se a data for inválida, tenta parsear manualmente
    if (isNaN(birthDate.getTime())) {
      // Tenta parsear formato DD/MM/YYYY
      if (dateString && typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const [day, month] = parts;
          const parsedDay = parseInt(day);
          const parsedMonth = parseInt(month);
          
          // Compara usando data local para evitar problemas de fuso horário
          return today.getDate() === parsedDay && today.getMonth() === parsedMonth - 1;
        }
      }
      
      // Tenta parsear formato YYYY-MM-DD
      if (dateString && typeof dateString === 'string' && dateString.includes('-') && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        
        // Compara usando data local para evitar problemas de fuso horário
        return today.getDate() === parsedDay && today.getMonth() === parsedMonth - 1;
      }
      
      return false;
    }
    
    // Para datas válidas, compara usando data local para evitar problemas de fuso horário
    return today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();
  };

  const isValidWhatsAppNumber = (phone?: string) => {
    if (!phone) return false;
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Verifica se tem 10 ou 11 dígitos (com ou sem DDD)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá! Feliz aniversário! 🎂 Que Deus abençoe seu dia!`;
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Filtrar aniversariantes de hoje apenas do mês corrente
  const todayInCurrentMonth = birthdaysToday.filter(user => {
    const birthDate = new Date(user.birthDate);
    const today = new Date();
    return birthDate.getMonth() === today.getMonth();
  });

  // Sort other birthdays chronologically (excluding today's)
  const otherBirthdays = birthdaysThisMonth
    .filter(user => !isToday(user.birthDate))
    .sort((a, b) => {
      // Evita problemas de fuso horário criando as datas de forma explícita
      const dateA = new Date(a.birthDate);
      const dateB = new Date(b.birthDate);
      
      // Se as datas forem inválidas, tenta parsear manualmente
      let dayA = 0, dayB = 0;
      
      if (!isNaN(dateA.getTime())) {
        dayA = dateA.getDate();
      } else if (a.birthDate && typeof a.birthDate === 'string' && a.birthDate.includes('/')) {
        const parts = a.birthDate.split('/');
        if (parts.length === 3) {
          dayA = parseInt(parts[0]);
        }
      } else if (a.birthDate && typeof a.birthDate === 'string' && a.birthDate.includes('-') && a.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = a.birthDate.split('-');
        dayA = parseInt(parts[2]);
      }
      
      if (!isNaN(dateB.getTime())) {
        dayB = dateB.getDate();
      } else if (b.birthDate && typeof b.birthDate === 'string' && b.birthDate.includes('/')) {
        const parts = b.birthDate.split('/');
        if (parts.length === 3) {
          dayB = parseInt(parts[0]);
        }
      } else if (b.birthDate && typeof b.birthDate === 'string' && b.birthDate.includes('-') && b.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = b.birthDate.split('-');
        dayB = parseInt(parts[2]);
      }
      
      return dayA - dayB;
    });

  if (isLoading) {
    return (
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cake className="h-4 w-4" />
            Aniversariantes do mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBirthdays = todayInCurrentMonth.length + otherBirthdays.length;

  return (
    <Card className="shadow-divine">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Cake className="h-4 w-4" />
          Aniversariantes do mês
        </CardTitle>
        <div className="flex items-center gap-2">
          {todayInCurrentMonth.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {todayInCurrentMonth.length} hoje
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {totalBirthdays} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {totalBirthdays === 0 ? (
          <div className="text-center py-8">
            <Cake className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum aniversariante este mês
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {/* Aniversariantes de hoje - em destaque */}
              {todayInCurrentMonth.length > 0 && (
                <>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Cake className="h-4 w-4" />
                      Aniversariantes de Hoje
                    </h4>
                    <div className="space-y-2">
                      {todayInCurrentMonth.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 shadow-sm"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.profilePhoto} />
                              <AvatarFallback className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold truncate">{user.name}</p>
                                <Badge variant="destructive" className="text-xs px-2 py-0">
                                  Hoje!
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(user.birthDate)}</span>
                                <span>•</span>
                                <span>{formatDayName(user.birthDate)}</span>
                                {user.church && (
                                  <>
                                    <span>•</span>
                                    <span className="text-muted-foreground/70">{user.church}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isValidWhatsAppNumber(user.phone) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openWhatsApp(user.phone!)}
                              title="Enviar mensagem no WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Separador */}
                  {otherBirthdays.length > 0 && (
                    <div className="border-t border-border my-4"></div>
                  )}
                </>
              )}

              {/* Outros aniversariantes do mês */}
              {otherBirthdays.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Outros aniversariantes do mês
                  </h4>
                  <div className="space-y-2">
                    {otherBirthdays.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profilePhoto} />
                            <AvatarFallback className="text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">{user.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(user.birthDate)}</span>
                              <span>•</span>
                              <span>{formatDayName(user.birthDate)}</span>
                              {user.church && (
                                <>
                                  <span>•</span>
                                  <span className="text-muted-foreground/70">{user.church}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {isValidWhatsAppNumber(user.phone) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => openWhatsApp(user.phone!)}
                            title="Enviar mensagem no WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}; 