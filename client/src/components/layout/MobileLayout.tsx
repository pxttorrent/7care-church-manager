import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const MobileLayout = ({ children, showBottomNav = true }: MobileLayoutProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('🔍 MobileLayout - Estado:', { isAuthenticated, isLoading, userRole: user?.role });

  // Pull to Refresh
  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: async () => {
      // Recarregar a página atual
      window.location.reload();
    },
    threshold: 80,
    enabled: true
  });

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
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col">
      {/* Indicador de Pull to Refresh */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center transition-all duration-200"
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance - 50 : -50}px)`,
          opacity: pullDistance > 0 ? Math.min(pullDistance / 80, 1) : 0
        }}
      >
        <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
          <RefreshCw 
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${progress * 3.6}deg)`
            }}
          />
        </div>
      </div>

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