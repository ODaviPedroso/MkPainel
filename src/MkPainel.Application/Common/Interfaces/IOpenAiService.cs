using System;
using System.Threading.Tasks;

namespace MkPainel.Application.Common.Interfaces;

public interface IOpenAiService
{
    Task<string> ChatAsync(Guid userId, string prompt);
}
