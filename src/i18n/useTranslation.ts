import { useAppContext } from "@/contexts/AppContext";
import { translations, type Lang } from "./translations";

export function useTranslation() {
  const { settings } = useAppContext();
  const lang = (settings.language as Lang) || "en";
  const dict = translations[lang] || translations.en;

  const t = (key: string, fallback?: string): string => {
    return dict[key] || translations.en[key] || fallback || key;
  };

  return { t, lang };
}
