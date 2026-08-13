import {
  countByCategory,
  countByLayer,
  mockCases,
} from "@/lib/cases/mock-cases";
import { EXTERNAL_COURTS, INTERNAL_COURTS } from "@/lib/cases/courts";

export type AssistantMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export const assistantQuickPrompts = [
  "Case load overview",
  "Internal vs external courts",
  "Pending and decided cases",
  "Restraining orders",
  "What can each role do?",
];

export const assistantLoginPrompts = [
  "What is IPS CRM Management?",
  "How do I sign in?",
  "Internal vs external courts",
  "Case categories",
  "Roles: Super Admin, Admin, Staff",
];

const internalTotal = countByLayer("internal");
const externalTotal = countByLayer("external");
const pending = countByCategory("pending-cases");
const decided = countByCategory("decided-cases");
const restraining = countByCategory("restraining-order");
const direction = countByCategory("direction-cases");

function normalize(input: string) {
  return input.trim().toLowerCase();
}

export function getAssistantReply(input: string): string {
  const q = normalize(input);

  if (!q) {
    return "Ask about internal/external courts, case categories, hearings, or role permissions for IPS Legal CRM Management.";
  }

  if (/hello|hi|hey|greetings|good morning|good evening/.test(q)) {
    return "Welcome to IPS Legal CRM Management. I can explain Internal/External courts, case categories (Decided, Pending, Restraining Order, Direction), and demo roles.";
  }

  if (/sign in|signin|login|log in|password|credentials|account access/.test(q)) {
    return "Enter any email and password, choose Super Admin, Admin, or Staff, then press Login. Demo mode accepts all credentials and opens the dashboard.";
  }

  if (/what is|ips|case management|crm management|platform|capabilities|features/.test(q)) {
    return [
      "IPS (Evacuee Trust Property Board — ips.gov.pk) Legal CRM Management tracks litigation in:",
      `• Internal Courts (${INTERNAL_COURTS.length}): Federal Secretary → Asst. / Dy. Administrator`,
      `• External Courts (${EXTERNAL_COURTS.length}): Federal Constitutional Court → Other Courts`,
      "Each court register stores the 30 departmental case fields (Sr. No. through Remarks).",
    ].join("\n");
  }

  if (/help|what can you|commands|options/.test(q)) {
    return [
      "You can ask about:",
      "• Internal vs external case counts",
      "• Decided / Pending / Restraining Order / Direction Cases",
      "• Role powers (Staff, Admin, Super Admin)",
      "• How court registers are organized",
    ].join("\n");
  }

  if (/internal|external|layer|court/.test(q) && !/restrain|direction|pending|decid/.test(q)) {
    return `Current demo register: ${mockCases.length} cases — Internal ${internalTotal}, External ${externalTotal}. Open Internal Courts or External Courts in the sidebar to drill into each forum and category.`;
  }

  if (/pending|decid|restrain|direction|categor/.test(q)) {
    return [
      "Case categories in the demo data:",
      `• Decided Cases: ${decided}`,
      `• Pending Cases: ${pending}`,
      `• Restraining Order: ${restraining}`,
      `• Direction Cases: ${direction}`,
      "",
      "Note: most external courts use Restraining Order and Direction Cases only; Other Courts and all internal courts use all four.",
    ].join("\n");
  }

  if (/role|staff|admin|super|permission|power/.test(q)) {
    return [
      "Roles:",
      "• Staff — view/edit cases; view settings",
      "• Admin — full case CRUD; manage staff users",
      "• Super Admin — ultimate control including admins and module configuration",
    ].join("\n");
  }

  if (/notification|alert|hearing|activity/.test(q)) {
    return "Notifications cover next hearings, restraining-order follow-ups, and direction-case compliance. Open Notifications from the bell icon.";
  }

  if (/dashboard|summary|overview|load|stats|chart/.test(q)) {
    return `Dashboard overview: ${mockCases.length} total cases · Internal ${internalTotal} · External ${externalTotal} · Pending ${pending} · Decided ${decided} · Restraining ${restraining} · Direction ${direction}.`;
  }

  return "I did not match that query. Try “Case load overview”, “Internal vs external courts”, or “What can each role do?”.";
}

export function createMessage(role: AssistantMessage["role"], text: string): AssistantMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text };
}
