import { useState, useEffect, useCallback } from 'react';

export const useSystemLogo = () => {
  const [systemLogo, setSystemLogo] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Função para recarregar logo do banco de dados
  const refreshLogo = useCallback(async () => {
    console.log('🔄 Refreshing logo from database...');
    try {
      const response = await fetch('/api/settings/logo');
      const data = await response.json();
      
      if (data.success && data.logoUrl) {
        const logoWithTimestamp = `${data.logoUrl}?v=${Date.now()}`;
        setSystemLogo(logoWithTimestamp);
        setLogoVersion(Date.now());
        console.log('✅ Logo refreshed from database:', logoWithTimestamp);
        
        // Forçar recarregamento da imagem no DOM
        const imgElements = document.querySelectorAll('img[src*="/uploads/"]');
        imgElements.forEach((img) => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.src.includes('/uploads/')) {
            const currentSrc = imgElement.src;
            imgElement.src = '';
            setTimeout(() => {
              imgElement.src = currentSrc;
            }, 10);
          }
        });
      } else {
        setSystemLogo(null);
        setLogoVersion(0);
        console.log('ℹ️ No logo found in database');
      }
    } catch (error) {
      console.error('❌ Error refreshing logo from database:', error);
      setSystemLogo(null);
      setLogoVersion(0);
    }
  }, []);

  // Função para limpar completamente o sistema de logo
  const clearLogoSystem = useCallback(async () => {
    console.log('🗑️ Clearing system logo from database...');
    try {
      const response = await fetch('/api/settings/logo', {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setSystemLogo(null);
        setLogoVersion(0);
        console.log('✅ System logo cleared from database');
        
        // Forçar recarregamento de todas as imagens para remover logos
        const allImgElements = document.querySelectorAll('img');
        allImgElements.forEach((img) => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.src.includes('/uploads/')) {
            imgElement.src = '';
            setTimeout(() => {
              imgElement.src = imgElement.src;
            }, 10);
          }
        });
      } else {
        console.error('❌ Failed to clear logo from database:', data.message);
      }
    } catch (error) {
      console.error('❌ Error clearing logo from database:', error);
    }
  }, []);

  // Função para atualizar logo localmente (usado quando recebe evento de atualização)
  const updateLogoSystem = useCallback((newLogoUrl: string) => {
    console.log('🔄 Updating system logo locally:', newLogoUrl);
    const newVersion = Date.now();
    setSystemLogo(`${newLogoUrl}?v=${newVersion}`);
    setLogoVersion(newVersion);
    console.log('✅ System logo updated locally');
  }, []);

  useEffect(() => {
    const loadSystemLogo = async () => {
      try {
        console.log('🔍 Loading logo from database...');
        const response = await fetch('/api/settings/logo');
        const data = await response.json();
        
        if (data.success && data.logoUrl) {
          // Verificar se a URL é válida
          if (data.logoUrl.startsWith('/uploads/') || data.logoUrl.startsWith('http')) {
            // Adicionar timestamp para evitar cache
            const logoWithTimestamp = `${data.logoUrl}?v=${Date.now()}`;
            setSystemLogo(logoWithTimestamp);
            setLogoVersion(Date.now());
            console.log('✅ Logo loaded from database:', logoWithTimestamp);
          } else {
            console.log('⚠️ Invalid logo URL from database:', data.logoUrl);
            setSystemLogo(null);
            setLogoVersion(0);
          }
        } else {
          console.log('ℹ️ No logo found in database');
          setSystemLogo(null);
          setLogoVersion(0);
        }
      } catch (error) {
        console.error('❌ Error loading logo from database:', error);
        setSystemLogo(null);
        setLogoVersion(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Carregar logo inicial do banco de dados
    loadSystemLogo();

    // Escutar evento de atualização da logo
    const handleLogoUpdate = (event: CustomEvent) => {
      try {
        console.log('🎨 Logo update event received:', event.detail);
        if (event.detail?.logoUrl) {
          updateLogoSystem(event.detail.logoUrl);
        } else {
          // Logo removida
          setSystemLogo(null);
          setLogoVersion(0);
          console.log('🗑️ Logo removed via event');
        }
      } catch (error) {
        console.error('❌ Erro no handleLogoUpdate:', error);
      }
    };

    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener);
    };
  }, [updateLogoSystem]);

  return { 
    systemLogo, 
    logoVersion, 
    isLoading, 
    refreshLogo, 
    clearLogoSystem, 
    updateLogoSystem 
  };
};