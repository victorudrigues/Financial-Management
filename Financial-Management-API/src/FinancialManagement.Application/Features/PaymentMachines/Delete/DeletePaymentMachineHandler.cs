using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.PaymentMachines.Delete;

public class DeletePaymentMachineHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public DeletePaymentMachineHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var machine = await _unitOfWork.PaymentMachines.GetByIdAsync(id, cancellationToken);

        if (machine is null)
            return Result.Failure("Maquineta não encontrada.");

        _unitOfWork.PaymentMachines.Remove(machine);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
