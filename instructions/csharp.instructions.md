---
applyTo: '**/*.cs'
description: 'Core C# language features, patterns, and coding guidelines.'
---

# C# 14 — Core Language Guidelines

## Language & Style

- **File-scoped namespaces** — always `namespace X;`, never block-scoped
- **Implicit usings** — don't redeclare `System`, `System.Linq` if enabled in `.csproj`
- **Using order:** System → third-party → project. Remove unused.
- **Primary constructors** — use for DI injection. If a dependency group is only used in one method, extract to a separate class.
- **`var`** for locals when type is obvious; explicit types for parameters, returns, fields
- **`sealed`** by default; **`required`** for mandatory properties; **`readonly`** for constructor-only fields
- **Access modifiers** — always explicit, least privilege

---

## Modern C# Patterns

- **Collection expressions:** `string[] x = ["a", "b"];` and `[..list1, ..list2]`
- **Switch expressions:** prefer over nested `if`
- **Range/Index:** `items[^1]`, `items[..3]`, `items[2..5]`
- **Expression-bodied members:** use for one-liners (`=> expr;`)
- **`nameof`:** always use instead of string literals for member names

---

## Null Safety

- **`is null` / `is not null`** — prefer over `== null`
- **Explicit nullability:** mark `T?` for nullable fields/returns
- **Null checks:** only at public boundaries with `ArgumentNullException.ThrowIfNull()`
- **No null checks** for value types or private methods
- **Nullability attributes:** `[NotNullIfNotNull]`, `[NotNullWhen(true)]`, `[return: NotNull]`

---

## Async / Await

- **`async Task` / `async Task<T>`** for async methods; `ValueTask<T>` for hot paths
- **`Task.FromResult(x)`** for pre-computed values — never `Task.Run(() => x)`
- **Never `.Result` or `.Wait()`** — causes deadlocks
- **`CancellationToken`** — pass through entire call chain
- **`ConfigureAwait(false)`** in library code
- **Dispose `CancellationTokenSource`** — use `using var cts = new CancellationTokenSource(...)`
- **Prefer `async/await`** over `.ContinueWith()`

---

## Safe Operations

- **Try methods** — `TryGetValue`, `TryParse`, `Uri.TryCreate` over exception handling
- **Combine with ternary:** `var x = dict.TryGetValue(k, out var v) ? v : default;`

---

## Collections

- Choose the right type: `List<T>`, `HashSet<T>`, `Dictionary<TKey, TValue>`
- Use `IReadOnlyList<T>` / `IReadOnlyCollection<T>` when exposing immutable data
- Use `IEnumerable<T>` for parameters when only enumeration is needed
- Initialize collections with known capacity when size is predictable
- Be aware of LINQ deferred execution — use `ToList()` / `ToArray()` when multiple enumeration is needed

---

## Error Handling

- Use specific exception types, never throw generic `Exception`
- Use exception filtering with `when`:
  ```csharp
  catch (HttpException ex) when (ex.StatusCode == 404) { ... }
  ```
- Exceptions are for **exceptional cases**, not control flow
- Log errors without exposing sensitive information
- Use meaningful exception messages with `nameof`

---

## String Handling

- Use string interpolation `$""` instead of `String.Format()` or concatenation
- Use raw string literals `"""..."""` for multi-line strings or strings containing quotes
- Use `string.IsNullOrEmpty()` / `string.IsNullOrWhiteSpace()` for validation
- Use `StringBuilder` for extensive string manipulation in loops

---

## Code Organization

- **One public type per file** — file name must match type name
- Prefer pure methods (no side effects, easier to test):
  ```csharp
  // ✅ Pure
  public static decimal CalculateTotal(IEnumerable<OrderLine> lines, decimal tax) =>
      lines.Sum(l => l.Price * l.Quantity) * (1 + tax);

  // ❌ Side effects
  public void CalculateAndSave() { this.Total = ...; this.UpdateDatabase(); }
  ```

---

## XML Documentation

Required for all public APIs:
```csharp
/// <summary>Processes the order asynchronously.</summary>
/// <param name="request">The order request.</param>
/// <param name="cancellationToken">Cancellation token.</param>
/// <returns>The processed order.</returns>
/// <exception cref="OrderNotFoundException">When order is not found.</exception>
public async Task<Order> ProcessOrderAsync(
    OrderRequest request,
    CancellationToken cancellationToken) { ... }
```

---

## SOLID Principles

| Principle | Application |
|---|---|
| **S**RP | A class should have only one reason to change |
| **O**CP | Open for extension, closed for modification |
| **L**SP | Subtypes must be substitutable for their base types |
| **I**SP | Many specific interfaces are better than one general-purpose interface |
| **D**IP | Depend on abstractions, not concretions |

---

## Post-Generation Checklist

- [ ] Trim trailing whitespace from all lines
- [ ] Consistent line endings (CRLF on Windows)
- [ ] No extra blank lines at end of file
- [ ] Indentation: 4 spaces, no tabs
- [ ] Remove unused usings
- [ ] XML doc comments on all public APIs
- [ ] CancellationToken passed through where applicable
