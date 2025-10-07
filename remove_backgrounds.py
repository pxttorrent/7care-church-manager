#!/usr/bin/env python3
"""
Script para remover fundos brancos/claros dos ícones dos montes
"""

import os
import sys
from PIL import Image
import numpy as np

def remove_white_background(image, threshold=240):
    """
    Remove fundo branco/claro de uma imagem
    threshold: valor de 0-255, acima disso é considerado fundo
    """
    # Converter para RGBA se não for
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Converter para array numpy
    data = np.array(image)
    
    # Encontrar pixels que são fundo (branco/claro)
    # Consideramos fundo se R, G, B são todos altos
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Máscara para pixels que são fundo
    background_mask = (r > threshold) & (g > threshold) & (b > threshold)
    
    # Tornar fundo transparente
    data[background_mask] = [0, 0, 0, 0]
    
    return Image.fromarray(data, 'RGBA')

def process_mountain_icons():
    """Processa todos os ícones dos montes"""
    assets_dir = "/Users/filipevitolapeixoto/Downloads/7care.1609.25.1/client/src/assets"
    
    print("🎨 Removendo fundos dos ícones dos montes...")
    
    # Criar backup
    backup_dir = os.path.join(assets_dir, "backup")
    os.makedirs(backup_dir, exist_ok=True)
    
    for i in range(1, 10):
        input_path = os.path.join(assets_dir, f"mountain-{i}.png")
        
        if not os.path.exists(input_path):
            print(f"⚠️  Arquivo não encontrado: {input_path}")
            continue
            
        print(f"🔄 Processando mountain-{i}.png...")
        
        try:
            # Carregar imagem
            image = Image.open(input_path)
            
            # Remover fundo
            cleaned_image = remove_white_background(image, threshold=240)
            
            # Salvar backup do original
            backup_path = os.path.join(backup_dir, f"mountain-{i}.png")
            image.save(backup_path)
            
            # Salvar versão limpa (substituir original)
            cleaned_image.save(input_path)
            
            print(f"✅ Processado: mountain-{i}.png")
            
        except Exception as e:
            print(f"❌ Erro ao processar mountain-{i}.png: {e}")
    
    print("🎉 Processamento concluído!")
    print(f"📁 Originais salvos em: {backup_dir}")
    print("🆕 Fundos removidos dos ícones!")

if __name__ == "__main__":
    process_mountain_icons()

