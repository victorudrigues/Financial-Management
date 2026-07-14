using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.PaymentMachines.CalculateFee;

public class CalculateFeeHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTimeProvider;

    public CalculateFeeHandler(IUnitOfWork unitOfWork, IDateTimeProvider dateTimeProvider)
    {
        _unitOfWork = unitOfWork;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<CalculateFeeResponse>> HandleAsync(CalculateFeeRequest request, CancellationToken cancellationToken)
    {
        var machine = await _unitOfWork.PaymentMachines.GetByIdAsync(request.PaymentMachineId, cancellationToken);

        if (machine is null)
            return Result.Failure<CalculateFeeResponse>("Maquineta não encontrada.");

        var fee = machine.CalculateFee(request.GrossAmount, request.PaymentMethod, request.Installments, _dateTimeProvider.UtcNow);

        return Result.Success(new CalculateFeeResponse(fee.GrossAmount, fee.FeeAmount, fee.NetAmount, fee.ExpectedSettlementDate));
    }
}
