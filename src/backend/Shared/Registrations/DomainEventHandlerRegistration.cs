using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Shared.Kernel.Domain;

namespace Shared.Registrations;

public static class DomainEventHandlerRegistration
{
    public static IServiceCollection AddDomainEventHandlersFromAssembly(
        this IServiceCollection services,
        Assembly assembly
    )
    {
        services.Scan(scan =>
            scan.FromAssemblies(assembly)
                .AddClasses(c => c.AssignableTo(typeof(IDomainEventHandler<>)), publicOnly: false)
                .AsImplementedInterfaces()
                .WithScopedLifetime()
        );

        return services;
    }
}
