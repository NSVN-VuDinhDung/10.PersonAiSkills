# CLAUDE.md — .NET Project Context

> **Template:** Copy this file to your project root and fill in. AI reads this once per session instead of re-discovering.

---

## Solution Overview

- **Solution:** `YourApp.sln`
- **Target Framework:** .NET 9
- **Project Type:** ASP.NET Core Minimal API / Controller-based / Worker Service / Blazor

---

## Projects

| Project | Type | Purpose |
|---|---|---|
| `src/YourApp.Api` | Web API | HTTP endpoints, DI setup |
| `src/YourApp.Domain` | Class Library | Entities, value objects, domain logic |
| `src/YourApp.Application` | Class Library | Use cases, CQRS handlers, validators |
| `src/YourApp.Infrastructure` | Class Library | EF Core, external services, repositories |
| `tests/YourApp.Tests` | xUnit | Unit + integration tests |

---

## Commands

```bash
# Build
dotnet build

# Run
dotnet run --project src/YourApp.Api

# Test
dotnet test

# EF Migration
dotnet ef migrations add <Name> --project src/YourApp.Infrastructure --startup-project src/YourApp.Api
dotnet ef database update --project src/YourApp.Infrastructure --startup-project src/YourApp.Api
```

---

## Architecture / Patterns

- [ ] Minimal API with endpoint groups
- [ ] Controller-based MVC
- [ ] MediatR + CQRS
- [ ] FluentValidation
- [ ] Repository pattern
- [ ] Unit of Work

---

## Key Files

| File | Purpose |
|---|---|
| `src/YourApp.Api/Program.cs` | DI registrations, middleware pipeline |
| `src/YourApp.Infrastructure/AppDbContext.cs` | EF Core DbContext |
| `src/YourApp.Api/appsettings.json` | Configuration |
| `src/YourApp.Api/Endpoints/` | Minimal API endpoint groups |

---

## Dependencies (Key Packages)

- Serilog.AspNetCore
- FluentValidation.AspNetCore
- Npgsql.EntityFrameworkCore.PostgreSQL / Microsoft.EntityFrameworkCore.SqlServer
- MediatR (if CQRS)

---

## Database

- **Provider:** PostgreSQL / SQL Server / SQLite
- **Connection String Key:** `ConnectionStrings:Default`
- **Migrations Location:** `src/YourApp.Infrastructure/Migrations/`

---

## Environment Variables (Required)

| Variable | Description |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | Development / Staging / Production |
| `ConnectionStrings__Default` | Database connection (override appsettings) |

---

## Notes / Conventions

<!-- Add project-specific notes here -->
- Use `sealed` classes by default
- All endpoints require authorization unless explicitly `[AllowAnonymous]`
- Use `IOptions<T>` pattern for configuration
