using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.CostCenters.Create;
using FinancialManagement.Application.Features.CostCenters.Delete;
using FinancialManagement.Application.Features.CostCenters.GetAll;
using FinancialManagement.Application.Features.CostCenters.Update;
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
    private readonly IValidator<UpdateCostCenterRequest> _updateValidator;
    private readonly UpdateCostCenterHandler _updateHandler;
    private readonly DeleteCostCenterHandler _deleteHandler;

    public CostCentersController(
        GetAllCostCentersHandler getAllHandler,
        IValidator<CreateCostCenterRequest> createValidator,
        CreateCostCenterHandler createHandler,
        IValidator<UpdateCostCenterRequest> updateValidator,
        UpdateCostCenterHandler updateHandler,
        DeleteCostCenterHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
        _updateValidator = updateValidator;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCostCenterRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_updateValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _updateHandler.HandleAsync(id, request, cancellationToken));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _deleteHandler.HandleAsync(id, cancellationToken));
}
