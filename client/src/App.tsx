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
const Meetings = lazy(() => import("./pages/Meetings"));
const VideoCall = lazy(() => import("./pages/VideoCall"));
const Users = lazy(() => import("./pages/Users"));
const Interested = lazy(() => import("./pages/Interested"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Settings = lazy(() => import("./pages/Settings"));
const Reports = lazy(() => import("./pages/Reports"));
const VideoCallRoom = lazy(() => import("./pages/VideoCallRoom"));
const MyInterested = lazy(() => import("./pages/MyInterested"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Prayers = lazy(() => import("./pages/Prayers"));
const TestCalendar = lazy(() => import("./pages/TestCalendar"));
const Contact = lazy(() => import("./pages/Contact"));
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
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/video-calls" element={<VideoCall />} />
              <Route path="/users" element={<Users />} />
              <Route path="/interested" element={<Interested />} />
              <Route path="/my-interested" element={<MyInterested />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/my-reports" element={<Reports />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/test-calendar" element={<TestCalendar />} />
              <Route path="/video-call/:meetingId" element={<VideoCallRoom />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
