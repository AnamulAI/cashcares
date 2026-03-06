import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { distributionData } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";

export function DistributionChart() {
  const { currency } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="finance-card-static p-6">
      <SectionHeader title={t("dashboard.accountDistribution")} />
      <div className="mt-5 flex flex-col items-center">
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
                formatter={(value: number) => [formatAmount(value, currency), undefined]}
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
      </div>
    </div>
  );
}
