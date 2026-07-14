using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.CostCenters.Create;
using FinancialManagement.Application.Features.CostCenters.GetAll;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/cost-centers")]
[Authorize]
public class CostCentersController : ApiControllerBase
{
    private readonly GetAllCostCentersHandler _getAllHandler;
    private readonly IValidator<CreateCostCenterRequest> _createValidator;
    private readonly CreateCostCenterHandler _createHandler;

    public CostCentersController(
        GetAllCostCentersHandler getAllHandler,
        IValidator<CreateCostCenterRequest> createValidator,
        CreateCostCenterHandler createHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreateCostCenterRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }
}
