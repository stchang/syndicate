```javascript
actor {
  forever {
    on asserted account($balance) {
      console.log("Balance:",
                  balance);
    }
  }
}
```
