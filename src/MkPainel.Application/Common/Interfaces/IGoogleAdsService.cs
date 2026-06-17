using System;
using System.Threading.Tasks;

namespace MkPainel.Application.Common.Interfaces;

public interface IGoogleAdsService
{
    Task<bool> PauseCampaignAsync(string externalAccountId, string externalCampaignId, string accessToken);
    Task SyncCampaignsAsync(Guid connectedAccountId, string accessToken);
}
