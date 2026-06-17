using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Enums;

namespace MkPainel.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public DashboardController(IApplicationDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var headerValue) && Guid.TryParse(headerValue, out var userId))
        {
            return userId;
        }
        return Guid.Parse("d7fb473a-4efd-4e92-bc91-2a945b0a33c1");
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData()
    {
        var userId = GetCurrentUserId();

        var accounts = await _context.ConnectedAccounts
            .Include(ca => ca.Campaigns)
            .Where(ca => ca.UserId == userId)
            .ToListAsync();

        if (!accounts.Any())
        {
            return Ok(new
            {
                kpis = new { clicks = 0, conversions = 0, spent = 0, avgRoas = 0, impressions = 0 },
                platformBreakdown = new object[] { },
                warnings = new object[] { },
                connectedAccounts = new object[] { }
            });
        }

        var campaigns = accounts.SelectMany(ca => ca.Campaigns).ToList();

        int totalClicks = campaigns.Sum(c => c.Clicks);
        int totalConversions = campaigns.Sum(c => c.Conversions);
        decimal totalSpent = campaigns.Sum(c => c.Spent);
        int totalImpressions = totalClicks * 25;

        decimal avgRoas = 0;
        if (totalSpent > 0)
        {
            avgRoas = campaigns.Sum(c => c.Roas * c.Spent) / totalSpent;
        }
        else if (campaigns.Any())
        {
            avgRoas = campaigns.Average(c => c.Roas);
        }

        var googleCampaigns = campaigns.Where(c => c.ConnectedAccount.Platform == PlatformType.GoogleAds).ToList();
        var metaCampaigns = campaigns.Where(c => c.ConnectedAccount.Platform == PlatformType.MetaAds).ToList();

        var googleSpent = googleCampaigns.Sum(c => c.Spent);
        var googleRoas = googleSpent > 0 ? googleCampaigns.Sum(c => c.Roas * c.Spent) / googleSpent : 0;

        var metaSpent = metaCampaigns.Sum(c => c.Spent);
        var metaRoas = metaSpent > 0 ? metaCampaigns.Sum(c => c.Roas * c.Spent) / metaSpent : 0;

        var platformBreakdown = new[]
        {
            new {
                platform = "GoogleAds",
                spent = googleSpent,
                clicks = googleCampaigns.Sum(c => c.Clicks),
                conversions = googleCampaigns.Sum(c => c.Conversions),
                avgRoas = googleRoas
            },
            new {
                platform = "MetaAds",
                spent = metaSpent,
                clicks = metaCampaigns.Sum(c => c.Clicks),
                conversions = metaCampaigns.Sum(c => c.Conversions),
                avgRoas = metaRoas
            }
        };

        var warnings = new System.Collections.Generic.List<object>();

        foreach (var account in accounts)
        {
            if (account.Balance <= 0)
            {
                warnings.Add(new
                {
                    type = "balance_critical",
                    accountName = account.Name,
                    accountId = account.Id,
                    message = $"O saldo da conta '{account.Name}' está esgotado (R$ 0,00). As campanhas foram pausadas.",
                    severity = "critical"
                });
            }
            else if (account.DailyBurn > 0 && account.Balance < account.DailyBurn * 7)
            {
                warnings.Add(new
                {
                    type = "balance_low",
                    accountName = account.Name,
                    accountId = account.Id,
                    message = $"Saldo baixo na conta '{account.Name}': R$ {account.Balance:F2} restantes (consumo de R$ {account.DailyBurn:F2}/dia). Recarregue em menos de 7 dias.",
                    severity = "warning"
                });
            }
        }

        foreach (var campaign in campaigns.Where(c => c.Status == "active"))
        {
            if (campaign.Roas < 2.5m)
            {
                warnings.Add(new
                {
                    type = "campaign_underperforming",
                    campaignName = campaign.Name,
                    campaignId = campaign.Id,
                    accountName = campaign.ConnectedAccount.Name,
                    message = $"A campanha '{campaign.Name}' está com ROAS muito baixo ({campaign.Roas:0.0}x). Considere pausá-la ou ajustar a segmentação.",
                    severity = "warning"
                });
            }
        }

        var connectedAccountsSummary = accounts.Select(ca => new
        {
            ca.Id,
            ca.Name,
            Platform = ca.Platform.ToString(),
            ca.ExternalAccountId,
            ca.Balance,
            ca.DailyBurn,
            ca.Status,
            ActiveCampaignsCount = ca.Campaigns.Count(c => c.Status == "active")
        }).ToList();

        return Ok(new
        {
            kpis = new
            {
                clicks = totalClicks,
                conversions = totalConversions,
                spent = totalSpent,
                avgRoas = Math.Round(avgRoas, 2),
                impressions = totalImpressions
            },
            platformBreakdown,
            warnings,
            connectedAccounts = connectedAccountsSummary
        });
    }
}
