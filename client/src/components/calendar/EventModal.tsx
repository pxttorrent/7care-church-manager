import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Edit2,
  Save,
  X,
  Trash2
} from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  location?: string;
  type: 'culto' | 'escola-sabatina' | 'jovens' | 'deaconato' | 'reuniao' | 'estudo' | 'outro';
  attendees?: number;
  maxAttendees?: number;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  isRecurring?: boolean;
  organizer: string;
}

interface EventModalProps {
  event?: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: number) => void;
  isEditing?: boolean;
}

const eventTypes = [
  { value: 'culto', label: 'Culto' },
  { value: 'escola-sabatina', label: 'Escola Sabatina' },
  { value: 'jovens', label: 'Jovens' },
  { value: 'deaconato', label: 'Deaconato' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'estudo', label: 'Estudo Bíblico' },
  { value: 'outro', label: 'Outro' }
];

const statusOptions = [
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' }
];

export const EventModal = ({ 
  event, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  isEditing: initialEditing = false 
}: EventModalProps) => {
  const [isEditing, setIsEditing] = useState(initialEditing || !event);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>(event || {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    location: '',
    type: 'culto',
    maxAttendees: 50,
    status: 'scheduled',
    organizer: ''
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
    if (!event) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (event) {
      setFormData(event);
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      culto: "bg-purple-100 text-purple-800",
      "escola-sabatina": "bg-blue-100 text-blue-800",
      jovens: "bg-green-100 text-green-800",
      deaconato: "bg-orange-100 text-orange-800",
      reuniao: "bg-gray-100 text-gray-800",
      estudo: "bg-yellow-100 text-yellow-800",
      outro: "bg-pink-100 text-pink-800"
    };
    return colors[type as keyof typeof colors] || colors.outro;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            {event ? (isEditing ? 'Editar Evento' : 'Detalhes do Evento') : 'Novo Evento'}
          </DialogTitle>
          <div className="flex gap-2">
            {event && !isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-event"
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
                  data-testid="button-save-event"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Header */}
          {!isEditing && event && (
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2" data-testid="text-event-title">
                  {event.title}
                </h2>
                <div className="flex gap-2 mb-3">
                  <Badge className={getTypeColor(event.type)} data-testid="badge-event-type">
                    {eventTypes.find(t => t.value === event.type)?.label}
                  </Badge>
                  <Badge className={getStatusColor(event.status)} data-testid="badge-event-status">
                    {statusOptions.find(s => s.value === event.status)?.label}
                  </Badge>
                  {event.isRecurring && (
                    <Badge variant="outline" data-testid="badge-recurring">
                      Recorrente
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-muted-foreground mb-4" data-testid="text-event-description">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título do Evento</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Culto da Manhã"
                  data-testid="input-event-title"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{event?.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição opcional do evento..."
                  rows={3}
                  data-testid="input-event-description"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {event?.description || 'Nenhuma descrição'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Tipo de Evento</Label>
              {isEditing ? (
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value as any})}
                >
                  <SelectTrigger data-testid="select-event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {eventTypes.find(t => t.value === event?.type)?.label}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value as any})}
                >
                  <SelectTrigger data-testid="select-event-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {statusOptions.find(s => s.value === event?.status)?.label}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
              {isEditing ? (
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  data-testid="input-event-date"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event?.date ? new Date(event.date).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="time">Horário</Label>
              {isEditing ? (
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  data-testid="input-event-time"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event?.time} ({formatDuration(event?.duration || 0)})
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              {isEditing ? (
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  data-testid="input-event-duration"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDuration(event?.duration || 0)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="maxAttendees">Capacidade Máxima</Label>
              {isEditing ? (
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({...formData, maxAttendees: parseInt(e.target.value)})}
                  data-testid="input-event-capacity"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event?.attendees || 0}/{event?.maxAttendees} pessoas
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="location">Local</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: Igreja Central - Auditório Principal"
                  data-testid="input-event-location"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event?.location || 'Local não informado'}
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="organizer">Organizador</Label>
              {isEditing ? (
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                  placeholder="Nome do organizador responsável"
                  data-testid="input-event-organizer"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event?.organizer || 'Organizador não informado'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {event && !isEditing && onDelete && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(event.id)}
                data-testid="button-delete-event"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir Evento
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};