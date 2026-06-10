using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Contracts.Interfaces;
using Shared.Infrastructure.Dispatchers;
using Shared.Kernel.Domain;
using Shared.Kernel.Settings;

namespace Shared;

public static class DependencyInjection
{
    public static IServiceCollection AddSharedServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddScoped<IIntegrationEventDispatcher, IntegrationEventDispatcher>();

        // services.AddHttpContextAccessor();
        // services.AddScoped<IUserContext, UserContext>();

        services.Configure<KeycloakSettings>(configuration.GetSection("Keycloak"));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<AdminSettings>(configuration.GetSection("AdminSettings"));

        return services;
    }
}
