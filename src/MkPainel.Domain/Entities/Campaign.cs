using System;
using System.Collections.Generic;

namespace MkPainel.Domain.Entities;

public class Campaign
{
    public Guid Id { get; private set; }
    public Guid ConnectedAccountId { get; private set; }
    public string ExternalCampaignId { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Status { get; private set; } = "active"; // active, paused
    
    // Metrics (based on data.jsx Funnel)
    public decimal Budget { get; private set; }
    public decimal Spent { get; private set; }
    public int Conversions { get; private set; }
    public int Clicks { get; private set; }
    public decimal Ctr { get; private set; }
    public decimal Roas { get; private set; }
    public DateTime LastSyncedAt { get; private set; }

    // Navigation Properties
    public ConnectedAccount ConnectedAccount { get; private set; } = null!;
    public ICollection<AiSuggestionLog> SuggestionLogs { get; private set; } = new List<AiSuggestionLog>();

    private Campaign() { }

    public Campaign(Guid id, Guid connectedAccountId, string externalCampaignId, string name)
    {
        Id = id;
        ConnectedAccountId = connectedAccountId;
        ExternalCampaignId = externalCampaignId;
        Name = name;
        LastSyncedAt = DateTime.UtcNow;
    }

    public void UpdateMetrics(decimal budget, decimal spent, int conversions, int clicks, decimal ctr, decimal roas, string status)
    {
        Budget = budget;
        Spent = spent;
        Conversions = conversions;
        Clicks = clicks;
        Ctr = ctr;
        Roas = roas;
        Status = status;
        LastSyncedAt = DateTime.UtcNow;
    }
}
