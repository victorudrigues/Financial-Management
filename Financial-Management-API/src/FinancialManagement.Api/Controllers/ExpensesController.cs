using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Expenses.Create;
using FinancialManagement.Application.Features.Expenses.GetAll;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/expenses")]
[Authorize]
public class ExpensesController : ApiControllerBase
{
    private readonly GetAllExpensesHandler _getAllHandler;
    private readonly IValidator<CreateExpenseRequest> _createValidator;
    private readonly CreateExpenseHandler _createHandler;

    public ExpensesController(
        GetAllExpensesHandler getAllHandler,
        IValidator<CreateExpenseRequest> createValidator,
        CreateExpenseHandler createHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(from, to, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }
}
