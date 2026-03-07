import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";
import { useTransactions } from "@/hooks/use-transactions";
import { useMemo } from "react";

export function TrendChart() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: transactions = [] } = useTransactions();

  const chartData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString(lang === "bn" ? "bn-BD" : "en-US", { month: "short" }),
      });
    }

    const result = months.map(m => ({ month: m.label, income: 0, expense: 0 }));

    (transactions as any[]).forEach(txn => {
      if (!txn.date) return;
      const monthKey = txn.date.substring(0, 7); // "YYYY-MM"
      const idx = months.findIndex(m => m.key === monthKey);
      if (idx === -1) return;
      if (txn.type === "income") result[idx].income += Number(txn.amount);
      else if (txn.type === "expense") result[idx].expense += Number(txn.amount);
    });

    return result;
  }, [transactions, lang]);

  const hasData = chartData.some(d => d.income > 0 || d.expense > 0);

  return (
    <div className="finance-card-static p-6">
      <SectionHeader title={t("dashboard.incomeVsExpenseTrend")} />
      <div className="mt-5 h-[280px]">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {t("common.noData") || "No trend data yet"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} dx={-4} />
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
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--positive))" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} name={t("transactions.income")} />
              <Line type="monotone" dataKey="expense" stroke="hsl(var(--negative))" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} name={t("transactions.expense")} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
