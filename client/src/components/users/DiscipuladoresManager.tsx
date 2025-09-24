import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X, UserPlus, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Discipulador {
  id: number;
  missionaryId: number;
  interestedId: number;
  status: string;
  assignedAt: string;
  notes: string;
  missionaryName: string;
  missionaryEmail: string;
  missionaryPhone: string;
}

interface DiscipuladoresManagerProps {
  interestedId: number;
  currentDiscipuladores: Discipulador[];
  potentialMissionaries: any[];
  onDiscipuladoresChange: (discipuladores: Discipulador[]) => void;
}

export const DiscipuladoresManager: React.FC<DiscipuladoresManagerProps> = React.memo(({
  interestedId,
  currentDiscipuladores,
  potentialMissionaries,
  onDiscipuladoresChange
}) => {
  const [openPopover, setOpenPopover] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const { toast } = useToast();

  // Memoizar a lista de missionários disponíveis para evitar recálculos desnecessários
  const availableMissionaries = useMemo(() => {
    return potentialMissionaries.filter(missionary => 
      !currentDiscipuladores.some(d => d.missionaryId === missionary.id)
    );
  }, [potentialMissionaries, currentDiscipuladores]);

  const handleAddDiscipulador = useCallback(async (missionaryId: number) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionaryId,
          interestedId,
          notes: 'Discipulador adicionado via interface'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar discipulador');
      }

      const newRelationship = await response.json();
      
      // Buscar dados completos do missionário
      const missionary = potentialMissionaries.find(m => m.id === missionaryId);
      const newDiscipulador: Discipulador = {
        id: newRelationship.id,
        missionaryId: newRelationship.missionaryId,
        interestedId: newRelationship.interestedId,
        status: newRelationship.status,
        assignedAt: newRelationship.assignedAt,
        notes: newRelationship.notes,
        missionaryName: missionary?.name || 'Nome não encontrado',
        missionaryEmail: missionary?.email || '',
        missionaryPhone: missionary?.phone || ''
      };

      const updatedDiscipuladores = [...currentDiscipuladores, newDiscipulador];
      onDiscipuladoresChange(updatedDiscipuladores);
      
      toast({
        title: "Discipulador adicionado",
        description: `${missionary?.name} foi adicionado como discipulador.`,
      });

      setOpenPopover(false);
    } catch (error) {
      console.error('Erro ao adicionar discipulador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o discipulador.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  }, [interestedId, currentDiscipuladores, potentialMissionaries, onDiscipuladoresChange, toast]);

  const handleRemoveDiscipulador = useCallback(async (relationshipId: number) => {
    setIsRemoving(relationshipId);
    try {
      const response = await fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover discipulador');
      }

      const updatedDiscipuladores = currentDiscipuladores.filter(d => d.id !== relationshipId);
      onDiscipuladoresChange(updatedDiscipuladores);
      
      toast({
        title: "Discipulador removido",
        description: "O discipulador foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover discipulador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o discipulador.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  }, [currentDiscipuladores, onDiscipuladoresChange, toast]);

  return (
    <div className="space-y-3">
      {/* Título e botão de adicionar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Discipuladores</span>
        </div>
        
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              disabled={isAdding || availableMissionaries.length === 0}
              title="Adicionar discipulador"
            >
              <span className="text-sm font-bold">+</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 z-50" side="bottom" align="end">
            <div className="flex justify-between items-center p-2 border-b">
              <span className="text-sm font-medium">Adicionar Discipulador</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenPopover(false)}
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
            <Command>
              <CommandInput placeholder="Digite o nome do membro..." />
              <CommandList>
                <CommandEmpty>
                  {availableMissionaries.length === 0 
                    ? "Todos os membros já são discipuladores" 
                    : "Nenhum membro encontrado."
                  }
                </CommandEmpty>
                <CommandGroup>
                  {availableMissionaries.map((missionary) => (
                    <CommandItem
                      key={missionary.id}
                      value={missionary.name}
                      onSelect={() => handleAddDiscipulador(missionary.id)}
                      disabled={isAdding}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      <span className="flex-1">{missionary.name}</span>
                      {missionary.status !== 'approved' && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {missionary.status}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Lista de discipuladores atuais */}
      {currentDiscipuladores.length === 0 ? (
        <div className="text-sm text-gray-500 italic">
          Nenhum discipulador atribuído
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {currentDiscipuladores.map((discipulador) => (
            <div
              key={discipulador.id}
              className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-50 border border-blue-200 rounded-sm hover:bg-blue-100 transition-colors"
            >
              <div className="w-0.5 h-0.5 bg-blue-500 rounded-full"></div>
              <span className="text-[10px] font-medium text-blue-800" title={discipulador.missionaryName}>
                {discipulador.missionaryName.split(' ')[0]}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-3 w-3 p-0 hover:bg-blue-200 hover:text-blue-800"
                onClick={() => handleRemoveDiscipulador(discipulador.id)}
                disabled={isRemoving === discipulador.id}
                title="Remover discipulador"
              >
                {isRemoving === discipulador.id ? (
                  <div className="animate-spin rounded-full h-1.5 w-1.5 border-b-2 border-current" />
                ) : (
                  <X className="h-1.5 w-1.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

DiscipuladoresManager.displayName = 'DiscipuladoresManager';
