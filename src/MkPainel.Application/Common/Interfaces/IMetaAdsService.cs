using System;
using System.Threading.Tasks;

namespace MkPainel.Application.Common.Interfaces;

public interface IMetaAdsService
{
    Task<bool> PauseCampaignAsync(string externalAccountId, string externalCampaignId, string accessToken);
    Task SyncCampaignsAsync(Guid connectedAccountId, string accessToken);
}
