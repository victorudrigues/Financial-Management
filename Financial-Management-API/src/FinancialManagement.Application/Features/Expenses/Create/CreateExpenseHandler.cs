using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.Domain.Services;
using FinancialManagement.SharedKernel.Common;
using FinancialManagement.Application.Features.Transactions;

namespace FinancialManagement.Application.Features.Expenses.Create;

public class CreateExpenseHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateExpenseHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TransactionResponse>> HandleAsync(CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.AccountId, cancellationToken);
        if (account is null)
            return Result.Failure<TransactionResponse>("Conta não encontrada.");

        var expense = Transaction.CreateExpense(
            request.Description,
            request.Amount,
            request.AccountId,
            request.CategoryId,
            request.CompetenceDate,
            request.PaymentMethod,
            request.ExpenseNature,
            request.Recurrence,
            request.CostCenterId,
            notes: request.Notes);

        await _unitOfWork.Transactions.AddAsync(expense, cancellationToken);

        var nextDate = RecurrenceCalculator.NextOccurrence(request.CompetenceDate, request.Recurrence);
        if (nextDate.HasValue)
        {
            var nextOccurrence = Transaction.CreateExpense(
                request.Description,
                request.Amount,
                request.AccountId,
                request.CategoryId,
                nextDate.Value,
                request.PaymentMethod,
                request.ExpenseNature,
                request.Recurrence,
                request.CostCenterId,
                expense.Id,
                request.Notes);

            await _unitOfWork.Transactions.AddAsync(nextOccurrence, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(TransactionMapper.ToResponse(expense));
    }
}
