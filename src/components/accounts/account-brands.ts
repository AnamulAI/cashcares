import {
  Wallet, Building2, Smartphone, CreditCard, PiggyBank, Briefcase,
  Banknote, Landmark, CircleDollarSign, Users, HandCoins, Coins,
  DollarSign, TrendingUp, ShieldCheck, Store, Globe, Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AccountBrand {
  icon: LucideIcon;
  color: string;
  label?: string;
}

// Known brand presets matched by lowercase name substring
const BRAND_PRESETS: { match: string[]; icon: LucideIcon; color: string; label: string }[] = [
  { match: ["bkash", "বিকাশ"], icon: Smartphone, color: "#e2136e", label: "bKash" },
  { match: ["nagad", "নগদ"], icon: Smartphone, color: "#f26522", label: "Nagad" },
  { match: ["rocket", "রকেট"], icon: Smartphone, color: "#8b2d8b", label: "Rocket" },
  { match: ["upay", "উপায়"], icon: Smartphone, color: "#00a651", label: "Upay" },
  { match: ["tap", "ট্যাপ"], icon: Smartphone, color: "#1a73e8", label: "Tap" },
  { match: ["dutch bangla", "dbbl", "ডাচ বাংলা"], icon: Landmark, color: "#00539b", label: "DBBL" },
  { match: ["islami bank", "ibbl", "ইসলামী ব্যাংক"], icon: Landmark, color: "#006838", label: "IBBL" },
  { match: ["city bank", "সিটি ব্যাংক"], icon: Landmark, color: "#c8102e", label: "City Bank" },
  { match: ["brac bank", "ব্র্যাক ব্যাংক"], icon: Landmark, color: "#e31837", label: "BRAC Bank" },
  { match: ["sonali bank", "সোনালী ব্যাংক"], icon: Landmark, color: "#fbb040", label: "Sonali Bank" },
  { match: ["janata bank", "জনতা ব্যাংক"], icon: Landmark, color: "#1b5e20", label: "Janata Bank" },
  { match: ["eastern bank", "ebl", "ইস্টার্ন ব্যাংক"], icon: Landmark, color: "#1565c0", label: "EBL" },
  { match: ["prime bank", "প্রাইম ব্যাংক"], icon: Landmark, color: "#c8102e", label: "Prime Bank" },
  { match: ["mutual trust", "mtb", "মিউচুয়াল ট্রাস্ট"], icon: Landmark, color: "#4a148c", label: "MTB" },
  { match: ["standard chartered", "scb", "স্ট্যান্ডার্ড চার্টার্ড"], icon: Landmark, color: "#0072aa", label: "SCB" },
  { match: ["hsbc", "এইচএসবিসি"], icon: Landmark, color: "#db0011", label: "HSBC" },
  { match: ["paypal", "পেপাল"], icon: CircleDollarSign, color: "#003087", label: "PayPal" },
  { match: ["agrani", "অগ্রণী"], icon: Landmark, color: "#1a237e", label: "Agrani Bank" },
  { match: ["rupali", "রূপালী"], icon: Landmark, color: "#0d47a1", label: "Rupali Bank" },
  { match: ["pubali", "পূবালী"], icon: Landmark, color: "#b71c1c", label: "Pubali Bank" },
  { match: ["uttara", "উত্তরা"], icon: Landmark, color: "#00695c", label: "Uttara Bank" },
  { match: ["mercantile", "মার্কেন্টাইল"], icon: Landmark, color: "#283593", label: "Mercantile Bank" },
  { match: ["southeast", "সাউথইস্ট"], icon: Landmark, color: "#1565c0", label: "Southeast Bank" },
  { match: ["one bank", "ওয়ান ব্যাংক"], icon: Landmark, color: "#ad1457", label: "One Bank" },
  { match: ["ucb", "united commercial", "ইউসিবি"], icon: Landmark, color: "#0277bd", label: "UCB" },
  { match: ["al-arafah", "আল-আরাফাহ"], icon: Landmark, color: "#2e7d32", label: "Al-Arafah Bank" },
  { match: ["social islami", "সোশ্যাল ইসলামী"], icon: Landmark, color: "#1b5e20", label: "Social Islami Bank" },
  { match: ["trust bank", "ট্রাস্ট ব্যাংক"], icon: Landmark, color: "#e65100", label: "Trust Bank" },
];

// Type-based fallback icons and colors
const TYPE_DEFAULTS: Record<string, { icon: LucideIcon; color: string }> = {
  cash: { icon: Banknote, color: "#22c55e" },
  bank: { icon: Landmark, color: "#3b82f6" },
  mobile_wallet: { icon: Smartphone, color: "#f97316" },
  card: { icon: CreditCard, color: "#8b5cf6" },
  savings: { icon: PiggyBank, color: "#14b8a6" },
  business: { icon: Briefcase, color: "#6366f1" },
  shared: { icon: Users, color: "#78716c" },
};

// Extended icon library for user override selection
export const ACCOUNT_ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Wallet", icon: Wallet },
  { name: "Banknote", icon: Banknote },
  { name: "Landmark", icon: Landmark },
  { name: "Smartphone", icon: Smartphone },
  { name: "CreditCard", icon: CreditCard },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "Briefcase", icon: Briefcase },
  { name: "Users", icon: Users },
  { name: "Building2", icon: Building2 },
  { name: "CircleDollarSign", icon: CircleDollarSign },
  { name: "HandCoins", icon: HandCoins },
  { name: "Coins", icon: Coins },
  { name: "DollarSign", icon: DollarSign },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Store", icon: Store },
  { name: "Globe", icon: Globe },
  { name: "Truck", icon: Truck },
];

export function getIconByName(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  const found = ACCOUNT_ICON_OPTIONS.find(o => o.name === name);
  return found?.icon || null;
}

export function detectBrand(name: string): AccountBrand | null {
  const lower = name.toLowerCase();
  for (const preset of BRAND_PRESETS) {
    if (preset.match.some(m => lower.includes(m))) {
      return { icon: preset.icon, color: preset.color, label: preset.label };
    }
  }
  return null;
}

export function getAccountVisual(account: { name: string; type: string; color: string; icon?: string | null }): AccountBrand {
  // 1. User-chosen icon override takes priority
  const customIcon = getIconByName(account.icon);
  
  // 2. Brand detection
  const brand = detectBrand(account.name);
  
  if (customIcon) {
    const effectiveColor = brand
      ? (account.color !== "#6366f1" ? account.color : brand.color)
      : (account.color || TYPE_DEFAULTS[account.type]?.color || "#6366f1");
    return { icon: customIcon, color: effectiveColor, label: brand?.label };
  }
  
  if (brand) return { ...brand, color: account.color !== "#6366f1" ? account.color : brand.color };

  const typeDefault = TYPE_DEFAULTS[account.type] || TYPE_DEFAULTS.cash;
  return {
    icon: typeDefault.icon,
    color: account.color || typeDefault.color,
  };
}

export function getTypeIcon(type: string): LucideIcon {
  return TYPE_DEFAULTS[type]?.icon || Wallet;
}

export function getTypeDefaultColor(type: string): string {
  return TYPE_DEFAULTS[type]?.color || "#6366f1";
}

export const ACCOUNT_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#e2136e", "#e11d48",
  "#f97316", "#f26522", "#f59e0b",
  "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#2563eb", "#1e40af",
  "#003087", "#00539b", "#c8102e",
  "#78716c", "#475569",
];
