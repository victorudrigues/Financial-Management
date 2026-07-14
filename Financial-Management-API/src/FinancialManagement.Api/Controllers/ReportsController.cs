using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Reports.ExportCashFlow;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/reports")]
[Authorize]
public class ReportsController : ApiControllerBase
{
    private readonly ExportCashFlowHandler _exportCashFlowHandler;

    public ReportsController(ExportCashFlowHandler exportCashFlowHandler)
    {
        _exportCashFlowHandler = exportCashFlowHandler;
    }

    [HttpGet("cashflow")]
    public async Task<IActionResult> ExportCashFlow(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] ExportFormat format,
        CancellationToken cancellationToken)
    {
        var result = await _exportCashFlowHandler.HandleAsync(new ExportCashFlowRequest(from, to, format), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }
}
