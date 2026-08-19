---
applyTo: '**/*.cs'
description: 'Serilog logging setup and usage guidelines.'
---

# Logging Guidelines (Serilog — Required)

> **Serilog only. No `Console.WriteLine` or `Debug.WriteLine`.**

---

## Setup (Program.cs)

```csharp
builder.Host.UseSerilog((ctx, svc, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .ReadFrom.Services(svc)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", ctx.HostingEnvironment.ApplicationName));
```

Configure sinks (Console, File, Elasticsearch) in `appsettings.json` under `Serilog` section.

---

## Usage

```csharp
// ✅ Structured logging with named properties
logger.LogInformation("Order {OrderId} created by {UserId}", order.Id, userId);
logger.LogError(ex, "Failed to process order {OrderId}", order.Id);

// ✅ LoggerMessage source generator for hot paths
[LoggerMessage(Level = LogLevel.Information, Message = "Order {OrderId} processed in {ElapsedMs}ms")]
public static partial void OrderProcessed(this ILogger logger, string orderId, long elapsedMs);

// ❌ String interpolation — defeats structured logging
logger.LogInformation($"Order {order.Id} created");
```

---

## Log Levels

| Level | Use |
|---|---|
| `Debug` | Dev diagnostics |
| `Information` | Normal flow |
| `Warning` | Recoverable issues |
| `Error` | Failures needing attention |
| `Fatal` | App cannot continue |

---

## Correlation

```csharp
app.Use(async (ctx, next) =>
{
    var id = ctx.Request.Headers["X-Correlation-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString();
    using (LogContext.PushProperty("CorrelationId", id))
    {
        ctx.Response.Headers["X-Correlation-ID"] = id;
        await next();
    }
});
```
