using System.Data.Common;
using System.Diagnostics;
using DealVote.Api.Infrastructure;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Shared.Constants;

namespace DealVote.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddHostServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddExceptionHandling();

        services.AddHangfireBackgroundJobs(configuration);

        services.AddApplicationResilience();

        return services;
    }

    private static IServiceCollection AddExceptionHandling(this IServiceCollection services)
    {
        services.AddProblemDetails(configure =>
        {
            configure.CustomizeProblemDetails = context =>
            {
                context.ProblemDetails.Instance =
                    $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";

                context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);

                Activity? activity = context.HttpContext.Features.Get<IHttpActivityFeature>()?.Activity;

                context.ProblemDetails.Extensions.TryAdd("traceId", activity?.Id);
            };
        });

        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddProblemDetails();

        return services;
    }

    private static IServiceCollection AddHangfireBackgroundJobs(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddHangfire(config =>
        {
            config.UsePostgreSqlStorage(
                options =>
                    options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection")),
                new PostgreSqlStorageOptions
                {
                    SchemaName = "hangfire",

                    // optionally tune other settings:
                    // QueuePollInterval = TimeSpan.FromSeconds(15),
                    // InvisibilityTimeout = TimeSpan.FromMinutes(30),
                    // TablePrefix = "hf_",
                }
            );
        });
        services.AddHangfireServer(options => options.SchedulePollingInterval = TimeSpan.FromSeconds(1));

        return services;
    }

    private static IServiceCollection AddApplicationResilience(this IServiceCollection services) =>
        services.AddResiliencePipeline(
            ResilienceConstants.StandardPolicy,
            builder =>
            {
                builder.AddRetry(
                    new RetryStrategyOptions
                    {
                        ShouldHandle = new PredicateBuilder().Handle<Exception>(),

                        MaxRetryAttempts = 3,
                        Delay = TimeSpan.FromMilliseconds(50),
                        BackoffType = DelayBackoffType.Exponential,
                        UseJitter = true,
                    }
                );

                builder.AddCircuitBreaker(
                    new CircuitBreakerStrategyOptions
                    {
                        // If 50% of requests fail...
                        FailureRatio = 0.5,

                        // ...within a 30-second window...
                        SamplingDuration = TimeSpan.FromSeconds(30),

                        // ...and we have attempted at least 7 requests...
                        MinimumThroughput = 7,

                        // ...then stop all requests for 15 seconds.
                        BreakDuration = TimeSpan.FromSeconds(15),

                        // Handle DB Concurrency, but also generic DB Exceptions (timeouts, connection issues)
                        ShouldHandle = new PredicateBuilder()
                            .Handle<DbUpdateConcurrencyException>()
                            .Handle<DbUpdateException>() // Catch general EF errors
                            .Handle<TimeoutException>()
                            .Handle<DbException>()
                            .Handle<NpgsqlException>()
                            .Handle<TimeoutException>(),
                    }
                );
            }
        );
}
