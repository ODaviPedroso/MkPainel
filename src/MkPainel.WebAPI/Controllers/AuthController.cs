using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MkPainel.Application.Common.Interfaces;
using MkPainel.Domain.Entities;
using MkPainel.Domain.Enums;

namespace MkPainel.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AuthController(IApplicationDbContext context)
    {
        _context = context;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest(new { message = "E-mail ou senha inválidos." });
        }

        return Ok(new
        {
            token = "mock_jwt_token_for_" + user.Id,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (exists)
        {
            return BadRequest(new { message = "E-mail já cadastrado." });
        }

        var user = new User(Guid.NewGuid(), request.Email, "hashed_" + request.Password, request.Name);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = "mock_jwt_token_for_" + user.Id,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            }
        });
    }

    [HttpPost("connect-mock")]
    public async Task<IActionResult> ConnectMock([FromQuery] Guid userId, [FromQuery] string platform, [FromQuery] string name)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        bool isGoogle = platform.ToLower() == "google" || platform.ToLower() == "googleads";
        var platformEnum = isGoogle ? PlatformType.GoogleAds : PlatformType.MetaAds;
        var extId = isGoogle ? "123-456-" + new Random().Next(1000, 9999) : "act_" + new Random().Next(100000, 999999);

        var account = new ConnectedAccount(
            Guid.NewGuid(),
            userId,
            platformEnum,
            name,
            extId
        );
        account.UpdateTokens("mock_access_" + Guid.NewGuid(), "mock_refresh_" + Guid.NewGuid(), DateTime.UtcNow.AddDays(30));
        account.UpdateMetrics(10000.00m, 250.00m, "active");

        _context.ConnectedAccounts.Add(account);

        var camp1 = new Campaign(Guid.NewGuid(), account.Id, "camp_mock_" + Guid.NewGuid().ToString()[..8], $"{name} - Campanha Conversão");
        camp1.UpdateMetrics(100.00m, 500.00m, 25, 600, 0.041m, 3.8m, "active");

        var camp2 = new Campaign(Guid.NewGuid(), account.Id, "camp_mock_" + Guid.NewGuid().ToString()[..8], $"{name} - Remarketing");
        camp2.UpdateMetrics(50.00m, 200.00m, 12, 350, 0.034m, 4.2m, "active");

        _context.Campaigns.AddRange(camp1, camp2);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, accountId = account.Id });
    }
}
