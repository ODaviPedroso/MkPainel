using System;
using System.Linq;
using System.Threading.Tasks;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;

namespace MkPainel.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (context.Users.Any())
        {
            return;
        }

        var defaultUserId = Guid.Parse("d7fb473a-4efd-4e92-bc91-2a945b0a33c1");
        var defaultUser = new User(
            defaultUserId,
            "demo@mkpainel.com.br",
            "AQAAAAIAAYagAAAAEI+7yKz/s1mJ2/qF6Qx34P/xW2x2kY8q3w6F5Xj/Z24A3xH6j3a+k3h+1n+283f+", // mock hash
            "Davi Alves"
        );
        context.Users.Add(defaultUser);

        var accountBellaModa = new ConnectedAccount(
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            defaultUserId,
            PlatformType.MetaAds,
            "Loja Bella Moda",
            "act_123456789"
        );
        accountBellaModa.UpdateTokens("mock_access_token_1", "mock_refresh_token_1", DateTime.UtcNow.AddDays(30));
        accountBellaModa.UpdateMetrics(150.00m, 80.00m, "warning");
        context.ConnectedAccounts.Add(accountBellaModa);

        var accountVitalis = new ConnectedAccount(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            defaultUserId,
            PlatformType.GoogleAds,
            "Clínica Vitalis",
            "123-456-7890"
        );
        accountVitalis.UpdateTokens("mock_access_token_2", "mock_refresh_token_2", DateTime.UtcNow.AddDays(30));
        accountVitalis.UpdateMetrics(4500.00m, 350.00m, "active");
        context.ConnectedAccounts.Add(accountVitalis);

        var accountAutoCenter = new ConnectedAccount(
            Guid.Parse("33333333-3333-3333-3333-333333333333"),
            defaultUserId,
            PlatformType.GoogleAds,
            "Auto Center Premium",
            "987-654-3210"
        );
        accountAutoCenter.UpdateTokens("mock_access_token_3", "mock_refresh_token_3", DateTime.UtcNow.AddDays(30));
        accountAutoCenter.UpdateMetrics(320.00m, 200.00m, "warning");
        context.ConnectedAccounts.Add(accountAutoCenter);

        var accountSaborReal = new ConnectedAccount(
            Guid.Parse("44444444-4444-4444-4444-444444444444"),
            defaultUserId,
            PlatformType.MetaAds,
            "Restaurante Sabor Real",
            "act_987654321"
        );
        accountSaborReal.UpdateTokens("mock_access_token_4", "mock_refresh_token_4", DateTime.UtcNow.AddDays(30));
        accountSaborReal.UpdateMetrics(1200.00m, 150.00m, "active");
        context.ConnectedAccounts.Add(accountSaborReal);

        var accountTechStart = new ConnectedAccount(
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            defaultUserId,
            PlatformType.GoogleAds,
            "TechStart Brasil",
            "555-666-7777"
        );
        accountTechStart.UpdateTokens("mock_access_token_5", "mock_refresh_token_5", DateTime.UtcNow.AddDays(30));
        accountTechStart.UpdateMetrics(8000.00m, 600.00m, "active");
        context.ConnectedAccounts.Add(accountTechStart);

        var accountSolar = new ConnectedAccount(
            Guid.Parse("66666666-6666-6666-6666-666666666666"),
            defaultUserId,
            PlatformType.GoogleAds,
            "Imobiliária Solar",
            "111-222-3333"
        );
        accountSolar.UpdateTokens("mock_access_token_6", "mock_refresh_token_6", DateTime.UtcNow.AddDays(30));
        accountSolar.UpdateMetrics(250.00m, 200.00m, "warning");
        context.ConnectedAccounts.Add(accountSolar);

        var c1 = new Campaign(Guid.NewGuid(), accountBellaModa.Id, "camp_bm_01", "Bella Moda Conversões");
        c1.UpdateMetrics(50.00m, 450.00m, 32, 850, 0.037m, 4.2m, "active");
        var c2 = new Campaign(Guid.NewGuid(), accountBellaModa.Id, "camp_bm_02", "Bella Moda Lookalike");
        c2.UpdateMetrics(30.00m, 250.00m, 15, 620, 0.024m, 3.8m, "active");
        context.Campaigns.AddRange(c1, c2);

        var c3 = new Campaign(Guid.NewGuid(), accountVitalis.Id, "camp_cv_01", "Vitalis Search - Agendamentos");
        c3.UpdateMetrics(200.00m, 1800.00m, 95, 2300, 0.041m, 3.5m, "active");
        var c4 = new Campaign(Guid.NewGuid(), accountVitalis.Id, "camp_cv_02", "Vitalis Display - Branding");
        c4.UpdateMetrics(150.00m, 800.00m, 12, 4500, 0.012m, 1.8m, "active");
        context.Campaigns.AddRange(c3, c4);

        var c5 = new Campaign(Guid.NewGuid(), accountAutoCenter.Id, "camp_ac_01", "Auto Center - Alinhamento");
        c5.UpdateMetrics(120.00m, 620.00m, 24, 750, 0.032m, 2.9m, "active");
        var c6 = new Campaign(Guid.NewGuid(), accountAutoCenter.Id, "camp_ac_02", "Auto Center - Pneus");
        c6.UpdateMetrics(80.00m, 400.00m, 14, 520, 0.027m, 2.1m, "active");
        context.Campaigns.AddRange(c5, c6);

        var c7 = new Campaign(Guid.NewGuid(), accountSaborReal.Id, "camp_sr_01", "Sabor Real - Delivery Fim de Semana");
        c7.UpdateMetrics(100.00m, 920.00m, 80, 1950, 0.041m, 4.6m, "active");
        var c8 = new Campaign(Guid.NewGuid(), accountSaborReal.Id, "camp_sr_02", "Sabor Real - Almoço Executivo");
        c8.UpdateMetrics(50.00m, 350.00m, 22, 920, 0.024m, 3.2m, "active");
        context.Campaigns.AddRange(c7, c8);

        var c9 = new Campaign(Guid.NewGuid(), accountTechStart.Id, "camp_ts_01", "TechStart - SaaS Lead Gen");
        c9.UpdateMetrics(400.00m, 4200.00m, 110, 3100, 0.035m, 3.7m, "active");
        var c10 = new Campaign(Guid.NewGuid(), accountTechStart.Id, "camp_ts_02", "TechStart - Remarketing");
        c10.UpdateMetrics(200.00m, 1500.00m, 55, 1200, 0.045m, 4.8m, "active");
        context.Campaigns.AddRange(c9, c10);

        var c11 = new Campaign(Guid.NewGuid(), accountSolar.Id, "camp_sol_01", "Solar - Leads Apartamento Centro");
        c11.UpdateMetrics(150.00m, 980.00m, 9, 420, 0.021m, 1.1m, "active");
        var c12 = new Campaign(Guid.NewGuid(), accountSolar.Id, "camp_sol_02", "Solar - Leads Condomínio Fechado");
        c12.UpdateMetrics(50.00m, 320.00m, 18, 550, 0.032m, 3.6m, "active");
        context.Campaigns.AddRange(c11, c12);

        await context.SaveChangesAsync();
    }
}
