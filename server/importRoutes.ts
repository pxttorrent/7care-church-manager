import { sql } from './neonConfig';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export const importRoutes = (app: any) => {
  // Novo endpoint de importação simplificado
  app.post("/api/calendar/import-simple", upload.single('file'), async (req: any, res: any) => {
    try {
      console.log("📊 Importação simplificada iniciada");
      
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log(`✅ Arquivo recebido: ${req.file.originalname}`);
      
      // Verificar se é arquivo XLSX
      if (!req.file.originalname.endsWith('.xlsx')) {
        return res.status(400).json({ 
          error: "Apenas arquivos .xlsx são aceitos. Por favor, converta seu arquivo para formato Excel (.xlsx)." 
        });
      }

      // Processar arquivo Excel
      let data = [];
      const filePath = req.file.path;
      
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
      
      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Nenhum dado encontrado no arquivo" });
      }

      let importedCount = 0;
      const errors = [];

      // Mapeamento de categorias - apenas as 7 categorias especificadas
      const categoryMapping = {
        'igreja local': 'igreja-local',
        'igreja-local': 'igreja-local',
        'asr geral': 'asr-geral',
        'asr-geral': 'asr-geral',
        'asr administrativo': 'asr-administrativo',
        'asr-administrativo': 'asr-administrativo',
        'asr pastores': 'asr-pastores',
        'asr-pastores': 'asr-pastores',
        'visitas': 'visitas',
        'reunioes': 'reunioes',
        'reuniões': 'reunioes',
        'pregações': 'pregacoes',
        'pregações': 'pregacoes',
        'pregacoes': 'pregacoes'
      };

      // Processar cada linha
      for (let i = 0; i < data.length; i++) {
        try {
          const event = data[i];
          
          if (!event.Evento || !event.Data) {
            errors.push(`Linha ${i + 1}: campos obrigatórios ausentes`);
            continue;
          }

          const eventTitle = event.Evento.trim();
          const dateString = event.Data.trim();
          const category = event.Categoria ? event.Categoria.trim().toLowerCase() : 'reunioes';
          const mappedType = categoryMapping[category] || 'reunioes';
          
          // Processar data
          let startDate = '';
          let endDate = '';
          
          if (dateString.includes('-')) {
            // Evento de múltiplos dias
            const [startPart, endPart] = dateString.split('-');
            const currentYear = new Date().getFullYear();
            
            // Processar data de início
            const [startDay, startMonth] = startPart.trim().split('/');
            startDate = `${currentYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
            
            // Processar data de fim
            const [endDay, endMonth] = endPart.trim().split('/');
            endDate = `${currentYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
            
            console.log(`📅 Evento de múltiplos dias: ${eventTitle} (${startDate} até ${endDate})`);
          } else {
            // Evento de um dia
            const [day, month] = dateString.split('/');
            const currentYear = new Date().getFullYear();
            startDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }

          // Criar evento usando SQL direto
          let result;
          if (endDate) {
            // Evento de múltiplos dias - criar múltiplos eventos para cada dia
            const start = new Date(startDate + 'T00:00:00Z');
            const end = new Date(endDate + 'T23:59:59Z');
            const days = [];
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              const dayDate = d.toISOString().split('T')[0];
              const isStart = dayDate === startDate;
              const isEnd = dayDate === endDate;
              
              let eventTitleForDay = eventTitle;
              if (isStart) eventTitleForDay = `${eventTitle} (Início)`;
              else if (isEnd) eventTitleForDay = `${eventTitle} (Fim)`;
              else eventTitleForDay = `${eventTitle} (Continua)`;
              
              const dayResult = await sql`
                INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
                VALUES (${eventTitleForDay}, ${`Evento importado: ${eventTitle}`}, ${dayDate + 'T19:00:00Z'}, ${''}, ${mappedType}, ${0}, ${false}, ${null}, ${1}, ${24}, ${new Date().toISOString()}, ${new Date().toISOString()})
                RETURNING id, title, date
              `;
              
              days.push(dayResult[0]);
            }
            
            result = days;
            console.log(`✅ Evento de múltiplos dias criado: ${eventTitle} (${days.length} dias)`);
          } else {
            // Evento de um dia
            result = await sql`
              INSERT INTO events (title, description, date, location, type, capacity, is_recurring, recurrence_pattern, created_by, church_id, created_at, updated_at)
              VALUES (${eventTitle}, ${`Evento importado: ${eventTitle}`}, ${startDate + 'T19:00:00Z'}, ${''}, ${mappedType}, ${0}, ${false}, ${null}, ${1}, ${24}, ${new Date().toISOString()}, ${new Date().toISOString()})
              RETURNING id, title, date
            `;
          }
          
          if (Array.isArray(result)) {
            console.log(`✅ Evento de múltiplos dias inserido: ${eventTitle} (${result.length} dias)`);
            importedCount += result.length;
          } else {
            console.log(`✅ Evento inserido: ${eventTitle} (ID: ${result[0].id})`);
            importedCount++;
          }
          
        } catch (error) {
          console.error(`❌ Erro na linha ${i + 1}: ${error.message}`);
          errors.push(`Linha ${i + 1}: ${error.message}`);
        }
      }

      // Limpar arquivo temporário
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        imported: importedCount,
        errors: errors
      });

    } catch (error) {
      console.error("❌ Erro na importação:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
};
