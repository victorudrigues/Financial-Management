using FinancialManagement.SharedKernel.Common;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Common;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : BadRequest(new { errors = result.Errors });

    protected IActionResult FromResult(Result result) =>
        result.IsSuccess ? NoContent() : BadRequest(new { errors = result.Errors });

    protected async Task<IActionResult?> ValidateAsync<T>(IValidator<T> validator, T instance)
    {
        var validationResult = await validator.ValidateAsync(instance);
        if (validationResult.IsValid)
            return null;

        foreach (var error in validationResult.Errors)
        {
            ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
        }

        return ValidationProblem(ModelState);
    }
}
