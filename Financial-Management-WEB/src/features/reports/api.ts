import { apiClient } from "@/lib/api-client";

export type ReportFormat = "Pdf" | "Excel" | "Csv";

const FILE_EXTENSIONS: Record<ReportFormat, string> = {
  Pdf: "pdf",
  Excel: "xlsx",
  Csv: "csv",
};

export async function downloadCashFlowReport(from: string, to: string, format: ReportFormat) {
  const response = await apiClient.get("/api/reports/cashflow", {
    params: { from, to, format },
    responseType: "blob",
  });

  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-financeiro.${FILE_EXTENSIONS[format]}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
