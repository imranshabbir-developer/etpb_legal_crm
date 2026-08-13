export type ReportFormat = "pdf" | "csv" | "docx";

export type ReportColumn = {
  key: string;
  header: string;
  width?: number;
};

export type ReportMeta = {
  title: string;
  subtitle?: string;
  officeOrCourt?: string;
  fileRef?: string;
  generatedBy: string;
  generatedRole?: string;
  asOn?: Date;
  classification?: string;
  footnotes?: string[];
};

export type ReportTable = {
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
};

export type ReportPayload = {
  meta: ReportMeta;
  summaryLines?: { label: string; value: string }[];
  table: ReportTable;
  fileBaseName: string;
};
