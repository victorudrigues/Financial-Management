using FinancialManagement.Domain.Enums;
using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class Transaction : BaseEntity
{
    public string Description { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public TransactionType Type { get; private set; }
    public TransactionStatus Status { get; private set; }

    public Guid AccountId { get; private set; }
    public Guid? DestinationAccountId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Guid? CostCenterId { get; private set; }

    public string? ClientName { get; private set; }
    public string? Notes { get; private set; }

    public DateTime CompetenceDate { get; private set; }
    public DateTime? SettlementDate { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }

    public ExpenseNature? ExpenseNature { get; private set; }
    public RecurrenceType Recurrence { get; private set; } = RecurrenceType.None;
    public Guid? ParentTransactionId { get; private set; }
    public bool IsRecurring => Recurrence != RecurrenceType.None;

    public Guid? PaymentMachineId { get; private set; }
    public int? InstallmentCount { get; private set; }
    public decimal? FeeAmount { get; private set; }
    public decimal? NetAmount { get; private set; }
    public DateTime? ExpectedSettlementDate { get; private set; }
    public Guid? LinkedFeeTransactionId { get; private set; }

    private Transaction() { }

    public static Transaction CreateIncome(
        string description,
        decimal amount,
        Guid accountId,
        Guid categoryId,
        DateTime competenceDate,
        PaymentMethod paymentMethod,
        string? clientName = null,
        Guid? costCenterId = null,
        string? notes = null)
    {
        var transaction = new Transaction
        {
            Description = Validate(description),
            Amount = ValidateAmount(amount),
            Type = TransactionType.Income,
            Status = TransactionStatus.Pending,
            AccountId = accountId,
            CategoryId = categoryId,
            CostCenterId = costCenterId,
            ClientName = clientName,
            Notes = notes,
            CompetenceDate = competenceDate,
            PaymentMethod = paymentMethod
        };

        return transaction;
    }

    public static Transaction CreateExpense(
        string description,
        decimal amount,
        Guid accountId,
        Guid categoryId,
        DateTime competenceDate,
        PaymentMethod paymentMethod,
        ExpenseNature expenseNature,
        RecurrenceType recurrence = RecurrenceType.None,
        Guid? costCenterId = null,
        Guid? parentTransactionId = null,
        string? notes = null)
    {
        var transaction = new Transaction
        {
            Description = Validate(description),
            Amount = ValidateAmount(amount),
            Type = TransactionType.Expense,
            Status = TransactionStatus.Pending,
            AccountId = accountId,
            CategoryId = categoryId,
            CostCenterId = costCenterId,
            Notes = notes,
            CompetenceDate = competenceDate,
            PaymentMethod = paymentMethod,
            ExpenseNature = expenseNature,
            Recurrence = recurrence,
            ParentTransactionId = parentTransactionId
        };

        return transaction;
    }

    public static Transaction CreateTransfer(
        decimal amount,
        Guid sourceAccountId,
        Guid destinationAccountId,
        DateTime competenceDate,
        string? notes = null)
    {
        if (sourceAccountId == destinationAccountId)
            throw new ArgumentException("A conta de origem deve ser diferente da conta de destino.");

        var transaction = new Transaction
        {
            Description = "Transferência entre contas",
            Amount = ValidateAmount(amount),
            Type = TransactionType.Transfer,
            Status = TransactionStatus.Pending,
            AccountId = sourceAccountId,
            DestinationAccountId = destinationAccountId,
            Notes = notes,
            CompetenceDate = competenceDate,
            PaymentMethod = PaymentMethod.Transfer
        };

        return transaction;
    }

    public void ApplyCardFee(Guid paymentMachineId, int installments, decimal feeAmount, decimal netAmount, DateTime expectedSettlementDate)
    {
        if (Type != TransactionType.Income)
            throw new InvalidOperationException("Taxas de maquineta só podem ser aplicadas a receitas.");

        PaymentMachineId = paymentMachineId;
        InstallmentCount = installments;
        FeeAmount = feeAmount;
        NetAmount = netAmount;
        ExpectedSettlementDate = expectedSettlementDate;
    }

    public void LinkFeeTransaction(Guid feeTransactionId) => LinkedFeeTransactionId = feeTransactionId;

    public void Confirm(DateTime settlementDate)
    {
        if (Status is TransactionStatus.Cancelled or TransactionStatus.Reversed)
            throw new InvalidOperationException("Não é possível confirmar uma movimentação cancelada ou estornada.");

        Status = Type == TransactionType.Expense ? TransactionStatus.Paid : TransactionStatus.Received;
        SettlementDate = settlementDate;
    }

    public void Cancel()
    {
        if (Status is TransactionStatus.Received or TransactionStatus.Paid)
            throw new InvalidOperationException("Movimentações já conciliadas não podem ser canceladas; utilize o estorno.");

        Status = TransactionStatus.Cancelled;
    }

    public void Reverse()
    {
        if (Status is not (TransactionStatus.Received or TransactionStatus.Paid))
            throw new InvalidOperationException("Somente movimentações conciliadas podem ser estornadas.");

        Status = TransactionStatus.Reversed;
    }

    public bool IsSettled => Status is TransactionStatus.Received or TransactionStatus.Paid;

    private static string Validate(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("A descrição é obrigatória.", nameof(description));

        return description;
    }

    private static decimal ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("O valor deve ser positivo.", nameof(amount));

        return amount;
    }
}
