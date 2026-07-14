using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Categories.Create;
using FinancialManagement.Application.Features.Categories.Delete;
using FinancialManagement.Application.Features.Categories.GetAll;
using FinancialManagement.Application.Features.Categories.Update;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/categories")]
[Authorize]
public class CategoriesController : ApiControllerBase
{
    private readonly GetAllCategoriesHandler _getAllHandler;
    private readonly IValidator<CreateCategoryRequest> _createValidator;
    private readonly CreateCategoryHandler _createHandler;
    private readonly UpdateCategoryHandler _updateHandler;
    private readonly DeleteCategoryHandler _deleteHandler;

    public CategoriesController(
        GetAllCategoriesHandler getAllHandler,
        IValidator<CreateCategoryRequest> createValidator,
        CreateCategoryHandler createHandler,
        UpdateCategoryHandler updateHandler,
        DeleteCategoryHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _createValidator = createValidator;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await _getAllHandler.HandleAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_createValidator, request);
        if (validationError is not null)
            return validationError;

        return FromResult(await _createHandler.HandleAsync(request, cancellationToken));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken) =>
        FromResult(await _updateHandler.HandleAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _deleteHandler.HandleAsync(id, cancellationToken));
}
