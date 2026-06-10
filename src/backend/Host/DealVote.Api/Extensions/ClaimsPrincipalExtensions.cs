using System.Security.Claims;

namespace DealVote.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue("db_id");

        return Guid.TryParse(id, out var guid) ? guid : null;
    }

    public static Guid? GetKeycloakUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue("sub");

        return Guid.TryParse(id, out var guid) ? guid : null;
    }

    public static string? GetEmail(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("email");
    }

    public static string? GetFirstName(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("given_name");
    }

    public static string? GetLastName(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("family_name");
    }

    public static string? GetFullName(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("name");
    }

    public static IEnumerable<string> GetRoles(this ClaimsPrincipal user)
    {
        return user.FindAll("roles").Select(c => c.Value).Distinct();
    }
}
