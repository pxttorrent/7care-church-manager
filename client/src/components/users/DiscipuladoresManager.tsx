import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiscipuladoresManagerProps {
  interestedId: number;
  interestedChurch: string;
  currentDiscipuladores: any[];
  onDiscipuladoresChange: (discipuladores: any[]) => void;
}

export function DiscipuladoresManager({ 
  interestedId,
  interestedChurch,
  currentDiscipuladores, 
  onDiscipuladoresChange 
}: DiscipuladoresManagerProps) {
  const [potentialMissionaries, setPotentialMissionaries] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const { toast } = useToast();

  // Carregar membros disponíveis
  useEffect(() => {
    loadPotentialMissionaries();
  }, []);

  const loadPotentialMissionaries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }
      
      const users = await response.json();
      
      // Filtrar apenas membros/missionários da MESMA IGREJA que não são discipuladores atuais
      const currentIds = currentDiscipuladores.map(d => d.id);
      const members = users.filter((user: any) => 
        (user.role.includes('member') || user.role.includes('missionary')) && 
        !currentIds.includes(user.id) &&
        user.church === interestedChurch // Apenas membros da mesma igreja
      );
      
      setPotentialMissionaries(members);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de membros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiscipulador = useCallback(async (missionaryId: number) => {
    setIsAdding(true);
    try {
      console.log('🔍 Adicionando discipulador via API...');
      
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interestedId,
          missionaryId,
          status: 'active'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar discipulador');
      }

      const newRelationship = await response.json();
      
      // Atualizar lista local
      const newDiscipulador = potentialMissionaries.find(m => m.id === missionaryId);
      if (newDiscipulador) {
        const updatedDiscipuladores = [
          ...currentDiscipuladores,
          {
            id: missionaryId,
            name: newDiscipulador.name,
            relationshipId: newRelationship.id
          }
        ];
        onDiscipuladoresChange(updatedDiscipuladores);
        
        // Atualizar lista de disponíveis
        setPotentialMissionaries(prev => 
          prev.filter(m => m.id !== missionaryId)
        );
      }

      toast({
        title: "Sucesso",
        description: "Discipulador adicionado com sucesso",
      });

      setShowAddModal(false);
    } catch (error) {
      console.error('Erro ao adicionar discipulador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o discipulador",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  }, [interestedId, potentialMissionaries, currentDiscipuladores, onDiscipuladoresChange, toast]);

  const handleRemoveDiscipulador = useCallback(async (relationshipId: number) => {
    setIsRemoving(relationshipId);
    try {
      const response = await fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover discipulador');
      }

      // Atualizar lista local
      const updatedDiscipuladores = currentDiscipuladores.filter(
        d => d.relationshipId !== relationshipId
      );
      onDiscipuladoresChange(updatedDiscipuladores);

      toast({
        title: "Sucesso",
        description: "Discipulador removido com sucesso",
      });

      // Recarregar lista de disponíveis
      loadPotentialMissionaries();
    } catch (error) {
      console.error('Erro ao remover discipulador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o discipulador",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  }, [currentDiscipuladores, onDiscipuladoresChange, toast]);

  if (currentDiscipuladores.length === 0) {
    return (
      <div className="flex items-center justify-start py-2">
        <span className="text-sm text-gray-500">Nenhum discipulador atribuído</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 justify-start">
        {currentDiscipuladores.map((discipulador) => (
          <Badge
            key={discipulador.id}
            variant="secondary"
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
          >
            {discipulador.name}
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0 ml-1 hover:bg-blue-100"
              onClick={() => handleRemoveDiscipulador(discipulador.relationshipId)}
              disabled={isRemoving === discipulador.relationshipId}
            >
              {isRemoving === discipulador.relationshipId ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </Button>
          </Badge>
        ))}
      </div>
      

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="w-[95vw] max-w-[840px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle>Adicionar Discipulador</DialogTitle>
              <DialogDescription>
                Selecione um membro da igreja <strong>{interestedChurch}</strong> para ser o discipulador deste interessado.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 min-h-0 px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando membros...</span>
              </div>
            ) : (
              <Command className="h-full">
                <CommandInput 
                  placeholder="Buscar membros..." 
                  id="search-members"
                  name="search-members"
                  className="border-0 focus:ring-0"
                />
                <CommandList className="max-h-[350px] overflow-auto">
                  <CommandEmpty>Nenhum membro disponível.</CommandEmpty>
                  <CommandGroup>
                    {potentialMissionaries.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.name}
                        onSelect={() => handleAddDiscipulador(member.id)}
                        disabled={isAdding}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="font-medium truncate text-sm">{member.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {member.email}
                              {member.church && <span className="ml-2 text-blue-600">• {member.church}</span>}
                            </div>
                          </div>
                        </div>
                        {isAdding && (
                          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 ml-2" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>

          <div className="p-6 pt-0">
            <DialogFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
