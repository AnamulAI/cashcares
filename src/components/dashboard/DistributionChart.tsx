import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";
import { useAccounts } from "@/hooks/use-accounts";
import { useMemo } from "react";

const TYPE_COLORS: Record<string, string> = {
  bank: "#6366f1",
  cash: "#10b981",
  mobile_wallet: "#e11d48",
  business: "#8b5cf6",
  savings: "#f59e0b",
  credit_card: "#ef4444",
  other: "#78716c",
};

export function DistributionChart() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: accounts = [] } = useAccounts();

  const distributionData = useMemo(() => {
    const grouped: Record<string, { name: string; value: number; color: string }> = {};
    accounts.forEach(a => {
      const bal = Number(a.balance);
      if (bal <= 0) return;
      const type = a.type || "other";
      if (!grouped[type]) {
        const label = type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        grouped[type] = { name: label, value: 0, color: a.color || TYPE_COLORS[type] || TYPE_COLORS.other };
      }
      grouped[type].value += bal;
    });
    return Object.values(grouped);
  }, [accounts]);

  const hasData = distributionData.length > 0;

  return (
    <div className="finance-card-static finance-card-hover p-6">
      <SectionHeader title={t("dashboard.accountDistribution")} />
      <div className="mt-5 flex flex-col items-center">
        {!hasData ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {t("common.noData") || "No account data yet"}
          </div>
        ) : (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.625rem",
                      fontSize: 12,
                      boxShadow: "0 4px 12px hsl(var(--foreground) / 0.06)",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number) => [formatAmount(value, currency, lang), undefined]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 text-xs">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
