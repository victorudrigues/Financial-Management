using FinancialManagement.Domain.Enums;
using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class Account : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public AccountType Type { get; private set; }
    public decimal InitialBalance { get; private set; }
    public decimal CurrentBalance { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Account() { }

    public Account(string name, AccountType type, decimal initialBalance)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da conta é obrigatório.", nameof(name));

        Name = name;
        Type = type;
        InitialBalance = initialBalance;
        CurrentBalance = initialBalance;
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da conta é obrigatório.", nameof(name));

        Name = name;
    }

    public void Credit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("O valor de crédito deve ser positivo.", nameof(amount));

        CurrentBalance += amount;
    }

    public void Debit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("O valor de débito deve ser positivo.", nameof(amount));

        CurrentBalance -= amount;
    }

    public void Deactivate() => IsActive = false;

    public void Activate() => IsActive = true;
}
