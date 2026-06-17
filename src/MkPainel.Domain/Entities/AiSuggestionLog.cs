using System;
using MkPainel.Domain.Enums;

namespace MkPainel.Domain.Entities;

public class AiSuggestionLog
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid CampaignId { get; private set; }
    public string ActionType { get; private set; } = "PauseCampaign"; // PauseCampaign, AdjustBudget
    
    // JSON payloads to store original and suggested configurations
    public string OriginalStateJson { get; private set; } = "{}";
    public string SuggestedStateJson { get; private set; } = "{}";
    
    public string Reasoning { get; private set; } = string.Empty;
    public string ProjectedImpact { get; private set; } = string.Empty;
    public SuggestionStatus Status { get; private set; } = SuggestionStatus.PendingApproval;
    
    public DateTime CreatedAt { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? ErrorMessage { get; private set; }

    // Navigation Properties
    public User User { get; private set; } = null!;
    public Campaign Campaign { get; private set; } = null!;

    private AiSuggestionLog() { }

    public AiSuggestionLog(Guid id, Guid userId, Guid campaignId, string actionType, string originalStateJson, string suggestedStateJson, string reasoning, string projectedImpact)
    {
        Id = id;
        UserId = userId;
        CampaignId = campaignId;
        ActionType = actionType;
        OriginalStateJson = originalStateJson;
        SuggestedStateJson = suggestedStateJson;
        Reasoning = reasoning;
        ProjectedImpact = projectedImpact;
        Status = SuggestionStatus.PendingApproval;
        CreatedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        Status = SuggestionStatus.Approved;
        ReviewedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        Status = SuggestionStatus.Rejected;
        ReviewedAt = DateTime.UtcNow;
    }

    public void MarkExecuted()
    {
        Status = SuggestionStatus.Executed;
    }

    public void MarkFailed(string errorMessage)
    {
        Status = SuggestionStatus.Failed;
        ErrorMessage = errorMessage;
    }
}
