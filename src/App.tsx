import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budgets" element={<ComingSoon />} />
            <Route path="/reports" element={<ComingSoon />} />
            <Route path="/assets" element={<ComingSoon />} />
            <Route path="/investments" element={<ComingSoon />} />
            <Route path="/receivables" element={<ComingSoon />} />
            <Route path="/payables" element={<ComingSoon />} />
            <Route path="/debt-loans" element={<ComingSoon />} />
            <Route path="/settings" element={<ComingSoon />} />
            <Route path="/subscription" element={<ComingSoon />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
