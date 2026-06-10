namespace Shared.Infrastructure.Messages.Outbox;

public sealed class OutboxMessage
{
    public Guid Id { get; private set; }
    public string Type { get; private set; } = default!;
    public string Payload { get; private set; } = default!;
    public DateTimeOffset OccurredAtUtc { get; private set; }
    public DateTimeOffset? ProcessedAtUtc { get; private set; }
    public string? Error { get; private set; }
    public int RetryCount { get; private set; }

    private OutboxMessage() { }

    public OutboxMessage(string type, string payload, DateTimeOffset occurredAtUtc)
    {
        Id = Guid.CreateVersion7();
        Type = type;
        Payload = payload;
        OccurredAtUtc = occurredAtUtc;
        RetryCount = 0;
    }

    public void MarkProcessed()
    {
        ProcessedAtUtc = DateTimeOffset.UtcNow;
        Error = null;
    }

    public void HandleFailure(string error, int maxRetries)
    {
        RetryCount++;
        if (RetryCount < maxRetries)
            return;
        // Stop retrying, mark as "Dead Letter"
        ProcessedAtUtc = DateTimeOffset.UtcNow;
        Error = $"Failed after {maxRetries} attempts. Last error: {error}";
    }
}
