using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.PaymentMachines.Create;

public class CreatePaymentMachineHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public CreatePaymentMachineHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentMachineResponse>> HandleAsync(CreatePaymentMachineRequest request, CancellationToken cancellationToken)
    {
        var machine = new PaymentMachine(
            request.Name,
            request.UnifiedFeeForAllBrands,
            request.BrandFees
                .Select(b => new BrandFeeSpec(b.Brand, b.DebitFeePercent, b.CreditFeePercent, b.InstallmentFeePercent))
                .ToList(),
            request.PixFeePercent,
            request.SettlementDays,
            request.AllowsAnticipation);

        await _unitOfWork.PaymentMachines.AddAsync(machine, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(PaymentMachineResponse.FromEntity(machine));
    }
}
