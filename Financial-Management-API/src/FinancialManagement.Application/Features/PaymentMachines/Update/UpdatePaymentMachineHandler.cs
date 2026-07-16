using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.PaymentMachines.Update;

public class UpdatePaymentMachineHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePaymentMachineHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentMachineResponse>> HandleAsync(Guid id, UpdatePaymentMachineRequest request, CancellationToken cancellationToken)
    {
        var machine = await _unitOfWork.PaymentMachines.GetByIdAsync(id, cancellationToken);

        if (machine is null)
            return Result.Failure<PaymentMachineResponse>("Maquineta não encontrada.");

        machine.Update(
            request.Name,
            request.UnifiedFeeForAllBrands,
            request.BrandFees
                .Select(b => new BrandFeeSpec(b.Brand, b.DebitFeePercent, b.CreditFeePercent, b.InstallmentFeePercent))
                .ToList(),
            request.PixFeePercent,
            request.SettlementDays,
            request.AllowsAnticipation);

        _unitOfWork.PaymentMachines.Update(machine);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(PaymentMachineResponse.FromEntity(machine));
    }
}
