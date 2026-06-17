using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MkPainel.Infrastructure.Data;
using MkPainel.WebAPI.Controllers;
using Xunit;

namespace MkPainel.Application.UnitTests;

public class AuthControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<ApplicationDbContext> _dbContextOptions;

    public AuthControllerTests()
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _dbContextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new ApplicationDbContext(_dbContextOptions);
        context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _connection.Dispose();
    }

    [Fact]
    public async Task Register_ShouldCreateUser_WhenEmailIsUnique()
    {
        using var context = new ApplicationDbContext(_dbContextOptions);
        var controller = new AuthController(context);
        var request = new AuthController.RegisterRequest
        {
            Email = "newuser@test.com",
            Password = "password123",
            Name = "New User"
        };

        var result = await controller.Register(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        using var verifyContext = new ApplicationDbContext(_dbContextOptions);
        var user = await verifyContext.Users.FirstOrDefaultAsync(u => u.Email == "newuser@test.com");
        Assert.NotNull(user);
        Assert.Equal("New User", user.Name);
    }

    [Fact]
    public async Task Register_ShouldFail_WhenEmailAlreadyExists()
    {
        using var context = new ApplicationDbContext(_dbContextOptions);
        var controller = new AuthController(context);
        var request = new AuthController.RegisterRequest
        {
            Email = "duplicate@test.com",
            Password = "password123",
            Name = "First User"
        };
        await controller.Register(request);

        var duplicateRequest = new AuthController.RegisterRequest
        {
            Email = "duplicate@test.com",
            Password = "password456",
            Name = "Second User"
        };

        var result = await controller.Register(duplicateRequest);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }

    [Fact]
    public async Task Login_ShouldSucceed_WhenUserExists()
    {
        using var context = new ApplicationDbContext(_dbContextOptions);
        var controller = new AuthController(context);
        var registerRequest = new AuthController.RegisterRequest
        {
            Email = "loginuser@test.com",
            Password = "password123",
            Name = "Login User"
        };
        await controller.Register(registerRequest);

        var loginRequest = new AuthController.LoginRequest
        {
            Email = "loginuser@test.com",
            Password = "password123"
        };

        var result = await controller.Login(loginRequest);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Login_ShouldFail_WhenUserDoesNotExist()
    {
        using var context = new ApplicationDbContext(_dbContextOptions);
        var controller = new AuthController(context);
        var loginRequest = new AuthController.LoginRequest
        {
            Email = "nonexistent@test.com",
            Password = "password123"
        };

        var result = await controller.Login(loginRequest);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }
}
