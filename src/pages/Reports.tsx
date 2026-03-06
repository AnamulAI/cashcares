import { useState } from "react";
import { Download, DollarSign, TrendingUp, TrendingDown, PiggyBank, Gauge, BarChart3, FileText, Building2, Scale, HandCoins, CreditCard, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const incomeExpenseData = [
  { month: "Jan", income: 85000, expense: 52000 },
  { month: "Feb", income: 78000, expense: 48000 },
  { month: "Mar", income: 92000, expense: 61000 },
  { month: "Apr", income: 85000, expense: 55000 },
  { month: "May", income: 88000, expense: 49000 },
  { month: "Jun", income: 95000, expense: 58000 },
];

const expenseBreakdown = [
  { name: "Food & Dining", value: 15200, color: "hsl(25, 95%, 53%)" },
  { name: "Transport", value: 8500, color: "hsl(217, 91%, 60%)" },
  { name: "Utilities", value: 5200, color: "hsl(45, 93%, 47%)" },
  { name: "Entertainment", value: 4100, color: "hsl(280, 67%, 55%)" },
  { name: "Shopping", value: 9800, color: "hsl(340, 82%, 52%)" },
  { name: "Others", value: 6200, color: "hsl(200, 18%, 46%)" },
];

const netMovement = [
  { month: "Jan", net: 33000 }, { month: "Feb", net: 30000 }, { month: "Mar", net: 31000 },
  { month: "Apr", net: 30000 }, { month: "May", net: 39000 }, { month: "Jun", net: 37000 },
];

function PlaceholderTab({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card className="finance-card-static">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent mb-4">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
        <Badge variant="secondary" className="mt-3 text-[10px]">Coming Soon</Badge>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { currency } = useAppContext();
  const [tab, setTab] = useState("overview");
  const fmt = (n: number) => `${currency.symbol}${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Analyze your money activity with clear financial insights"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-9"><Download className="h-4 w-4" /> Export Report</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Export as PDF</DropdownMenuItem>
              <DropdownMenuItem><Layers className="h-4 w-4 mr-2" /> Export as CSV</DropdownMenuItem>
              <DropdownMenuItem><BarChart3 className="h-4 w-4 mr-2" /> Monthly Summary</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-primary" />} label="Net Worth" value={fmt(524000)} iconBg="bg-primary/10" />
        <FinanceCard icon={<TrendingUp className="h-5 w-5 text-positive" />} label="Total Income" value={fmt(523000)} iconBg="bg-positive/10" />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-negative" />} label="Total Expense" value={fmt(323000)} iconBg="bg-negative/10" />
        <FinanceCard icon={<PiggyBank className="h-5 w-5 text-primary" />} label="Savings" value={fmt(200000)} iconBg="bg-accent" />
        <FinanceCard icon={<Gauge className="h-5 w-5 text-warning" />} label="Budget Util." value="72%" iconBg="bg-warning/10" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue="this_month">
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3">Last 3 Months</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60 p-1 h-auto gap-0.5 overflow-x-auto flex-wrap">
          {["overview","income","expense","budget","savings","assets","investments","receivables","payables","debt"].map(t => (
            <TabsTrigger key={t} value={t} className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm capitalize">{t === "debt" ? "Debt & Loans" : t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-4">
          {/* Income vs Expense */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Card className="finance-card-static lg:col-span-3">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Income vs Expense</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={incomeExpenseData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="income" fill="hsl(var(--positive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(var(--negative))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="finance-card-static lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Net Movement</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={netMovement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Line type="monotone" dataKey="net" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Expense breakdown & distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="finance-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="finance-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Top Categories</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Top Spending</p>
                  {expenseBreakdown.slice(0, 4).map((e, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-xs">{e.name}</span>
                      <span className="text-xs font-semibold">{fmt(e.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Top Income Sources</p>
                  {[{ name: "Salary", value: 85000 }, { name: "Freelance", value: 12000 }, { name: "Dividends", value: 3500 }].map((e, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-xs">{e.name}</span>
                      <span className="text-xs font-semibold text-positive">{fmt(e.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <PlaceholderTab icon={TrendingUp} title="Income Report" description="Detailed income analysis by source, account, and time period will be available here." />
        </TabsContent>
        <TabsContent value="expense" className="mt-4">
          <PlaceholderTab icon={TrendingDown} title="Expense Report" description="Category-wise expense breakdown with trends and comparisons." />
        </TabsContent>
        <TabsContent value="budget" className="mt-4">
          <PlaceholderTab icon={Gauge} title="Budget Report" description="Track budget utilization, overspending patterns, and monthly comparisons." />
        </TabsContent>
        <TabsContent value="savings" className="mt-4">
          <PlaceholderTab icon={PiggyBank} title="Savings Report" description="Analyze your savings rate, growth trends, and goal progress." />
        </TabsContent>
        <TabsContent value="assets" className="mt-4">
          <PlaceholderTab icon={Building2} title="Asset Report" description="Overview of your asset portfolio, valuations, and appreciation trends." />
        </TabsContent>
        <TabsContent value="investments" className="mt-4">
          <PlaceholderTab icon={TrendingUp} title="Investment Report" description="Track investment performance, returns, and allocation breakdown." />
        </TabsContent>
        <TabsContent value="receivables" className="mt-4">
          <PlaceholderTab icon={HandCoins} title="Receivables Report" description="Outstanding receivables, aging analysis, and collection status." />
        </TabsContent>
        <TabsContent value="payables" className="mt-4">
          <PlaceholderTab icon={CreditCard} title="Payables Report" description="Upcoming and overdue payables with payment schedule tracking." />
        </TabsContent>
        <TabsContent value="debt" className="mt-4">
          <PlaceholderTab icon={Scale} title="Debt & Loans Report" description="Loan balances, repayment progress, and interest analysis." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
