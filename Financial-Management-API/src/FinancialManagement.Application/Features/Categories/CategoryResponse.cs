using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Categories;

public record CategoryResponse(Guid Id, string Name, CategoryType Type, string? Color, Guid? ParentCategoryId);
