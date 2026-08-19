---
name: dotnet-aspnetcore
description: Workflow for .NET / ASP.NET Core tasks. Use when scaffolding, adding features, debugging DI/EF/runtime issues, or any .NET solution task. Triggers on: dotnet, ASP.NET Core, EF Core, migration, middleware, DI, controller, minimal API, DbContext.
---

# .NET / ASP.NET Core — Workflow Skill

> This skill defines **how to work**, not how to write code. Coding conventions live in instruction files.

---

## Step 0 — Context First (Discover Once, Reuse Always)

**If CLAUDE.md or repo memory exists** → read it, skip discovery.

**If not** → discover and persist:

```
1. dotnet sln list                          → list projects
2. Read *.csproj                            → SDK type, target framework
3. Read Program.cs                          → DI setup, middleware, patterns used
4. dotnet test                              → establish green baseline
5. Write findings to CLAUDE.md or repo memory
```

**STOP if tests are red before your change.** Fix first or get explicit approval.

---

## Decision Tree

```
.NET task
    │
    ├── New project ──────────────────→ Scaffold Workflow
    ├── New endpoint ─────────────────→ Endpoint Workflow
    ├── New entity + persistence ─────→ EF Core Workflow
    ├── New background job ───────────→ Worker Workflow
    ├── DI / startup exception ───────→ DI Debug Checklist
    ├── EF query / migration fail ────→ EF Debug Checklist
    ├── Runtime 5xx / exception ──────→ Runtime Debug Checklist
    └── Add library / integration ────→ Integration Checklist
```

---

## Scaffold Workflow

```
1. dotnet new webapi -n MyApp [--use-minimal-apis]
2. dotnet sln add MyApp/MyApp.csproj
3. dotnet add package Serilog.AspNetCore
4. Apply folder structure (Endpoints/, Services/, Domain/, Infrastructure/)
5. dotnet build && dotnet run → confirm startup
6. Update CLAUDE.md with project context
```

---

## Endpoint Workflow

```
1. Define contract: route, method, request/response shapes, status codes
2. Create request/response records
3. Add validator (FluentValidation)
4. Write service interface + implementation → register in DI
5. Wire endpoint (Minimal API or Controller)
6. Write tests: happy path + validation failure + not found
7. dotnet test → green
```

---

## EF Core Workflow

```
1. Define domain entity
2. Add DbSet to DbContext
3. Configure with Fluent API (IEntityTypeConfiguration<T>)
4. dotnet ef migrations add <Name> --project <InfraProject>
5. REVIEW migration file line-by-line
6. dotnet ef database update
7. Add repository + tests
```

---

## Worker Workflow

```
1. Create class : BackgroundService
2. Inject IServiceScopeFactory (not scoped services directly)
3. In ExecuteAsync: create scope per cycle, catch exceptions inside loop
4. Register: builder.Services.AddHostedService<T>()
5. Test with short delay, verify logs
```

---

## DI Debug Checklist

```
□ Service registered? (Search AddScoped/AddSingleton/AddTransient)
□ Lifetime compatible? (Singleton cannot depend on Scoped)
□ Interface vs concrete registered correctly?
□ Assembly scanning includes correct assembly?
□ Options validated? (Check ValidateOnStart output)
```

---

## EF Debug Checklist

```
□ Migration applied? (dotnet ef migrations list)
□ Connection string correct? (appsettings + env)
□ Model configuration matches DB schema?
□ Navigation properties configured?
□ Using AsNoTracking() for read-only?
```

---

## Runtime Debug Checklist

```
□ Read full exception + inner exceptions
□ Find YOUR code in stack trace (not framework)
□ Check: null ref? config missing? auth issue? EF mapping?
□ Add structured log before failing line
□ Re-run and examine log
```

---

## Integration Checklist (Adding Library)

```
□ Package maintained? (check NuGet stats)
□ dotnet add package <Name> --version <exact>
□ Register in DI per official docs
□ Bind config section with Options pattern
□ Smoke test end-to-end
```

---

## Exit Criteria (Before Done)

```
□ dotnet build → 0 errors, 0 warnings
□ dotnet test → all pass
□ New code has tests
□ CancellationToken passed through
□ No .Result or .Wait()
□ Migration reviewed
□ CLAUDE.md updated if project context changed
```
