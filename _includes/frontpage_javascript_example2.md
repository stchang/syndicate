```javascript
actor {
  react {
    on asserted account($balance) {
      console.log("Balance:",
                  balance);
    }
  }
}
```
