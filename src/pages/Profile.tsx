import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Building2, Briefcase, Calendar, CreditCard, Edit, CheckCircle2 } from "lucide-react";

const profileData = {
  name: "Rafiq Ahmed",
  email: "rafiq@cashcare.app",
  phone: "+880 1712-345678",
  address: "Dhaka, Bangladesh",
  company: "CashCare Inc.",
  role: "Business Owner",
  orgType: "Small Business",
  salary: "—",
  country: "Bangladesh",
  state: "Dhaka Division",
  plan: "Free",
  memberSince: "March 2026",
  workspace: "Personal",
  accountsCount: 5,
};

const completionFields = [
  { label: "Full Name", done: true },
  { label: "Email", done: true },
  { label: "Phone", done: true },
  { label: "Address", done: true },
  { label: "Company", done: true },
  { label: "Salary", done: false },
  { label: "Profile Photo", done: false },
];

export default function Profile() {
  const [editOpen, setEditOpen] = useState(false);
  const completedCount = completionFields.filter(f => f.done).length;
  const completionPct = Math.round((completedCount / completionFields.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage personal and professional account details" />

      {/* Top profile card */}
      <Card className="finance-card-static">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-6">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">RA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-display tracking-tight">{profileData.name}</h2>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="secondary" className="text-[10px]">{profileData.role}</Badge>
              <Badge variant="outline" className="text-[10px]">{profileData.workspace}</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setEditOpen(true)}>
            <Edit className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Full Name", value: profileData.name },
                { icon: Mail, label: "Email", value: profileData.email },
                { icon: Phone, label: "Phone", value: profileData.phone },
                { icon: MapPin, label: "Address", value: profileData.address },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0 mt-0.5">
                    <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-medium truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Building2, label: "Company", value: profileData.company },
                { icon: Briefcase, label: "Role / Position", value: profileData.role },
                { icon: Building2, label: "Organization Type", value: profileData.orgType },
                { icon: CreditCard, label: "Salary", value: profileData.salary },
                { icon: MapPin, label: "Country", value: profileData.country },
                { icon: MapPin, label: "State / Division", value: profileData.state },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0 mt-0.5">
                    <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-medium truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Account Summary */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Plan", value: profileData.plan },
                { label: "Member Since", value: profileData.memberSince },
                { label: "Workspace", value: profileData.workspace },
                { label: "Total Accounts", value: String(profileData.accountsCount) },
              ].map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{f.label}</span>
                    <span className="text-xs font-semibold">{f.value}</span>
                  </div>
                  {i < 3 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-display text-primary">{completionPct}%</span>
                <span className="text-xs text-muted-foreground">{completedCount}/{completionFields.length} fields</span>
              </div>
              <Progress value={completionPct} className="h-2" />
              <div className="space-y-1.5 pt-1">
                {completionFields.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${f.done ? "text-positive" : "text-muted-foreground/30"}`} />
                    <span className={`text-xs ${f.done ? "text-foreground" : "text-muted-foreground"}`}>{f.label}</span>
                  </div>
                ))}
              </div>
              {completionPct < 100 && (
                <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={() => setEditOpen(true)}>Complete Profile</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Personal</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input defaultValue={profileData.name} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input defaultValue={profileData.email} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input defaultValue={profileData.phone} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Address</Label><Input defaultValue={profileData.address} className="h-9 text-sm" /></div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Professional</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Company</Label><Input defaultValue={profileData.company} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Role</Label><Input defaultValue={profileData.role} className="h-9 text-sm" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Organization Type</Label>
                <Select defaultValue="small_business">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="small_business">Small Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Salary</Label><Input placeholder="Optional" className="h-9 text-sm" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Country</Label>
                <Select defaultValue="bd">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bd">Bangladesh</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">State / Division</Label><Input defaultValue={profileData.state} className="h-9 text-sm" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setEditOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
