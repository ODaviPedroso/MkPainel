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
public class SuggestionsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IOpenAiService _openAiService;
    private readonly IGoogleAdsService _googleAdsService;
    private readonly IMetaAdsService _metaAdsService;

    public SuggestionsController(
        IApplicationDbContext context,
        IOpenAiService openAiService,
        IGoogleAdsService googleAdsService,
        IMetaAdsService metaAdsService)
    {
        _context = context;
        _openAiService = openAiService;
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

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    [HttpGet]
    public async Task<IActionResult> GetSuggestions([FromQuery] string? status)
    {
        var userId = GetCurrentUserId();

        var query = _context.AiSuggestionLogs
            .Include(sl => sl.Campaign)
            .ThenInclude(c => c.ConnectedAccount)
            .Where(sl => sl.UserId == userId);

        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<SuggestionStatus>(status, true, out var statusEnum))
            {
                query = query.Where(sl => sl.Status == statusEnum);
            }
        }

        var results = await query.OrderByDescending(sl => sl.CreatedAt).ToListAsync();

        var response = results.Select(sl => new
        {
            sl.Id,
            sl.CampaignId,
            CampaignName = sl.Campaign.Name,
            Platform = sl.Campaign.ConnectedAccount.Platform.ToString(),
            AccountName = sl.Campaign.ConnectedAccount.Name,
            sl.ActionType,
            sl.OriginalStateJson,
            sl.SuggestedStateJson,
            sl.Reasoning,
            sl.ProjectedImpact,
            Status = sl.Status.ToString(),
            sl.CreatedAt,
            sl.ReviewedAt,
            sl.ErrorMessage
        });

        return Ok(response);
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveSuggestion(Guid id)
    {
        var userId = GetCurrentUserId();

        var suggestion = await _context.AiSuggestionLogs
            .Include(sl => sl.Campaign)
            .ThenInclude(c => c.ConnectedAccount)
            .FirstOrDefaultAsync(sl => sl.Id == id && sl.UserId == userId);

        if (suggestion == null)
        {
            return NotFound(new { message = "Sugestão não encontrada." });
        }

        if (suggestion.Status != SuggestionStatus.PendingApproval)
        {
            return BadRequest(new { message = $"Esta sugestão já foi revisada. Status atual: {suggestion.Status}" });
        }

        suggestion.Approve();
        await _context.SaveChangesAsync();

        bool success = false;
        var campaign = suggestion.Campaign;
        var account = campaign.ConnectedAccount;

        try
        {
            if (account.Platform == PlatformType.GoogleAds)
            {
                success = await _googleAdsService.PauseCampaignAsync(
                    account.ExternalAccountId,
                    campaign.ExternalCampaignId,
                    account.AccessToken
                );
            }
            else if (account.Platform == PlatformType.MetaAds)
            {
                success = await _metaAdsService.PauseCampaignAsync(
                    account.ExternalAccountId,
                    campaign.ExternalCampaignId,
                    account.AccessToken
                );
            }

            if (success)
            {
                suggestion.MarkExecuted();
            }
            else
            {
                suggestion.MarkFailed("Falha na chamada da API da plataforma externa.");
            }
        }
        catch (Exception ex)
        {
            suggestion.MarkFailed($"Exceção ao executar ação: {ex.Message}");
        }

        await _context.SaveChangesAsync();

        return Ok(new { success, status = suggestion.Status.ToString(), errorMessage = suggestion.ErrorMessage });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectSuggestion(Guid id)
    {
        var userId = GetCurrentUserId();

        var suggestion = await _context.AiSuggestionLogs
            .FirstOrDefaultAsync(sl => sl.Id == id && sl.UserId == userId);

        if (suggestion == null)
        {
            return NotFound(new { message = "Sugestão não encontrada." });
        }

        if (suggestion.Status != SuggestionStatus.PendingApproval)
        {
            return BadRequest(new { message = $"Esta sugestão já foi revisada. Status atual: {suggestion.Status}" });
        }

        suggestion.Reject();
        await _context.SaveChangesAsync();

        return Ok(new { success = true, status = suggestion.Status.ToString() });
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "A mensagem não pode ser vazia." });
        }

        var reply = await _openAiService.ChatAsync(userId, request.Message);
        return Ok(new { response = reply });
    }
}
