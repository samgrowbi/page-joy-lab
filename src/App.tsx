import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ThankYou from "./pages/ThankYou";

import BookLedCryo from "./pages/BookLedCryo";
import BookLed from "./pages/BookLed";
import BookBodySculpting from "./pages/BookBodySculpting";
import BookInstantLift from "./pages/BookInstantLift";
import LedCryo from "./pages/LedCryo";
import BodySculpting from "./pages/BodySculpting";
import InstantLift from "./pages/InstantLift";
import SkinSpecialistChat from "./components/chat/SkinSpecialistChat";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InstantLift />} />
          <Route path="/instant-lift" element={<Navigate to="/" replace />} />
          <Route path="/led" element={<Index />} />
          <Route path="/led-cryo" element={<LedCryo />} />
          <Route path="/body-sculpting" element={<BodySculpting />} />
          <Route path="/book/led" element={<BookLed />} />
          <Route path="/book/instant-lift" element={<BookInstantLift />} />
          <Route path="/book/led-cryo" element={<BookLedCryo />} />
          <Route path="/book/body-sculpting" element={<BookBodySculpting />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SkinSpecialistChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
