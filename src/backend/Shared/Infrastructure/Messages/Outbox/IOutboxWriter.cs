using Shared.Contracts.Interfaces;

namespace Shared.Infrastructure.Messages.Outbox;

public interface IOutboxWriter
{
    void Add(IIntegrationEvent integrationEvent, CancellationToken ct = default);
}
