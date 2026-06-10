namespace Shared.Kernel.Settings;

public sealed class KeycloakSettings
{
    public string AdminUrl { get; init; } = default!;
    public string Realm { get; init; } = default!;
    public string AdminClientId { get; init; } = default!;
    public string AdminClientSecret { get; init; } = default!;
    public string RedirectUri { get; init; } = default!;
    public string ClientId { get; init; } = default!;
    public string Issuer { get; init; } = default!;
    public string Audience { get; init; } = default!;
    public string ClientSecret { get; init; } = default!;
    public bool RequireHttpsMetadata { get; set; }
}
