using FluentValidation;

namespace FinancialManagement.Application.Features.CostCenters.Create;

public class CreateCostCenterValidator : AbstractValidator<CreateCostCenterRequest>
{
    public CreateCostCenterValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}
