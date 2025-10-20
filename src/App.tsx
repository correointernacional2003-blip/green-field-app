import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import Breeds from "./pages/Breeds";
import Lots from "./pages/Lots";
import Paddocks from "./pages/Paddocks";
import Milkings from "./pages/Milkings";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { isAuthenticated } from "./lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/animals" 
            element={
              <ProtectedRoute>
                <Animals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/breeds" 
            element={
              <ProtectedRoute>
                <Breeds />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lots" 
            element={
              <ProtectedRoute>
                <Lots />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/paddocks" 
            element={
              <ProtectedRoute>
                <Paddocks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/milkings" 
            element={
              <ProtectedRoute>
                <Milkings />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
