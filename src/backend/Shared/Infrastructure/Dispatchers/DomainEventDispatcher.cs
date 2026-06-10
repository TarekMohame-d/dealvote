using System.Collections.Concurrent;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Shared.Kernel.Domain;

namespace Shared.Infrastructure.Dispatchers;

public class DomainEventDispatcher(IServiceProvider serviceProvider) : IDomainEventDispatcher
{
    // Cache the wrappers to ensure reflection only happens ONCE per event type lifetime
    private static readonly ConcurrentDictionary<Type, DomainEventHandlerWrapper> Cache = new();

    public Task DispatchAsync(IDomainEvent domainEvent, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);

        var eventType = domainEvent.GetType();

        var wrapper = Cache.GetOrAdd(
            eventType,
            type =>
            {
                var wrapperType = typeof(GenericDomainEventHandlerWrapper<>).MakeGenericType(type);
                return (DomainEventHandlerWrapper)Activator.CreateInstance(wrapperType)!;
            }
        );

        return wrapper.HandleAsync(domainEvent, serviceProvider, ct);
    }
}

internal abstract class DomainEventHandlerWrapper
{
    public abstract Task HandleAsync(
        IDomainEvent domainEvent,
        IServiceProvider provider,
        CancellationToken ct
    );
}

internal sealed class GenericDomainEventHandlerWrapper<TEvent> : DomainEventHandlerWrapper
    where TEvent : IDomainEvent
{
    public override async Task HandleAsync(
        IDomainEvent domainEvent,
        IServiceProvider provider,
        CancellationToken ct
    )
    {
        // Resolve all registered handlers using DI
        var handlers = provider.GetServices<IDomainEventHandler<TEvent>>();

        foreach (var handler in handlers)
        {
            if (handler is null)
                continue;

            // Native, highly optimized, type-safe execution path
            await handler.HandleAsync((TEvent)domainEvent, ct);
        }
    }
}
