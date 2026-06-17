# Create solution
dotnet new sln -n MkPainel

# Create src projects
dotnet new classlib -n MkPainel.Domain -o src/MkPainel.Domain -f net8.0
dotnet new classlib -n MkPainel.Application -o src/MkPainel.Application -f net8.0
dotnet new classlib -n MkPainel.Infrastructure -o src/MkPainel.Infrastructure -f net8.0
dotnet new webapi -n MkPainel.WebAPI -o src/MkPainel.WebAPI -f net8.0

# Create test projects
dotnet new xunit -n MkPainel.Domain.UnitTests -o tests/MkPainel.Domain.UnitTests -f net8.0
dotnet new xunit -n MkPainel.Application.UnitTests -o tests/MkPainel.Application.UnitTests -f net8.0
dotnet new xunit -n MkPainel.Infrastructure.IntegrationTests -o tests/MkPainel.Infrastructure.IntegrationTests -f net8.0

# Add projects to solution
dotnet sln MkPainel.sln add src/MkPainel.Domain/MkPainel.Domain.csproj
dotnet sln MkPainel.sln add src/MkPainel.Application/MkPainel.Application.csproj
dotnet sln MkPainel.sln add src/MkPainel.Infrastructure/MkPainel.Infrastructure.csproj
dotnet sln MkPainel.sln add src/MkPainel.WebAPI/MkPainel.WebAPI.csproj
dotnet sln MkPainel.sln add tests/MkPainel.Domain.UnitTests/MkPainel.Domain.UnitTests.csproj
dotnet sln MkPainel.sln add tests/MkPainel.Application.UnitTests/MkPainel.Application.UnitTests.csproj
dotnet sln MkPainel.sln add tests/MkPainel.Infrastructure.IntegrationTests/MkPainel.Infrastructure.IntegrationTests.csproj

# Add project references
# Application -> Domain
dotnet add src/MkPainel.Application/MkPainel.Application.csproj reference src/MkPainel.Domain/MkPainel.Domain.csproj

# Infrastructure -> Application
dotnet add src/MkPainel.Infrastructure/MkPainel.Infrastructure.csproj reference src/MkPainel.Application/MkPainel.Application.csproj

# WebAPI -> Infrastructure, Application
dotnet add src/MkPainel.WebAPI/MkPainel.WebAPI.csproj reference src/MkPainel.Infrastructure/MkPainel.Infrastructure.csproj
dotnet add src/MkPainel.WebAPI/MkPainel.WebAPI.csproj reference src/MkPainel.Application/MkPainel.Application.csproj

# Test project references
# Domain.UnitTests -> Domain
dotnet add tests/MkPainel.Domain.UnitTests/MkPainel.Domain.UnitTests.csproj reference src/MkPainel.Domain/MkPainel.Domain.csproj

# Application.UnitTests -> Application
dotnet add tests/MkPainel.Application.UnitTests/MkPainel.Application.UnitTests.csproj reference src/MkPainel.Application/MkPainel.Application.csproj

# Infrastructure.IntegrationTests -> Infrastructure, WebAPI
dotnet add tests/MkPainel.Infrastructure.IntegrationTests/MkPainel.Infrastructure.IntegrationTests.csproj reference src/MkPainel.Infrastructure/MkPainel.Infrastructure.csproj
dotnet add tests/MkPainel.Infrastructure.IntegrationTests/MkPainel.Infrastructure.IntegrationTests.csproj reference src/MkPainel.WebAPI/MkPainel.WebAPI.csproj
