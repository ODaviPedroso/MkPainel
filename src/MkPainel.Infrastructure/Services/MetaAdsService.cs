using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;

namespace MkPainel.Infrastructure.Services;

public class MetaAdsService : IMetaAdsService
{
    private readonly IApplicationDbContext _context;
    private readonly IHttpClientFactory? _httpClientFactory;
    private readonly IConfiguration? _configuration;

    public MetaAdsService(
        IApplicationDbContext context,
        IConfiguration? configuration = null,
        IHttpClientFactory? httpClientFactory = null)
    {
        _context = context;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    private bool ShouldUseMock(string accessToken)
    {
        return _httpClientFactory == null 
               || string.IsNullOrWhiteSpace(accessToken) 
               || accessToken.StartsWith("mock_", StringComparison.OrdinalIgnoreCase);
    }

    private string NormalizeAdAccountId(string externalAccountId)
    {
        if (string.IsNullOrWhiteSpace(externalAccountId)) return string.Empty;
        
        return externalAccountId.StartsWith("act_", StringComparison.OrdinalIgnoreCase) 
            ? externalAccountId 
            : "act_" + externalAccountId;
    }

    public async Task<bool> PauseCampaignAsync(string externalAccountId, string externalCampaignId, string accessToken)
    {
        if (ShouldUseMock(accessToken))
        {
            return await PauseCampaignMockAsync(externalAccountId, externalCampaignId);
        }

        var apiVersion = _configuration?["MetaAds:ApiVersion"] ?? "v20.0";
        var client = _httpClientFactory!.CreateClient();

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("status", "PAUSED"),
            new KeyValuePair<string, string>("access_token", accessToken)
        });

        var response = await client.PostAsync($"https://graph.facebook.com/{apiVersion}/{externalCampaignId}", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            string errorMsg = errorContent;
            try
            {
                using var doc = JsonDocument.Parse(errorContent);
                if (doc.RootElement.TryGetProperty("error", out var errorEl) && errorEl.TryGetProperty("message", out var msgEl))
                {
                    errorMsg = msgEl.GetString() ?? errorContent;
                }
            }
            catch { }
            throw new HttpRequestException($"Erro ao pausar campanha no Meta Ads (Status {response.StatusCode}): {errorMsg}");
        }

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
        if (ShouldUseMock(accessToken))
        {
            await SyncCampaignsMockAsync(connectedAccountId);
            return;
        }

        var account = await _context.ConnectedAccounts
            .Include(ca => ca.Campaigns)
            .FirstOrDefaultAsync(ca => ca.Id == connectedAccountId);

        if (account == null) return;

        var apiVersion = _configuration?["MetaAds:ApiVersion"] ?? "v20.0";
        var client = _httpClientFactory!.CreateClient();
        var adAccountId = NormalizeAdAccountId(account.ExternalAccountId);

        // 1. Fetch campaigns
        var campaignsUrl = $"https://graph.facebook.com/{apiVersion}/{adAccountId}/campaigns?fields=id,name,status,daily_budget,lifetime_budget&limit=100&access_token={accessToken}";
        var campaignsRes = await client.GetAsync(campaignsUrl);
        await HandleApiErrorAsync(campaignsRes);

        var campaignsResponse = await campaignsRes.Content.ReadFromJsonAsync<MetaCampaignResponse>();
        if (campaignsResponse == null || campaignsResponse.Data == null) return;

        // 2. Fetch insights grouped by campaign
        var insightsUrl = $"https://graph.facebook.com/{apiVersion}/{adAccountId}/insights?level=campaign&fields=campaign_id,spend,clicks,actions,ctr,purchase_roas&date_preset=lifetime&limit=100&access_token={accessToken}";
        var insightsRes = await client.GetAsync(insightsUrl);
        await HandleApiErrorAsync(insightsRes);

        var insightsResponse = await insightsRes.Content.ReadFromJsonAsync<MetaInsightsResponse>();
        var insightsDict = insightsResponse?.Data?.ToDictionary(i => i.CampaignId) ?? new Dictionary<string, MetaInsightsData>();

        // 3. Process and save campaign data
        foreach (var apiCampaign in campaignsResponse.Data)
        {
            var campaign = account.Campaigns.FirstOrDefault(c => c.ExternalCampaignId == apiCampaign.Id);

            decimal budget = 0;
            if (decimal.TryParse(apiCampaign.DailyBudget, CultureInfo.InvariantCulture, out var dailyBudgetVal))
            {
                budget = dailyBudgetVal / 100.0m;
            }
            else if (decimal.TryParse(apiCampaign.LifetimeBudget, CultureInfo.InvariantCulture, out var lifetimeBudgetVal))
            {
                budget = lifetimeBudgetVal / 100.0m;
            }

            string status = apiCampaign.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase) ? "active" : "paused";

            decimal spent = 0;
            int clicks = 0;
            decimal ctr = 0;
            decimal roas = 0;
            int conversions = 0;

            if (insightsDict.TryGetValue(apiCampaign.Id, out var insights))
            {
                decimal.TryParse(insights.Spend, CultureInfo.InvariantCulture, out spent);
                int.TryParse(insights.Clicks, out clicks);

                if (decimal.TryParse(insights.Ctr, CultureInfo.InvariantCulture, out var ctrPercent))
                {
                    ctr = ctrPercent / 100.0m;
                }

                if (insights.Actions != null)
                {
                    decimal totalConversions = 0;
                    foreach (var action in insights.Actions)
                    {
                        if (action.ActionType.Contains("purchase", StringComparison.OrdinalIgnoreCase) ||
                            action.ActionType.Contains("lead", StringComparison.OrdinalIgnoreCase) ||
                            action.ActionType.Contains("conversion", StringComparison.OrdinalIgnoreCase) ||
                            action.ActionType.Contains("messaging_first_reply", StringComparison.OrdinalIgnoreCase))
                        {
                            if (decimal.TryParse(action.Value, CultureInfo.InvariantCulture, out var actionVal))
                            {
                                totalConversions += actionVal;
                            }
                        }
                    }
                    conversions = (int)Math.Round(totalConversions);
                }

                if (insights.PurchaseRoas != null && insights.PurchaseRoas.Any())
                {
                    decimal.TryParse(insights.PurchaseRoas.First().Value, CultureInfo.InvariantCulture, out roas);
                }
                else if (spent > 0)
                {
                    roas = (conversions * 150.0m) / spent;
                }
            }

            if (campaign == null)
            {
                campaign = new Campaign(Guid.NewGuid(), account.Id, apiCampaign.Id, apiCampaign.Name);
                campaign.UpdateMetrics(budget, spent, conversions, clicks, ctr, roas, status);
                _context.Campaigns.Add(campaign);
            }
            else
            {
                campaign.UpdateMetrics(budget, spent, conversions, clicks, ctr, roas, status);
            }
        }

        // Recalculate daily burn rate (12% of active budgets)
        decimal totalDailyBurn = account.Campaigns
            .Where(c => c.Status == "active")
            .Sum(c => c.Budget * 0.12m);

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
        else
        {
            newStatus = "active";
        }

        account.UpdateMetrics(newBalance, totalDailyBurn, newStatus);

        await _context.SaveChangesAsync();
    }

    private async Task HandleApiErrorAsync(HttpResponseMessage response)
    {
        if (response.IsSuccessStatusCode) return;

        var errorContent = await response.Content.ReadAsStringAsync();
        string errorMsg = errorContent;
        try
        {
            using var doc = JsonDocument.Parse(errorContent);
            if (doc.RootElement.TryGetProperty("error", out var errorEl) && errorEl.TryGetProperty("message", out var msgEl))
            {
                errorMsg = msgEl.GetString() ?? errorContent;
            }
        }
        catch { }
        throw new HttpRequestException($"Erro na API do Meta (Status {response.StatusCode}): {errorMsg}");
    }

    #region Mock Fallbacks
    private async Task<bool> PauseCampaignMockAsync(string externalAccountId, string externalCampaignId)
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

    private async Task SyncCampaignsMockAsync(Guid connectedAccountId)
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
            .Sum(c => c.Budget * 0.12m);

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
        else
        {
            newStatus = "active";
        }

        account.UpdateMetrics(newBalance, totalDailyBurn, newStatus);

        await _context.SaveChangesAsync();
    }
    #endregion

    #region DTOs for Json Deserialization
    private class MetaCampaignResponse
    {
        [JsonPropertyName("data")]
        public List<MetaCampaignData> Data { get; set; } = new();
    }

    private class MetaCampaignData
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("daily_budget")]
        public string? DailyBudget { get; set; }

        [JsonPropertyName("lifetime_budget")]
        public string? LifetimeBudget { get; set; }
    }

    private class MetaInsightsResponse
    {
        [JsonPropertyName("data")]
        public List<MetaInsightsData> Data { get; set; } = new();
    }

    private class MetaInsightsData
    {
        [JsonPropertyName("campaign_id")]
        public string CampaignId { get; set; } = string.Empty;

        [JsonPropertyName("spend")]
        public string? Spend { get; set; }

        [JsonPropertyName("clicks")]
        public string? Clicks { get; set; }

        [JsonPropertyName("ctr")]
        public string? Ctr { get; set; }

        [JsonPropertyName("actions")]
        public List<MetaAction>? Actions { get; set; }

        [JsonPropertyName("purchase_roas")]
        public List<MetaAction>? PurchaseRoas { get; set; }
    }

    private class MetaAction
    {
        [JsonPropertyName("action_type")]
        public string ActionType { get; set; } = string.Empty;

        [JsonPropertyName("value")]
        public string Value { get; set; } = string.Empty;
    }
    #endregion
}

