import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageCircle, Lock, Users, HelpCircle } from 'lucide-react';

interface SpiritualCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpiritualState {
  score: number;
  prayerRequest?: string;
  isPrivate: boolean;
  allowChurchMembers: boolean;
}

interface SpiritualLevel {
  score: number;
  emoji: string;
  label: string;
  verse: string;
  reference: string;
  description: string;
}

const spiritualLevels: SpiritualLevel[] = [
  {
    score: 1,
    emoji: '🍃',
    label: 'Distante',
    verse: 'Tenho, porém, contra ti que deixaste o teu primeiro amor.',
    reference: 'Apocalipse 2:4',
    description: 'Quase não oro, minha Bíblia está fechada, e percebo que outras coisas têm ocupado o lugar de Deus na minha vida.'
  },
  {
    score: 2,
    emoji: '🔍',
    label: 'Buscando',
    verse: 'Buscai ao Senhor enquanto se pode achar, invocai-o enquanto está perto.',
    reference: 'Isaías 55:6',
    description: 'Sinto falta de Deus, faço algumas orações rápidas, ouço mensagens e até abro a Bíblia, mas ainda sem constância.'
  },
  {
    score: 3,
    emoji: '🌱',
    label: 'Enraizando',
    verse: 'Antes, tem o seu prazer na lei do Senhor, e na sua lei medita de dia e de noite.',
    reference: 'Salmo 1:2',
    description: 'Já leio a Bíblia com mais frequência, encontro respostas, começo a praticar e percebo mudanças no meu coração.'
  },
  {
    score: 4,
    emoji: '🌳',
    label: 'Frutificando',
    verse: 'Eu sou a videira, vós as varas; quem permanece em mim, e eu nele, esse dá muito fruto.',
    reference: 'João 15:5',
    description: 'Minha fé começa a transbordar em atitudes, ajudo pessoas, testemunho de Cristo e inspiro outros a segui-lo.'
  },
  {
    score: 5,
    emoji: '✨',
    label: 'Intimidade',
    verse: 'E andou Enoque com Deus; e já não apareceu, porquanto Deus para si o tomou.',
    reference: 'Gênesis 5:24',
    description: 'Vivo em comunhão diária com Deus, oro constantemente, ouço Sua voz e procuro andar em plena sintonia com Ele.'
  }
];

export const SpiritualCheckInModal = ({ isOpen, onClose }: SpiritualCheckInModalProps) => {
  const { user } = useAuth();
  const [spiritualState, setSpiritualState] = useState<SpiritualState>({
    score: 0,
    prayerRequest: '',
    isPrivate: false,
    allowChurchMembers: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const { toast } = useToast();

  const handleScoreSelect = (score: number) => {
    setSpiritualState(prev => ({ ...prev, score }));
  };

  // Toggle explanation panel
  const toggleLevelExplanation = (score: number) => {
    setExpandedLevel(expandedLevel === score ? null : score);
  };

  // Auto-close explanation panel after 5 seconds
  useEffect(() => {
    if (expandedLevel !== null) {
      const timer = setTimeout(() => {
        setExpandedLevel(null);
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [expandedLevel]);

  const handleSubmit = async () => {
    if (spiritualState.score === 0) {
      toast({
        title: "Selecione como está espiritualmente",
        description: "Por favor, escolha uma situação espiritual de 1 a 5 para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/emotional-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          score: spiritualState.score,
          prayerRequest: spiritualState.prayerRequest,
          isPrivate: spiritualState.isPrivate,
          allowChurchMembers: spiritualState.allowChurchMembers,
        }),
      });

      if (response.ok) {
        toast({
          title: "Check-in espiritual enviado!",
          description: "Obrigado por compartilhar sua situação espiritual conosco.",
        });
        onClose();
        setSpiritualState({
          score: 0,
          prayerRequest: '',
          isPrivate: false,
          allowChurchMembers: false
        });
        setExpandedLevel(null);
      } else {
        throw new Error('Erro ao enviar check-in');
      }
    } catch (error) {
      console.error('Erro ao enviar check-in espiritual:', error);
      toast({
        title: "Erro ao enviar check-in",
        description: "Não foi possível enviar seu check-in espiritual. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Heart className="h-5 w-5 text-red-500" />
            Como está sua vida espiritual hoje?
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Compartilhe sua situação espiritual e, se desejar, um pedido de oração
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Spiritual Score Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Selecione sua situação espiritual:</Label>
            <div className="grid grid-cols-5 gap-2">
              {spiritualLevels.map((level) => (
                <div key={level.score} className="relative">
                  <button
                    onClick={() => handleScoreSelect(level.score)}
                    className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center justify-center ${
                      spiritualState.score === level.score
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{level.emoji}</div>
                    <div className="text-xs text-gray-600 text-center leading-tight">{level.label}</div>
                  </button>
                  
                  {/* Help Icon */}
                  <button
                    onClick={() => toggleLevelExplanation(level.score)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                    title="Clique para ver explicação"
                  >
                    ?
                  </button>
                  
                  {/* Explanation Panel */}
                  {expandedLevel === level.score && (
                    <div className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <div className="text-2xl">{level.emoji}</div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900">
                              Nível {level.score} – {level.label}
                            </h4>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {level.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prayer Request */}
          <div className="space-y-3">
            <Label htmlFor="prayerRequest" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Pedido de Oração (opcional)
            </Label>
            <Textarea
              id="prayerRequest"
              placeholder="Compartilhe seu pedido de oração ou agradecimento..."
              value={spiritualState.prayerRequest}
              onChange={(e) => setSpiritualState(prev => ({ 
                ...prev, 
                prayerRequest: e.target.value 
              }))}
              rows={3}
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Configurações de privacidade:</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrivate"
                checked={spiritualState.isPrivate}
                onCheckedChange={(checked) => setSpiritualState(prev => ({ 
                  ...prev, 
                  isPrivate: checked as boolean 
                }))}
              />
              <Label htmlFor="isPrivate" className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4" />
                Apenas o pastor verá meus motivos de oração
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowChurchMembers"
                checked={spiritualState.allowChurchMembers}
                onCheckedChange={(checked) => setSpiritualState(prev => ({ 
                  ...prev, 
                  allowChurchMembers: checked as boolean 
                }))}
                disabled={spiritualState.isPrivate}
              />
              <Label htmlFor="allowChurchMembers" className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Permitir que membros da igreja vejam meu pedido
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || spiritualState.score === 0}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Check-in Espiritual'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
