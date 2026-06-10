namespace Shared.Kernel.Settings;

public sealed class AdminSettings
{
    public Guid Id { get; init; }
    public Guid KeycloakId { get; init; }
    public string Email { get; init; } = default!;
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string PhoneNumber { get; init; } = default!;
}
