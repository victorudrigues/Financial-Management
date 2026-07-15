using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.CostCenters.Delete;

public class DeleteCostCenterHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCostCenterHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(id, cancellationToken);

        if (costCenter is null)
            return Result.Failure("Centro de custo não encontrado.");

        _unitOfWork.CostCenters.Remove(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
