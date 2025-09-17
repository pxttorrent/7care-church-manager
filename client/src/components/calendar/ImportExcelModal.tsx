import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ImportExcelModal({ isOpen, onClose, onImportComplete }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('Por favor, selecione um arquivo Excel');
      return;
    }

    setIsLoading(true);
    setMessage('Importando...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/calendar/import-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ${result.message || "Arquivo importado com sucesso!"}`);
        
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('import-success', { 
          detail: { imported: result.imported } 
        }));
        
        setTimeout(() => {
          onImportComplete?.();
          onClose();
        }, 2000);
      } else {
        setMessage(`❌ ${result.error || "Erro ao importar arquivo"}`);
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      setMessage('❌ Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        aria-describedby="import-excel-description"
      >
        <DialogHeader>
          <DialogTitle>Importar Calendário Excel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div id="import-excel-description" className="text-sm text-muted-foreground">
            Selecione um arquivo Excel (.xlsx) com as colunas: Evento, Categoria, Data
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Selecionar arquivo Excel (.xlsx)</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Formato esperado:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Coluna A: Evento</li>
              <li>Coluna B: Categoria (Igreja Local, ASR Geral, ASR Administrativo, ASR Pastores, Visitas, Reuniões, Pregações)</li>
              <li>Coluna C: Data (DD/MM ou DD/MM-DD/MM)</li>
            </ul>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 
              message.includes('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!file || isLoading}>
              {isLoading ? "Importando..." : "Importar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
