import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Login } from "./pages/Login";
import { MobileLayout } from "./components/layout/MobileLayout";
import { FirstAccessWelcome } from "./components/auth/FirstAccessWelcome";
import { createQueryClient, setupPerformanceListeners, prefetchImportantData } from "./lib/queryClient";
import { cleanConsoleInProduction } from "./lib/performance";

// Lazy load all pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Menu = lazy(() => import("./pages/Menu"));
const MeuCadastro = lazy(() => import("./pages/MeuCadastro"));
const Users = lazy(() => import("./pages/Users"));
const Interested = lazy(() => import("./pages/Interested"));
const Chat = lazy(() => import("./pages/Chat"));
const Settings = lazy(() => import("./pages/Settings"));
const Tasks = lazy(() => import("./pages/Tasks"));
const MyInterested = lazy(() => import("./pages/MyInterested"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Prayers = lazy(() => import("./pages/Prayers"));
// const TestCalendar = lazy(() => import("./pages/TestCalendar")); // Arquivo removido
const Contact = lazy(() => import("./pages/Contact"));
const ElectionConfig = lazy(() => import("./pages/ElectionConfig"));
const ElectionVoting = lazy(() => import("./pages/ElectionVoting"));
const ElectionDashboard = lazy(() => import("./pages/ElectionDashboard"));
const ElectionResults = lazy(() => import("./pages/ElectionResults"));
const ElectionManage = lazy(() => import("./pages/ElectionManage"));
const ElectionVotingMobile = lazy(() => import("./pages/ElectionVotingMobile"));
const UnifiedElection = lazy(() => import("./pages/UnifiedElection"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Create optimized query client
const queryClient = createQueryClient();

const App = () => {
  // Setup performance optimizations
  useEffect(() => {
    // Clean console logs in production
    cleanConsoleInProduction();
    
    // Setup performance listeners
    setupPerformanceListeners(queryClient);
    
    // Prefetch important data
    prefetchImportantData(queryClient);
    
    // Cleanup old cache every 30 minutes
    const cleanupInterval = setInterval(() => {
      // This will be implemented in the queryClient file
    }, 30 * 60 * 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/first-access" element={<FirstAccessWelcome />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/meu-cadastro" element={<MeuCadastro />} />
              <Route path="/users" element={<Users />} />
              <Route path="/interested" element={<Interested />} />
              <Route path="/my-interested" element={<MyInterested />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/reports" element={<Tasks />} />
              <Route path="/my-reports" element={<Tasks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/election-config" element={<ElectionConfig />} />
              <Route path="/election-voting" element={<ElectionVoting />} />
              <Route path="/election-dashboard" element={<ElectionDashboard />} />
              <Route path="/elections" element={<UnifiedElection />} />
              <Route path="/election-dashboard/:configId" element={<ElectionResults />} />
              <Route path="/election-manage" element={<ElectionDashboard />} />
              <Route path="/election-manage/:configId" element={<ElectionManage />} />
              <Route path="/election-vote/:configId" element={<ElectionVotingMobile />} />
              {/* <Route path="/test-calendar" element={<TestCalendar />} /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
