using Microsoft.EntityFrameworkCore;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;

namespace MkPainel.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ConnectedAccount> ConnectedAccounts => Set<ConnectedAccount>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<AiSuggestionLog> AiSuggestionLogs => Set<AiSuggestionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
