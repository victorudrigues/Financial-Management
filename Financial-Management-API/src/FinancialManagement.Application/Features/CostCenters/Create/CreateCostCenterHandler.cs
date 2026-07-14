using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.CostCenters.Create;

public class CreateCostCenterHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateCostCenterHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterResponse>> HandleAsync(CreateCostCenterRequest request, CancellationToken cancellationToken)
    {
        var costCenter = new CostCenter(request.Name, request.Description);

        await _unitOfWork.CostCenters.AddAsync(costCenter, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new CostCenterResponse(costCenter.Id, costCenter.Name, costCenter.Description));
    }
}
