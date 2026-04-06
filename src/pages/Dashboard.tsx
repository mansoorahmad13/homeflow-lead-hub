import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockLeads } from "@/data/mockLeads";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);
const todayLeads = mockLeads.filter((l) => l.submittedAt.startsWith(today));

const stats = [
  { label: "Sent Today", value: todayLeads.length, icon: Clock, color: "text-primary" },
  { label: "Sold", value: todayLeads.filter((l) => l.status === "Sold").length, icon: CheckCircle, color: "text-status-sold" },
  { label: "Rejected", value: todayLeads.filter((l) => l.status === "Rejected").length, icon: XCircle, color: "text-status-rejected" },
  { label: "Pending", value: todayLeads.filter((l) => l.status === "Pending").length, icon: AlertTriangle, color: "text-status-pending" },
];

export default function Dashboard() {
  const recentLeads = [...mockLeads].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Lead Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-mono text-xs">{lead.id}</TableCell>
                  <TableCell>{lead.channel}</TableCell>
                  <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                  <TableCell><StatusBadge status={lead.status} /></TableCell>
                  <TableCell>{lead.price != null ? `$${lead.price.toFixed(2)}` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(lead.submittedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
