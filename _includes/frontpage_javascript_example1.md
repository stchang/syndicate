```javascript
actor {
  this.balance = 0;
  react {
    assert account(this.balance);
    on message deposit($amount) {
      this.balance += amount;
    }
  }
}
```
