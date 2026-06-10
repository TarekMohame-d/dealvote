using System.Collections.Concurrent;
using Microsoft.Extensions.DependencyInjection;
using Shared.Contracts.Interfaces;

namespace Shared.Infrastructure.Dispatchers;

public class IntegrationEventDispatcher(IServiceProvider serviceProvider) : IIntegrationEventDispatcher
{
    private static readonly ConcurrentDictionary<Type, IntegrationEventHandlerWrapper> Cache = new();

    public Task DispatchAsync(IIntegrationEvent integrationEvent, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(integrationEvent);

        var eventType = integrationEvent.GetType();

        var wrapper = Cache.GetOrAdd(
            eventType,
            type =>
            {
                var wrapperType = typeof(GenericIntegrationEventHandlerWrapper<>).MakeGenericType(type);
                return (IntegrationEventHandlerWrapper)Activator.CreateInstance(wrapperType)!;
            }
        );

        return wrapper.HandleAsync(integrationEvent, serviceProvider, ct);
    }
}

internal abstract class IntegrationEventHandlerWrapper
{
    public abstract Task HandleAsync(
        IIntegrationEvent integrationEvent,
        IServiceProvider provider,
        CancellationToken ct
    );
}

internal sealed class GenericIntegrationEventHandlerWrapper<TEvent> : IntegrationEventHandlerWrapper
    where TEvent : IIntegrationEvent
{
    public override async Task HandleAsync(
        IIntegrationEvent integrationEvent,
        IServiceProvider provider,
        CancellationToken ct
    )
    {
        var handlers = provider.GetServices<IIntegrationEventHandler<TEvent>>();

        foreach (var handler in handlers)
        {
            if (handler is null)
                continue;

            await handler.HandleAsync((TEvent)integrationEvent, ct);
        }
    }
}
