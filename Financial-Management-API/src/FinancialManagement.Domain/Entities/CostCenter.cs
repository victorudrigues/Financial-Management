using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class CostCenter : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    private CostCenter() { }

    public CostCenter(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome do centro de custo é obrigatório.", nameof(name));

        Name = name;
        Description = description;
    }

    public void Update(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome do centro de custo é obrigatório.", nameof(name));

        Name = name;
        Description = description;
    }
}
