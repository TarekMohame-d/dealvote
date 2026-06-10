using System.Reflection;
using DbUp;
using dotenv.net;
using Npgsql;

Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine("==================================================");
Console.WriteLine("        🚀 INITIALIZING MIGRATION RUNNER          ");
Console.WriteLine("==================================================");
Console.ResetColor();

var shouldReset = args.Contains("--reset");

IDictionary<string, string>? envValues = null;
try
{
    envValues = DotEnv.Fluent().WithProbeForEnv(probeLevelsToSearch: 10).WithTrimValues().Read();
}
catch (Exception ex)
{
    LogWarning($"ℹ️ Direct .env probing could not be evaluated ({ex.Message}). Relying on system variables.");
}

string? GetConfigSetting(string key)
{
    var systemValue = Environment.GetEnvironmentVariable(key);
    if (!string.IsNullOrWhiteSpace(systemValue))
        return systemValue;

    if (envValues != null && envValues.TryGetValue(key, out var envValue))
        return envValue;

    return null;
}

var connectionString =
    GetConfigSetting("DefaultConnection") ?? GetConfigSetting("ConnectionStrings__DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    LogError("💥 Critical Error: Database connection string is entirely missing.");
    return -1;
}

var adminId = GetConfigSetting("AdminSettings__Id");
var adminKeycloakId = GetConfigSetting("AdminSettings__KeycloakId");
var adminEmail = GetConfigSetting("AdminSettings__Email");
var adminFirstName = GetConfigSetting("AdminSettings__FirstName") ?? "";
var adminLastName = GetConfigSetting("AdminSettings__LastName") ?? "";
var adminUsername = GetConfigSetting("AdminSettings__Username") ?? "";
var adminPhoneNumber = GetConfigSetting("AdminSettings__PhoneNumber") ?? "";

if (
    string.IsNullOrWhiteSpace(adminId)
    || string.IsNullOrWhiteSpace(adminKeycloakId)
    || string.IsNullOrWhiteSpace(adminEmail)
)
{
    LogError(
        "💥 Critical Error: Essential Admin Settings (Id, KeycloakId, or Email) are missing from the environment configuration."
    );
    return -1;
}

var adminSettings = new AdminSettings(
    Id: adminId,
    KeycloakId: adminKeycloakId,
    FirstName: adminFirstName,
    LastName: adminLastName,
    Username: adminUsername,
    Email: adminEmail,
    PhoneNumber: adminPhoneNumber
);

// Define Monolith Modules
var modules = new[] { "Identity" };

// Execute Migrations Per Module (Isolated Schemas)
foreach (var module in modules)
{
    var schemaName = module.ToLowerInvariant();
    var scriptPrefix = $"DealVote.Migrations.Scripts.{module}.";

    LogSection($"Processing Module: [{module}] -> Target Schema: [{schemaName}]");

    EnsureDatabase.For.PostgresqlDatabase(connectionString);

    // Handle database reset if the flag is present
    if (shouldReset)
    {
        LogWarning($"⚠️ Reset flag detected! Dropping schema [{schemaName}] and all its contents...");
        using var connection = new NpgsqlConnection(connectionString);
        connection.Open();
        using var command = new NpgsqlCommand($"DROP SCHEMA IF EXISTS {schemaName} CASCADE;", connection);
        command.ExecuteNonQuery();
    }

    using (var connection = new NpgsqlConnection(connectionString))
    {
        connection.Open();
        using var command = new NpgsqlCommand($"CREATE SCHEMA IF NOT EXISTS {schemaName};", connection);
        command.ExecuteNonQuery();
    }

    var upgrader = DeployChanges
        .To.PostgresqlDatabase(connectionString)
        .WithScriptsEmbeddedInAssembly(
            Assembly.GetExecutingAssembly(),
            scriptName => scriptName.StartsWith(scriptPrefix) && scriptName.EndsWith(".sql")
        )
        .WithTransaction()
        .JournalToPostgresqlTable(schemaName, "schema_versions")
        .LogToConsole()
        .WithVariables(
            new Dictionary<string, string>
            {
                { "adminUserId", adminSettings.Id },
                { "adminKeycloakId", adminSettings.KeycloakId },
                { "adminFirstName", adminSettings.FirstName },
                { "adminLastName", adminSettings.LastName },
                { "adminUsername", adminSettings.Username },
                { "adminEmail", adminSettings.Email },
                { "adminPhoneNumber", adminSettings.PhoneNumber },
            }
        )
        .Build();

    if (upgrader.IsUpgradeRequired())
    {
        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            LogError($"❌ Migration FAILED on module: {module}", result.Error.ToString());
            return -1;
        }

        LogSuccess($"✔ Module [{module}] migrated successfully.");
        continue;
    }

    LogSuccess($"✔ Module [{module}] is up to date.", ConsoleColor.DarkGreen);
}

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("\n============================================================");
Console.WriteLine("    🎉 ALL DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!  ");
Console.WriteLine("============================================================");
Console.ResetColor();
return 0;

static void LogSection(string message)
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine($"\n--- {message} ---");
    Console.ResetColor();
}

static void LogSuccess(string message, ConsoleColor color = ConsoleColor.Green)
{
    Console.ForegroundColor = color;
    Console.WriteLine(message);
    Console.ResetColor();
}

static void LogWarning(string message)
{
    Console.ForegroundColor = ConsoleColor.DarkYellow;
    Console.WriteLine(message);
    Console.ResetColor();
}

static void LogError(string message, string details = "")
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.Error.WriteLine($"\n{message}");
    if (!string.IsNullOrWhiteSpace(details))
    {
        Console.Error.WriteLine($"Details: {details}");
    }
    Console.ResetColor();
}

record AdminSettings(
    string Id,
    string KeycloakId,
    string Email,
    string FirstName,
    string LastName,
    string Username,
    string PhoneNumber
);
