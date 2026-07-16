using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentMachineBrandFees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreditFeePercent",
                table: "PaymentMachines");

            migrationBuilder.DropColumn(
                name: "DebitFeePercent",
                table: "PaymentMachines");

            migrationBuilder.DropColumn(
                name: "InstallmentFeePercent",
                table: "PaymentMachines");

            migrationBuilder.AddColumn<bool>(
                name: "UnifiedFeeForAllBrands",
                table: "PaymentMachines",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PaymentMachineBrandFees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentMachineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Brand = table.Column<int>(type: "int", nullable: false),
                    DebitFeePercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CreditFeePercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    InstallmentFeePercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMachineBrandFees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentMachineBrandFees_PaymentMachines_PaymentMachineId",
                        column: x => x.PaymentMachineId,
                        principalTable: "PaymentMachines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentMachineBrandFees_PaymentMachineId",
                table: "PaymentMachineBrandFees",
                column: "PaymentMachineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentMachineBrandFees");

            migrationBuilder.DropColumn(
                name: "UnifiedFeeForAllBrands",
                table: "PaymentMachines");

            migrationBuilder.AddColumn<decimal>(
                name: "CreditFeePercent",
                table: "PaymentMachines",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DebitFeePercent",
                table: "PaymentMachines",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "InstallmentFeePercent",
                table: "PaymentMachines",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
