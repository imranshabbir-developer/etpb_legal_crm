export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type Lead = {
  id: string;
  name: string;
  company: string;
  handle: string;
  status: LeadStatus;
  value: number;
  owner: string;
  updated: string;
};

export const weeklyStats = [
  { day: "Mon", leads: 62, deals: 24 },
  { day: "Tue", leads: 78, deals: 31 },
  { day: "Wed", leads: 54, deals: 19 },
  { day: "Thu", leads: 96, deals: 42 },
  { day: "Fri", leads: 71, deals: 28 },
  { day: "Sat", leads: 38, deals: 12 },
  { day: "Sun", leads: 84, deals: 35 },
];

export const weeklyStatsLastWeek = [
  { day: "Mon", leads: 48, deals: 18 },
  { day: "Tue", leads: 65, deals: 26 },
  { day: "Wed", leads: 59, deals: 22 },
  { day: "Thu", leads: 72, deals: 30 },
  { day: "Fri", leads: 68, deals: 25 },
  { day: "Sat", leads: 41, deals: 14 },
  { day: "Sun", leads: 76, deals: 29 },
];

export const weeklyStatsMonthly = [
  { day: "W1", leads: 412, deals: 158 },
  { day: "W2", leads: 468, deals: 176 },
  { day: "W3", leads: 395, deals: 149 },
  { day: "W4", leads: 521, deals: 198 },
];

export type WeeklyRange = "thisWeek" | "lastWeek" | "month";
export type WeeklyMetric = "all" | "leads" | "deals";

export const weeklyStatsByRange: Record<
  WeeklyRange,
  { day: string; leads: number; deals: number }[]
> = {
  thisWeek: weeklyStats,
  lastWeek: weeklyStatsLastWeek,
  month: weeklyStatsMonthly,
};

export const revenueTrend = [
  { month: "Jan", revenue: 18, target: 16 },
  { month: "Feb", revenue: 24, target: 20 },
  { month: "Mar", revenue: 21, target: 22 },
  { month: "Apr", revenue: 32, target: 26 },
  { month: "May", revenue: 38, target: 30 },
  { month: "Jun", revenue: 44, target: 36 },
  { month: "Jul", revenue: 52, target: 42 },
];

export const channelSplit = [
  { name: "WhatsApp", value: 44 },
  { name: "Email", value: 31 },
  { name: "Cold Calling", value: 15 },
  { name: "Meta Ads", value: 10 },
];

export const activities = [
  {
    title: "WhatsApp reply from Ayesha Khan",
    detail: "Asked for the enterprise pricing sheet",
    time: "4 min ago",
    channel: "WhatsApp",
  },
  {
    title: "Email sequence completed",
    detail: "“Q3 Outreach — Retail” finished for 240 contacts",
    time: "38 min ago",
    channel: "Email",
  },
  {
    title: "Cold call booked a demo",
    detail: "Bilal Ahmed scheduled Thursday 3:00 PM",
    time: "1 hr ago",
    channel: "Cold Calling",
  },
  {
    title: "Meta Ads lead form synced",
    detail: "18 new leads imported from “Ramadan Promo”",
    time: "2 hrs ago",
    channel: "Meta Ads",
  },
  {
    title: "Deal marked won",
    detail: "Northline Traders — $12,400 annual",
    time: "5 hrs ago",
    channel: "Pipeline",
  },
];

export type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  channel: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n-1",
    title: "WhatsApp reply from Ayesha Khan",
    message: "Asked for the enterprise pricing sheet",
    time: "4m",
    channel: "WhatsApp",
    unread: true,
  },
  {
    id: "n-2",
    title: "Email sequence completed",
    message: "Q3 Outreach — Retail finished for 240 contacts",
    time: "38m",
    channel: "Email",
    unread: true,
  },
  {
    id: "n-3",
    title: "Cold call booked a demo",
    message: "Bilal Ahmed scheduled Thursday 3:00 PM",
    time: "1h",
    channel: "Cold Calling",
    unread: true,
  },
  {
    id: "n-4",
    title: "Meta Ads lead form synced",
    message: "18 new leads imported from Ramadan Promo",
    time: "2h",
    channel: "Meta Ads",
    unread: false,
  },
  {
    id: "n-5",
    title: "Deal marked won",
    message: "Northline Traders — $12,400 annual",
    time: "5h",
    channel: "Pipeline",
    unread: false,
  },
  {
    id: "n-6",
    title: "Team member invited",
    message: "Omar Zaid was invited to Support",
    time: "6h",
    channel: "Teams",
    unread: false,
  },
  {
    id: "n-7",
    title: "Integration sync warning",
    message: "Meta Ads token expires in 3 days",
    time: "8h",
    channel: "Integrations",
    unread: false,
  },
  {
    id: "n-8",
    title: "Weekly pipeline report ready",
    message: "Summary for Aug 4–11 is available",
    time: "1d",
    channel: "Reports",
    unread: false,
  },
];

export const whatsappLeads: Lead[] = [
  { id: "WA-1041", name: "Ayesha Khan", company: "Northline Traders", handle: "+92 300 1122334", status: "qualified", value: 12400, owner: "Shin Ryujin", updated: "4 min ago" },
  { id: "WA-1042", name: "Hamza Iqbal", company: "Bluepeak Retail", handle: "+92 321 8877665", status: "contacted", value: 5400, owner: "Nabeel R.", updated: "22 min ago" },
  { id: "WA-1043", name: "Sana Fatima", company: "Zeta Cosmetics", handle: "+92 333 4455667", status: "new", value: 2100, owner: "Unassigned", updated: "1 hr ago" },
  { id: "WA-1044", name: "Usman Tariq", company: "Gadgetry Co.", handle: "+92 345 9988776", status: "won", value: 18900, owner: "Hira S.", updated: "3 hrs ago" },
  { id: "WA-1045", name: "Maryam Noor", company: "Fashion Loop", handle: "+92 302 1234567", status: "lost", value: 800, owner: "Nabeel R.", updated: "Yesterday" },
];

export const emailLeads: Lead[] = [
  { id: "EM-2201", name: "Daniyal Sheikh", company: "Orbit Logistics", handle: "daniyal@orbit.co", status: "contacted", value: 7600, owner: "Hira S.", updated: "12 min ago" },
  { id: "EM-2202", name: "Rabia Aslam", company: "Verdant Foods", handle: "rabia@verdant.pk", status: "qualified", value: 9800, owner: "Shin Ryujin", updated: "48 min ago" },
  { id: "EM-2203", name: "Faizan Malik", company: "Slate Interiors", handle: "faizan@slate.design", status: "new", value: 3200, owner: "Unassigned", updated: "2 hrs ago" },
  { id: "EM-2204", name: "Komal Raza", company: "Pixel Studio", handle: "komal@pixel.studio", status: "won", value: 15400, owner: "Nabeel R.", updated: "Yesterday" },
];

export const coldCallLeads: Lead[] = [
  { id: "CC-3310", name: "Bilal Ahmed", company: "Sunrise Motors", handle: "+92 311 5566778", status: "qualified", value: 22000, owner: "Shin Ryujin", updated: "1 hr ago" },
  { id: "CC-3311", name: "Zara Siddiqui", company: "Crest Pharma", handle: "+92 313 2233445", status: "contacted", value: 6400, owner: "Hira S.", updated: "3 hrs ago" },
  { id: "CC-3312", name: "Adnan Yousuf", company: "Metro Build", handle: "+92 315 7788990", status: "lost", value: 1500, owner: "Nabeel R.", updated: "2 days ago" },
  { id: "CC-3313", name: "Hafsa Anwar", company: "Lumen Energy", handle: "+92 317 6655443", status: "new", value: 4100, owner: "Unassigned", updated: "2 days ago" },
];

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export const integrations = [
  {
    slug: "whatsapp",
    name: "WhatsApp Business",
    tagline: "Cloud API messaging, templates and inbox sync",
    status: "Connected",
    metric: "1,284 conversations / 30d",
  },
  {
    slug: "email",
    name: "Email & SMTP",
    tagline: "Sequences, tracking and shared team inbox",
    status: "Connected",
    metric: "8,410 emails sent / 30d",
  },
  {
    slug: "meta-marketing",
    name: "Meta Marketing",
    tagline: "Pages, audiences and lead form sync",
    status: "Connected",
    metric: "6 audiences syncing",
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    tagline: "Campaign spend, ROAS and instant forms",
    status: "Action needed",
    metric: "$4,120 spend / 30d",
  },
];

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Agent";
  team: "Sales" | "Marketing" | "Support";
  status: "Active" | "Invited" | "Suspended";
};

export const initialTeam: TeamMember[] = [
  { id: "u-1", name: "Shin Ryujin", email: "ryujin@greenboard.app", role: "Admin", team: "Sales", status: "Active" },
  { id: "u-2", name: "Nabeel Rehman", email: "nabeel@greenboard.app", role: "Manager", team: "Sales", status: "Active" },
  { id: "u-3", name: "Hira Saleem", email: "hira@greenboard.app", role: "Agent", team: "Marketing", status: "Active" },
  { id: "u-4", name: "Omar Zaid", email: "omar@greenboard.app", role: "Agent", team: "Support", status: "Invited" },
  { id: "u-5", name: "Laiba Anwar", email: "laiba@greenboard.app", role: "Manager", team: "Marketing", status: "Suspended" },
];
