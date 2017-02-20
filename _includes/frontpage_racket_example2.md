```racket
(spawn
 (on (asserted (account $balance))
     (printf "Balance: ~a\n"
             balance)))
```
