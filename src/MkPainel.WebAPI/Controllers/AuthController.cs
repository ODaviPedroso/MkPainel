using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;

namespace MkPainel.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMetaAdsService _metaAdsService;

    public AuthController(
        IApplicationDbContext context,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        IMetaAdsService metaAdsService)
    {
        _context = context;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _metaAdsService = metaAdsService;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest(new { message = "E-mail ou senha inválidos." });
        }

        return Ok(new
        {
            token = "mock_jwt_token_for_" + user.Id,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (exists)
        {
            return BadRequest(new { message = "E-mail já cadastrado." });
        }

        var user = new User(Guid.NewGuid(), request.Email, "hashed_" + request.Password, request.Name);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = "mock_jwt_token_for_" + user.Id,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            }
        });
    }

    [HttpPost("connect-mock")]
    public async Task<IActionResult> ConnectMock([FromQuery] Guid userId, [FromQuery] string platform, [FromQuery] string name)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        bool isGoogle = platform.ToLower() == "google" || platform.ToLower() == "googleads";
        var platformEnum = isGoogle ? PlatformType.GoogleAds : PlatformType.MetaAds;
        var extId = isGoogle ? "123-456-" + new Random().Next(1000, 9999) : "act_" + new Random().Next(100000, 999999);

        var account = new ConnectedAccount(
            Guid.NewGuid(),
            userId,
            platformEnum,
            name,
            extId
        );
        account.UpdateTokens("mock_access_" + Guid.NewGuid(), "mock_refresh_" + Guid.NewGuid(), DateTime.UtcNow.AddDays(30));
        account.UpdateMetrics(10000.00m, 250.00m, "active");

        _context.ConnectedAccounts.Add(account);

        var camp1 = new Campaign(Guid.NewGuid(), account.Id, "camp_mock_" + Guid.NewGuid().ToString()[..8], $"{name} - Campanha Conversão");
        camp1.UpdateMetrics(100.00m, 500.00m, 25, 600, 0.041m, 3.8m, "active");

        var camp2 = new Campaign(Guid.NewGuid(), account.Id, "camp_mock_" + Guid.NewGuid().ToString()[..8], $"{name} - Remarketing");
        camp2.UpdateMetrics(50.00m, 200.00m, 12, 350, 0.034m, 4.2m, "active");

        _context.Campaigns.AddRange(camp1, camp2);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, accountId = account.Id });
    }

    [HttpGet("facebook-login-url")]
    public IActionResult GetFacebookLoginUrl()
    {
        var appId = _configuration["MetaAds:AppId"] ?? string.Empty;
        var redirectUri = _configuration["MetaAds:RedirectUri"] ?? "http://localhost:5173/";
        var apiVersion = _configuration["MetaAds:ApiVersion"] ?? "v20.0";

        var url = $"https://www.facebook.com/{apiVersion}/dialog/oauth" +
                  $"?client_id={Uri.EscapeDataString(appId)}" +
                  $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                  $"&scope=ads_read,ads_management" +
                  $"&response_type=code";

        return Ok(new { url });
    }

    public class FacebookCallbackRequest
    {
        public string Code { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    [HttpPost("facebook-callback")]
    public async Task<IActionResult> FacebookCallback([FromBody] FacebookCallbackRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { message = "Código de autorização inválido." });
        }

        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        var appId = _configuration["MetaAds:AppId"] ?? string.Empty;
        var appSecret = _configuration["MetaAds:AppSecret"] ?? string.Empty;
        var redirectUri = _configuration["MetaAds:RedirectUri"] ?? "http://localhost:5173/";
        var apiVersion = _configuration["MetaAds:ApiVersion"] ?? "v20.0";

        var client = _httpClientFactory.CreateClient();

        // 1. Exchange authorization code for User Access Token
        var tokenUrl = $"https://graph.facebook.com/{apiVersion}/oauth/access_token" +
                       $"?client_id={Uri.EscapeDataString(appId)}" +
                       $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                       $"&client_secret={Uri.EscapeDataString(appSecret)}" +
                       $"&code={Uri.EscapeDataString(request.Code)}";

        var tokenRes = await client.GetAsync(tokenUrl);
        if (!tokenRes.IsSuccessStatusCode)
        {
            var err = await tokenRes.Content.ReadAsStringAsync();
            return BadRequest(new { message = $"Erro ao trocar código pelo token: {err}" });
        }

        var tokenData = await tokenRes.Content.ReadFromJsonAsync<FacebookTokenResponse>();
        if (tokenData == null || string.IsNullOrWhiteSpace(tokenData.AccessToken))
        {
            return BadRequest(new { message = "Resposta do token inválida." });
        }

        // 2. Exchange short-lived token for long-lived access token
        var longLivedTokenUrl = $"https://graph.facebook.com/{apiVersion}/oauth/access_token" +
                                $"?grant_type=fb_exchange_token" +
                                $"&client_id={Uri.EscapeDataString(appId)}" +
                                $"&client_secret={Uri.EscapeDataString(appSecret)}" +
                                $"&fb_exchange_token={Uri.EscapeDataString(tokenData.AccessToken)}";

        var longLivedRes = await client.GetAsync(longLivedTokenUrl);
        if (!longLivedRes.IsSuccessStatusCode)
        {
            var err = await longLivedRes.Content.ReadAsStringAsync();
            return BadRequest(new { message = $"Erro ao obter token de longa duração: {err}" });
        }

        var longLivedData = await longLivedRes.Content.ReadFromJsonAsync<FacebookTokenResponse>();
        if (longLivedData == null || string.IsNullOrWhiteSpace(longLivedData.AccessToken))
        {
            return BadRequest(new { message = "Resposta do token de longa duração inválida." });
        }

        var longLivedToken = longLivedData.AccessToken;
        var expiration = DateTime.UtcNow.AddSeconds(longLivedData.ExpiresIn > 0 ? longLivedData.ExpiresIn : 5184000); // Default to 60 days if 0

        // 3. Get connected Facebook Ad Accounts
        var accountsUrl = $"https://graph.facebook.com/{apiVersion}/me/adaccounts" +
                          $"?fields=id,name" +
                          $"&access_token={Uri.EscapeDataString(longLivedToken)}";

        var accountsRes = await client.GetAsync(accountsUrl);
        if (!accountsRes.IsSuccessStatusCode)
        {
            var err = await accountsRes.Content.ReadAsStringAsync();
            return BadRequest(new { message = $"Erro ao obter contas de anúncios: {err}" });
        }

        var accountsData = await accountsRes.Content.ReadFromJsonAsync<FacebookAdAccountsResponse>();
        if (accountsData == null || accountsData.Data == null || !accountsData.Data.Any())
        {
            return BadRequest(new { message = "Nenhuma conta de anúncios encontrada vinculada a este perfil." });
        }

        // We will register all ad accounts we find
        var registeredAccountIds = new List<Guid>();

        foreach (var adAccount in accountsData.Data)
        {
            // Check if this connected account already exists for the user
            var existingAccount = await _context.ConnectedAccounts
                .FirstOrDefaultAsync(ca => ca.UserId == user.Id 
                                          && ca.Platform == PlatformType.MetaAds 
                                          && ca.ExternalAccountId == adAccount.Id);

            if (existingAccount == null)
            {
                existingAccount = new ConnectedAccount(
                    Guid.NewGuid(),
                    user.Id,
                    PlatformType.MetaAds,
                    adAccount.Name,
                    adAccount.Id
                );
                
                // Initialize metrics (Demo values for onboarding view)
                existingAccount.UpdateMetrics(5000.00m, 120.00m, "active");
                _context.ConnectedAccounts.Add(existingAccount);
            }

            existingAccount.UpdateTokens(longLivedToken, string.Empty, expiration);
            await _context.SaveChangesAsync();

            // 4. Force sync campaigns from this account now that it's connected
            try
            {
                await _metaAdsService.SyncCampaignsAsync(existingAccount.Id, longLivedToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao sincronizar campanhas durante onboarding da conta {adAccount.Name}: {ex.Message}");
            }

            registeredAccountIds.Add(existingAccount.Id);
        }

        return Ok(new { success = true, accountIds = registeredAccountIds });
    }

    private class FacebookTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }

    private class FacebookAdAccountsResponse
    {
        [JsonPropertyName("data")]
        public List<FacebookAdAccountData> Data { get; set; } = new();
    }

    private class FacebookAdAccountData
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }
}
