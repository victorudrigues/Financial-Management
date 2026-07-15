using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetSummary;

namespace FinancialManagement.Application.Features.Reports.ExportCashFlow;

public class ExportCashFlowHandler
{
    private readonly GetCashFlowSummaryHandler _summaryHandler;
    private readonly GetCategoryBreakdownHandler _categoryBreakdownHandler;
    private readonly GetCostCenterBreakdownHandler _costCenterBreakdownHandler;
    private readonly IReportExportService _exportService;

    public ExportCashFlowHandler(
        GetCashFlowSummaryHandler summaryHandler,
        GetCategoryBreakdownHandler categoryBreakdownHandler,
        GetCostCenterBreakdownHandler costCenterBreakdownHandler,
        IReportExportService exportService)
    {
        _summaryHandler = summaryHandler;
        _categoryBreakdownHandler = categoryBreakdownHandler;
        _costCenterBreakdownHandler = costCenterBreakdownHandler;
        _exportService = exportService;
    }

    public async Task<ExportCashFlowResult> HandleAsync(ExportCashFlowRequest request, CancellationToken cancellationToken)
    {
        var summary = await _summaryHandler.HandleAsync(request.From, request.To, cancellationToken);
        var categoryBreakdown = await _categoryBreakdownHandler.HandleAsync(request.From, request.To, cancellationToken);
        var costCenterBreakdown = await _costCenterBreakdownHandler.HandleAsync(request.From, request.To, cancellationToken);

        return request.Format switch
        {
            ExportFormat.Pdf => new ExportCashFlowResult(
                _exportService.GenerateCashFlowPdf(summary, categoryBreakdown, costCenterBreakdown, request.From, request.To),
                "application/pdf",
                "relatorio-financeiro.pdf"),
            ExportFormat.Excel => new ExportCashFlowResult(
                _exportService.GenerateCashFlowExcel(summary, categoryBreakdown, costCenterBreakdown, request.From, request.To),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "relatorio-financeiro.xlsx"),
            ExportFormat.Csv => new ExportCashFlowResult(
                _exportService.GenerateCashFlowCsv(summary, categoryBreakdown, costCenterBreakdown, request.From, request.To),
                "text/csv",
                "relatorio-financeiro.csv"),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Format))
        };
    }
}
