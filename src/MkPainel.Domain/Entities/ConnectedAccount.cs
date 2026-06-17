using System;
using System.Collections.Generic;
using MkPainel.Domain.Enums;

namespace MkPainel.Domain.Entities;

public class ConnectedAccount
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public PlatformType Platform { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string ExternalAccountId { get; private set; } = string.Empty; // customer_id or act_id
    
    // Tokens for API Access
    public string AccessToken { get; private set; } = string.Empty;
    public string RefreshToken { get; private set; } = string.Empty;
    public DateTime TokenExpiration { get; private set; }
    
    // Summary Metrics & Balances (from UI Design)
    public decimal Balance { get; private set; } // Saldo
    public decimal DailyBurn { get; private set; } // Consumo diário
    public string Status { get; private set; } = "active"; // active, warning, paused
    
    // Navigation Properties
    public User User { get; private set; } = null!;
    public ICollection<Campaign> Campaigns { get; private set; } = new List<Campaign>();

    private ConnectedAccount() { }

    public ConnectedAccount(Guid id, Guid userId, PlatformType platform, string name, string externalAccountId)
    {
        Id = id;
        UserId = userId;
        Platform = platform;
        Name = name;
        ExternalAccountId = externalAccountId;
    }

    public void UpdateTokens(string accessToken, string refreshToken, DateTime expiration)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        TokenExpiration = expiration;
    }

    public void UpdateMetrics(decimal balance, decimal dailyBurn, string status)
    {
        Balance = balance;
        DailyBurn = dailyBurn;
        Status = status;
    }
}
