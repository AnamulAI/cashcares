import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

const ROLES = [
  { value: "user", label: "User", desc: "Standard app access" },
  { value: "admin", label: "Admin", desc: "Full system access" },
  { value: "manager", label: "Manager", desc: "Team management access" },
  { value: "support", label: "Support", desc: "Support & read access" },
];

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentRole: string;
  onConfirm: (newRole: string) => Promise<void>;
  isSelf?: boolean;
}

export function EditRoleModal({ open, onOpenChange, userName, currentRole, onConfirm, isSelf }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (selectedRole === currentRole) return;
    setSaving(true);
    await onConfirm(selectedRole);
    setSaving(false);
    onOpenChange(false);
  };

  const isDemotion = isSelf && currentRole === "admin" && selectedRole !== "admin";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) { onOpenChange(o); setSelectedRole(currentRole); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Edit Role
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs text-muted-foreground">User</p>
            <p className="text-sm font-medium">{userName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Role</p>
            <Badge variant="secondary" className="text-[10px]">{currentRole}</Badge>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{r.label}</span>
                      <span className="text-[10px] text-muted-foreground">{r.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isDemotion && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md p-2">
              ⚠️ You are removing your own admin access. You will lose access to this page.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); setSelectedRole(currentRole); }} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={saving || selectedRole === currentRole}>
            {saving ? "Saving..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
