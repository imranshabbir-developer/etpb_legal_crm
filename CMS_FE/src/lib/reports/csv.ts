import type { ReportPayload } from "@/lib/reports/types";

function escapeCsv(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(payload: ReportPayload) {
  const headers = payload.table.columns.map((c) => c.header);
  const lines = [
    `# ${payload.meta.title}`,
    `# Generated: ${payload.meta.asOn?.toISOString() ?? new Date().toISOString()}`,
    `# By: ${payload.meta.generatedBy}`,
    headers.map(escapeCsv).join(","),
    ...payload.table.rows.map((row) =>
      payload.table.columns.map((col) => escapeCsv(row[col.key] ?? "")).join(","),
    ),
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `${payload.fileBaseName}.csv`);
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
