namespace FinancialManagement.SharedKernel.Common;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
