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

const WINDOWS_PING_URL = "/profitise/ping/";

const WINDOWS_API_ID = import.meta.env.VITE_PROFITISE_WINDOWS_API_ID as string;
const WINDOWS_API_PASSWORD = import.meta.env.VITE_PROFITISE_WINDOWS_API_PASSWORD as string;
const WINDOWS_PRODUCT_ID = Number(import.meta.env.VITE_PROFITISE_WINDOWS_PRODUCT_ID) || 268;

const BATH_PING_URL = "/profitise/ping/";
const BATH_POST_URL = "/profitise/post/";
const BATH_FULLPOST_URL = "/profitise/fullpost/";

const BATH_API_ID = import.meta.env.VITE_PROFITISE_BATH_API_ID as string;
const BATH_API_PASSWORD = import.meta.env.VITE_PROFITISE_BATH_API_PASSWORD as string;
const BATH_PRODUCT_ID = Number(import.meta.env.VITE_PROFITISE_BATH_PRODUCT_ID) || 269;

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

  const handleChannelSwitch = (ch: Channel) => {
    setChannel(ch);
    setForm({});
    setErrors({});
    if (ch === "Windows") setStrategy("ping_post");
  };

  // Required fields differ by channel.
  // Windows uses ping-only — only ping's required fields apply.
  const windowsRequiredFields = [
    "zip", "ownHome", "typeOfWindow", "numberOfWindows", "typeOfService", "tcpaStatement",
  ];
  // Bath: firstName…address required for post; zip/ownHome/addRemoveWall/typeOfService/tcpaStatement required for ping.
  // Collect all upfront so both ping and post have what they need.
  const bathRequiredFields = [
    "firstName", "lastName", "phoneNumber", "email", "address",
    "zip", "ownHome", "addRemoveWall", "typeOfService", "tcpaStatement",
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    const required = channel === "Windows" ? windowsRequiredFields : bathRequiredFields;
    required.forEach((f) => {
      if (!form[f]?.trim()) errs[f] = "Required";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (form.zip && !/^\d{5}(-\d{4})?$/.test(form.zip)) errs.zip = "Must be 5 digits";
    if (channel === "Bath" && strategy === "full_post" && !form.price?.trim()) errs.price = "Required for Full Post";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWindowsPing = async () => {
    const pingPayload = {
      apiId: WINDOWS_API_ID,
      apiPassword: WINDOWS_API_PASSWORD,
      productId: WINDOWS_PRODUCT_ID,
      userAgent: navigator.userAgent,
      zip: form.zip,
      ownHome: form.ownHome,
      typeOfWindow: form.typeOfWindow,
      numberOfWindows: form.numberOfWindows,
      typeOfService: form.typeOfService,
      tcpaStatement: form.tcpaStatement,
      ...(form.firstName && { firstName: form.firstName }),
      ...(form.lastName && { lastName: form.lastName }),
      ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
      ...(form.email && { email: form.email }),
      ...(form.address && { address: form.address }),
      ...(form.city && { city: form.city }),
      ...(form.state && { state: form.state }),
      ...(form.jornayaLeadId && { jornayaLeadId: form.jornayaLeadId }),
      ...(form.trustedFormURL && { trustedFormURL: form.trustedFormURL }),
      ...(form.buyTimeframe && { buyTimeframe: form.buyTimeframe }),
      ...(form.bestCallTime && { bestCallTime: form.bestCallTime }),
      ...(form.subSource && { subSource: form.subSource }),
      ...(form.clickid && { clickid: form.clickid }),
      ...(form.source && { source: form.source }),
      ...(form.webSiteUrl && { webSiteUrl: form.webSiteUrl }),
      ...(form.userIp && { userIp: form.userIp }),
      ...(testMode && { testMode: 1 }),
    };

    let pingData: Record<string, unknown>;
    try {
      const pingRes = await fetch(WINDOWS_PING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pingPayload),
      });
      pingData = await pingRes.json();
    } catch {
      toast.error("Ping request failed. Check your connection and try again.");
      return;
    }

    if (pingData.status === "continue") {
      toast.success(`Ping accepted — price: $${pingData.price}, promise: ${pingData.promise}`);
    } else {
      toast.error(`Ping rejected: ${(pingData.reason as string) || "No buyer found."}`);
    }
  };

  const bathCommonPayload = () => ({
    apiId: BATH_API_ID,
    apiPassword: BATH_API_PASSWORD,
    productId: BATH_PRODUCT_ID,
    userAgent: navigator.userAgent,
    zip: form.zip,
    ownHome: form.ownHome,
    addRemoveWall: form.addRemoveWall,
    typeOfService: form.typeOfService,
    tcpaStatement: form.tcpaStatement,
    firstName: form.firstName,
    lastName: form.lastName,
    phoneNumber: form.phoneNumber,
    email: form.email,
    address: form.address,
    ...(form.city && { city: form.city }),
    ...(form.state && { state: form.state }),
    ...(form.jornayaLeadId && { jornayaLeadId: form.jornayaLeadId }),
    ...(form.trustedFormURL && { trustedFormURL: form.trustedFormURL }),
    ...(form.buyTimeframe && { buyTimeframe: form.buyTimeframe }),
    ...(form.bestCallTime && { bestCallTime: form.bestCallTime }),
    ...(form.subSource && { subSource: form.subSource }),
    ...(form.clickid && { clickid: form.clickid }),
    ...(form.source && { source: form.source }),
    ...(form.webSiteUrl && { webSiteUrl: form.webSiteUrl }),
    ...(form.userIp && { userIp: form.userIp }),
    ...(testMode && { testMode: 1 }),
  });

  const handleBathPingPost = async () => {
    // Step 1 — Ping
    let pingData: Record<string, unknown>;
    try {
      const pingRes = await fetch(BATH_PING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bathCommonPayload()),
      });
      pingData = await pingRes.json();
    } catch {
      toast.error("Ping request failed. Check your connection and try again.");
      return;
    }

    if (pingData.status !== "continue") {
      toast.error(`Ping rejected: ${(pingData.reason as string) || "No buyer found."}`);
      return;
    }

    toast.info(`Ping accepted — offer: $${pingData.price}. Posting lead...`);

    // Step 2 — Post
    let postData: Record<string, unknown>;
    try {
      const postRes = await fetch(BATH_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bathCommonPayload(), promise: pingData.promise }),
      });
      postData = await postRes.json();
    } catch {
      toast.error("Post request failed. Check your connection and try again.");
      return;
    }

    if (postData.status_text === "sold") {
      toast.success(`Lead sold for $${postData.price}!`);
    } else if (postData.status_text === "reject") {
      toast.warning("Lead was rejected by buyers.");
    } else if (postData.errors) {
      toast.error(`Submission error: ${JSON.stringify(postData.errors)}`);
    } else {
      toast.info("Lead submitted. Status: " + (postData.status_text ?? "unknown"));
    }
  };

  const handleBathFullPost = async () => {
    let postData: Record<string, unknown>;
    try {
      const postRes = await fetch(BATH_FULLPOST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bathCommonPayload(), price: parseFloat(form.price) }),
      });
      postData = await postRes.json();
    } catch {
      toast.error("Full post request failed. Check your connection and try again.");
      return;
    }

    if (postData.status_text === "sold") {
      toast.success(`Lead sold for $${postData.price}!`);
    } else if (postData.status_text === "reject") {
      toast.warning("Lead was rejected by buyers.");
    } else if (postData.errors) {
      toast.error(`Submission error: ${JSON.stringify(postData.errors)}`);
    } else {
      toast.info("Lead submitted. Status: " + (postData.status_text ?? "unknown"));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error("Please fix validation errors"); return; }
    setLoading(true);
    try {
      if (channel === "Windows") {
        await handleWindowsPing();
      } else {
        if (strategy === "full_post") {
          await handleBathFullPost();
        } else {
          await handleBathPingPost();
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name: string) =>
    errors[name] ? "border-destructive focus-visible:ring-destructive" : "";

  const isWindowsRequired = (field: string) => windowsRequiredFields.includes(field);
  const isBathRequired = (field: string) => bathRequiredFields.includes(field);
  const isRequired = (field: string) =>
    channel === "Windows" ? isWindowsRequired(field) : isBathRequired(field);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Submit Lead</h1>

      {/* Channel Toggle */}
      <div className="flex gap-2">
        {(["Windows", "Bath"] as Channel[]).map((ch) => (
          <Button
            key={ch}
            variant={channel === ch ? "default" : "outline"}
            onClick={() => handleChannelSwitch(ch)}
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
            <Field label="First Name" required={isRequired("firstName")} error={errors.firstName}>
              <Input value={form.firstName || ""} onChange={(e) => set("firstName", e.target.value)} className={fieldClass("firstName")} />
            </Field>
            <Field label="Last Name" required={isRequired("lastName")} error={errors.lastName}>
              <Input value={form.lastName || ""} onChange={(e) => set("lastName", e.target.value)} className={fieldClass("lastName")} />
            </Field>
            <Field label="Phone Number" required={isRequired("phoneNumber")} error={errors.phoneNumber}>
              <Input value={form.phoneNumber || ""} onChange={(e) => set("phoneNumber", e.target.value)} className={fieldClass("phoneNumber")} />
            </Field>
            <Field label="Email" required={isRequired("email")} error={errors.email}>
              <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} className={fieldClass("email")} />
            </Field>
            <Field label="Address" required={isRequired("address")} error={errors.address} className="sm:col-span-2">
              <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} className={fieldClass("address")} />
            </Field>
            <Field label="City" required={isRequired("city")} error={errors.city}>
              <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} className={fieldClass("city")} />
            </Field>
            <Field label="State" required={isRequired("state")} error={errors.state}>
              <Select value={form.state || ""} onValueChange={(v) => set("state", v)}>
                <SelectTrigger className={fieldClass("state")}><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Zip" required={isRequired("zip")} error={errors.zip}>
              <Input value={form.zip || ""} onChange={(e) => set("zip", e.target.value)} maxLength={5} className={fieldClass("zip")} />
            </Field>
            <Field label="Own Home" required={isRequired("ownHome")} error={errors.ownHome}>
              <Select value={form.ownHome || ""} onValueChange={(v) => set("ownHome", v)}>
                <SelectTrigger className={fieldClass("ownHome")}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">YES</SelectItem>
                  <SelectItem value="NO">NO</SelectItem>
                  <SelectItem value="NA">NA</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Buy Timeframe" required={isRequired("buyTimeframe")} error={errors.buyTimeframe}>
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

          <Field label="TCPA Statement" required={isRequired("tcpaStatement")} error={errors.tcpaStatement}>
            <Textarea value={form.tcpaStatement || ""} onChange={(e) => set("tcpaStatement", e.target.value)} rows={3} className={fieldClass("tcpaStatement")} />
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
                        {["WINDOWS", "WINDOW_BLINDS", "WINDOW_DRAPERIES", "WINDOW_SHUTTERS", "WINDOW_TINTING", "OTHER"].map((v) => (
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
                        {["INSTALL_REPLACE", "REPAIR_SERVICE", "OTHER"].map((v) => (
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
                        {["BATHTUB_TO_SHOWER_CONVERSION", "BATHTUB_SHOWER_UPDATES", "WALK_IN_SHOWER", "COMPLETE_BATHROOM_REMODEL", "OTHER"].map((v) => (
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
            {channel === "Windows" ? (
              <div className="space-y-2">
                <Button variant="default" size="sm" disabled>Ping</Button>
                <p className="text-xs text-muted-foreground">
                  Ping URL: <span className="font-mono">https://leads.profitise.com/ping/</span>
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button variant={strategy === "ping_post" ? "default" : "outline"} size="sm" onClick={() => setStrategy("ping_post")}>Ping + Post</Button>
                  <Button variant={strategy === "full_post" ? "default" : "outline"} size="sm" onClick={() => setStrategy("full_post")}>Full Post</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {strategy === "ping_post" ? (
                    <>
                      Ping URL: <span className="font-mono">https://leads.profitise.com/ping/</span>
                      <span className="mx-2">·</span>
                      Post URL: <span className="font-mono">https://leads.profitise.com/post/</span>
                    </>
                  ) : (
                    <>Full Post URL: <span className="font-mono">https://leads.profitise.com/fullpost/</span></>
                  )}
                </p>
                {strategy === "full_post" && (
                  <Field label="Minimum Price ($)" required error={errors.price}>
                    <Input type="number" step="0.01" min={0} value={form.price || ""} onChange={(e) => set("price", e.target.value)} className={fieldClass("price")} />
                  </Field>
                )}
              </>
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
