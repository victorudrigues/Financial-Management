using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Accounts;

public record AccountResponse(Guid Id, string Name, AccountType Type, decimal InitialBalance, decimal CurrentBalance, bool IsActive);
