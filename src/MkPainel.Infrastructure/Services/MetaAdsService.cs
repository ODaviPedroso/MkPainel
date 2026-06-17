using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;

namespace MkPainel.Infrastructure.Services;

public class MetaAdsService : IMetaAdsService
{
    private readonly IApplicationDbContext _context;

    public MetaAdsService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> PauseCampaignAsync(string externalAccountId, string externalCampaignId, string accessToken)
    {
        await Task.Delay(500);

        var campaign = await _context.Campaigns
            .Include(c => c.ConnectedAccount)
            .FirstOrDefaultAsync(c => c.ExternalCampaignId == externalCampaignId 
                                      && c.ConnectedAccount.ExternalAccountId == externalAccountId);

        if (campaign == null)
            return false;

        campaign.UpdateMetrics(
            campaign.Budget,
            campaign.Spent,
            campaign.Conversions,
            campaign.Clicks,
            campaign.Ctr,
            campaign.Roas,
            "paused"
        );

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SyncCampaignsAsync(Guid connectedAccountId, string accessToken)
    {
        await Task.Delay(800);

        var account = await _context.ConnectedAccounts
            .Include(ca => ca.Campaigns)
            .FirstOrDefaultAsync(ca => ca.Id == connectedAccountId);

        if (account == null) return;

        var random = new Random();
        foreach (var campaign in account.Campaigns)
        {
            if (campaign.Status == "active")
            {
                decimal addedSpent = (decimal)(random.NextDouble() * 60 + 15);
                int addedClicks = random.Next(15, 120);
                int addedConversions = random.Next(0, 6);

                decimal newSpent = campaign.Spent + addedSpent;
                int newClicks = campaign.Clicks + addedClicks;
                int newConversions = campaign.Conversions + addedConversions;
                
                decimal newCtr = newClicks > 0 ? (decimal)newClicks / (newClicks * 15) : campaign.Ctr;
                decimal newRoas = newSpent > 0 ? (decimal)(newConversions * 120) / newSpent : campaign.Roas;

                campaign.UpdateMetrics(
                    campaign.Budget,
                    newSpent,
                    newConversions,
                    newClicks,
                    newCtr,
                    newRoas,
                    campaign.Status
                );
            }
        }

        decimal totalDailyBurn = account.Campaigns
            .Where(c => c.Status == "active")
            .Sum(c => c.Budget * 0.12m); // slightly higher burn rate for Meta

        decimal newBalance = Math.Max(0, account.Balance - totalDailyBurn * 0.5m);
        string newStatus = account.Status;
        if (newBalance <= 0)
        {
            newStatus = "paused";
        }
        else if (newBalance < totalDailyBurn * 2)
        {
            newStatus = "warning";
        }

        account.UpdateMetrics(newBalance, totalDailyBurn, newStatus);

        await _context.SaveChangesAsync();
    }
}
