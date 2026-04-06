import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { mockLeads, type Channel, type LeadStatus } from "@/data/mockLeads";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export default function LeadHistory() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const filtered = useMemo(() => {
    return mockLeads.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || [l.id, l.firstName, l.lastName, l.phoneNumber, l.zip, l.email]
        .some((f) => f.toLowerCase().includes(q));
      const matchesChannel = channelFilter === "all" || l.channel === channelFilter;
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const date = new Date(l.submittedAt);
      const matchesFrom = !dateFrom || date >= dateFrom;
      const matchesTo = !dateTo || date <= new Date(dateTo.getTime() + 86400000);
      return matchesSearch && matchesChannel && matchesStatus && matchesFrom && matchesTo;
    }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [search, channelFilter, statusFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Lead History</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="Windows">Windows</SelectItem>
                <SelectItem value="Bath">Bath</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker label="From" date={dateFrom} onChange={setDateFrom} />
            <DatePicker label="To" date={dateTo} onChange={setDateTo} />
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Zip</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No leads found</TableCell></TableRow>
                ) : filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-mono text-xs">{lead.id}</TableCell>
                    <TableCell>{lead.channel}</TableCell>
                    <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                    <TableCell>{lead.phoneNumber}</TableCell>
                    <TableCell>{lead.zip}</TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell>{lead.price != null ? `$${lead.price.toFixed(2)}` : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(lead.submittedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DatePicker({ label, date, onChange }: { label: string; date?: Date; onChange: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM d, yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}
