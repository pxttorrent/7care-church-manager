#!/bin/bash

# Script para testar importação do Google Sheets

echo "🧪 TESTANDO IMPORTAÇÃO GOOGLE SHEETS"
echo "======================================"
echo ""

# URL do spreadsheet (você precisa ter configurado em Settings)
# Vamos tentar com a planilha hardcoded que vimos no código
SPREADSHEET_ID="1i-x-0KiciwACRztoKX-YHlXT4FsrAzaKwuH-hHkD8go"
CSV_URL="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0"
SPREADSHEET_URL="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}"

echo "1️⃣ Testando acesso ao CSV do Google Sheets..."
echo "URL: $CSV_URL"
echo ""

# Testar se consegue acessar o CSV
curl -s -I "$CSV_URL" | head -5
echo ""

echo "2️⃣ Testando endpoint de importação..."
echo ""

# Testar importação
curl -X POST "https://7care.netlify.app/api/tasks/sync-google-drive" \
  -H "Content-Type: application/json" \
  -d "{\"csvUrl\":\"$CSV_URL\",\"spreadsheetUrl\":\"$SPREADSHEET_URL\"}" \
  | jq '.' || cat

echo ""
echo ""
echo "3️⃣ Verificando se tarefas foram importadas..."
echo ""

# Buscar tarefas novamente
curl -s -X GET "https://7care.netlify.app/api/tasks" \
  -H "x-user-id: 1" \
  | jq '.tasks | length' || echo "Erro ao parsear JSON"

echo ""

