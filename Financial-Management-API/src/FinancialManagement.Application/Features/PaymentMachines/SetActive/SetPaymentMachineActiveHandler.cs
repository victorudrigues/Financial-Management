using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.PaymentMachines.SetActive;

public class SetPaymentMachineActiveHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public SetPaymentMachineActiveHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentMachineResponse>> HandleAsync(Guid id, bool isActive, CancellationToken cancellationToken)
    {
        var machine = await _unitOfWork.PaymentMachines.GetByIdAsync(id, cancellationToken);

        if (machine is null)
            return Result.Failure<PaymentMachineResponse>("Maquineta não encontrada.");

        if (isActive)
            machine.Activate();
        else
            machine.Deactivate();

        _unitOfWork.PaymentMachines.Update(machine);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(PaymentMachineResponse.FromEntity(machine));
    }
}
