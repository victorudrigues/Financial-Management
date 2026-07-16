using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.PaymentMachines.GetAll;

public class GetAllPaymentMachinesHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllPaymentMachinesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PaymentMachineResponse>> HandleAsync(CancellationToken cancellationToken)
    {
        var machines = await _unitOfWork.PaymentMachines.GetAllAsync(cancellationToken);

        return machines.Select(PaymentMachineResponse.FromEntity).ToList();
    }
}
