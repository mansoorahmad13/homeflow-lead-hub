export type LeadStatus = "Sold" | "Rejected" | "Pending" | "Error";
export type Channel = "Windows" | "Bath";

export interface Lead {
  id: string;
  channel: Channel;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  zip: string;
  status: LeadStatus;
  price: number | null;
  submittedAt: string;
}

export const mockLeads: Lead[] = [
  { id: "LD-1001", channel: "Windows", firstName: "James", lastName: "Wilson", phoneNumber: "555-012-3456", email: "jwilson@email.com", zip: "90210", status: "Sold", price: 12.50, submittedAt: "2026-04-06T09:14:00Z" },
  { id: "LD-1002", channel: "Bath", firstName: "Sarah", lastName: "Chen", phoneNumber: "555-234-5678", email: "schen@email.com", zip: "10001", status: "Pending", price: null, submittedAt: "2026-04-06T10:22:00Z" },
  { id: "LD-1003", channel: "Windows", firstName: "Michael", lastName: "Brown", phoneNumber: "555-345-6789", email: "mbrown@email.com", zip: "60614", status: "Rejected", price: 8.00, submittedAt: "2026-04-06T08:05:00Z" },
  { id: "LD-1004", channel: "Bath", firstName: "Emily", lastName: "Davis", phoneNumber: "555-456-7890", email: "edavis@email.com", zip: "33101", status: "Sold", price: 15.00, submittedAt: "2026-04-05T16:30:00Z" },
  { id: "LD-1005", channel: "Windows", firstName: "Robert", lastName: "Garcia", phoneNumber: "555-567-8901", email: "rgarcia@email.com", zip: "75201", status: "Error", price: null, submittedAt: "2026-04-05T14:12:00Z" },
  { id: "LD-1006", channel: "Bath", firstName: "Lisa", lastName: "Martinez", phoneNumber: "555-678-9012", email: "lmartinez@email.com", zip: "98101", status: "Sold", price: 11.25, submittedAt: "2026-04-05T11:45:00Z" },
  { id: "LD-1007", channel: "Windows", firstName: "David", lastName: "Anderson", phoneNumber: "555-789-0123", email: "danderson@email.com", zip: "85001", status: "Pending", price: null, submittedAt: "2026-04-06T11:00:00Z" },
  { id: "LD-1008", channel: "Bath", firstName: "Jennifer", lastName: "Taylor", phoneNumber: "555-890-1234", email: "jtaylor@email.com", zip: "30301", status: "Rejected", price: 9.75, submittedAt: "2026-04-04T09:30:00Z" },
  { id: "LD-1009", channel: "Windows", firstName: "Chris", lastName: "Thomas", phoneNumber: "555-901-2345", email: "cthomas@email.com", zip: "02101", status: "Sold", price: 14.00, submittedAt: "2026-04-06T07:20:00Z" },
  { id: "LD-1010", channel: "Bath", firstName: "Amanda", lastName: "Jackson", phoneNumber: "555-012-3456", email: "ajackson@email.com", zip: "48201", status: "Pending", price: null, submittedAt: "2026-04-06T12:15:00Z" },
];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];
