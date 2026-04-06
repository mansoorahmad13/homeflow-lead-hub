import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { US_STATES, type Channel } from "@/data/mockLeads";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const RequiredMark = () => <span className="text-destructive ml-0.5">*</span>;

type PostingStrategy = "ping_post" | "full_post";

export default function SubmitLead() {
  const [channel, setChannel] = useState<Channel>("Windows");
  const [strategy, setStrategy] = useState<PostingStrategy>("ping_post");
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const requiredFields = [
    "firstName", "lastName", "phoneNumber", "email", "address", "city", "state", "zip",
    "ownHome", "buyTimeframe",
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    requiredFields.forEach((f) => {
      if (!form[f]?.trim()) errs[f] = "Required";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (form.zip && !/^\d{5}$/.test(form.zip)) errs.zip = "Must be 5 digits";
    if (strategy === "full_post" && !form.price?.trim()) errs.price = "Required for Full Post";
    if (channel === "Windows" && !form.typeOfWindow?.trim()) errs.typeOfWindow = "Required";
    if (channel === "Windows" && !form.numberOfWindows?.trim()) errs.numberOfWindows = "Required";
    if (channel === "Bath" && !form.addRemoveWall?.trim()) errs.addRemoveWall = "Required";
    if (!form.typeOfService?.trim()) errs.typeOfService = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error("Please fix validation errors"); return; }
    setLoading(true);
    const payload = {
      channel,
      postingStrategy: strategy,
      testMode,
      ...(strategy === "full_post" && { price: parseFloat(form.price) }),
      ...form,
    };
    console.log("Lead Payload:", JSON.stringify(payload, null, 2));
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Lead submitted (logged to console)");
    setLoading(false);
  };

  const fieldClass = (name: string) =>
    errors[name] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Submit Lead</h1>

      {/* Channel Toggle */}
      <div className="flex gap-2">
        {(["Windows", "Bath"] as Channel[]).map((ch) => (
          <Button
            key={ch}
            variant={channel === ch ? "default" : "outline"}
            onClick={() => { setChannel(ch); setForm({}); setErrors({}); }}
          >
            {ch}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Lead Information</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* Common Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" required error={errors.firstName}>
              <Input value={form.firstName || ""} onChange={(e) => set("firstName", e.target.value)} className={fieldClass("firstName")} />
            </Field>
            <Field label="Last Name" required error={errors.lastName}>
              <Input value={form.lastName || ""} onChange={(e) => set("lastName", e.target.value)} className={fieldClass("lastName")} />
            </Field>
            <Field label="Phone Number" required error={errors.phoneNumber}>
              <Input value={form.phoneNumber || ""} onChange={(e) => set("phoneNumber", e.target.value)} className={fieldClass("phoneNumber")} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} className={fieldClass("email")} />
            </Field>
            <Field label="Address" required error={errors.address} className="sm:col-span-2">
              <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} className={fieldClass("address")} />
            </Field>
            <Field label="City" required error={errors.city}>
              <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} className={fieldClass("city")} />
            </Field>
            <Field label="State" required error={errors.state}>
              <Select value={form.state || ""} onValueChange={(v) => set("state", v)}>
                <SelectTrigger className={fieldClass("state")}><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Zip" required error={errors.zip}>
              <Input value={form.zip || ""} onChange={(e) => set("zip", e.target.value)} maxLength={5} className={fieldClass("zip")} />
            </Field>
            <Field label="Own Home" required error={errors.ownHome}>
              <Select value={form.ownHome || ""} onValueChange={(v) => set("ownHome", v)}>
                <SelectTrigger className={fieldClass("ownHome")}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">YES</SelectItem>
                  <SelectItem value="NO">NO</SelectItem>
                  <SelectItem value="NA">NA</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Buy Timeframe" required error={errors.buyTimeframe}>
              <Select value={form.buyTimeframe || ""} onValueChange={(v) => set("buyTimeframe", v)}>
                <SelectTrigger className={fieldClass("buyTimeframe")}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMMEDIATELY">IMMEDIATELY</SelectItem>
                  <SelectItem value="ONE_SIX_MONTH">ONE_SIX_MONTH</SelectItem>
                  <SelectItem value="DONT_KNOW">DONT_KNOW</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Best Call Time">
              <Input value={form.bestCallTime || ""} onChange={(e) => set("bestCallTime", e.target.value)} />
            </Field>
          </div>

          <Field label="TCPA Statement">
            <Textarea value={form.tcpaStatement || ""} onChange={(e) => set("tcpaStatement", e.target.value)} rows={3} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jornaya Lead ID"><Input value={form.jornayaLeadId || ""} onChange={(e) => set("jornayaLeadId", e.target.value)} /></Field>
            <Field label="TrustedForm URL"><Input value={form.trustedFormURL || ""} onChange={(e) => set("trustedFormURL", e.target.value)} /></Field>
            <Field label="User IP"><Input value={form.userIp || ""} onChange={(e) => set("userIp", e.target.value)} /></Field>
            <Field label="Sub Source"><Input value={form.subSource || ""} onChange={(e) => set("subSource", e.target.value)} /></Field>
            <Field label="Click ID"><Input value={form.clickid || ""} onChange={(e) => set("clickid", e.target.value)} /></Field>
            <Field label="Source"><Input value={form.source || ""} onChange={(e) => set("source", e.target.value)} /></Field>
            <Field label="Website URL" className="sm:col-span-2"><Input value={form.webSiteUrl || ""} onChange={(e) => set("webSiteUrl", e.target.value)} /></Field>
          </div>

          {/* Channel-specific fields */}
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
              {channel === "Windows" ? "Window Details" : "Bathroom Details"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {channel === "Windows" ? (
                <>
                  <Field label="Type of Window" required error={errors.typeOfWindow}>
                    <Select value={form.typeOfWindow || ""} onValueChange={(v) => set("typeOfWindow", v)}>
                      <SelectTrigger className={fieldClass("typeOfWindow")}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["WINDOWS","WINDOW_BLINDS","WINDOW_DRAPERIES","WINDOW_SHUTTERS","WINDOW_TINTING","OTHER"].map((v) => (
                          <SelectItem key={v} value={v}>{v.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Number of Windows" required error={errors.numberOfWindows}>
                    <Input type="number" min={1} value={form.numberOfWindows || ""} onChange={(e) => set("numberOfWindows", e.target.value)} className={fieldClass("numberOfWindows")} />
                  </Field>
                  <Field label="Type of Service" required error={errors.typeOfService}>
                    <Select value={form.typeOfService || ""} onValueChange={(v) => set("typeOfService", v)}>
                      <SelectTrigger className={fieldClass("typeOfService")}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["INSTALL_REPLACE","REPAIR_SERVICE","OTHER"].map((v) => (
                          <SelectItem key={v} value={v}>{v.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Add/Remove Wall" required error={errors.addRemoveWall}>
                    <Select value={form.addRemoveWall || ""} onValueChange={(v) => set("addRemoveWall", v)}>
                      <SelectTrigger className={fieldClass("addRemoveWall")}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YES">YES</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                        <SelectItem value="NOT_SURE">NOT_SURE</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Type of Service" required error={errors.typeOfService}>
                    <Select value={form.typeOfService || ""} onValueChange={(v) => set("typeOfService", v)}>
                      <SelectTrigger className={fieldClass("typeOfService")}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["BATHTUB_TO_SHOWER_CONVERSION","BATHTUB_SHOWER_UPDATES","WALK_IN_SHOWER","COMPLETE_BATHROOM_REMODEL","OTHER"].map((v) => (
                          <SelectItem key={v} value={v}>{v.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
            </div>
          </div>

          {/* Posting Strategy */}
          <div className="border-t pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Posting Strategy</h3>
            <div className="flex gap-2">
              <Button variant={strategy === "ping_post" ? "default" : "outline"} size="sm" onClick={() => setStrategy("ping_post")}>Ping + Post</Button>
              <Button variant={strategy === "full_post" ? "default" : "outline"} size="sm" onClick={() => setStrategy("full_post")}>Full Post</Button>
            </div>
            {strategy === "full_post" && (
              <Field label="Minimum Price ($)" required error={errors.price}>
                <Input type="number" step="0.01" min={0} value={form.price || ""} onChange={(e) => set("price", e.target.value)} className={fieldClass("price")} />
              </Field>
            )}
          </div>

          {/* Test Mode */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-3">
              <Checkbox id="testMode" checked={testMode} onCheckedChange={(c) => setTestMode(!!c)} />
              <Label htmlFor="testMode" className="cursor-pointer">Test Mode</Label>
              {testMode && (
                <Badge variant="outline" className="bg-status-pending/15 text-status-pending border-status-pending/30 gap-1">
                  <AlertTriangle className="h-3 w-3" /> Test Mode Enabled
                </Badge>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={loading} className="w-full mt-2" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Lead"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, required, error, className, children }: {
  label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-sm mb-1.5 block">
        {label}{required && <RequiredMark />}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
