using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetSummary;

namespace FinancialManagement.Application.Common.Interfaces;

public interface IReportExportService
{
    byte[] GenerateCashFlowPdf(
        CashFlowSummaryResponse summary,
        IReadOnlyList<CategoryBreakdownItem> categoryBreakdown,
        IReadOnlyList<CostCenterBreakdownItem> costCenterBreakdown,
        DateTime from,
        DateTime to);

    byte[] GenerateCashFlowExcel(
        CashFlowSummaryResponse summary,
        IReadOnlyList<CategoryBreakdownItem> categoryBreakdown,
        IReadOnlyList<CostCenterBreakdownItem> costCenterBreakdown,
        DateTime from,
        DateTime to);

    byte[] GenerateCashFlowCsv(
        CashFlowSummaryResponse summary,
        IReadOnlyList<CategoryBreakdownItem> categoryBreakdown,
        IReadOnlyList<CostCenterBreakdownItem> costCenterBreakdown,
        DateTime from,
        DateTime to);
}
