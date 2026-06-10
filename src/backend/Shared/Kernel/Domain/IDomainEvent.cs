namespace Shared.Kernel.Domain;

public interface IDomainEvent
{
    Guid EventId => Guid.CreateVersion7();
    DateTimeOffset OccurredOnUtc => DateTimeOffset.UtcNow;
}
