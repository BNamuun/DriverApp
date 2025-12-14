import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import CameraSetup from "./pages/CameraSetup";
import Home from "./pages/Home";
import DriveMode from "./pages/DriveMode";
import AlertScreen from "./pages/AlertScreen";
import TripHistory from "./pages/TripHistory";
import TripDetails from "./pages/TripDetails";
import Settings from "./pages/Settings";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/camera-setup" element={<CameraSetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/drive" element={<DriveMode />} />
          <Route path="/alert" element={<AlertScreen />} />
          <Route path="/history" element={<TripHistory />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/install" element={<Install />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
