namespace FinancialManagement.SharedKernel.Common;

public static class Roles
{
    public const string Administrador = "Administrador";
    public const string Gerente = "Gerente";
    public const string Operador = "Operador";
    public const string Usuario = "Usuario";

    public static readonly string[] All = { Administrador, Gerente, Operador, Usuario };
}
