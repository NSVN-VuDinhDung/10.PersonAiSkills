---
applyTo: '**/*Tests.cs,**/*Test.cs,**/*Spec.cs'
description: 'Unit and integration testing guidelines for C# projects.'
---

# Testing Guidelines

## Framework

- **xUnit** (preferred), NUnit, or MSTest
- Mock dependencies with **Moq** or **NSubstitute**

---

## Test Structure

- Do not emit `// Arrange`, `// Act`, `// Assert` comments — code should be self-explanatory
- Use descriptive test method names that describe the scenario:
  ```csharp
  // ✅ Descriptive name
  [Fact]
  public async Task ProcessOrderAsync_WhenOrderNotFound_ThrowsOrderNotFoundException() { ... }

  // ❌ Vague name
  [Fact]
  public async Task ProcessOrderAsync_Test() { ... }
  ```
- Test both happy paths and edge cases
- Use `Assert.Throws<T>()` instead of try-catch in tests:
  ```csharp
  // ✅
  var ex = await Assert.ThrowsAsync<OrderNotFoundException>(
      () => _sut.ProcessOrderAsync(invalidId, CancellationToken.None));
  Assert.Equal(invalidId, ex.OrderId);

  // ❌
  try
  {
      await _sut.ProcessOrderAsync(invalidId, CancellationToken.None);
      Assert.Fail("Expected exception was not thrown");
  }
  catch (OrderNotFoundException) { }
  ```

---

## AAA Pattern (Implicit)

Structure each test as Arrange → Act → Assert without comments:

```csharp
[Fact]
public async Task ProcessOrderAsync_ValidOrder_SavesAndReturnsOrder()
{
    var order = new OrderBuilder().WithDefaults().Build();
    _repositoryMock.Setup(r => r.SaveAsync(order, It.IsAny<CancellationToken>()))
                   .ReturnsAsync(order);

    var result = await _sut.ProcessOrderAsync(order, CancellationToken.None);

    Assert.Equal(order.Id, result.Id);
    _repositoryMock.Verify(r => r.SaveAsync(order, It.IsAny<CancellationToken>()), Times.Once);
}
```

---

## Data-driven Tests

Use `[Theory]` + `[InlineData]` or `[MemberData]` for parametric tests:

```csharp
[Theory]
[InlineData(0)]
[InlineData(-1)]
[InlineData(int.MinValue)]
public async Task ProcessOrderAsync_InvalidQuantity_ThrowsArgumentException(int quantity)
{
    var order = new OrderBuilder().WithQuantity(quantity).Build();

    await Assert.ThrowsAsync<ArgumentException>(
        () => _sut.ProcessOrderAsync(order, CancellationToken.None));
}
```

---

## Test Isolation

- Each test must be independent — no shared mutable state between tests
- Use constructor setup for fresh mocks per test:
  ```csharp
  public sealed class OrderProcessorTests
  {
      private readonly Mock<IOrderRepository> _repositoryMock = new();
      private readonly Mock<ILogger<OrderProcessor>> _loggerMock = new();
      private readonly OrderProcessor _sut;

      public OrderProcessorTests()
      {
          _sut = new OrderProcessor(_repositoryMock.Object, _loggerMock.Object);
      }
  }
  ```
