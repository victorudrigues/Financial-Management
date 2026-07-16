using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;
using FinancialManagement.Application.Features.Transactions;

namespace FinancialManagement.Application.Features.Income.Create;

public class CreateIncomeHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTimeProvider;

    public CreateIncomeHandler(IUnitOfWork unitOfWork, IDateTimeProvider dateTimeProvider)
    {
        _unitOfWork = unitOfWork;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<TransactionResponse>> HandleAsync(CreateIncomeRequest request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.AccountId, cancellationToken);
        if (account is null)
            return Result.Failure<TransactionResponse>("Conta não encontrada.");

        var income = Transaction.CreateIncome(
            request.Description,
            request.Amount,
            request.AccountId,
            request.CategoryId,
            request.CompetenceDate,
            request.PaymentMethod,
            request.ClientName,
            request.CostCenterId,
            request.Notes);

        await _unitOfWork.Transactions.AddAsync(income, cancellationToken);

        if (request.PaymentMachineId.HasValue)
        {
            var machine = await _unitOfWork.PaymentMachines.GetByIdAsync(request.PaymentMachineId.Value, cancellationToken);
            if (machine is null)
                return Result.Failure<TransactionResponse>("Maquineta não encontrada.");

            var installments = request.Installments ?? 1;
            var fee = machine.CalculateFee(request.Amount, request.PaymentMethod, installments, _dateTimeProvider.UtcNow);

            income.ApplyCardFee(machine.Id, installments, fee.FeeAmount, fee.NetAmount, fee.ExpectedSettlementDate);

            if (fee.FeeAmount > 0)
            {
                var feeCategory = await GetOrCreateFeeCategoryAsync(cancellationToken);

                var feeExpense = Transaction.CreateExpense(
                    $"Taxa máquininha - {machine.Name}",
                    fee.FeeAmount,
                    request.AccountId,
                    feeCategory.Id,
                    request.CompetenceDate,
                    request.PaymentMethod,
                    Domain.Enums.ExpenseNature.Variable,
                    notes: $"Gerado automaticamente a partir da receita \"{income.Description}\".");

                feeExpense.Confirm(request.CompetenceDate);

                await _unitOfWork.Transactions.AddAsync(feeExpense, cancellationToken);
                income.LinkFeeTransaction(feeExpense.Id);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(TransactionMapper.ToResponse(income));
    }

    private const string FeeCategoryName = "Taxas e Tarifas";

    private async Task<Category> GetOrCreateFeeCategoryAsync(CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        var existing = categories.FirstOrDefault(
            c => c.Type == Domain.Enums.CategoryType.Expense && c.Name == FeeCategoryName);

        if (existing is not null)
            return existing;

        var category = new Category(FeeCategoryName, Domain.Enums.CategoryType.Expense);
        await _unitOfWork.Categories.AddAsync(category, cancellationToken);

        return category;
    }
}
