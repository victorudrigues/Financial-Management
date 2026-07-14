using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.CashFlow.GetSummary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/cashflow")]
[Authorize]
public class CashFlowController : ApiControllerBase
{
    private readonly GetCashFlowSummaryHandler _summaryHandler;

    public CashFlowController(GetCashFlowSummaryHandler summaryHandler)
    {
        _summaryHandler = summaryHandler;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _summaryHandler.HandleAsync(from, to, cancellationToken));
}
