using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Domain.Services;

public static class RecurrenceCalculator
{
    public static DateTime? NextOccurrence(DateTime from, RecurrenceType recurrence) => recurrence switch
    {
        RecurrenceType.Weekly => from.AddDays(7),
        RecurrenceType.Monthly => from.AddMonths(1),
        RecurrenceType.Yearly => from.AddYears(1),
        _ => null
    };
}
