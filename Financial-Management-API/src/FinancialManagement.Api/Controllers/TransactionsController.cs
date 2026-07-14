using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Transactions.Cancel;
using FinancialManagement.Application.Features.Transactions.Confirm;
using FinancialManagement.Application.Features.Transactions.Reverse;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/transactions")]
[Authorize]
public class TransactionsController : ApiControllerBase
{
    private readonly ConfirmTransactionHandler _confirmHandler;
    private readonly CancelTransactionHandler _cancelHandler;
    private readonly ReverseTransactionHandler _reverseHandler;

    public TransactionsController(
        ConfirmTransactionHandler confirmHandler,
        CancelTransactionHandler cancelHandler,
        ReverseTransactionHandler reverseHandler)
    {
        _confirmHandler = confirmHandler;
        _cancelHandler = cancelHandler;
        _reverseHandler = reverseHandler;
    }

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id, ConfirmTransactionRequest request, CancellationToken cancellationToken) =>
        FromResult(await _confirmHandler.HandleAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _cancelHandler.HandleAsync(id, cancellationToken));

    [HttpPost("{id:guid}/reverse")]
    public async Task<IActionResult> Reverse(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _reverseHandler.HandleAsync(id, cancellationToken));
}
