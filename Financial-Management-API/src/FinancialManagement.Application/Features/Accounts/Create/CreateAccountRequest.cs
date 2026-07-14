using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Accounts.Create;

public record CreateAccountRequest(string Name, AccountType Type, decimal InitialBalance);
