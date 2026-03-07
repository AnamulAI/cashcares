import {
  Wallet, Banknote, TrendingUp, TrendingDown, CreditCard, PiggyBank,
  Home, Car, Utensils, ShoppingCart, GraduationCap, HeartPulse,
  Briefcase, Gift, Plane, Smartphone, Dumbbell, Zap,
  Building2, Receipt, HandCoins, Landmark, DollarSign,
  Package, Wrench, BookOpen, Baby, Music, Gamepad2,
  Shirt, Coffee, Bus, Fuel, Wifi, Tv,
  FolderOpen, Tag, ArrowDownUp, ArrowUpRight, ArrowDownRight,
  CircleDollarSign, BadgeDollarSign, Scale, ChartBar, Layers,
  ArrowRightLeft, Send, Download, Upload, RefreshCcw,
  ClipboardCheck, FileCheck, ShieldCheck, CircleCheck,
  Repeat, ReceiptText, Handshake, MoveRight, MoveLeft,
  ArrowUpFromLine, ArrowDownToLine, BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryIconOption {
  key: string;
  icon: LucideIcon;
  label: string;
  group: string;
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  // Finance
  { key: "wallet", icon: Wallet, label: "Wallet", group: "Finance" },
  { key: "banknote", icon: Banknote, label: "Cash", group: "Finance" },
  { key: "dollar-sign", icon: DollarSign, label: "Dollar", group: "Finance" },
  { key: "credit-card", icon: CreditCard, label: "Card", group: "Finance" },
  { key: "piggy-bank", icon: PiggyBank, label: "Savings", group: "Finance" },
  { key: "hand-coins", icon: HandCoins, label: "Coins", group: "Finance" },
  { key: "landmark", icon: Landmark, label: "Bank", group: "Finance" },
  { key: "receipt", icon: Receipt, label: "Receipt", group: "Finance" },
  { key: "circle-dollar", icon: CircleDollarSign, label: "Money", group: "Finance" },
  { key: "badge-dollar", icon: BadgeDollarSign, label: "Badge", group: "Finance" },
  { key: "trending-up", icon: TrendingUp, label: "Income", group: "Finance" },
  { key: "trending-down", icon: TrendingDown, label: "Expense", group: "Finance" },
  { key: "chart-bar", icon: ChartBar, label: "Chart", group: "Finance" },
  { key: "scale", icon: Scale, label: "Balance", group: "Finance" },
  { key: "arrow-up-right", icon: ArrowUpRight, label: "Send", group: "Finance" },
  { key: "arrow-down-right", icon: ArrowDownRight, label: "Receive", group: "Finance" },
  { key: "arrow-down-up", icon: ArrowDownUp, label: "Transfer", group: "Finance" },

  // Debt & Settlement
  { key: "arrow-right-left", icon: ArrowRightLeft, label: "Exchange", group: "Debt" },
  { key: "send", icon: Send, label: "কর্জ দেওয়া", group: "Debt" },
  { key: "download", icon: Download, label: "কর্জ পাওয়া", group: "Debt" },
  { key: "clipboard-check", icon: ClipboardCheck, label: "কর্জ পরিশোধ", group: "Debt" },
  { key: "move-right", icon: MoveRight, label: "দেনা", group: "Debt" },
  { key: "move-left", icon: MoveLeft, label: "পাওনা", group: "Debt" },
  { key: "badge-check", icon: BadgeCheck, label: "আদায়", group: "Debt" },
  { key: "shield-check", icon: ShieldCheck, label: "Settlement", group: "Debt" },
  { key: "file-check", icon: FileCheck, label: "Paid Back", group: "Debt" },
  { key: "circle-check", icon: CircleCheck, label: "Cleared", group: "Debt" },
  { key: "repeat", icon: Repeat, label: "Repayment", group: "Debt" },
  { key: "receipt-text", icon: ReceiptText, label: "Due", group: "Debt" },
  { key: "handshake", icon: Handshake, label: "Agreement", group: "Debt" },
  { key: "upload", icon: Upload, label: "Money Out", group: "Debt" },
  { key: "refresh-ccw", icon: RefreshCcw, label: "Refund", group: "Debt" },
  { key: "arrow-up-from-line", icon: ArrowUpFromLine, label: "Outgoing", group: "Debt" },
  { key: "arrow-down-to-line", icon: ArrowDownToLine, label: "Incoming", group: "Debt" },

  // Living
  { key: "home", icon: Home, label: "Home", group: "Living" },
  { key: "zap", icon: Zap, label: "Bills", group: "Living" },
  { key: "wifi", icon: Wifi, label: "Internet", group: "Living" },
  { key: "tv", icon: Tv, label: "TV", group: "Living" },
  { key: "wrench", icon: Wrench, label: "Repairs", group: "Living" },

  // Transport
  { key: "car", icon: Car, label: "Car", group: "Transport" },
  { key: "bus", icon: Bus, label: "Transport", group: "Transport" },
  { key: "fuel", icon: Fuel, label: "Fuel", group: "Transport" },
  { key: "plane", icon: Plane, label: "Travel", group: "Transport" },

  // Food & Shopping
  { key: "utensils", icon: Utensils, label: "Food", group: "Shopping" },
  { key: "coffee", icon: Coffee, label: "Coffee", group: "Shopping" },
  { key: "shopping-cart", icon: ShoppingCart, label: "Shopping", group: "Shopping" },
  { key: "shirt", icon: Shirt, label: "Clothing", group: "Shopping" },
  { key: "package", icon: Package, label: "Package", group: "Shopping" },

  // Education & Health
  { key: "graduation-cap", icon: GraduationCap, label: "Education", group: "Education" },
  { key: "book-open", icon: BookOpen, label: "Books", group: "Education" },
  { key: "heart-pulse", icon: HeartPulse, label: "Health", group: "Health" },
  { key: "dumbbell", icon: Dumbbell, label: "Fitness", group: "Health" },

  // Work & Business
  { key: "briefcase", icon: Briefcase, label: "Business", group: "Work" },
  { key: "building2", icon: Building2, label: "Office", group: "Work" },
  { key: "smartphone", icon: Smartphone, label: "Tech", group: "Work" },

  // Lifestyle
  { key: "gift", icon: Gift, label: "Gift", group: "Lifestyle" },
  { key: "baby", icon: Baby, label: "Kids", group: "Lifestyle" },
  { key: "music", icon: Music, label: "Music", group: "Lifestyle" },
  { key: "gamepad-2", icon: Gamepad2, label: "Gaming", group: "Lifestyle" },

  // General
  { key: "folder-open", icon: FolderOpen, label: "General", group: "General" },
  { key: "tag", icon: Tag, label: "Tag", group: "General" },
  { key: "layers", icon: Layers, label: "Layers", group: "General" },
];

export const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#e11d48",
  "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#2563eb",
  "#78716c", "#64748b", "#475569",
];
