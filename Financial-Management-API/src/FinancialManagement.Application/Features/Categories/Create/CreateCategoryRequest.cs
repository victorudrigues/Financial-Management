using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Categories.Create;

public record CreateCategoryRequest(string Name, CategoryType Type, string? Color, Guid? ParentCategoryId);
