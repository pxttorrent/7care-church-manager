import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Download, Smartphone } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const { isInstallable, isInstalled, installApp, getInstallInstructions } = usePWAInstall();
  
  const installInstructions = getInstallInstructions();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check for first access and tutorial completion
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    const tutorialSkipped = localStorage.getItem('tutorial_skipped');
    
    if (!tutorialCompleted && !tutorialSkipped) {
      return <Navigate to="/first-access" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative">
      {/* PWA Install Notification */}
      {!isInstalled && showInstallPrompt && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <Alert className="bg-white/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <Smartphone className="h-4 w-4" />
            <AlertDescription className="pr-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-primary mb-2">
                    📱 Instale o 7Care Plus no seu celular!
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">Como instalar ({installInstructions.platform}):</p>
                    {installInstructions.steps.map((step, index) => (
                      <p key={index} className="text-xs">{step}</p>
                    ))}
                  </div>
                  {isInstallable && (
                    <Button 
                      onClick={handleInstall}
                      size="sm" 
                      className="mt-2 bg-primary hover:bg-primary-dark text-white"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Instalar App
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  onClick={() => setShowInstallPrompt(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-glow">
              <img src={logo} alt="7Care Plus" className="w-12 h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              7Care Plus
            </h1>
            <p className="text-white/90 text-lg">
              Sistema de Gestão Eclesiástica
            </p>
            <p className="text-white/70 text-sm">
              Conectando corações, fortalecendo a fé
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="space-y-4">
          {isRegistering ? <RegisterForm /> : <LoginForm />}
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {isRegistering 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem conta? Cadastre-se'
              }
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/60 text-sm">
          <p>© 2024 7Care Plus. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};