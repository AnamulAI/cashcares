import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

interface PremiumLockedProps {
  icon: React.ReactNode;
  moduleName: string;
  description: string;
}

export function PremiumLocked({ icon, moduleName, description }: PremiumLockedProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card className="finance-card-static">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
            {icon}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-warning-foreground">
            <Lock className="h-3 w-3" />
          </div>
        </div>
        <h3 className="text-base font-semibold mt-1">{t("premium.moduleTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
        <Button className="mt-5 gap-1.5" onClick={() => navigate("/subscription")}>
          <Lock className="h-3.5 w-3.5" /> {t("premium.upgradeNow")}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-2">{t("premium.unlockAll")}</p>
      </CardContent>
    </Card>
  );
}
