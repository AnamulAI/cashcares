import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { trendChartData } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function TrendChart() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <SectionHeader title="Income vs Expense Trend" />
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: 12,
              }}
              formatter={(value: number) => [`৳${value.toLocaleString()}`, undefined]}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="hsl(var(--positive))" strokeWidth={2.5} dot={{ r: 3 }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="hsl(var(--negative))" strokeWidth={2.5} dot={{ r: 3 }} name="Expense" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
