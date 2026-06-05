import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister, wireOfflineReconnect } from "@/lib/offline";

wireOfflineReconnect();
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
import Savings from "./pages/Savings";
import SavingsLedger from "./pages/SavingsLedger";
import Partnerships from "./pages/Partnerships";
import PartnershipLedger from "./pages/PartnershipLedger";
import Reminders from "./pages/Reminders";
import Mohorana from "./pages/Mohorana";
import MohoranaLedger from "./pages/MohoranaLedger";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const App = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      buster: "v1",
    }}
    onSuccess={() => {
      // Resume any mutations that were paused while offline (e.g. previous session)
      queryClient.resumePausedMutations();
    }}
  >
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
            <Route path="/receivables" element={<PremiumRoute><Receivables /></PremiumRoute>} />
            <Route path="/receivables/:id" element={<PremiumRoute><ReceivableLedger /></PremiumRoute>} />
            <Route path="/payables" element={<PremiumRoute><Payables /></PremiumRoute>} />
            <Route path="/payables/:id" element={<PremiumRoute><PayableLedger /></PremiumRoute>} />
            <Route path="/debt-loans" element={<PremiumRoute><DebtLoans /></PremiumRoute>} />
            <Route path="/assets" element={<PremiumRoute><Assets /></PremiumRoute>} />
            <Route path="/investments" element={<PremiumRoute><Investments /></PremiumRoute>} />
            <Route path="/savings" element={<PremiumRoute><Savings /></PremiumRoute>} />
            <Route path="/savings/:id" element={<PremiumRoute><SavingsLedger /></PremiumRoute>} />
            <Route path="/partnerships" element={<PremiumRoute><Partnerships /></PremiumRoute>} />
            <Route path="/partnerships/:id" element={<PremiumRoute><PartnershipLedger /></PremiumRoute>} />
            <Route path="/mohorana" element={<PremiumRoute><Mohorana /></PremiumRoute>} />
            <Route path="/mohorana/:id" element={<PremiumRoute><MohoranaLedger /></PremiumRoute>} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </PersistQueryClientProvider>
);

export default App;
