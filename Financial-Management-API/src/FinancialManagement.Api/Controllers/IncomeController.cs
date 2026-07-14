using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Income.Create;
using FinancialManagement.Application.Features.Income.GetAll;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/income")]
[Authorize]
public class IncomeController : ApiControllerBase
{
    private readonly GetAllIncomeHandler _getAllHandler;
    private readonly IValidator<CreateIncomeRequest> _createValidator;
    private readonly CreateIncomeHandler _createHandler;

    public IncomeController(
        GetAllIncomeHandler getAllHandler,
        IValidator<CreateIncomeRequest> createValidator,
        CreateIncomeHandler createHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(from, to, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreateIncomeRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }
}
