import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Menu from "./pages/Menu";
import MeuCadastro from "./pages/MeuCadastro";
import Meetings from "./pages/Meetings";
import VideoCall from "./pages/VideoCall";
import Users from "./pages/Users";
import Interested from "./pages/Interested";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { MobileLayout } from "./components/layout/MobileLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<MobileLayout><Dashboard /></MobileLayout>} />
          <Route path="/calendar" element={<MobileLayout><Calendar /></MobileLayout>} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/meu-cadastro" element={<MeuCadastro />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/video-calls" element={<VideoCall />} />
          <Route path="/users" element={<Users />} />
          <Route path="/interested" element={<Interested />} />
          <Route path="/my-interested" element={<Interested />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
