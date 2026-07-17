using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Transfers.Create;
using FinancialManagement.Application.Features.Transfers.GetAll;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/transfers")]
[Authorize]
public class TransfersController : ApiControllerBase
{
    private readonly GetAllTransfersHandler _getAllHandler;
    private readonly IValidator<CreateTransferRequest> _createValidator;
    private readonly CreateTransferHandler _createHandler;

    public TransfersController(
        GetAllTransfersHandler getAllHandler,
        IValidator<CreateTransferRequest> createValidator,
        CreateTransferHandler createHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(from, to, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreateTransferRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }
}
