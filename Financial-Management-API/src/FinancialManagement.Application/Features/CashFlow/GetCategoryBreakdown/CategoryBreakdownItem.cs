using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;

public record CategoryBreakdownItem(
    Guid CategoryId,
    string CategoryName,
    CategoryType CategoryType,
    string? Color,
    decimal TotalAmount,
    int TransactionCount);
