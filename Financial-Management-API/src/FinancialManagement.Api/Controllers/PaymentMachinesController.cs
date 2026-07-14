using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.PaymentMachines.CalculateFee;
using FinancialManagement.Application.Features.PaymentMachines.Create;
using FinancialManagement.Application.Features.PaymentMachines.GetAll;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/payment-machines")]
[Authorize]
public class PaymentMachinesController : ApiControllerBase
{
    private readonly GetAllPaymentMachinesHandler _getAllHandler;
    private readonly IValidator<CreatePaymentMachineRequest> _createValidator;
    private readonly CreatePaymentMachineHandler _createHandler;
    private readonly CalculateFeeHandler _calculateFeeHandler;

    public PaymentMachinesController(
        GetAllPaymentMachinesHandler getAllHandler,
        IValidator<CreatePaymentMachineRequest> createValidator,
        CreatePaymentMachineHandler createHandler,
        CalculateFeeHandler calculateFeeHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
        _calculateFeeHandler = calculateFeeHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentMachineRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }

    [HttpPost("calculate-fee")]
    public async Task<IActionResult> CalculateFee(CalculateFeeRequest request, CancellationToken cancellationToken) =>
        FromResult(await _calculateFeeHandler.HandleAsync(request, cancellationToken));
}
