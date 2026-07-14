using FinancialManagement.Application.Features.CashFlow.GetSummary;

namespace FinancialManagement.Application.Common.Interfaces;

public interface IReportExportService
{
    byte[] GenerateCashFlowPdf(CashFlowSummaryResponse summary, DateTime from, DateTime to);
    byte[] GenerateCashFlowExcel(CashFlowSummaryResponse summary, DateTime from, DateTime to);
    byte[] GenerateCashFlowCsv(CashFlowSummaryResponse summary, DateTime from, DateTime to);
}
