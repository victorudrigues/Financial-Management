using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.Application.Features.CashFlow.GetAccountBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetPaymentMachineBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetSummary;

namespace FinancialManagement.Application.Features.Reports.ExportCashFlow;

public class ExportCashFlowHandler
{
    private readonly GetCashFlowSummaryHandler _summaryHandler;
    private readonly GetCategoryBreakdownHandler _categoryBreakdownHandler;
    private readonly GetCostCenterBreakdownHandler _costCenterBreakdownHandler;
    private readonly GetPaymentMachineBreakdownHandler _paymentMachineBreakdownHandler;
    private readonly GetAccountBreakdownHandler _accountBreakdownHandler;
    private readonly IReportExportService _exportService;

    public ExportCashFlowHandler(
        GetCashFlowSummaryHandler summaryHandler,
        GetCategoryBreakdownHandler categoryBreakdownHandler,
        GetCostCenterBreakdownHandler costCenterBreakdownHandler,
        GetPaymentMachineBreakdownHandler paymentMachineBreakdownHandler,
        GetAccountBreakdownHandler accountBreakdownHandler,
        IReportExportService exportService)
    {
        _summaryHandler = summaryHandler;
        _categoryBreakdownHandler = categoryBreakdownHandler;
        _costCenterBreakdownHandler = costCenterBreakdownHandler;
        _paymentMachineBreakdownHandler = paymentMachineBreakdownHandler;
        _accountBreakdownHandler = accountBreakdownHandler;
        _exportService = exportService;
    }

    public async Task<ExportCashFlowResult> HandleAsync(ExportCashFlowRequest request, CancellationToken cancellationToken)
    {
        var summary = await _summaryHandler.HandleAsync(request.From, request.To, cancellationToken);
        var categoryBreakdown = await _categoryBreakdownHandler.HandleAsync(request.From, request.To, cancellationToken);
        var costCenterBreakdown = await _costCenterBreakdownHandler.HandleAsync(request.From, request.To, cancellationToken);
        var paymentMachineBreakdown = await _paymentMachineBreakdownHandler.HandleAsync(request.From, request.To, cancellationToken);
        var accountBreakdown = await _accountBreakdownHandler.HandleAsync(request.From, request.To, cancellationToken);

        var data = new CashFlowReportData(
            summary,
            categoryBreakdown,
            costCenterBreakdown,
            paymentMachineBreakdown,
            accountBreakdown,
            request.From,
            request.To);

        return request.Format switch
        {
            ExportFormat.Pdf => new ExportCashFlowResult(
                _exportService.GenerateCashFlowPdf(data),
                "application/pdf",
                "relatorio-financeiro.pdf"),
            ExportFormat.Excel => new ExportCashFlowResult(
                _exportService.GenerateCashFlowExcel(data),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "relatorio-financeiro.xlsx"),
            ExportFormat.Csv => new ExportCashFlowResult(
                _exportService.GenerateCashFlowCsv(data),
                "text/csv",
                "relatorio-financeiro.csv"),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Format))
        };
    }
}
