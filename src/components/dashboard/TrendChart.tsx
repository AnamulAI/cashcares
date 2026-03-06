import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { trendChartData } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";

export function TrendChart() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();

  return (
    <div className="finance-card-static p-6">
      <SectionHeader title={t("dashboard.incomeVsExpenseTrend")} />
      <div className="mt-5 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendChartData}>
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
              formatter={(value: number) => [formatAmount(value, currency), undefined]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
            <Line type="monotone" dataKey="income" stroke="hsl(var(--positive))" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} name={t("transactions.income")} />
            <Line type="monotone" dataKey="expense" stroke="hsl(var(--negative))" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} name={t("transactions.expense")} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
