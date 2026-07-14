using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Goals.Create;
using FinancialManagement.Application.Features.Goals.GetAll;
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

    public GoalsController(
        GetAllGoalsHandler getAllHandler,
        IValidator<CreateGoalRequest> createValidator,
        CreateGoalHandler createHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
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
}
