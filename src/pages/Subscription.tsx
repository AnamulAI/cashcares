import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Star, ChevronDown, ChevronUp, HelpCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext, type PlanType } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAppDate } from "@/lib/formatters";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useMyUpgradeRequests, useSubmitUpgradeRequest } from "@/hooks/use-upgrade-requests";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { name: "Income & Expense Tracking", free: true, premium: true },
  { name: "Accounts Management", free: true, premium: true },
  { name: "Categories Management", free: true, premium: true },
  { name: "Budget Planning", free: "3 budgets", premium: true },
  { name: "Savings Tracking", free: false, premium: true },
  { name: "Receivables", free: false, premium: true },
  { name: "Payables", free: false, premium: true },
  { name: "Debt Tracking", free: false, premium: true },
  { name: "Asset Tracking", free: false, premium: true },
  { name: "Investment Tracking", free: false, premium: true },
  { name: "Advanced Reports", free: "Basic only", premium: true },
  { name: "Export Options", free: "CSV only", premium: true },
  { name: "Multi-workspace", free: false, premium: true },
  { name: "Priority Support", free: false, premium: true },
];

const plans: { id: PlanType; name: string; price: number; period: string; billed: string; popular: boolean }[] = [
  { id: "monthly", name: "Monthly", price: 499, period: "/mo", billed: "Billed monthly", popular: false },
  { id: "yearly", name: "Yearly", price: 3999, period: "/yr", billed: "Billed annually (save 33%)", popular: true },
  { id: "lifetime", name: "Lifetime", price: 9999, period: "", billed: "One-time payment", popular: false },
];

const faqs = [
  { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle." },
  { q: "Is there a refund policy?", a: "We offer a 14-day money-back guarantee for all new subscriptions. No questions asked." },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, bKash, Nagad, and bank transfers for yearly and lifetime plans." },
  { q: "Do I lose data if I downgrade?", a: "No. Your data is always preserved. However, premium features will become read-only until you upgrade again." },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-positive mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export default function Subscription() {
  const { plan, isPremium, currency, settings } = useAppContext();
  const { isAdmin } = useAuth();
  const { t, lang } = useTranslation();
  const fmtDate = (d: string | Date) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);

  const { data: myRequests = [] } = useMyUpgradeRequests();
  const submitRequest = useSubmitUpgradeRequest();

  // Check if there's a pending request
  const pendingRequest = myRequests.find(r => r.status === "pending");

  const planLabels: Record<PlanType, string> = {
    free: t("subscription.freePlan"),
    monthly: t("subscription.monthlyPremium"),
    yearly: t("subscription.yearlyPremium"),
    lifetime: t("subscription.lifetimePremium"),
  };

  const handleCardClick = (planId: PlanType) => {
    if (planId === plan) return;
    setSelectedPlan(planId);
  };

  const handleUpgradeClick = (planId: PlanType) => {
    if (planId === plan) return;
    setPendingPlan(planId);
    setConfirmOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!pendingPlan) return;
    try {
      await submitRequest.mutateAsync({
        requested_plan: pendingPlan,
        current_plan: plan,
      });
      toast.success("Upgrade request submitted! Your request is awaiting admin approval.");
    } catch (e: any) {
      toast.error("Failed to submit request: " + e.message);
    }
    setConfirmOpen(false);
    setPendingPlan(null);
    setSelectedPlan(null);
  };

  const handleDowngrade = () => {
    setPendingPlan("free");
    setConfirmOpen(true);
  };

  const pendingPlanData = pendingPlan ? plans.find(p => p.id === pendingPlan) : null;
  const isDowngrade = pendingPlan === "free";

  return (
    <div className="space-y-6">
      <PageHeader title={t("subscription.title")} subtitle={t("subscription.subtitle")} />

      <Card className="finance-card-static border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-feature-subscription/10 shrink-0">
            <Crown className="h-6 w-6 text-feature-subscription" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display">{planLabels[plan]}</h3>
              <Badge variant={isPremium ? "default" : "secondary"} className="text-[10px]">{isPremium ? t("subscription.premium") : t("status.active")}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isPremium ? "Full access to all premium features" : "Basic financial tracking with limited features"}
            </p>
          </div>
          {!isPremium && !pendingRequest && (
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => handleUpgradeClick(selectedPlan || "yearly")}><Zap className="h-4 w-4" /> {t("subscription.upgradeToPremium")}</Button>
          )}
          {isPremium && (
            <Button size="sm" variant="outline" className="shrink-0" onClick={handleDowngrade}>{t("action.downgrade")}</Button>
          )}
        </CardContent>
      </Card>

      {/* Pending request banner */}
      {pendingRequest && (
        <Card className="finance-card-static border-warning/30 bg-warning/5">
          <CardContent className="flex items-center gap-3 pt-5 pb-4">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Upgrade Request Pending</p>
              <p className="text-xs text-muted-foreground">
                You requested <span className="font-medium text-foreground">{planLabels[pendingRequest.requested_plan as PlanType] || pendingRequest.requested_plan}</span> on {fmtDate(pendingRequest.created_at)}. Awaiting admin approval.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] text-warning border-warning/40 shrink-0">Pending</Badge>
          </CardContent>
        </Card>
      )}

      {/* Recent approved/rejected requests */}
      {myRequests.filter(r => r.status !== "pending").slice(0, 1).map(r => (
        <Card key={r.id} className={cn("finance-card-static", r.status === "approved" ? "border-positive/30 bg-positive/5" : "border-destructive/30 bg-destructive/5")}>
          <CardContent className="flex items-center gap-3 pt-5 pb-4">
            {r.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-positive shrink-0" />
            ) : (
              <X className="h-5 w-5 text-destructive shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                {r.status === "approved" ? "Upgrade Approved" : "Upgrade Request Declined"}
              </p>
              <p className="text-xs text-muted-foreground">
                {planLabels[r.requested_plan as PlanType] || r.requested_plan} — {r.admin_note || (r.status === "approved" ? "Your plan has been activated." : "Please contact support for details.")}
              </p>
            </div>
            <Badge variant="outline" className={cn("text-[10px] shrink-0", r.status === "approved" ? "text-positive border-positive/40" : "text-destructive border-destructive/40")}>
              {r.status}
            </Badge>
          </CardContent>
        </Card>
      ))}

      <div>
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold font-display tracking-tight">{t("subscription.choosePlan")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("subscription.simplePricing")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {plans.map(p => {
            const isCurrentPlan = plan === p.id;
            const isSelected = selectedPlan === p.id;
            const hasPendingForThis = pendingRequest?.requested_plan === p.id;
            return (
              <Card
                key={p.id}
                onClick={() => handleCardClick(p.id)}
                className={cn(
                  "finance-card-static relative transition-all cursor-pointer",
                  p.popular && !isSelected && !isCurrentPlan && "border-primary/40 shadow-md",
                  isCurrentPlan && "ring-2 ring-primary border-primary cursor-default",
                  isSelected && !isCurrentPlan && "ring-2 ring-accent-foreground border-accent-foreground shadow-lg",
                  hasPendingForThis && "ring-2 ring-warning border-warning",
                )}
              >
                {p.popular && !hasPendingForThis && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-3 gap-1"><Star className="h-3 w-3" /> {t("subscription.recommended")}</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" className="text-[10px] px-3">{t("subscription.currentPlanBadge")}</Badge>
                  </div>
                )}
                {hasPendingForThis && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="outline" className="text-[10px] px-3 text-warning border-warning/40 bg-background">Pending</Badge>
                  </div>
                )}
                <CardContent className="pt-6 text-center space-y-4">
                  <h3 className="text-sm font-semibold">{p.name}</h3>
                  <div>
                    <span className="text-3xl font-bold font-display">{currency.symbol}{p.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.billed}</p>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "secondary" : isSelected ? "default" : p.popular ? "default" : "outline"}
                    size="sm"
                    disabled={isCurrentPlan || !!hasPendingForThis}
                    onClick={(e) => { e.stopPropagation(); handleUpgradeClick(p.id); }}
                  >
                    {isCurrentPlan ? t("subscription.currentPlanBadge") : hasPendingForThis ? "Request Pending" : isSelected ? "Request Upgrade" : p.popular ? t("subscription.getStarted") : t("subscription.selectPlan")}
                  </Button>
                  <ul className="text-left space-y-1.5 pt-2">
                    {["All premium features", "Unlimited budgets", "Advanced reports", "Priority support"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-positive shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="finance-card-static">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{t("subscription.featureComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground w-1/2">{t("subscription.feature")}</th>
                  <th className="text-center py-2 text-xs font-medium text-muted-foreground w-1/4">{t("subscription.free")}</th>
                  <th className="text-center py-2 text-xs font-medium w-1/4"><span className="text-primary font-semibold">{t("subscription.premium")}</span></th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-xs">{f.name}</td>
                    <td className="py-2.5 text-center"><FeatureCell value={f.free} /></td>
                    <td className="py-2.5 text-center"><FeatureCell value={f.premium} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="finance-card-static">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-feature-subscription" /> {t("subscription.billingFaq")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border/50 last:border-0">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-xs font-medium">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              {openFaq === i && <p className="text-xs text-muted-foreground pb-3 leading-relaxed">{faq.a}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{t("subscription.billingHistory")}</p>
          <p className="text-[11px] text-muted-foreground">{isPremium ? `Active ${planLabels[plan]} subscription` : "No transactions yet"}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" disabled>{t("subscription.viewHistory")}</Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isDowngrade ? "Request Downgrade to Free Plan?" : `Request Upgrade to ${pendingPlan ? planLabels[pendingPlan] : ""}?`}
        description={
          isDowngrade
            ? "Your downgrade request will be submitted for admin review. Premium features will remain active until processed."
            : pendingPlanData
              ? `Your upgrade request for the ${pendingPlanData.name} plan (${currency.symbol}${pendingPlanData.price.toLocaleString()}${pendingPlanData.period}) will be submitted for admin approval. Payment integration is coming soon.`
              : ""
        }
        onConfirm={handleConfirmUpgrade}
        confirmLabel={isDowngrade ? "Submit Request" : "Submit Upgrade Request"}
        destructive={isDowngrade}
      />
    </div>
  );
}
