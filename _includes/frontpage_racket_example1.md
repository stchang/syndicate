```racket
(actor
 (field [balance 0])
 (assert (account (balance)))
 (on (message (deposit $amount))
     (balance (+ (balance) amount))))
```
