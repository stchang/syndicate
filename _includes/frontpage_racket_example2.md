```racket
(actor
 (react (on (asserted (account $balance))
            (printf "Balance: ~a\n"
                    balance))))
```
