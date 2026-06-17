using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MkPainel.Domain.Entities;

namespace MkPainel.Infrastructure.Data.Configurations;

public class ConnectedAccountConfiguration : IEntityTypeConfiguration<ConnectedAccount>
{
    public void Configure(EntityTypeBuilder<ConnectedAccount> builder)
    {
        builder.ToTable("ConnectedAccounts");

        builder.HasKey(ca => ca.Id);

        builder.Property(ca => ca.Platform)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(ca => ca.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(ca => ca.ExternalAccountId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ca => ca.AccessToken)
            .IsRequired();

        builder.Property(ca => ca.RefreshToken)
            .IsRequired();

        builder.Property(ca => ca.TokenExpiration)
            .IsRequired();

        builder.Property(ca => ca.Balance)
            .HasPrecision(18, 2);

        builder.Property(ca => ca.DailyBurn)
            .HasPrecision(18, 2);

        builder.Property(ca => ca.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("active");

        builder.HasMany(ca => ca.Campaigns)
            .WithOne(c => c.ConnectedAccount)
            .HasForeignKey(c => c.ConnectedAccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
