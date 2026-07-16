using FinancialManagement.Application.Features.Reports.ExportCashFlow;

namespace FinancialManagement.Application.Common.Interfaces;

public interface IReportExportService
{
    byte[] GenerateCashFlowPdf(CashFlowReportData data);

    byte[] GenerateCashFlowExcel(CashFlowReportData data);

    byte[] GenerateCashFlowCsv(CashFlowReportData data);
}
