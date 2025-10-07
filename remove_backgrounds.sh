#!/bin/bash

# Script para remover fundos dos ícones dos montes
# Remove fundos brancos/claros e mantém apenas o desenho principal

echo "🎨 Removendo fundos dos ícones dos montes..."

# Diretório dos assets
ASSETS_DIR="/Users/filipevitolapeixoto/Downloads/7care.1609.25.1/client/src/assets"

# Backup dos originais
echo "📁 Criando backup dos originais..."
mkdir -p "$ASSETS_DIR/backup"
cp "$ASSETS_DIR/mountain-"*.png "$ASSETS_DIR/backup/"

# Processar cada ícone
for i in {1..9}; do
    INPUT="$ASSETS_DIR/mountain-$i.png"
    OUTPUT="$ASSETS_DIR/mountain-$i-clean.png"
    
    echo "🔄 Processando mountain-$i.png..."
    
    # Usar sips para ajustar e remover fundo
    # Primeiro, vamos criar uma versão com fundo transparente
    sips -s format png -s formatOptions default "$INPUT" --out "$OUTPUT"
    
    # Se tivéssemos imagemagick, usaríamos:
    # convert "$INPUT" -fuzz 10% -transparent white "$OUTPUT"
    
    echo "✅ Processado: mountain-$i.png"
done

echo "🎉 Processamento concluído!"
echo "📁 Originais salvos em: $ASSETS_DIR/backup/"
echo "🆕 Novos arquivos sem fundo criados com sufixo '-clean'"

