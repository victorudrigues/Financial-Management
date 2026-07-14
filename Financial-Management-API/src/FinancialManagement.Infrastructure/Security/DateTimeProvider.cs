using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Infrastructure.Security;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
