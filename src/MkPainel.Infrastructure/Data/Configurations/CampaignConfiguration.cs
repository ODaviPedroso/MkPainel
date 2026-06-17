using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MkPainel.Domain.Entities;

namespace MkPainel.Infrastructure.Data.Configurations;

public class CampaignConfiguration : IEntityTypeConfiguration<Campaign>
{
    public void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.ToTable("Campaigns");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.ExternalCampaignId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("active");

        builder.Property(c => c.Budget)
            .HasPrecision(18, 2);

        builder.Property(c => c.Spent)
            .HasPrecision(18, 2);

        builder.Property(c => c.Ctr)
            .HasPrecision(18, 6);

        builder.Property(c => c.Roas)
            .HasPrecision(18, 2);

        builder.Property(c => c.LastSyncedAt)
            .IsRequired();

        builder.HasMany(c => c.SuggestionLogs)
            .WithOne(sl => sl.Campaign)
            .HasForeignKey(sl => sl.CampaignId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
