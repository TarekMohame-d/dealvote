namespace Shared.Contracts.Interfaces;

public interface IIntegrationEventDispatcher
{
    Task DispatchAsync(IIntegrationEvent integrationEvent, CancellationToken ct = default);
}
