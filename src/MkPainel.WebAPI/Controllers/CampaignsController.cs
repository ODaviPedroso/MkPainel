using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;

namespace MkPainel.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IGoogleAdsService _googleAdsService;
    private readonly IMetaAdsService _metaAdsService;

    public CampaignsController(
        IApplicationDbContext context,
        IGoogleAdsService googleAdsService,
        IMetaAdsService metaAdsService)
    {
        _context = context;
        _googleAdsService = googleAdsService;
        _metaAdsService = metaAdsService;
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
    public async Task<IActionResult> GetCampaigns(
        [FromQuery] string? platform,
        [FromQuery] Guid? accountId,
        [FromQuery] string? status,
        [FromQuery] string? searchTerm,
        [FromQuery] string? sortBy = "roas",
        [FromQuery] bool descending = true)
    {
        var userId = GetCurrentUserId();

        var query = _context.Campaigns
            .Include(c => c.ConnectedAccount)
            .Where(c => c.ConnectedAccount.UserId == userId);

        if (!string.IsNullOrEmpty(platform))
        {
            if (Enum.TryParse<PlatformType>(platform, true, out var platformEnum))
            {
                query = query.Where(c => c.ConnectedAccount.Platform == platformEnum);
            }
        }

        if (accountId.HasValue)
        {
            query = query.Where(c => c.ConnectedAccountId == accountId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(c => c.Status.ToLower() == status.ToLower());
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(c => c.Name.ToLower().Contains(searchTerm.ToLower()));
        }

        switch (sortBy?.ToLower())
        {
            case "name":
                query = descending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name);
                break;
            case "budget":
                query = descending ? query.OrderByDescending(c => c.Budget) : query.OrderBy(c => c.Budget);
                break;
            case "spent":
                query = descending ? query.OrderByDescending(c => c.Spent) : query.OrderBy(c => c.Spent);
                break;
            case "conversions":
                query = descending ? query.OrderByDescending(c => c.Conversions) : query.OrderBy(c => c.Conversions);
                break;
            case "clicks":
                query = descending ? query.OrderByDescending(c => c.Clicks) : query.OrderBy(c => c.Clicks);
                break;
            case "ctr":
                query = descending ? query.OrderByDescending(c => c.Ctr) : query.OrderBy(c => c.Ctr);
                break;
            case "roas":
            default:
                query = descending ? query.OrderByDescending(c => c.Roas) : query.OrderBy(c => c.Roas);
                break;
        }

        var results = await query.ToListAsync();

        var response = results.Select(c => new
        {
            c.Id,
            c.ConnectedAccountId,
            AccountName = c.ConnectedAccount.Name,
            Platform = c.ConnectedAccount.Platform.ToString(),
            c.ExternalCampaignId,
            c.Name,
            c.Status,
            c.Budget,
            c.Spent,
            c.Conversions,
            c.Clicks,
            Ctr = Math.Round(c.Ctr, 4),
            Roas = Math.Round(c.Roas, 2),
            c.LastSyncedAt
        });

        return Ok(response);
    }

    [HttpPost("sync/{accountId}")]
    public async Task<IActionResult> SyncCampaigns(Guid accountId)
    {
        var userId = GetCurrentUserId();

        var account = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.Id == accountId && ca.UserId == userId);

        if (account == null)
        {
            return NotFound(new { message = "Conta não encontrada ou sem permissão." });
        }

        if (account.Platform == PlatformType.GoogleAds)
        {
            await _googleAdsService.SyncCampaignsAsync(account.Id, account.AccessToken);
        }
        else if (account.Platform == PlatformType.MetaAds)
        {
            await _metaAdsService.SyncCampaignsAsync(account.Id, account.AccessToken);
        }

        return Ok(new { success = true, message = "Sincronização realizada com sucesso." });
    }

    [HttpPost("{id}/pause")]
    public async Task<IActionResult> PauseCampaign(Guid id)
    {
        var userId = GetCurrentUserId();

        var campaign = await _context.Campaigns
            .Include(c => c.ConnectedAccount)
            .FirstOrDefaultAsync(c => c.Id == id && c.ConnectedAccount.UserId == userId);

        if (campaign == null)
        {
            return NotFound(new { message = "Campanha não encontrada ou sem permissão." });
        }

        bool success = false;
        if (campaign.ConnectedAccount.Platform == PlatformType.GoogleAds)
        {
            success = await _googleAdsService.PauseCampaignAsync(
                campaign.ConnectedAccount.ExternalAccountId,
                campaign.ExternalCampaignId,
                campaign.ConnectedAccount.AccessToken
            );
        }
        else if (campaign.ConnectedAccount.Platform == PlatformType.MetaAds)
        {
            success = await _metaAdsService.PauseCampaignAsync(
                campaign.ConnectedAccount.ExternalAccountId,
                campaign.ExternalCampaignId,
                campaign.ConnectedAccount.AccessToken
            );
        }

        if (success)
        {
            return Ok(new { success = true, status = "paused" });
        }

        return BadRequest(new { message = "Falha ao pausar campanha na API externa." });
    }

    [HttpPost("{id}/resume")]
    public async Task<IActionResult> ResumeCampaign(Guid id)
    {
        var userId = GetCurrentUserId();

        var campaign = await _context.Campaigns
            .Include(c => c.ConnectedAccount)
            .FirstOrDefaultAsync(c => c.Id == id && c.ConnectedAccount.UserId == userId);

        if (campaign == null)
        {
            return NotFound(new { message = "Campanha não encontrada ou sem permissão." });
        }

        campaign.UpdateMetrics(
            campaign.Budget,
            campaign.Spent,
            campaign.Conversions,
            campaign.Clicks,
            campaign.Ctr,
            campaign.Roas,
            "active"
        );

        await _context.SaveChangesAsync();
        return Ok(new { success = true, status = "active" });
    }
}
