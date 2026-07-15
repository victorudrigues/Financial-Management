using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.CostCenters.Update;

public class UpdateCostCenterHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCostCenterHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterResponse>> HandleAsync(Guid id, UpdateCostCenterRequest request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(id, cancellationToken);

        if (costCenter is null)
            return Result.Failure<CostCenterResponse>("Centro de custo não encontrado.");

        costCenter.Update(request.Name, request.Description);
        _unitOfWork.CostCenters.Update(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new CostCenterResponse(costCenter.Id, costCenter.Name, costCenter.Description));
    }
}
