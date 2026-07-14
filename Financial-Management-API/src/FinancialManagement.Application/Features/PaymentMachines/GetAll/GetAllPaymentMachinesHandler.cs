using FinancialManagement.Domain.Entities;
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

        return machines.Select(ToResponse).ToList();
    }

    private static PaymentMachineResponse ToResponse(PaymentMachine machine) => new(
        machine.Id, machine.Name, machine.DebitFeePercent, machine.CreditFeePercent,
        machine.InstallmentFeePercent, machine.PixFeePercent, machine.SettlementDays,
        machine.AllowsAnticipation, machine.IsActive);
}
