namespace Shared.Infrastructure.Messages.Outbox;

public interface IOutboxProcessor
{
    Task ProcessPendingMessagesAsync();
}
