using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.PaymentMachines.CalculateFee;
using FinancialManagement.Application.Features.PaymentMachines.Create;
using FinancialManagement.Application.Features.PaymentMachines.Delete;
using FinancialManagement.Application.Features.PaymentMachines.GetAll;
using FinancialManagement.Application.Features.PaymentMachines.Update;
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
    private readonly IValidator<UpdatePaymentMachineRequest> _updateValidator;
    private readonly UpdatePaymentMachineHandler _updateHandler;
    private readonly DeletePaymentMachineHandler _deleteHandler;
    private readonly CalculateFeeHandler _calculateFeeHandler;

    public PaymentMachinesController(
        GetAllPaymentMachinesHandler getAllHandler,
        IValidator<CreatePaymentMachineRequest> createValidator,
        CreatePaymentMachineHandler createHandler,
        IValidator<UpdatePaymentMachineRequest> updateValidator,
        UpdatePaymentMachineHandler updateHandler,
        DeletePaymentMachineHandler deleteHandler,
        CalculateFeeHandler calculateFeeHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
        _updateValidator = updateValidator;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdatePaymentMachineRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_updateValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _updateHandler.HandleAsync(id, request, cancellationToken));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _deleteHandler.HandleAsync(id, cancellationToken));

    [HttpPost("calculate-fee")]
    public async Task<IActionResult> CalculateFee(CalculateFeeRequest request, CancellationToken cancellationToken) =>
        FromResult(await _calculateFeeHandler.HandleAsync(request, cancellationToken));
}
