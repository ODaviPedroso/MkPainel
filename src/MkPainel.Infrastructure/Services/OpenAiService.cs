using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;

namespace MkPainel.Infrastructure.Services;

public class OpenAiService : IOpenAiService
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public OpenAiService(IApplicationDbContext context, IConfiguration configuration, HttpClient httpClient)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<string> ChatAsync(Guid userId, string prompt)
    {
        var apiKey = _configuration["OpenAi:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return await ExecuteOfflineMockAsync(userId, prompt);
        }

        return await ExecuteRealOpenAiAsync(userId, prompt, apiKey);
    }

    private async Task<string> ExecuteOfflineMockAsync(Guid userId, string prompt)
    {
        await Task.Delay(1000);

        string normalizedPrompt = prompt.ToLower();

        var accounts = await _context.ConnectedAccounts
            .Include(ca => ca.Campaigns)
            .Where(ca => ca.UserId == userId)
            .ToListAsync();

        if (!accounts.Any())
        {
            return "Você ainda não possui nenhuma conta conectada. Por favor, conecte uma conta Google Ads ou Meta Ads primeiro.";
        }

        ConnectedAccount? targetAccount = null;
        foreach (var account in accounts)
        {
            if (normalizedPrompt.Contains(account.Name.ToLower()))
            {
                targetAccount = account;
                break;
            }
        }

        if (targetAccount == null)
        {
            targetAccount = accounts.First();
        }

        var activeCampaigns = targetAccount.Campaigns
            .Where(c => c.Status == "active")
            .ToList();

        if (!activeCampaigns.Any())
        {
            return $"Não encontrei nenhuma campanha ativa na conta '{targetAccount.Name}'.";
        }

        Campaign? targetCampaign = null;
        string reasoning = "";
        string projectedImpact = "";

        if (normalizedPrompt.Contains("roas") || normalizedPrompt.Contains("menor roas") || normalizedPrompt.Contains("pior"))
        {
            targetCampaign = activeCampaigns.OrderBy(c => c.Roas).FirstOrDefault();
            if (targetCampaign != null)
            {
                reasoning = $"A campanha '{targetCampaign.Name}' na conta '{targetAccount.Name}' está com o menor ROAS ({targetCampaign.Roas:0.0}x), abaixo da meta estabelecida.";
                projectedImpact = $"Evita desperdício de R$ {targetCampaign.Budget:F2}/dia, melhorando o ROAS médio da conta.";
            }
        }
        else if (normalizedPrompt.Contains("cpa") || normalizedPrompt.Contains("caro"))
        {
            targetCampaign = activeCampaigns.OrderBy(c => c.Conversions == 0 ? c.Spent : c.Spent / c.Conversions).LastOrDefault();
            if (targetCampaign != null)
            {
                decimal cpa = targetCampaign.Conversions > 0 ? targetCampaign.Spent / targetCampaign.Conversions : targetCampaign.Spent;
                reasoning = $"A campanha '{targetCampaign.Name}' apresenta um custo por conversão elevado (CPA de R$ {cpa:F2}).";
                projectedImpact = $"Redução imediata do custo diário em R$ {targetCampaign.Budget:F2}.";
            }
        }

        if (targetCampaign == null && (normalizedPrompt.Contains("pausa") || normalizedPrompt.Contains("pausar") || normalizedPrompt.Contains("sugestão") || normalizedPrompt.Contains("analisar") || normalizedPrompt.Contains("analise")))
        {
            targetCampaign = activeCampaigns.OrderBy(c => c.Roas).FirstOrDefault();
            if (targetCampaign != null)
            {
                reasoning = $"A campanha '{targetCampaign.Name}' foi selecionada para pausa devido ao desempenho inferior em relação ao ROAS médio ({targetCampaign.Roas:0.0}x).";
                projectedImpact = $"Economia projetada de R$ {targetCampaign.Budget:F2} por dia.";
            }
        }

        if (targetCampaign != null)
        {
            var originalState = new { status = targetCampaign.Status, budget = targetCampaign.Budget };
            var suggestedState = new { status = "paused", budget = targetCampaign.Budget };

            var suggestionLog = new AiSuggestionLog(
                Guid.NewGuid(),
                userId,
                targetCampaign.Id,
                "PauseCampaign",
                JsonSerializer.Serialize(originalState),
                JsonSerializer.Serialize(suggestedState),
                reasoning,
                projectedImpact
            );

            _context.AiSuggestionLogs.Add(suggestionLog);
            await _context.SaveChangesAsync();

            return $"[MOCK OFFLINE] Analisei as campanhas da conta **{targetAccount.Name}** e identifiquei que a campanha **{targetCampaign.Name}** está com baixo desempenho (ROAS {targetCampaign.Roas:0.0}x).\n\nCriei uma recomendação para **Pausar** esta campanha. Você pode revisá-la e aprová-la na seção de sugestões do painel.";
        }

        return $"Olá! Eu sou o assistente de IA da MKPainel. Eu posso analisar suas campanhas e sugerir melhorias. Por exemplo, tente dizer: *\"Pausa a campanha de menor ROAS da {targetAccount.Name}\"*.";
    }

    private async Task<string> ExecuteRealOpenAiAsync(Guid userId, string prompt, string apiKey)
    {
        var userCampaigns = await _context.Campaigns
            .Include(c => c.ConnectedAccount)
            .Where(c => c.ConnectedAccount.UserId == userId)
            .ToListAsync();

        var campaignContextList = userCampaigns.Select(c => new
        {
            c.Id,
            c.Name,
            c.Status,
            c.Budget,
            c.Spent,
            c.Clicks,
            c.Conversions,
            c.Ctr,
            c.Roas,
            Platform = c.ConnectedAccount.Platform.ToString(),
            AccountName = c.ConnectedAccount.Name,
            ConnectedAccountId = c.ConnectedAccount.Id,
            ExternalCampaignId = c.ExternalCampaignId
        }).ToList();

        var systemPrompt = $"Você é o assistente de IA do MKPainel. Você analisa métricas de campanhas de tráfego pago (Google Ads e Meta Ads).\n" +
                           $"Aqui estão as campanhas atuais do usuário (em JSON):\n" +
                           $"{JsonSerializer.Serialize(campaignContextList)}\n\n" +
                           $"Se o usuário pedir para analisar, propor pausar ou otimizar campanhas, use a ferramenta 'propose_pause_campaign' para pausar campanhas sob-performando.\n" +
                           $"Importante: Responda em português brasileiro.";

        var tools = new[]
        {
            new
            {
                type = "function",
                function = new
                {
                    name = "propose_pause_campaign",
                    description = "Proposes to pause a traffic campaign because it underperforms, exhibits high CPA, or low ROAS. This creates a recommendation log requiring human confirmation.",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            connectedAccountId = new { type = "string", description = "The internal system unique identifier (Guid string) of the ConnectedAccount owning the campaign." },
                            campaignId = new { type = "string", description = "The internal system unique identifier (Guid string) of the Campaign." },
                            externalCampaignId = new { type = "string", description = "The platform's external unique identifier of the campaign." },
                            reasoning = new { type = "string", description = "A clear description in Portuguese detailing why this campaign should be paused." },
                            projectedImpact = new { type = "string", description = "Estimated optimization outcome or financial savings, formatted in Portuguese (e.g. 'Economia de R$ 1.840/mês')." }
                        },
                        required = new[] { "connectedAccountId", "campaignId", "externalCampaignId", "reasoning", "projectedImpact" }
                    }
                }
            }
        };

        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt },
            new { role = "user", content = prompt }
        };

        var requestBody = new
        {
            model = "gpt-4o-mini",
            messages = messages,
            tools = tools,
            tool_choice = "auto"
        };

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        requestMessage.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(requestMessage);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            return $"Erro ao chamar OpenAI API: {response.StatusCode} - {err}";
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseContent);
        var root = doc.RootElement;
        
        var choice = root.GetProperty("choices")[0];
        var message = choice.GetProperty("message");

        if (message.TryGetProperty("tool_calls", out var toolCalls) && toolCalls.ValueKind == JsonValueKind.Array && toolCalls.GetArrayLength() > 0)
        {
            var toolCall = toolCalls[0];
            var function = toolCall.GetProperty("function");
            var functionName = function.GetProperty("name").GetString();
            var argumentsJson = function.GetProperty("arguments").GetString();

            if (functionName == "propose_pause_campaign" && !string.IsNullOrEmpty(argumentsJson))
            {
                using var argsDoc = JsonDocument.Parse(argumentsJson);
                var argsRoot = argsDoc.RootElement;

                var connAccIdStr = argsRoot.GetProperty("connectedAccountId").GetString();
                var campIdStr = argsRoot.GetProperty("campaignId").GetString();
                var extCampId = argsRoot.GetProperty("externalCampaignId").GetString();
                var reasoning = argsRoot.GetProperty("reasoning").GetString() ?? "";
                var projectedImpact = argsRoot.GetProperty("projectedImpact").GetString() ?? "";

                if (Guid.TryParse(campIdStr, out var campaignId) && Guid.TryParse(connAccIdStr, out var connectedAccountId))
                {
                    var campaign = await _context.Campaigns
                        .Include(c => c.ConnectedAccount)
                        .FirstOrDefaultAsync(c => c.Id == campaignId && c.ConnectedAccount.UserId == userId);

                    if (campaign != null)
                    {
                        var originalState = new { status = campaign.Status, budget = campaign.Budget };
                        var suggestedState = new { status = "paused", budget = campaign.Budget };

                        var suggestionLog = new AiSuggestionLog(
                            Guid.NewGuid(),
                            userId,
                            campaign.Id,
                            "PauseCampaign",
                            JsonSerializer.Serialize(originalState),
                            JsonSerializer.Serialize(suggestedState),
                            reasoning,
                            projectedImpact
                        );

                        _context.AiSuggestionLogs.Add(suggestionLog);
                        await _context.SaveChangesAsync();

                        var toolCallId = toolCall.GetProperty("id").GetString();
                        
                        var toolResponse = new { success = true, suggestionId = suggestionLog.Id.ToString() };

                        var secondMessages = new List<object>
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = prompt },
                            new {
                                role = "assistant",
                                tool_calls = new[] {
                                    new {
                                        id = toolCallId,
                                        type = "function",
                                        function = new { name = "propose_pause_campaign", arguments = argumentsJson }
                                    }
                                }
                            },
                            new { role = "tool", tool_call_id = toolCallId, name = "propose_pause_campaign", content = JsonSerializer.Serialize(toolResponse) }
                        };

                        var secondRequestBody = new
                        {
                            model = "gpt-4o-mini",
                            messages = secondMessages
                        };

                        var secondRequestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
                        secondRequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                        secondRequestMessage.Content = new StringContent(JsonSerializer.Serialize(secondRequestBody), Encoding.UTF8, "application/json");

                        var secondResponse = await _httpClient.SendAsync(secondRequestMessage);
                        if (secondResponse.IsSuccessStatusCode)
                        {
                            var secondResponseContent = await secondResponse.Content.ReadAsStringAsync();
                            using var secondDoc = JsonDocument.Parse(secondResponseContent);
                            return secondDoc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
                        }
                    }
                }
            }
        }

        return message.GetProperty("content").GetString() ?? "Não consegui processar seu pedido.";
    }
}
