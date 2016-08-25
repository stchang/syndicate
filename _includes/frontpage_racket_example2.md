```racket
(actor
 (on (asserted (account $balance))
     (printf "Balance: ~a\n"
             balance)))
```
