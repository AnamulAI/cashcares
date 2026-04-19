import { useState, useMemo } from "react";
import { Download, DollarSign, TrendingUp, TrendingDown, PiggyBank, Gauge, BarChart3, FileText, Building2, Scale, HandCoins, CreditCard, Layers, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/AppContext";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useBudgets } from "@/hooks/use-budgets";
import { useAllReceivableEntries } from "@/hooks/use-receivable-entries";
import { useAllPayableEntries } from "@/hooks/use-payable-entries";
import { usePayableBooks } from "@/hooks/use-payable-books";
import { useReceivableBooks } from "@/hooks/use-receivable-books";
import { useLoans } from "@/hooks/use-loans";
import { useAssets } from "@/hooks/use-assets";
import { useInvestments } from "@/hooks/use-investments";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { parseISO, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatPercent, formatAppDate, formatAppDateTime } from "@/lib/formatters";

function DataSummaryTab({ icon: Icon, title, items, noDataText }: { icon: React.ElementType; title: string; items: { label: string; value: string; color?: string }[]; noDataText: string }) {
  return (
    <Card className="finance-card-static">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Icon className="h-4 w-4" /> {title}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">{noDataText}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-xs">{item.label}</span>
                <span className={`text-xs font-semibold ${item.color || ""}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { currency, dateRange, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const fmtDate = (d: Date) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
  const { data: transactionsRaw = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categoriesRaw = [] } = useCategories();
  const { data: budgetsRaw = [] } = useBudgets();
  const { data: receivableEntries = [] } = useAllReceivableEntries();
  const { data: payableEntries = [] } = useAllPayableEntries();
  const { data: payableBooks = [] } = usePayableBooks();
  const { data: receivableBooks = [] } = useReceivableBooks();
  const { data: loansRaw = [] } = useLoans();
  const { data: assetsRaw = [] } = useAssets();
  const { data: investmentsRaw = [] } = useInvestments();
  const [tab, setTab] = useState("overview");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilterVal, setCategoryFilterVal] = useState("all");
  const fmt = (n: number) => formatAmount(n, currency, lang);

  const filteredTxns = useMemo(() => {
    return (transactionsRaw as any[]).filter((t: any) => {
      const d = parseISO(t.date);
      if (!isWithinInterval(d, { start: dateRange.from, end: dateRange.to })) return false;
      if (accountFilter !== "all" && t.account_id !== accountFilter) return false;
      if (categoryFilterVal !== "all" && t.category_id !== categoryFilterVal) return false;
      return true;
    });
  }, [transactionsRaw, dateRange, accountFilter, categoryFilterVal]);

  const totalIncome = filteredTxns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filteredTxns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const totalReceivableAmt = receivableEntries.filter((r: any) => r.status !== "collected").reduce((s: number, r: any) => s + (Number(r.amount) - Number(r.collected_amount)), 0);
  const totalPayableAmt = payableEntries.filter((p: any) => p.status !== "paid").reduce((s: number, p: any) => s + (Number(p.amount) - Number(p.paid_amount)), 0);
  const totalDebtAmt = loansRaw.filter((l: any) => l.status !== "paid_off").reduce((s: number, l: any) => s + (Number(l.principal_amount) - Number(l.paid_amount)), 0);
  const totalAssetsAmt = assetsRaw.filter((a: any) => a.status === "active").reduce((s: number, a: any) => s + Number(a.current_value), 0);
  const totalInvestAmt = investmentsRaw.filter((i: any) => i.status === "active").reduce((s: number, i: any) => s + Number(i.current_value), 0);
  const netWorth = accounts.reduce((s, a) => s + Number(a.balance), 0) + totalAssetsAmt + totalInvestAmt + totalReceivableAmt - totalPayableAmt - totalDebtAmt;

  const budgetUtil = useMemo(() => {
    if (!budgetsRaw.length) return 0;
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);
    const totalAlloc = budgetsRaw.reduce((s, b) => s + Number((b as any).allocated_amount), 0);
    if (totalAlloc === 0) return 0;
    const totalSpent = (transactionsRaw as any[])
      .filter(t => t.type === "expense" && t.status === "completed" && isWithinInterval(parseISO(t.date), { start: mStart, end: mEnd }))
      .filter(t => budgetsRaw.some(b => b.category_id === t.category_id))
      .reduce((s, t) => s + Number(t.amount), 0);
    return Math.round((totalSpent / totalAlloc) * 100);
  }, [budgetsRaw, transactionsRaw]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {};
    filteredTxns.forEach(t => {
      const key = format(parseISO(t.date), "MMM");
      if (!months[key]) months[key] = { month: key, income: 0, expense: 0 };
      if (t.type === "income") months[key].income += Number(t.amount);
      if (t.type === "expense") months[key].expense += Number(t.amount);
    });
    return Object.values(months);
  }, [filteredTxns]);

  const netMovement = monthlyData.map(m => ({ month: m.month, net: m.income - m.expense }));

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    filteredTxns.filter(t => t.type === "expense").forEach((t: any) => {
      const catName = t.category?.name || t("reports.other");
      const cat = categoriesRaw.find(c => c.id === t.category_id);
      if (!map[catName]) map[catName] = { name: catName, value: 0, color: cat?.color || "#6366f1" };
      map[catName].value += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredTxns, categoriesRaw]);

  const incomeSources = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    filteredTxns.filter(t => t.type === "income").forEach((t: any) => {
      const catName = t.category?.name || t("reports.other");
      if (!map[catName]) map[catName] = { name: catName, value: 0 };
      map[catName].value += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 4);
  }, [filteredTxns]);

  const exportCSV = () => {
    const headers = [t("table.date"), t("table.type"), t("table.category"), t("table.account"), t("table.amount"), t("table.note"), t("table.status")];
    const rows = filteredTxns.map((t: any) => [
      t.date, t.type, t.category?.name || "", t.account?.name || "", t.amount, t.note || "", t.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashcare-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("reports.csvExported"));
  };

  const tabItems = [
    { value: "overview", label: t("reports.overview") },
    { value: "income", label: t("reports.income") },
    { value: "expense", label: t("reports.expense") },
    { value: "budget", label: t("reports.budget") },
    { value: "savings", label: t("reports.savingsTab") },
    { value: "assets", label: t("reports.assetsTab") },
    { value: "investments", label: t("reports.investmentsTab") },
    { value: "receivables", label: t("reports.receivablesTab") },
    { value: "payables", label: t("reports.payablesTab") },
    { value: "debt", label: t("reports.debtTab") },
  ];

  const noData = t("common.noDataAvailable");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-only header */}
      <div className="print-only hidden mb-4">
        <h1 className="text-xl font-bold">MahBook — Financial Report</h1>
        <p className="text-sm text-muted-foreground">
          {fmtDate(dateRange.from)} — {fmtDate(dateRange.to)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Generated: {formatAppDateTime(new Date(), settings.dateFormat, settings.timezone, lang)}</p>
      </div>

      <PageHeader
        title={t("reports.title")}
        subtitle={t("reports.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 h-9"><Download className="h-4 w-4" /> {t("action.exportReport")}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled><FileText className="h-4 w-4 mr-2" /> {t("reports.exportPDF")}</DropdownMenuItem>
                <DropdownMenuItem onClick={exportCSV}><Layers className="h-4 w-4 mr-2" /> {t("reports.exportCSV")}</DropdownMenuItem>
                <DropdownMenuItem disabled><BarChart3 className="h-4 w-4 mr-2" /> {t("reports.monthlySummary")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-primary" />} label={t("reports.netWorth")} value={fmt(netWorth)} iconBg="bg-primary/10" />
        <FinanceCard icon={<TrendingUp className="h-5 w-5 text-feature-income" />} label={t("reports.totalIncome")} value={fmt(totalIncome)} iconBg="bg-feature-income/10" />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-feature-expense" />} label={t("reports.totalExpense")} value={fmt(totalExpense)} iconBg="bg-feature-expense/10" />
        <FinanceCard icon={<PiggyBank className="h-5 w-5 text-feature-savings" />} label={t("reports.savings")} value={fmt(totalIncome - totalExpense)} iconBg="bg-feature-savings/10" />
        <FinanceCard icon={<Gauge className="h-5 w-5 text-feature-budget" />} label={t("reports.budgetUtil")} value={formatPercent(budgetUtil, lang)} iconBg="bg-feature-budget/10" />
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reports.allAccounts")}</SelectItem>
            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilterVal} onValueChange={setCategoryFilterVal}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reports.allCategories")}</SelectItem>
            {categoriesRaw.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60 p-1 h-auto gap-0.5 overflow-x-auto flex-wrap">
          {tabItems.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm capitalize">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Card className="finance-card-static lg:col-span-3">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("reports.incomeVsExpense")}</CardTitle></CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">{t("reports.noTransactionData")}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="income" name={t("transactions.income")} fill="hsl(var(--positive))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name={t("transactions.expense")} fill="hsl(var(--negative))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="finance-card-static lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("reports.netMovement")}</CardTitle></CardHeader>
              <CardContent>
                {netMovement.length === 0 ? (
                  <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">{t("reports.noData")}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={netMovement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                      <Line type="monotone" dataKey="net" name={t("reports.netMovement")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="finance-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("reports.expenseBreakdown")}</CardTitle></CardHeader>
              <CardContent>
                {expenseBreakdown.length === 0 ? (
                  <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">{t("reports.noExpenses")}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="finance-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t("reports.topCategories")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("reports.topSpending")}</p>
                  {expenseBreakdown.length === 0 && <p className="text-xs text-muted-foreground">{t("reports.noData")}</p>}
                  {expenseBreakdown.slice(0, 4).map((e, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-xs">{e.name}</span>
                      <span className="text-xs font-semibold">{fmt(e.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("reports.topIncomeSources")}</p>
                  {incomeSources.length === 0 && <p className="text-xs text-muted-foreground">{t("reports.noData")}</p>}
                  {incomeSources.map((e, i) => (
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
          <DataSummaryTab icon={TrendingUp} title={t("reports.incomeReport")} noDataText={noData} items={incomeSources.map(s => ({ label: s.name, value: fmt(s.value), color: "text-positive" }))} />
        </TabsContent>
        <TabsContent value="expense" className="mt-4">
          <DataSummaryTab icon={TrendingDown} title={t("reports.expenseReport")} noDataText={noData} items={expenseBreakdown.map(e => ({ label: e.name, value: fmt(e.value), color: "text-negative" }))} />
        </TabsContent>
        <TabsContent value="budget" className="mt-4">
          <DataSummaryTab icon={Gauge} title={t("reports.budgetReport")} noDataText={noData} items={budgetsRaw.map((b: any) => ({ label: b.category?.name || "Unknown", value: `${fmt(Number(b.allocated_amount))} ${t("common.allocated")}` }))} />
        </TabsContent>
        <TabsContent value="savings" className="mt-4">
          <DataSummaryTab icon={PiggyBank} title={t("reports.savingsReport")} noDataText={noData} items={accounts.filter(a => a.type === "savings").map(a => ({ label: a.name, value: fmt(Number(a.balance)), color: "text-positive" }))} />
        </TabsContent>
        <TabsContent value="receivables" className="mt-4">
          <DataSummaryTab icon={HandCoins} title={t("reports.receivablesReport")} noDataText={noData} items={
            receivableBooks.filter((b: any) => b.status === "active").map((b: any) => {
              const bookEntries = receivableEntries.filter((e: any) => e.book_id === b.id && e.status !== "collected");
              const remaining = bookEntries.reduce((s: number, e: any) => s + (Number(e.amount) - Number(e.collected_amount)), 0);
              return { label: b.person_name, value: fmt(remaining), color: remaining > 0 ? "" : "text-positive" };
            }).filter((i: any) => parseFloat(i.value.replace(/[^0-9.-]/g, "")) !== 0)
          } />
        </TabsContent>
        <TabsContent value="payables" className="mt-4">
          <DataSummaryTab icon={CreditCard} title={t("reports.payablesReport")} noDataText={noData} items={
            payableBooks.filter((b: any) => b.status === "active").map((b: any) => {
              const bookEntries = payableEntries.filter((e: any) => e.book_id === b.id && e.status !== "paid");
              const remaining = bookEntries.reduce((s: number, e: any) => s + (Number(e.amount) - Number(e.paid_amount)), 0);
              return { label: b.person_name, value: fmt(remaining), color: remaining > 0 ? "text-negative" : "" };
            }).filter((i: any) => parseFloat(i.value.replace(/[^0-9.-]/g, "")) !== 0)
          } />
        </TabsContent>
        <TabsContent value="debt" className="mt-4">
          <DataSummaryTab icon={Scale} title={t("reports.debtReport")} noDataText={noData} items={loansRaw.filter((l: any) => l.status !== "paid_off").map((l: any) => ({ label: l.lender_name, value: fmt(Number(l.principal_amount) - Number(l.paid_amount)), color: "text-negative" }))} />
        </TabsContent>
        <TabsContent value="assets" className="mt-4">
          <DataSummaryTab icon={Building2} title={t("reports.assetReport")} noDataText={noData} items={assetsRaw.filter((a: any) => a.status === "active").map((a: any) => ({ label: a.asset_name, value: fmt(Number(a.current_value)) }))} />
        </TabsContent>
        <TabsContent value="investments" className="mt-4">
          <DataSummaryTab icon={TrendingUp} title={t("reports.investmentReport")} noDataText={noData} items={investmentsRaw.filter((i: any) => i.status === "active").map((i: any) => { const pl = Number(i.current_value) - Number(i.invested_amount); return { label: i.investment_name, value: `${pl >= 0 ? "+" : ""}${fmt(pl)}`, color: pl >= 0 ? "text-positive" : "text-negative" }; })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
