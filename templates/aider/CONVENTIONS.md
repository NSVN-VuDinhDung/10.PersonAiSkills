# CONVENTIONS.md — .NET Project Context (for Aider)

> Aider reads this file when referenced in `.aider.conf.yml`

## Solution Overview

- **Solution:** `YourApp.sln`
- **Target Framework:** .NET 9
- **Project Type:** ASP.NET Core Minimal API

## Projects

| Project | Type | Purpose |
|---|---|---|
| `src/YourApp.Api` | Web API | HTTP endpoints, DI setup |
| `src/YourApp.Domain` | Class Library | Entities, domain logic |
| `src/YourApp.Infrastructure` | Class Library | EF Core, repositories |
| `tests/YourApp.Tests` | xUnit | Unit + integration tests |

## Commands

```bash
dotnet build                    # Build
dotnet run --project src/YourApp.Api   # Run
dotnet test                     # Test
dotnet ef migrations add <Name> --project src/YourApp.Infrastructure --startup-project src/YourApp.Api
```

## Architecture

- Minimal API with endpoint groups
- FluentValidation
- Serilog logging
- EF Core + PostgreSQL

## Key Files

- DI setup: `src/YourApp.Api/Program.cs`
- DbContext: `src/YourApp.Infrastructure/AppDbContext.cs`
- Config: `src/YourApp.Api/appsettings.json`

## Coding Rules

- File-scoped namespaces: `namespace X;`
- Classes are `sealed` by default
- Use `required` for mandatory properties
- Primary constructors for DI
- Serilog structured logging: `logger.LogInformation("Order {OrderId}", id)`
- No `Console.WriteLine`
- `CancellationToken` in all async call chains
- Options pattern for configuration
- No hardcoded values — use `appsettings.json`

## Testing

- xUnit + Moq
- Descriptive test names: `MethodName_Scenario_ExpectedResult`
