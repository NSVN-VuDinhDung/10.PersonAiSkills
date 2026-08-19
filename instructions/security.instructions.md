---
applyTo: '**/*.cs'
description: 'Security guidelines for C# — input validation, secrets, SQL, OWASP.'
---

# Security Guidelines

> Follow OWASP secure coding guidelines for all C# code.

---

## Input Validation

- Validate **all** input parameters at system boundaries (API controllers, message consumers, file parsers)
- Reject invalid input early — do not pass unvalidated data into the domain layer:
  ```csharp
  // ✅ Validate at the boundary
  [HttpPost]
  public async Task<IActionResult> CreateOrder(
      [FromBody] CreateOrderRequest request,
      CancellationToken ct)
  {
      var validation = await _validator.ValidateAsync(request, ct);
      if (!validation.IsValid)
          return BadRequest(validation.Errors);

      var order = await _service.CreateAsync(request, ct);
      return Ok(order);
  }
  ```

---

## Secrets Management

- **Never hardcode secrets** — no passwords, API keys, connection strings, or tokens in source code
- Use environment variables, `dotnet user-secrets` (development), or a secret manager (Azure Key Vault, AWS Secrets Manager) in production:
  ```csharp
  // ✅ Read from configuration / environment
  var apiKey = builder.Configuration["ExternalService:ApiKey"]
      ?? throw new InvalidOperationException("ExternalService:ApiKey is not configured.");

  // ❌ Never inline secrets
  private const string ApiKey = "sk-abc123...";
  ```

---

## SQL Injection Prevention

- **Always parameterize queries** — never concatenate user input into SQL strings:
  ```csharp
  // ✅ Parameterized query
  var order = await _context.Orders
      .Where(o => o.Id == orderId)
      .FirstOrDefaultAsync(ct);

  // ✅ Dapper — use parameters
  var order = await connection.QuerySingleOrDefaultAsync<Order>(
      "SELECT * FROM Orders WHERE Id = @Id",
      new { Id = orderId });

  // ❌ String concatenation — SQL injection risk
  var order = await connection.QuerySingleOrDefaultAsync<Order>(
      $"SELECT * FROM Orders WHERE Id = '{orderId}'");
  ```

---

## Output Encoding

- Encode output before rendering to prevent XSS
- Use Razor's built-in HTML encoding (`@value`) — never use `@Html.Raw()` with user-supplied data:
  ```csharp
  // ✅ Auto-encoded by Razor
  <p>@Model.UserName</p>

  // ❌ Bypasses encoding — XSS risk
  <p>@Html.Raw(Model.UserName)</p>
  ```

---

## Error Messages & Logs

- **Never expose sensitive information** in error responses or log entries:
  ```csharp
  // ✅ Safe: generic message to caller, details in structured log
  logger.LogError(ex, "Order {OrderId} processing failed", orderId);
  return Problem("An error occurred processing your request.", statusCode: 500);

  // ❌ Leaks stack trace / internal details to caller
  return StatusCode(500, ex.ToString());
  ```

---

## Authentication & Authorization

- Always check authentication and authorization before executing business logic
- Use `[Authorize]` attributes or policy-based authorization — never rely on security through obscurity:
  ```csharp
  // ✅ Explicit authorization policy
  [Authorize(Policy = "RequireOrderManager")]
  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteOrder(string id, CancellationToken ct) { ... }
  ```
- Never trust client-supplied identity claims without server-side validation

---

## General Checklist

- [ ] All public endpoints validate and sanitize input
- [ ] No secrets in source code or version control
- [ ] All database queries use parameterized statements or ORM
- [ ] Output is encoded before rendering
- [ ] Error responses contain no stack traces or internal detail
- [ ] All routes requiring authentication have `[Authorize]`
- [ ] Dependencies are up to date — no known CVEs
