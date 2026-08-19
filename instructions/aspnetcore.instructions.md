---
applyTo: '**/*.cs'
description: 'ASP.NET Core configuration, options pattern, and constants guidelines.'
---

# ASP.NET Core — Configuration & Constants Guidelines

## Configuration Rules

> **Never hardcode configuration values in code. All configurable values must be driven by `appsettings.json`.**

- Connection strings, URLs, timeouts, feature flags, credentials, ports, queue names, and any environment-specific value must live in `appsettings.json` / `appsettings.{Environment}.json`
- Bind configuration sections to strongly-typed options classes using the Options pattern:
  ```csharp
  // appsettings.json
  // {
  //   "Email": {
  //     "SmtpHost": "smtp.example.com",
  //     "Port": 587,
  //     "FromAddress": "no-reply@example.com"
  //   }
  // }

  // ✅ Strongly-typed options
  public sealed class EmailOptions
  {
      public const string Section = "Email";
      public required string SmtpHost { get; init; }
      public required int Port { get; init; }
      public required string FromAddress { get; init; }
  }

  // Program.cs
  builder.Services.Configure<EmailOptions>(
      builder.Configuration.GetSection(EmailOptions.Section));

  // Usage
  public sealed class EmailService(IOptions<EmailOptions> options)
  {
      private readonly EmailOptions _options = options.Value;
  }

  // ❌ Never hardcode
  private const string SmtpHost = "smtp.example.com";
  private readonly int _port = 587;
  ```
- Use `IOptionsSnapshot<T>` for values that may change at runtime (e.g. feature flags)
- Use `IOptionsMonitor<T>` for singleton services that need to react to config changes
- Validate options at startup using `ValidateDataAnnotations()` and `ValidateOnStart()`:
  ```csharp
  builder.Services
      .AddOptions<EmailOptions>()
      .BindConfiguration(EmailOptions.Section)
      .ValidateDataAnnotations()
      .ValidateOnStart();
  ```

---

## Constants

> **Never scatter magic strings throughout the codebase. All string literals used as identifiers must be defined as constants in a dedicated static class.**

This applies to: log property names, configuration section keys, HTTP headers, claim types, cache keys, route names, and any string referenced in more than one place.

### Naming Convention

Group constants by concern into dedicated `static class` files under a shared `Constants/` folder:

```
YourProject/
└── Constants/
    ├── LogProperties.cs
    ├── ConfigSections.cs
    ├── HttpHeaders.cs
    ├── ClaimTypes.cs
    └── CacheKeys.cs
```

### Configuration Section Keys

Each options class owns its section key as a `const` — do not repeat it elsewhere:

```csharp
public sealed class EmailOptions
{
    public const string Section = "Email";   // ← single source of truth
    public required string SmtpHost { get; init; }
    public required int Port { get; init; }
}

public sealed class ElasticsearchOptions
{
    public const string Section = "Elasticsearch";
    public required bool Enabled { get; init; }
    public required string Uri { get; init; }
    public required string IndexFormat { get; init; }
}

public sealed class ElasticApmOptions
{
    public const string Section = "ElasticApm";
    public required bool Enabled { get; init; }
    public required string ServerUrl { get; init; }
    public required string ServiceName { get; init; }
}

// ✅ Always reference the const, never the raw string
builder.Configuration.GetSection(EmailOptions.Section);

// ❌
builder.Configuration.GetSection("Email");
```

### HTTP Headers

```csharp
public static class HttpHeaders
{
    public const string CorrelationId = "X-Correlation-ID";
    public const string RequestId     = "X-Request-ID";
    public const string ApiVersion    = "X-API-Version";
}

// ✅ Usage
var correlationId = context.Request.Headers[HttpHeaders.CorrelationId]
    .FirstOrDefault() ?? Guid.NewGuid().ToString();

context.Response.Headers[HttpHeaders.CorrelationId] = correlationId;
```

### Cache Keys

```csharp
public static class CacheKeys
{
    // Use a method when the key includes a dynamic segment
    public static string Order(string orderId)      => $"order:{orderId}";
    public static string UserProfile(string userId) => $"user:{userId}:profile";

    // Use a const for fixed keys
    public const string AppSettings = "app:settings";
}

// ✅ Usage
var cacheKey = CacheKeys.Order(order.Id);
```
