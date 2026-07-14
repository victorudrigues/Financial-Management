using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Transfers.Create;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/transfers")]
[Authorize]
public class TransfersController : ApiControllerBase
{
    private readonly IValidator<CreateTransferRequest> _createValidator;
    private readonly CreateTransferHandler _createHandler;

    public TransfersController(IValidator<CreateTransferRequest> createValidator, CreateTransferHandler createHandler)
    {
        _createValidator = createValidator;
        _createHandler = createHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTransferRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }
}
