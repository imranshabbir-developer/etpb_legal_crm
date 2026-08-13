import { useState } from "react";
import { FileDown, FileSpreadsheet, FileText, Loader2, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportReport } from "@/lib/reports/export";
import type { ReportFormat, ReportPayload } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

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
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-emerald-800/25"
            disabled={!!busy}
            onClick={() => void run("pdf", buildPayload, "main-pdf")}
            data-testid="report-export-pdf"
          >
            {busy === "main-pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
            PDF
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-emerald-800/25"
            disabled={!!busy}
            onClick={() => void run("csv", buildPayload, "main-csv")}
            data-testid="report-export-csv"
          >
            {busy === "main-csv" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-3.5" />
            )}
            CSV
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-emerald-800/25"
            disabled={!!busy}
            onClick={() => void run("docx", buildPayload, "main-docx")}
            data-testid="report-export-docx"
          >
            {busy === "main-docx" ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
            Word
          </Button>

          {extras?.map((extra) =>
            (extra.formats ?? ["pdf"]).map((format) => (
              <Button
                key={`${extra.label}-${format}`}
                type="button"
                size="sm"
                className="rounded-full bg-brand-gradient font-semibold"
                disabled={!!busy}
                onClick={() => void run(format, extra.buildPayload, `${extra.label}-${format}`)}
                data-testid="report-export-executive"
              >
                {busy === `${extra.label}-${format}` ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ScrollText className="size-3.5" />
                )}
                {extra.label}
              </Button>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
