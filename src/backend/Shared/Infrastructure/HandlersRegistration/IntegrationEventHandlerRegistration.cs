using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Shared.Contracts.Interfaces;

namespace Shared.Infrastructure.HandlersRegistration;

public static class IntegrationEventHandlerRegistration
{
    public static IServiceCollection AddIntegrationEventHandlersFromAssembly(
        this IServiceCollection services,
        Assembly assembly
    )
    {
        services.Scan(scan =>
            scan.FromAssemblies(assembly)
                .AddClasses(c => c.AssignableTo(typeof(IIntegrationEventHandler<>)), publicOnly: false)
                .AsImplementedInterfaces()
                .WithScopedLifetime()
        );

        return services;
    }
}
