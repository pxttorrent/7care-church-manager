# 📊 Mapeamento Completo do Excel para o Banco de Dados

## 📋 Estrutura do Arquivo Excel

**Arquivo:** `data 131025.xlsx`
**Total de colunas:** 75
**Total de linhas:** 329

---

## 🎯 Mapeamento por Categoria

### 1. IDENTIFICAÇÃO (Colunas Diretas do Banco)

| Excel | Banco | Tipo | Observação |
|-------|-------|------|------------|
| `Nome` | `name` | TEXT | Obrigatório |
| `Email` | `email` | TEXT | Obrigatório, gera automático se vazio |
| `Código` | `church_code` | TEXT | Código do membro |
| `Tipo` | `role` | TEXT | Interessado/Membro/Pastor → interested/member/pastor |
| `Igreja` | `church` | TEXT | Nome da igreja |

### 2. DADOS PESSOAIS (Colunas Diretas do Banco)

| Excel | Banco | Tipo | Observação |
|-------|-------|------|------------|
| `Sexo` | `extra_data.sexo` | TEXT | Masculino/Feminino |
| `Idade` | `extra_data.idade` | INTEGER | Calculado |
| `Nascimento` | `birth_date` | DATE | Serial Excel → converter |
| `Estado civil` | `civil_status` | TEXT | |
| `Ocupação` | `occupation` | TEXT | |
| `Grau de educação` | `education` | TEXT | |
| `Celular` | `phone` | TEXT | Formatar para (XX) XXXXX-XXXX |
| `CPF` | `extra_data.cpf` | TEXT | |

### 3. ENDEREÇO (Extra Data)

| Excel | Banco | Tipo |
|-------|-------|------|
| `Endereço` | `address` | TEXT |
| `Bairro` | `extra_data.bairro` | TEXT |
| `Cidade e Estado` | `extra_data.cidadeEstado` | TEXT |
| `Cidade de nascimento` | `extra_data.cidadeNascimento` | TEXT |
| `Estado de nascimento` | `extra_data.estadoNascimento` | TEXT |

### 4. **CAMPOS DE PONTUAÇÃO** (⭐ COLUNAS DIRETAS - CRÍTICO)

| Excel | Banco | Tipo | Valores | Pontuação |
|-------|-------|------|---------|-----------|
| `Engajamento` | `engajamento` | TEXT | Alto/Médio/Baixo/Não Membro | 300/200/100/0 |
| `Classificação` | `classificacao` | TEXT | Frequente/Não Frequente/A resgatar/A transferir/Sem informação | 200/50/0/0/0 |
| `Dizimista` | `dizimista_type` | TEXT | Recorrente (8-12)/Sazonal (4-7)/Pontual (1-3)/Não Dizimista | 300/200/100/0 |
| `Ofertante` | `ofertante_type` | TEXT | Recorrente (8-12)/Sazonal (4-7)/Pontual (1-3)/Não Ofertante | 200/150/75/0 |
| `Tempo de batismo - anos` | `tempo_batismo_anos` | INTEGER | Número de anos | 10 pontos/ano |
| `Departamentos e cargos` | `departamentos_cargos` | TEXT | Lista separada por ";" | 100/depto |
| `Nome da unidade` | `nome_unidade` | TEXT | Nome do grupo pequeno | 150 |
| `Tem lição` | `tem_licao` | BOOLEAN | Sim/Não → true/false | 50 |
| `Total de presença` | `total_presenca` | INTEGER | 0-13 | variável |
| `Comunhão` | `comunhao` | INTEGER | 0-13 | 20 pontos cada |
| `Missão` | `missao` | INTEGER | 0-13 | 30 pontos cada |
| `Estudo bíblico` | `estudo_biblico` | INTEGER | 0-13 | 25 pontos cada |
| `Batizou alguém` | `batizou_alguem` | BOOLEAN/INTEGER | Número ou Sim/Não | 200 cada |
| `Disc. pós batismal` | `disc_pos_batismal` | INTEGER | Quantidade | 150 cada |
| `CPF válido` | `cpf_valido` | BOOLEAN | Sim/Não | 25 |
| `Campos vazios/inválidos` | `campos_vazios` | BOOLEAN | Número → 0=false, >0=true | -50 |

### 5. DADOS FINANCEIROS (Extra Data)

| Excel | Banco | Tipo |
|-------|-------|------|
| `Dízimos - 12m` | `extra_data.dizimos12m` | INTEGER |
| `Último dízimo - 12m` | `extra_data.ultimoDizimo` | DATE |
| `Valor dízimo - 12m` | `extra_data.valorDizimo` | DECIMAL |
| `Número de meses s/ dizimar` | `extra_data.numeroMesesSemDizimar` | INTEGER |
| `Dizimista antes do últ. dízimo` | `extra_data.dizimistaAntesUltimoDizimo` | TEXT |
| `Ofertas - 12m` | `extra_data.ofertas12m` | INTEGER |
| `Última oferta - 12m` | `extra_data.ultimaOferta` | DATE |
| `Valor oferta - 12m` | `extra_data.valorOferta` | DECIMAL |
| `Número de meses s/ ofertar` | `extra_data.numeroMesesSemOfertar` | INTEGER |
| `Ofertante antes da últ. oferta` | `extra_data.ofertanteAntesUltimaOferta` | TEXT |

### 6. BATISMO E ENTRADA (Extra Data + Colunas Diretas)

| Excel | Banco | Tipo | Observação |
|-------|-------|------|------------|
| `Batismo` | `baptism_date` | DATE | Serial Excel → converter |
| `Tempo de batismo` | `extra_data.tempoBatismo` | TEXT | "Sem informação" ou texto |
| `Localidade do batismo` | `extra_data.localidadeBatismo` | TEXT | |
| `Batizado por` | `extra_data.batizadoPor` | TEXT | |
| `Idade no Batismo` | `extra_data.idadeBatismo` | INTEGER | |
| `Tipo de entrada` | `extra_data.tipoEntrada` | TEXT | Rebatismo/Profissão de fé |
| `Último movimento` | `extra_data.ultimoMovimento` | TEXT | Remoção/Apostasia |
| `Data do último movimento` | `extra_data.dataUltimoMovimento` | DATE | |

### 7. CONVERSÃO E INSTRUÇÃO (Extra Data)

| Excel | Banco |
|-------|-------|
| `Religião anterior` | `previous_religion` |
| `Como conheceu a IASD` | `extra_data.comoConheceu` |
| `Fator decisivo` | `extra_data.fatorDecisivo` |
| `Como estudou a Bíblia` | `extra_data.comoEstudou` |
| `Instrutor bíblico` | `biblical_instructor` |
| `Instrutor bíblico 2` | `extra_data.instrutorBiblico2` |

### 8. CARGOS E DEPARTAMENTOS (Extra Data)

| Excel | Banco |
|-------|-------|
| `Tem cargo` | `extra_data.temCargo` |
| `Teen` | `extra_data.teen` |

### 9. FAMÍLIA (Extra Data)

| Excel | Banco |
|-------|-------|
| `Nome da mãe` | `extra_data.nomeMae` |
| `Nome do pai` | `extra_data.nomePai` |
| `Data de casamento` | `extra_data.dataCasamento` |

### 10. ESCOLA SABATINA (Extra Data)

| Excel | Banco |
|-------|-------|
| `Matriculado na ES` | `extra_data.matriculadoES` |

### 11. PRESENÇA DETALHADA (Extra Data)

| Excel | Banco |
|-------|-------|
| `Total presença no cartão` | `extra_data.presencaCartao` |
| `Presença no quiz local` | `extra_data.presencaQuizLocal` |
| `Presença no quiz outra unidade` | `extra_data.presencaQuizOutra` |
| `Presença no quiz online` | `extra_data.presencaQuizOnline` |

### 12. COLABORADOR (Extra Data)

| Excel | Banco |
|-------|-------|
| `Teve participação` | `extra_data.teveParticipacao` |
| `Campo - colaborador` | `extra_data.campoColaborador` |
| `Área - colaborador` | `extra_data.areaColaborador` |
| `Estabelecimento - colaborador` | `extra_data.estabelecimentoColaborador` |
| `Função - colaborador` | `extra_data.funcaoColaborador` |

### 13. EDUCAÇÃO ADVENTISTA (Extra Data)

| Excel | Banco |
|-------|-------|
| `Aluno educação Adv.` | `extra_data.alunoEducacaoAdv` |
| `Parentesco p/ c/ aluno` | `extra_data.parentescoAluno` |

### 14. CAMPOS VAZIOS (Extra Data)

| Excel | Banco |
|-------|-------|
| `Nome dos campos vazios no ACMS` | `extra_data.camposVaziosLista` |

---

## 🔧 Funções de Conversão Necessárias

### 1. `parseExcelDate(value)`
Converte números seriais do Excel para datas:
```typescript
// Excel: 25688 → Data: 1970-04-25
// Excel: 43179 → Data: 2018-03-04
const parseExcelDate = (value) => {
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  return value;
};
```

### 2. `parseEngajamento(value)`
Normaliza valores de engajamento:
```typescript
// "Não Membro" → "Não Membro" (manter)
// "Alto" → "Alto"
// "Médio" → "Médio"
// "Baixo" → "Baixo"
```

### 3. `parseClassificacao(value)`
Normaliza valores de classificação:
```typescript
// "Frequente" → "Frequente"
// "Não frequente" → "Não Frequente"
// "A resgatar" → "A Resgatar"
// "A transferir" → "A Transferir"
// "Sem informação" → null
```

### 4. `parseDizimista(value)`
Extrai tipo e isDonor:
```typescript
{
  isDonor: true/false,
  dizimistaType: "Recorrente (8-12)" | "Sazonal (4-7)" | "Pontual (1-3)" | "Não Dizimista"
}
```

### 5. `parseOfertante(value)`
Extrai tipo e isOffering:
```typescript
{
  isOffering: true/false,
  ofertanteType: "Recorrente (8-12)" | "Sazonal (4-7)" | "Pontual (1-3)" | "Não Ofertante"
}
```

### 6. `parseTempoBatismoAnos(batismoDate, tempoTexto)`
Calcula anos de batismo:
```typescript
// Se "Tempo de batismo - anos" existe: usar
// Senão, calcular de "Batismo" (data)
// Formato: Data atual - Data batismo = Anos
```

### 7. `parseBooleanOrNumber(value)`
Converte valores mistos:
```typescript
// "Sim" → true
// "Não" → false
// 0 → false
// 1 ou maior → true (para "Batizou alguém")
```

### 8. `parseCamposVazios(value)`
Converte contador para boolean:
```typescript
// 0 → false (sem campos vazios)
// 1 ou mais → true (tem campos vazios)
```

---

## ⚠️ Campos Problemáticos Identificados

### 1. **Engajamento com "Não Membro"**
- Excel tem valores: "Alto", "Médio", "Baixo", "Não Membro"
- Banco espera: "Alto", "Médio", "Baixo" (ou null)
- **Solução:** Manter "Não Membro" como valor válido e adicionar pontuação 0

### 2. **Classificação com valores extras**
- Excel tem: "A resgatar", "A transferir", "Sem informação"
- Banco espera: "Frequente", "Não Frequente"
- **Solução:** Mapear "Sem informação" → null, manter outros

### 3. **"Batizou alguém" como número**
- Excel tem: 0, 1, 2, 3, 4, 6, 7 (quantidade)
- Banco espera: boolean
- **Solução:** Converter >0 → true, armazenar quantidade em extra_data

### 4. **"Tempo de batismo" vs "Tempo de batismo - anos"**
- "Tempo de batismo": texto ("Sem informação")
- Não existe coluna "Tempo de batismo - anos" no Excel!
- **Solução:** Calcular anos a partir da coluna "Batismo" (data)

### 5. **Email vazio**
- Muitos registros sem email
- **Solução:** Gerar email: `nome.sobrenome@igreja.com`

---

## 🎯 Prioridades de Correção

### ✅ Alta Prioridade (Afeta Pontuação)
1. ⭐ **Engajamento** - manter "Não Membro"
2. ⭐ **Classificação** - mapear todos os valores
3. ⭐ **Tempo de batismo** - calcular a partir da data
4. ⭐ **Batizou alguém** - converter quantidade para boolean+extra

### ✅ Média Prioridade
5. Datas seriais do Excel
6. Email automático
7. Telefone formatado

### ✅ Baixa Prioridade
8. Campos de extra_data completos
9. Validações adicionais

---

## 📊 Resultado Esperado

Após importação correta:

```
✅ 329 usuários importados
✅ Engajamento: 300+ preenchidos (incluindo "Não Membro")
✅ Classificação: 300+ preenchidos
✅ Dizimista: 300+ preenchidos
✅ Tempo batismo: calculado automaticamente
✅ Todos os 75 campos mapeados
✅ Pontuação: 300+ usuários com pontos > 0
```

---

**Documentação completa do mapeamento Excel → Banco de Dados**

