using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.CostCenters.GetAll;

public class GetAllCostCentersHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllCostCentersHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CostCenterResponse>> HandleAsync(CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetAllAsync(cancellationToken);

        return costCenters.Select(c => new CostCenterResponse(c.Id, c.Name, c.Description)).ToList();
    }
}
