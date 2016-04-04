```racket
(actor
 (forever #:collect [(balance 0)]
   (assert (account balance))
   (on (message (deposit $amount))
       (+ balance amount))))
```
