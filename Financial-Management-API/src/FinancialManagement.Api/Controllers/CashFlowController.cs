using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetPaymentMachineBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetSummary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/cashflow")]
[Authorize]
public class CashFlowController : ApiControllerBase
{
    private readonly GetCashFlowSummaryHandler _summaryHandler;
    private readonly GetCategoryBreakdownHandler _categoryBreakdownHandler;
    private readonly GetCostCenterBreakdownHandler _costCenterBreakdownHandler;
    private readonly GetPaymentMachineBreakdownHandler _paymentMachineBreakdownHandler;

    public CashFlowController(
        GetCashFlowSummaryHandler summaryHandler,
        GetCategoryBreakdownHandler categoryBreakdownHandler,
        GetCostCenterBreakdownHandler costCenterBreakdownHandler,
        GetPaymentMachineBreakdownHandler paymentMachineBreakdownHandler)
    {
        _summaryHandler = summaryHandler;
        _categoryBreakdownHandler = categoryBreakdownHandler;
        _costCenterBreakdownHandler = costCenterBreakdownHandler;
        _paymentMachineBreakdownHandler = paymentMachineBreakdownHandler;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _summaryHandler.HandleAsync(from, to, cancellationToken));

    [HttpGet("by-category")]
    public async Task<IActionResult> GetByCategory([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _categoryBreakdownHandler.HandleAsync(from, to, cancellationToken));

    [HttpGet("by-cost-center")]
    public async Task<IActionResult> GetByCostCenter([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _costCenterBreakdownHandler.HandleAsync(from, to, cancellationToken));

    [HttpGet("by-payment-machine")]
    public async Task<IActionResult> GetByPaymentMachine([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _paymentMachineBreakdownHandler.HandleAsync(from, to, cancellationToken));
}
