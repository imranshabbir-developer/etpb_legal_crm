import { useState } from "react";
import { FileDown, FileSpreadsheet, FileText, Loader2, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportReport } from "@/lib/reports/export";
import type { ReportFormat, ReportPayload } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

const FORMAT_META: Record<
  ReportFormat,
  {
    label: string;
    icon: typeof FileText;
    className: string;
  }
> = {
  pdf: {
    label: "PDF",
    icon: FileText,
    className:
      "border-red-300 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/70",
  },
  csv: {
    label: "CSV",
    icon: FileSpreadsheet,
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70",
  },
  docx: {
    label: "Word",
    icon: FileDown,
    className:
      "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-950/70",
  },
};

type ReportExportBarProps = {
  title?: string;
  description?: string;
  buildPayload: () => ReportPayload;
  /** Extra primary actions e.g. Executive pack */
  extras?: {
    label: string;
    buildPayload: () => ReportPayload;
    formats?: ReportFormat[];
  }[];
  className?: string;
  compact?: boolean;
};

export function ReportExportBar({
  title = "Official reports & exports",
  description = "Generate Government of the Punjab / ETPB format statements (PDF, CSV, Word).",
  buildPayload,
  extras,
  className,
  compact,
}: ReportExportBarProps) {
  const [busy, setBusy] = useState<string | null>(null);

  async function run(format: ReportFormat, payloadFactory: () => ReportPayload, key: string) {
    setBusy(key);
    try {
      await exportReport(payloadFactory(), format);
    } finally {
      setBusy(null);
    }
  }

  function formatButton(
    format: ReportFormat,
    payloadFactory: () => ReportPayload,
    key: string,
    reportLabel?: string,
  ) {
    const meta = FORMAT_META[format];
    const Icon = meta.icon;

    return (
      <Button
        key={key}
        type="button"
        size="sm"
        variant="outline"
        className={cn("rounded-full font-semibold", meta.className)}
        disabled={!!busy}
        onClick={() => void run(format, payloadFactory, key)}
        data-testid={`report-export-${format}`}
        aria-label={reportLabel ? `${reportLabel} — ${meta.label}` : `Export ${meta.label}`}
      >
        {busy === key ? <Loader2 className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
        {reportLabel ? `${reportLabel} · ${meta.label}` : meta.label}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-800/15 bg-gradient-to-br from-emerald-50/90 via-card/90 to-card/80 p-3 shadow-sm dark:from-emerald-950/40 dark:via-card/80 dark:to-card/70 sm:p-4",
        className,
      )}
      data-testid="report-export-bar"
    >
      <div className={cn("flex flex-col gap-3", !compact && "sm:flex-row sm:items-center sm:justify-between")}>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950 dark:text-emerald-100">
            <ScrollText className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
            <span>{title}</span>
          </div>
          {!compact ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {formatButton("pdf", buildPayload, "main-pdf")}
          {formatButton("csv", buildPayload, "main-csv")}
          {formatButton("docx", buildPayload, "main-docx")}

          {extras?.map((extra) =>
            (extra.formats ?? ["pdf"]).map((format) =>
              formatButton(
                format,
                extra.buildPayload,
                `${extra.label}-${format}`,
                extra.label.replace(/\s*\((PDF|CSV|Word)\)\s*$/i, ""),
              ),
            ),
          )}
        </div>
      </div>
    </div>
  );
}
