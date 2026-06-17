using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MkPainel.Domain.Entities;

namespace MkPainel.Infrastructure.Data.Configurations;

public class AiSuggestionLogConfiguration : IEntityTypeConfiguration<AiSuggestionLog>
{
    public void Configure(EntityTypeBuilder<AiSuggestionLog> builder)
    {
        builder.ToTable("AiSuggestionLogs");

        builder.HasKey(sl => sl.Id);

        builder.Property(sl => sl.ActionType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sl => sl.OriginalStateJson)
            .IsRequired()
            .HasDefaultValue("{}");

        builder.Property(sl => sl.SuggestedStateJson)
            .IsRequired()
            .HasDefaultValue("{}");

        builder.Property(sl => sl.Reasoning)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(sl => sl.ProjectedImpact)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(sl => sl.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(sl => sl.CreatedAt)
            .IsRequired();

        builder.Property(sl => sl.ReviewedAt);

        builder.Property(sl => sl.ErrorMessage)
            .HasMaxLength(1000);

        builder.HasOne(sl => sl.User)
            .WithMany()
            .HasForeignKey(sl => sl.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
