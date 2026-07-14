namespace FinancialManagement.SharedKernel.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public Guid? UpdatedBy { get; private set; }
    public bool IsDeleted { get; private set; }

    [System.ComponentModel.DataAnnotations.Timestamp]
    public byte[] RowVersion { get; private set; } = Array.Empty<byte>();

    public void SetCreatedBy(Guid userId) => CreatedBy = userId;

    public void MarkUpdated(Guid? userId)
    {
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = userId;
    }

    public void MarkDeleted(Guid? userId)
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        UpdatedBy = userId;
    }

    public void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
    }
}
