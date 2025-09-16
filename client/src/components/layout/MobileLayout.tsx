import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const MobileLayout = ({ children, showBottomNav = true }: MobileLayoutProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('🔍 MobileLayout - Estado:', { isAuthenticated, isLoading, userRole: user?.role });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />
      <main className="flex-1 overflow-auto pb-24">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};