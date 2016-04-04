```javascript
actor {
  this.balance = 0;
  forever {
    assert account(this.balance);
    on message deposit($amount) {
      this.balance += amount;
    }
  }
}
```
