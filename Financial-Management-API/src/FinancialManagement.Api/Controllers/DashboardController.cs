using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Dashboard.GetOverview;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/dashboard")]
[Authorize]
public class DashboardController : ApiControllerBase
{
    private readonly GetDashboardOverviewHandler _overviewHandler;

    public DashboardController(GetDashboardOverviewHandler overviewHandler)
    {
        _overviewHandler = overviewHandler;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(CancellationToken cancellationToken) =>
        Ok(await _overviewHandler.HandleAsync(cancellationToken));
}
