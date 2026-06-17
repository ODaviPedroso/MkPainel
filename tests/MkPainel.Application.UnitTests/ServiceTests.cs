using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;
using MkPainel.Infrastructure.Data;
using MkPainel.Infrastructure.Services;
using Xunit;

namespace MkPainel.Application.UnitTests;

public class ServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<ApplicationDbContext> _dbContextOptions;

    public ServiceTests()
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _dbContextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new ApplicationDbContext(_dbContextOptions);
        context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _connection.Dispose();
    }

    private async Task SeedDataAsync(ApplicationDbContext context, Guid userId, Guid accountId, Guid campaignId, PlatformType platform = PlatformType.GoogleAds)
    {
        var user = new User(userId, "user@test.com", "hash", "Test User");
        context.Users.Add(user);

        var account = new ConnectedAccount(accountId, userId, platform, "Test Account", "ext_acc_001");
        account.UpdateMetrics(1000m, 100m, "active");
        context.ConnectedAccounts.Add(account);

        var campaign = new Campaign(campaignId, accountId, "ext_camp_001", "Test Campaign");
        campaign.UpdateMetrics(100m, 400m, 10, 200, 0.05m, 2.0m, "active");
        context.Campaigns.Add(campaign);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GoogleAdsService_ShouldPauseCampaignInDatabase()
    {
        using var context = new ApplicationDbContext(_dbContextOptions);
        var userId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var campaignId = Guid.NewGuid();
        await SeedDataAsync(context, userId, accountId, campaignId);

        var service = new GoogleAdsService(context);

        var result = await service.PauseCampaignAsync("ext_acc_001", "ext_camp_001", "access_token");

        Assert.True(result);

        using var verifyContext = new ApplicationDbContext(_dbContextOptions);
        var campaign = await verifyContext.Campaigns.FindAsync(campaignId);
        Assert.NotNull(campaign);
        Assert.Equal("paused", campaign.Status);
    }

    [Fact]
    public async Task MetaAdsService_ShouldPauseCampaignInDatabase()
    {
        using var context = new ApplicationDbContext(_dbContextOptions);
        var userId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var campaignId = Guid.NewGuid();
        await SeedDataAsync(context, userId, accountId, campaignId, PlatformType.MetaAds);

        var service = new MetaAdsService(context);

        var result = await service.PauseCampaignAsync("ext_acc_001", "ext_camp_001", "access_token");

        Assert.True(result);

        using var verifyContext = new ApplicationDbContext(_dbContextOptions);
        var campaign = await verifyContext.Campaigns.FindAsync(campaignId);
        Assert.NotNull(campaign);
        Assert.Equal("paused", campaign.Status);
    }
}
