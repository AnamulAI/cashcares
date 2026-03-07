import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, PremiumRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Receivables from "./pages/Receivables";
import Payables from "./pages/Payables";
import ReceivableLedger from "./pages/ReceivableLedger";
import PayableLedger from "./pages/PayableLedger";
import DebtLoans from "./pages/DebtLoans";
import Assets from "./pages/Assets";
import Investments from "./pages/Investments";
import Partnerships from "./pages/Partnerships";
import PartnershipLedger from "./pages/PartnershipLedger";
import Reminders from "./pages/Reminders";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <AppProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/receivables" element={<Receivables />} />
            <Route path="/receivables/:id" element={<ReceivableLedger />} />
            <Route path="/payables" element={<Payables />} />
            <Route path="/payables/:id" element={<PayableLedger />} />
            <Route path="/debt-loans" element={<DebtLoans />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/partnerships/:id" element={<PartnershipLedger />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
