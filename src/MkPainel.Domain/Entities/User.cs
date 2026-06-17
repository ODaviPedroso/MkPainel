using System;
using System.Collections.Generic;

namespace MkPainel.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    
    // Navigation Property
    public ICollection<ConnectedAccount> ConnectedAccounts { get; private set; } = new List<ConnectedAccount>();

    private User() { } // Required for EF Core

    public User(Guid id, string email, string passwordHash, string name)
    {
        Id = id;
        Email = email;
        PasswordHash = passwordHash;
        Name = name;
        CreatedAt = DateTime.UtcNow;
    }
}
