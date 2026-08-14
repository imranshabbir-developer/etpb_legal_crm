export type AssistantMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export type AssistantContext = {
  total: number;
  internal: number;
  external: number;
  pending: number;
  decided: number;
  restraining: number;
  direction: number;
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

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function formatCounts(ctx?: AssistantContext) {
  if (!ctx) return null;
  return `Live totals: ${ctx.total} cases (${ctx.internal} internal, ${ctx.external} external). Categories — Pending ${ctx.pending}, Decided ${ctx.decided}, Restraining ${ctx.restraining}, Direction ${ctx.direction}.`;
}

export function getAssistantReply(input: string, context?: AssistantContext): string {
  const q = normalize(input);
  const live = formatCounts(context);

  if (!q) {
    return "Ask about internal/external courts, case categories, hearings, or role permissions for IPS Legal CRM Management.";
  }

  if (/hello|hi|hey|greetings|good morning|good evening/.test(q)) {
    return "Welcome to IPS Legal CRM Management. I can explain Internal/External courts, case categories (Decided, Pending, Restraining Order, Direction), and roles.";
  }

  if (/sign in|signin|login|log in|password|credentials|account access/.test(q)) {
    return "Use a seeded account (e.g. admin@ips.gov.pk / Admin@123), choose the matching role, then press Login. Session is restored from the API after refresh.";
  }

  if (/what is|ips|case management|crm management|platform|capabilities|features/.test(q)) {
    return [
      "IPS (Evacuee Trust Property Board — ips.gov.pk) Legal CRM Management tracks litigation in:",
      "• Internal Courts: loaded live from the database; Admin can add, edit, or deactivate courts",
      "• External Courts: loaded live from the database; Admin can add, edit, or deactivate courts",
      "Each court register stores the 30 departmental case fields (Sr. No. through Remarks) in Postgres.",
    ].join("\n");
  }

  if (/help|what can you|commands|options/.test(q)) {
    return [
      "You can ask about:",
      "• Internal vs external case registers",
      "• Decided / Pending / Restraining Order / Direction Cases",
      "• Role powers (Staff, Admin, Super Admin)",
      "• Reminders from next hearing dates",
      "• How court registers are organized",
    ].join("\n");
  }

  if (/internal|external|layer|court/.test(q) && !/restrain|direction|pending|decid/.test(q)) {
    return [
      "Open Dashboard for live totals from the database, or use Internal Courts / External Courts in the sidebar. Admin can add more courts with Add court.",
      live,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/pending|decid|restrain|direction|categor/.test(q)) {
    return [
      "Case categories (live counts are on the Dashboard):",
      "• Decided Cases",
      "• Pending Cases",
      "• Restraining Order",
      "• Direction Cases",
      "",
      "Note: most external courts use Restraining Order and Direction Cases only; Other Courts and all internal courts use all four unless Admin changes categories.",
      live,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/role|staff|admin|super|permission|power/.test(q)) {
    return [
      "Roles:",
      "• Staff — view/edit cases; view settings",
      "• Admin — full case CRUD; manage courts; manage users",
      "• Super Admin — ultimate control including admins and module configuration",
    ].join("\n");
  }

  if (/reminder|hearing|activity|upcoming/.test(q)) {
    return "Reminders are generated from live case next-hearing dates (2 days before → tomorrow → today → overdue). Open Reminders from the sidebar or top-bar clock icon.";
  }

  if (/dashboard|summary|overview|load|stats|chart/.test(q)) {
    return [
      "Open Dashboard for live totals, charts, court blocks, and hearing reminders driven by Postgres.",
      live,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return "I did not match that query. Try “Case load overview”, “Internal vs external courts”, or “What can each role do?”.";
}

export function createMessage(role: AssistantMessage["role"], text: string): AssistantMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text };
}
