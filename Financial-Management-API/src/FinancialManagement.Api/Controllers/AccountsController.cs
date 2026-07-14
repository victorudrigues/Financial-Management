using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Accounts.Create;
using FinancialManagement.Application.Features.Accounts.Delete;
using FinancialManagement.Application.Features.Accounts.GetAll;
using FinancialManagement.Application.Features.Accounts.GetById;
using FinancialManagement.Application.Features.Accounts.Update;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/accounts")]
[Authorize]
public class AccountsController : ApiControllerBase
{
    private readonly GetAllAccountsHandler _getAllHandler;
    private readonly GetAccountByIdHandler _getByIdHandler;
    private readonly IValidator<CreateAccountRequest> _createValidator;
    private readonly CreateAccountHandler _createHandler;
    private readonly IValidator<UpdateAccountRequest> _updateValidator;
    private readonly UpdateAccountHandler _updateHandler;
    private readonly DeleteAccountHandler _deleteHandler;

    public AccountsController(
        GetAllAccountsHandler getAllHandler,
        GetAccountByIdHandler getByIdHandler,
        IValidator<CreateAccountRequest> createValidator,
        CreateAccountHandler createHandler,
        IValidator<UpdateAccountRequest> updateValidator,
        UpdateAccountHandler updateHandler,
        DeleteAccountHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
        _updateValidator = updateValidator;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _getByIdHandler.HandleAsync(id, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreateAccountRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateAccountRequest request, CancellationToken cancellationToken)
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
