using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.Application.Features.CashFlow.GetSummary;

namespace FinancialManagement.Application.Features.Reports.ExportCashFlow;

public class ExportCashFlowHandler
{
    private readonly GetCashFlowSummaryHandler _summaryHandler;
    private readonly IReportExportService _exportService;

    public ExportCashFlowHandler(GetCashFlowSummaryHandler summaryHandler, IReportExportService exportService)
    {
        _summaryHandler = summaryHandler;
        _exportService = exportService;
    }

    public async Task<ExportCashFlowResult> HandleAsync(ExportCashFlowRequest request, CancellationToken cancellationToken)
    {
        var summary = await _summaryHandler.HandleAsync(request.From, request.To, cancellationToken);

        return request.Format switch
        {
            ExportFormat.Pdf => new ExportCashFlowResult(
                _exportService.GenerateCashFlowPdf(summary, request.From, request.To),
                "application/pdf",
                "fluxo-de-caixa.pdf"),
            ExportFormat.Excel => new ExportCashFlowResult(
                _exportService.GenerateCashFlowExcel(summary, request.From, request.To),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "fluxo-de-caixa.xlsx"),
            ExportFormat.Csv => new ExportCashFlowResult(
                _exportService.GenerateCashFlowCsv(summary, request.From, request.To),
                "text/csv",
                "fluxo-de-caixa.csv"),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Format))
        };
    }
}
