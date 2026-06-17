using System;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;
using Xunit;

namespace MkPainel.Domain.UnitTests;

public class EntityTests
{
    [Fact]
    public void ConnectedAccount_ShouldUpdateMetricsCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var account = new ConnectedAccount(Guid.NewGuid(), userId, PlatformType.GoogleAds, "Test Account", "123");

        // Act
        account.UpdateMetrics(1000m, 100m, "active");

        // Assert
        Assert.Equal(1000m, account.Balance);
        Assert.Equal(100m, account.DailyBurn);
        Assert.Equal("active", account.Status);
    }

    [Fact]
    public void ConnectedAccount_ShouldUpdateTokensCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var account = new ConnectedAccount(Guid.NewGuid(), userId, PlatformType.GoogleAds, "Test Account", "123");
        var expiration = DateTime.UtcNow.AddHours(2);

        // Act
        account.UpdateTokens("access_token", "refresh_token", expiration);

        // Assert
        Assert.Equal("access_token", account.AccessToken);
        Assert.Equal("refresh_token", account.RefreshToken);
        Assert.Equal(expiration, account.TokenExpiration);
    }

    [Fact]
    public void Campaign_ShouldUpdateMetricsCorrectly()
    {
        // Arrange
        var accountId = Guid.NewGuid();
        var campaign = new Campaign(Guid.NewGuid(), accountId, "camp_001", "Test Campaign");
        var beforeSync = DateTime.UtcNow.AddSeconds(-1);

        // Act
        campaign.UpdateMetrics(150m, 500m, 20, 600, 0.033m, 2.5m, "active");

        // Assert
        Assert.Equal(150m, campaign.Budget);
        Assert.Equal(500m, campaign.Spent);
        Assert.Equal(20, campaign.Conversions);
        Assert.Equal(600, campaign.Clicks);
        Assert.Equal(0.033m, campaign.Ctr);
        Assert.Equal(2.5m, campaign.Roas);
        Assert.Equal("active", campaign.Status);
        Assert.True(campaign.LastSyncedAt >= beforeSync);
    }

    [Fact]
    public void AiSuggestionLog_ShouldTransitionStatusCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var campaignId = Guid.NewGuid();
        var suggestion = new AiSuggestionLog(
            Guid.NewGuid(),
            userId,
            campaignId,
            "PauseCampaign",
            "{}",
            "{}",
            "ROAS under 1.5",
            "Savings"
        );

        Assert.Equal(SuggestionStatus.PendingApproval, suggestion.Status);
        Assert.Null(suggestion.ReviewedAt);

        // Act & Assert - Approve
        suggestion.Approve();
        Assert.Equal(SuggestionStatus.Approved, suggestion.Status);
        Assert.NotNull(suggestion.ReviewedAt);

        // Act & Assert - Execute
        suggestion.MarkExecuted();
        Assert.Equal(SuggestionStatus.Executed, suggestion.Status);

        // Act & Assert - Reject
        var suggestion2 = new AiSuggestionLog(Guid.NewGuid(), userId, campaignId, "PauseCampaign", "{}", "{}", "Reason", "Impact");
        suggestion2.Reject();
        Assert.Equal(SuggestionStatus.Rejected, suggestion2.Status);
        Assert.NotNull(suggestion2.ReviewedAt);

        // Act & Assert - MarkFailed
        var suggestion3 = new AiSuggestionLog(Guid.NewGuid(), userId, campaignId, "PauseCampaign", "{}", "{}", "Reason", "Impact");
        suggestion3.MarkFailed("Network Error");
        Assert.Equal(SuggestionStatus.Failed, suggestion3.Status);
        Assert.Equal("Network Error", suggestion3.ErrorMessage);
    }
}
