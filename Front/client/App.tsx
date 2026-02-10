import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import BrowseTalents from "./pages/BrowseTalents";
import FreelanceVacancies from "./pages/FreelanceVacancies";
import PostJob from "./pages/PostJob";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import EgovCallback from "./pages/EgovCallback";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Tests from "./pages/Tests";
import TestReact from "./pages/TestReact";

const queryClient = new QueryClient();

// Clear stale auth tokens on app initialization
// This ensures users are not "already logged in" from previous sessions
const clearStaleAuthTokens = () => {
  // Clear eGov session tokens
  sessionStorage.removeItem('egov_access_token');
  sessionStorage.removeItem('egov_id_token');
  sessionStorage.removeItem('egov_refresh_token');
  sessionStorage.removeItem('egov_user');
  sessionStorage.removeItem('egov_auth_code');
  
  // Only clear user session if no valid session exists
  // (The AuthContext will handle the actual auth state)
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    localStorage.removeItem('user_role');
    localStorage.removeItem('access_token');
    localStorage.removeItem('is_egov_auth');
  }
};

// Run on initialization
clearStaleAuthTokens();

const App = () => (
  <LocaleProvider>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/browse" element={<BrowseTalents />} />
                <Route path="/jobs" element={<FreelanceVacancies />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/auth/egov/callback" element={<EgovCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/tests/react" element={<TestReact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </LocaleProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
