import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Clock, CheckCircle2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAllUpgradeRequests, useReviewUpgradeRequest, type UpgradeRequest } from "@/hooks/use-upgrade-requests";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminUpgradeRequestsProps {
  users: { id: string; full_name: string | null; email: string | null }[];
  onPlanActivated?: (userId: string, plan: string) => void;
}

export function AdminUpgradeRequests({ users, onPlanActivated }: AdminUpgradeRequestsProps) {
  const { user: currentUser } = useAuth();
  const { data: requests = [], isLoading } = useAllUpgradeRequests();
  const reviewMutation = useReviewUpgradeRequest();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);

  const pendingRequests = requests.filter(r => r.status === "pending");
  const processedRequests = requests.filter(r => r.status !== "pending");
  const displayProcessed = showAll ? processedRequests : processedRequests.slice(0, 5);

  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u?.full_name || u?.email || "Unknown User";
  };

  const handleApprove = async (req: UpgradeRequest) => {
    try {
      // 1. Update request status
      await reviewMutation.mutateAsync({
        id: req.id,
        status: "approved",
        admin_note: adminNotes[req.id] || "Approved by admin",
        reviewed_by: currentUser!.id,
      });
      // 2. Activate the plan on the profile and verify
      console.log("[AdminUpgrade] Activating plan:", { userId: req.user_id, plan: req.requested_plan });
      const { data: updated, error } = await supabase
        .from("profiles")
        .update({ subscription_plan: req.requested_plan } as any)
        .eq("id", req.user_id)
        .select("subscription_plan");
      if (error) throw error;
      if (!updated || updated.length === 0) throw new Error("No rows updated — RLS may be blocking");
      console.log("[AdminUpgrade] Persisted:", (updated[0] as any).subscription_plan);
      toast.success(`Plan upgraded to ${req.requested_plan} for ${getUserName(req.user_id)}`);
      onPlanActivated?.(req.user_id, req.requested_plan);
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleReject = async (req: UpgradeRequest) => {
    try {
      await reviewMutation.mutateAsync({
        id: req.id,
        status: "rejected",
        admin_note: adminNotes[req.id] || "Rejected by admin",
        reviewed_by: currentUser!.id,
      });
      toast.success("Request rejected");
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  if (isLoading) return null;
  if (requests.length === 0) return null;

  return (
    <Card className="finance-card-static">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Crown className="h-4 w-4 text-feature-subscription" /> Upgrade Requests
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="text-[10px] ml-1">{pendingRequests.length} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No pending requests</p>
        )}
        {pendingRequests.map(req => (
          <div key={req.id} className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{getUserName(req.user_id)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {req.current_plan} → <span className="font-medium text-foreground">{req.requested_plan}</span> · {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] text-warning border-warning/40 shrink-0">Pending</Badge>
            </div>
            <Textarea
              placeholder="Admin note (optional)"
              className="text-xs min-h-[40px] h-10"
              value={adminNotes[req.id] || ""}
              onChange={e => setAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => handleApprove(req)} disabled={reviewMutation.isPending}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Activate
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => handleReject(req)} disabled={reviewMutation.isPending}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          </div>
        ))}

        {displayProcessed.length > 0 && (
          <>
            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Processed</p>
              {displayProcessed.map(req => (
                <div key={req.id} className="flex items-center gap-2.5 py-1.5 border-b border-border/30 last:border-0">
                  {req.status === "approved" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-positive shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  <span className="text-xs truncate flex-1">{getUserName(req.user_id)}</span>
                  <span className="text-[10px] text-muted-foreground">{req.current_plan}→{req.requested_plan}</span>
                  <Badge variant="outline" className={cn("text-[10px]", req.status === "approved" ? "text-positive border-positive/40" : "text-destructive border-destructive/40")}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
            {processedRequests.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full text-xs gap-1" onClick={() => setShowAll(!showAll)}>
                {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Show Less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show All ({processedRequests.length})</>}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
