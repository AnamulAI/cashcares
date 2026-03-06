import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { distributionData } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { formatCurrency } from "@/config/app";

export function DistributionChart() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <SectionHeader title="Account Distribution" />
      <div className="mt-4 flex flex-col items-center">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatCurrency(value), undefined]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
          {distributionData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
