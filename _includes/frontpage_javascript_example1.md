```javascript
actor {
  field this.balance = 0;
  assert account(this.balance);
  on message deposit($amount) {
    this.balance += amount;
  }
}
```
