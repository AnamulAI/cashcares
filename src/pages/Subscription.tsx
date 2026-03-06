import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Crown, Zap, Star, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

const plans = [
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
  const [billing, setBilling] = useState("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription" subtitle="Unlock advanced finance tools and premium productivity" />

      {/* Current plan card */}
      <Card className="finance-card-static border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display">Free Plan</h3>
              <Badge variant="secondary" className="text-[10px]">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Basic financial tracking with limited features</p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0"><Zap className="h-4 w-4" /> Upgrade to Premium</Button>
        </CardContent>
      </Card>

      {/* Pricing cards */}
      <div>
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold font-display tracking-tight">Choose Your Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Simple pricing, no hidden fees</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className={cn(
                "finance-card-static relative transition-shadow",
                plan.popular && "border-primary shadow-md ring-1 ring-primary/20"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-3 gap-1"><Star className="h-3 w-3" /> Recommended</Badge>
                </div>
              )}
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-sm font-semibold">{plan.name}</h3>
                <div>
                  <span className="text-3xl font-bold font-display">৳{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{plan.billed}</p>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="sm">
                  {plan.popular ? "Get Started" : "Select Plan"}
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
          ))}
        </div>
      </div>

      {/* Feature comparison */}
      <Card className="finance-card-static">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground w-1/2">Feature</th>
                  <th className="text-center py-2 text-xs font-medium text-muted-foreground w-1/4">Free</th>
                  <th className="text-center py-2 text-xs font-medium w-1/4"><span className="text-primary font-semibold">Premium</span></th>
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

      {/* FAQ */}
      <Card className="finance-card-static">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Billing FAQ</CardTitle>
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

      {/* Billing history placeholder */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Billing History</p>
          <p className="text-[11px] text-muted-foreground">No transactions yet</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" disabled>View History</Button>
      </div>
    </div>
  );
}
