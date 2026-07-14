using FinancialManagement.Domain.Enums;
using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public CategoryType Type { get; private set; }
    public string? Color { get; private set; }
    public Guid? ParentCategoryId { get; private set; }

    private Category() { }

    public Category(string name, CategoryType type, string? color = null, Guid? parentCategoryId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da categoria é obrigatório.", nameof(name));

        Name = name;
        Type = type;
        Color = color;
        ParentCategoryId = parentCategoryId;
    }

    public void Update(string name, string? color)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da categoria é obrigatório.", nameof(name));

        Name = name;
        Color = color;
    }
}
