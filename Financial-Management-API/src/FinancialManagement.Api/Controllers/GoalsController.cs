using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Goals.Create;
using FinancialManagement.Application.Features.Goals.Delete;
using FinancialManagement.Application.Features.Goals.GetAll;
using FinancialManagement.Application.Features.Goals.Update;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/goals")]
[Authorize]
public class GoalsController : ApiControllerBase
{
    private readonly GetAllGoalsHandler _getAllHandler;
    private readonly IValidator<CreateGoalRequest> _createValidator;
    private readonly CreateGoalHandler _createHandler;
    private readonly IValidator<UpdateGoalRequest> _updateValidator;
    private readonly UpdateGoalHandler _updateHandler;
    private readonly DeleteGoalHandler _deleteHandler;

    public GoalsController(
        GetAllGoalsHandler getAllHandler,
        IValidator<CreateGoalRequest> createValidator,
        CreateGoalHandler createHandler,
        IValidator<UpdateGoalRequest> updateValidator,
        UpdateGoalHandler updateHandler,
        DeleteGoalHandler deleteHandler)
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
    public async Task<IActionResult> Create(CreateGoalRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateGoalRequest request, CancellationToken cancellationToken)
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
