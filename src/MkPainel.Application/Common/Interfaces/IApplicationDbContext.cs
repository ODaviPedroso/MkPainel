using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MkPainel.Domain.Entities;

namespace MkPainel.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<ConnectedAccount> ConnectedAccounts { get; }
    DbSet<Campaign> Campaigns { get; }
    DbSet<AiSuggestionLog> AiSuggestionLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
