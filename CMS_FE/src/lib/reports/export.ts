import { toast } from "sonner";

import { downloadCsv } from "@/lib/reports/csv";
import { downloadGovDocx } from "@/lib/reports/docx";
import { downloadGovPdf } from "@/lib/reports/pdf";
import type { ReportFormat, ReportPayload } from "@/lib/reports/types";

export async function exportReport(payload: ReportPayload, format: ReportFormat) {
  try {
    if (format === "csv") {
      downloadCsv(payload);
      toast.success("CSV report downloaded");
      return;
    }
    if (format === "pdf") {
      downloadGovPdf(payload);
      toast.success("PDF report downloaded (Govt. of Punjab format)");
      return;
    }
    await downloadGovDocx(payload);
    toast.success("Word (DOCX) report downloaded");
  } catch (error) {
    console.error(error);
    toast.error("Could not generate report. Please try again.");
  }
}
