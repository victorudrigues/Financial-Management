using FinancialManagement.Application.Features.CashFlow.GetAccountBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetPaymentMachineBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetSummary;

namespace FinancialManagement.Application.Features.Reports.ExportCashFlow;

public record CashFlowReportData(
    CashFlowSummaryResponse Summary,
    IReadOnlyList<CategoryBreakdownItem> CategoryBreakdown,
    IReadOnlyList<CostCenterBreakdownItem> CostCenterBreakdown,
    IReadOnlyList<PaymentMachineBreakdownItem> PaymentMachineBreakdown,
    IReadOnlyList<AccountBreakdownItem> AccountBreakdown,
    DateTime From,
    DateTime To);
