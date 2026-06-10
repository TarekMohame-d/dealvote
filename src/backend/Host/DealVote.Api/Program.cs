using System.Text.Json.Serialization;
using DealVote.Api;
using DealVote.Api.Extensions;
using DealVote.Api.Middlewares;
using dotenv.net;
using Modules.Identity;
using Scalar.AspNetCore;
using Serilog;
using Shared;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    DotEnv.Fluent().WithProbeForEnv(probeLevelsToSearch: 10).WithTrimValues().Load();
    builder.Configuration.AddEnvironmentVariables();
}

builder.Host.UseSerilog(
    (context, loggerConfig) => loggerConfig.ReadFrom.Configuration(context.Configuration)
);

// Add services to the container.
builder
    .Services.AddHostServices(builder.Configuration)
    .AddSharedServices(builder.Configuration)
    .AddIdentityModule(builder.Configuration);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    // app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "ByteLink API"));
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseMiddleware<RequestLogContextMiddleware>();

app.UseSerilogRequestLogging();

app.UseExceptionHandler();

// app.UseRateLimiter();

app.UseStatusCodePages();

// app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.MapIdentityEndpoints();

app.UseIdentityModuleBackgroundJobs();

app.UseCustomHangfireDashboard(builder.Configuration);

app.Run();
