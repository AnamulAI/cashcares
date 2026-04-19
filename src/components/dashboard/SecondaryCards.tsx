import { HandCoins, CreditCard, Scale, TrendingUp, Building2, PiggyBank, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { useAppContext } from "@/contexts/AppContext";
import { useAllPayableEntries } from "@/hooks/use-payable-entries";
import { useAllReceivableEntries } from "@/hooks/use-receivable-entries";
import { useLoans } from "@/hooks/use-loans";
import { useAssets } from "@/hooks/use-assets";
import { useInvestments } from "@/hooks/use-investments";
import { useSavingsPlans } from "@/hooks/use-savings";
import { usePartnerships } from "@/hooks/use-partnerships";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type CardItem = {
  key: string;
  icon: ReactNode;
  iconBg: string;
  label: string;
  amount: number;
};

const VISIBLE = 5;

export function SecondaryCards() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);

  const { data: receivableEntries = [] } = useAllReceivableEntries();
  const { data: payableEntries = [] } = useAllPayableEntries();
  const { data: loans = [] } = useLoans();
  const { data: assets = [] } = useAssets();
  const { data: investments = [] } = useInvestments();
  const { data: savingsPlans = [] } = useSavingsPlans();
  const { data: partnerships = [] } = usePartnerships();

  const totalReceivable = receivableEntries
    .filter((r: any) => r.status !== "collected")
    .reduce((s: number, r: any) => s + (Number(r.amount) - Number(r.collected_amount)), 0);
  const totalPayable = payableEntries
    .filter((p: any) => p.status !== "paid")
    .reduce((s: number, p: any) => s + (Number(p.amount) - Number(p.paid_amount)), 0);
  const totalDebt = loans.filter(l => l.status !== "paid_off").reduce((s, l) => s + (Number(l.principal_amount) - Number(l.paid_amount)), 0);
  const totalInvestments = investments.filter(i => i.status === "active").reduce((s, i) => s + Number(i.current_value), 0);
  const totalAssets = assets.filter(a => a.status === "active").reduce((s, a) => s + Number(a.current_value), 0);
  const totalSavings = savingsPlans.filter((p: any) => p.status === "active").reduce((s: number, p: any) => s + Number(p.total_saved), 0);
  const totalPartnerships = partnerships.filter((p: any) => p.status === "active").reduce((s: number, p: any) => s + Number(p.your_contribution), 0);

  const allCards: CardItem[] = [
    { key: "receivables", label: t("dashboard.receivables"), amount: totalReceivable, iconBg: "bg-feature-receivables/10", icon: <HandCoins className="h-[18px] w-[18px] text-feature-receivables" /> },
    { key: "payables", label: t("dashboard.payables"), amount: totalPayable, iconBg: "bg-feature-payables/10", icon: <CreditCard className="h-[18px] w-[18px] text-feature-payables" /> },
    { key: "debt", label: t("dashboard.debtLoans"), amount: totalDebt, iconBg: "bg-feature-debt/10", icon: <Scale className="h-[18px] w-[18px] text-feature-debt" /> },
    { key: "investments", label: t("dashboard.investments"), amount: totalInvestments, iconBg: "bg-feature-investments/10", icon: <TrendingUp className="h-[18px] w-[18px] text-feature-investments" /> },
    { key: "assets", label: t("dashboard.assets"), amount: totalAssets, iconBg: "bg-feature-assets/10", icon: <Building2 className="h-[18px] w-[18px] text-feature-assets" /> },
    { key: "savings", label: t("dashboard.savings"), amount: totalSavings, iconBg: "bg-feature-savings/10", icon: <PiggyBank className="h-[18px] w-[18px] text-feature-savings" /> },
    { key: "partnerships", label: t("nav.partnerships"), amount: totalPartnerships, iconBg: "bg-feature-partnerships/10", icon: <Users className="h-[18px] w-[18px] text-feature-partnerships" /> },
  ];

  // Hide cards with effectively zero amount (< 1 unit of base currency)
  const cards = allCards.filter(c => Math.abs(c.amount) >= 1);

  const useCarousel = cards.length > VISIBLE;

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", slidesToScroll: 1 });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, cards.length]);

  if (cards.length === 0) return null;

  if (!useCarousel) {
    // Static grid — at most 5 items
    const cols =
      cards.length === 1 ? "grid-cols-1" :
      cards.length === 2 ? "grid-cols-2" :
      cards.length === 3 ? "grid-cols-2 sm:grid-cols-3" :
      cards.length === 4 ? "grid-cols-2 sm:grid-cols-4" :
      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
    return (
      <div className={cn("grid gap-3", cols)}>
        {cards.map(c => (
          <FinanceCard key={c.key} icon={c.icon} iconBg={c.iconBg} label={c.label} value={fmt(c.amount)} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {cards.map(c => (
            <div
              key={c.key}
              className="min-w-0 shrink-0 grow-0 basis-1/2 sm:basis-1/3 lg:basis-1/5"
            >
              <FinanceCard icon={c.icon} iconBg={c.iconBg} label={c.label} value={fmt(c.amount)} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className={cn(
          "absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          !canPrev && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className={cn(
          "absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          !canNext && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
